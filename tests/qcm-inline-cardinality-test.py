from pathlib import Path
import importlib.util
import unittest

spec=importlib.util.spec_from_file_location('coherence',Path(__file__).resolve().parents[1]/'tools/pdf-bank-coherence.py')
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class InlineCardinality(unittest.TestCase):
    def setUp(self):
        self.rows=[{'id':'sample_01','number':1,'theme':'Exemple','difficulty':'easy','question':'Quelle est la bonne réponse ?', 'choices':['Un','Deux','Trois','Quatre','Cinq'],'answers':[1],'announcedCorrectCount':1,'explanation':'A — Faux. B — Vrai. C — Faux. D — Faux. E — Faux.'}]
        self.text='FACILE\nQ01 · Quelle est la bonne réponse ? (1 bonne réponse)\nA. Un\nB. Deux\nC. Trois\nD. Quatre\nE. Cinq\nCorrigés argumentés\nQ01 — Réponses : B.\n'+self.rows[0]['explanation']
    def test_exact(self):mod.validate_qcm_theme_cards(self.text,self.rows,inline_cardinality=True)
    def test_wrong_count(self):
        with self.assertRaises(AssertionError):mod.validate_qcm_theme_cards(self.text.replace('(1 bonne réponse)','(2 bonnes réponses)'),self.rows,inline_cardinality=True)
    def test_wrong_choice(self):
        with self.assertRaises(AssertionError):mod.validate_qcm_theme_cards(self.text.replace('B. Deux','B. Autre'),self.rows,inline_cardinality=True)
    def test_wrong_key(self):
        with self.assertRaises(AssertionError):mod.validate_qcm_theme_cards(self.text.replace('Réponses : B.','Réponses : A.'),self.rows,inline_cardinality=True)
    def test_default_reader_not_relaxed(self):
        with self.assertRaises(AssertionError):mod.validate_qcm_theme_cards(self.text,self.rows)

if __name__=='__main__':unittest.main()
