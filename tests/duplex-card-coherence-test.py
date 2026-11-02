"""Exercise the exact newly supported duplex layout, including rejected defects."""
from pathlib import Path
import importlib.util
import unittest
import fitz

spec=importlib.util.spec_from_file_location('duplex',Path(__file__).resolve().parents[1]/'tools/duplex-card-coherence.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class DuplexCards(unittest.TestCase):
    def make(self,mirror=True,wrong=False):
        doc=fitz.open();front=doc.new_page(width=595.28,height=841.89);back=doc.new_page(width=595.28,height=841.89)
        # MuPDF's bundled Unicode font keeps fixtures portable across Windows/CI.
        doc[0].insert_text((42,66),'Questions — rectos',fontname='china-s')
        doc[1].insert_text((42,66),'Réponses — versos correspondants',fontname='china-s')
        rows=[]
        for i in range(2):
            card={'front':f'Question {i+1} ?', 'answers':[f'Reponse {i+1}']};rows.append({'flashcards':[card]})
            for face,page,col in [('front',doc[0],i),('back',doc[1],1-i if mirror else i)]:
                x=42+260*col;page.insert_text((x+12,105),f'Carte {i+1:02d}')
                page.insert_text((x+12,139),card['front'] if face=='front' else ('Incorrect' if wrong and i==0 else card['answers'][0]))
        return doc,rows
    def test_reference(self):
        doc,rows=self.make();self.assertEqual(mod.validate_duplex_cards(doc,rows),2)
    def test_mirrored_answers_required(self):
        doc,rows=self.make(mirror=False)
        with self.assertRaises(AssertionError):mod.validate_duplex_cards(doc,rows)
    def test_wrong_answer_rejected(self):
        doc,rows=self.make(wrong=True)
        with self.assertRaises(AssertionError):mod.validate_duplex_cards(doc,rows)
    def test_missing_page_rejected(self):
        doc,rows=self.make();doc.delete_page(1)
        with self.assertRaises(AssertionError):mod.validate_duplex_cards(doc,rows)

if __name__=='__main__':unittest.main()
