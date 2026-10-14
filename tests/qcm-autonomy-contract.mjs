// Garde-fou pédagogique des NOUVEAUX items ou des items MODIFIÉS.
// Les cours historiques inchangés sont conservés jusqu'à leur revue privée.
// La vérification de la formulation ne remplace pas la revue médicale.
import assert from 'node:assert/strict';

const patterns = [
  /\b(?:selon|d['’]après|dans|sur|du|de|par|indiqué(?:e|es|s)?\s+dans|présenté(?:e|es|s)?\s+dans)\s+(?:(?:le|la|les|ce|cet|cette|l['’])\s*)?(?:TD|cours|support|diapo(?:sitive)?|document)\b/iu,
  /\b(?:le|ce|la)\s+(?:TD|cours|support|diapo(?:sitive)?|document)\s+(?:cite|citent|montre|indique|précise|décrit|donne|présente|recommande)\b/iu,
  /\b(?:page|diapositive|diapo)\s*\d+\s*(?:du|de la|d['’]un)\s*(?:TD|cours|support|document)\b/iu,
  /\b(?:TD|support|cours)\s*(?:p\.|page)\s*\d+\b/iu,
  /\b(?:cité(?:e|es|s)?|relevé(?:e|es|s)?|mentionné(?:e|es|s)?|présenté(?:e|es|s)?|décrit(?:e|es|s)?)\s+(?:(?:explicitement|uniquement)\s+)?(?:dans|par|sur)\s+(?:(?:le|la|ce|cette|un)\s*)?(?:TD|cours|support|document|diapositive)\b/iu
];

function textOnly(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(textOnly);
  if (value && typeof value === 'object')
    return Object.entries(value).filter(([key])=>!/^(?:source|source_ref|sourceRef|provenance|citation|citations|pageSource|supportReference)$/i.test(key))
      .flatMap(([, v]) => textOnly(v));
  return [];
}

export function pedagogicalFields(item) {
  return {
    question:item.question??item.prompt??item.text??'',
    choices:item.choices??[],
    explanation:item.explanation??item.correction??'',
    flashcards:item.flashcards??[]
  };
}

export function autonomyViolations(item) {
  const fields=pedagogicalFields(item);
  const errors=[];
  for(const [field,value] of Object.entries(fields)){
    for(const sentence of textOnly(value)){
      const pattern=patterns.find(re=>re.test(sentence));
      if(pattern)errors.push({field,excerpt:sentence.slice(0,140)});
    }
  }
  return errors;
}

export function validateChangedQcmBanks(beforeRows,afterRows,fileName='banque') {
  assert.ok(Array.isArray(beforeRows)&&Array.isArray(afterRows),'Bank QCM JSON invalide: '+fileName);
  const before=new Map(beforeRows.map(x=>[x.id,x]));
  const visited=new Set();
  let scanned=0;
  for(const item of afterRows){
    assert.ok(typeof item.id==='string' && item.id.trim(),fileName+': ID QCM absent');
    assert.ok(!visited.has(item.id),fileName+': ID QCM dupliqué '+item.id);
    visited.add(item.id);
    const old=before.get(item.id);
    if(old && JSON.stringify(pedagogicalFields(old))===JSON.stringify(pedagogicalFields(item))) continue;
    scanned++;
    const errors=autonomyViolations(item);
    if(errors.length){
      const details=errors.map(x=>x.field+': '+x.excerpt).join(' | ');
      throw new Error(fileName+': '+item.id+' dépend du TD/support : '+details);
    }
  }
  return scanned;
}
