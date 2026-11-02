"""Native text and positions for six-card portrait long-edge duplex PDFs.

An additive layout reader: other PDF contracts keep their existing readers.
"""
import math
import re
import unicodedata
import fitz

def compact(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', text)).strip()

def validate_duplex_cards(document, rows):
    cards=[f for q in rows for f in q.get('flashcards',[])]
    assert cards, 'Banque de cartes vide'
    assert len(document)==math.ceil(len(cards)/6)*2, 'Nombre de feuilles recto-verso divergent'
    assert len({compact(c['front']).casefold() for c in cards})==len(cards), 'Rectos dupliques'
    for sheet in range(math.ceil(len(cards)/6)):
        front=document[2*sheet];back=document[2*sheet+1]
        assert compact(front.get_text()).count('Questions — rectos')==1, 'Face question absente'
        assert compact(back.get_text()).count('Réponses — versos correspondants')==1, 'Face reponse absente'
        for slot in range(6):
            number=sheet*6+slot+1;row=slot//2
            for face,page,col in [('front',front,slot%2),('back',back,1-slot%2)]:
                x=42+260*col;top=83+231*row
                area=fitz.Rect(x+5,top+5,x+246,top+213)
                actual=compact(page.get_text(clip=area,sort=True))
                if number>len(cards):
                    assert not actual, 'Contenu dans une case vide'
                    continue
                card=cards[number-1]
                content=card['front'] if face=='front' else ' '.join(card['answers'])
                expected=compact(f'Carte {number:02d} '+content)
                assert actual==expected, f'Carte {number} {face}: texte ou position divergent'
                if face=='front':
                    assert compact(' '.join(card['answers'])) not in actual, f'Reponse visible sur recto {number}'
    return len(cards)
