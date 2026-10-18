// Garde-fous de qualité QCM. Analyse statique, sans corriger les réponses médicales.
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
export function exactDuplicateKey(q){
  if(!q?.question||!Array.isArray(q.choices)||!Array.isArray(q.answers))return '';
  const course=String(q.courseId||q.course||'');
  const stem=norm(q.question).replace(/[?!,;.:]+$/,'');
  const choices=q.choices.map(norm).join('\u001f');
  const answers=[...q.answers].sort((a,b)=>a-b).join(',');
  // Un même énoncé générique utilisé sur deux cours avec des réponses différentes
  // n'est pas une question identique.
  return course+'\u001e'+stem+'\u001e'+choices+'\u001e'+answers;
}
export function needsExternalFigure(value){
  const text=String(value??'');
  // Une question sur les propriétés générales d'une radiographie ne demande
  // pas forcément d'image ; une déixis visuelle ("sur ce schéma") oui.
  return /\b(?:image|figure|sch[eé]ma|radiographie|photographie|clich[eé])\s+(?:ci[- ]dessous|ci[- ]contre|suivant(?:e)?|joint(?:e)?)\b/i.test(text)
    || /\b(?:sur|dans)\s+(?:(?:le|la|ce|cet|cette|l['’])\s*)?(?:image|figure|sch[eé]ma|radiographie|photographie|clich[eé])\b/i.test(text)
    || /\b(?:voir|observer|regarder)\s+(?:(?:le|la|l['’])\s*)?(?:figure|sch[eé]ma|image)\b/i.test(text);
}
export function hasFigureResource(q){
  const references=['imageUrl','figureId','visualId','mediaId','assetId','image'];
  // Un simple booléen "image: true" ne prouve pas le rattachement d'un visuel.
  return references.some(key=>{
    const value=q?.[key];
    return (typeof value==='string'&&value.trim().length>0)
      || (value&&typeof value==='object'&&['url','src','id','path'].some(k=>typeof value[k]==='string'&&value[k].trim()));
  });
}
export function hasPdfPageFurniture(q){
  const text=[q?.question,...(Array.isArray(q?.choices)?q.choices:[]),q?.explanation].map(v=>String(v??'')).join(' ');
  // Marqueurs très spécifiques de pollution par extraction PDF : ne pas
  // détecter la simple mention naturelle d'une page ou d'un CM.
  return /CM\s*\d+\s*[•·]|\bNiveaux d.abstraction et utilit[ée]/i.test(text);
}
export function pedagogicalQualityViolations(q){
  const errors=[];
  if(!q||typeof q!=='object')return ['Question absente'];
  if(typeof q.id!=='string'||!q.id.trim())errors.push('Identifiant QCM absent');
  if(typeof q.courseId!=='string'||!q.courseId.trim())errors.push('Identifiant de cours absent');
  if(typeof q.question!=='string'||!q.question.trim())errors.push('Énoncé absent');
  if(typeof q.theme!=='string'||!q.theme.trim())errors.push('Thème absent');
  if(!['easy','medium','hard'].includes(q.difficulty))errors.push('Niveau de difficulté explicite manquant ou invalide');
  if(!Array.isArray(q.choices)||![4,5].includes(q.choices.length))
    errors.push('4 ou 5 propositions attendues');
  else{
    if(q.choices.some(v=>typeof v!=='string'||!v.trim()))errors.push('Proposition vide ou incorrecte');
    if(new Set(q.choices.map(norm)).size!==q.choices.length)errors.push('Propositions identiques');
  }
  if(!Array.isArray(q.answers)||q.answers.length<1||q.answers.length>3)
    errors.push('1 à 3 bonnes réponses attendues');
  if(Array.isArray(q.answers)){
    if(new Set(q.answers).size!==q.answers.length)errors.push('Index de réponse dupliqué');
    if(!Array.isArray(q.choices)||q.answers.some(i=>!Number.isInteger(i)||i<0||i>=q.choices.length))
      errors.push('Index de réponse incorrect');
  }
  if(typeof q.explanation!=='string'||q.explanation.trim().length<80)
    errors.push('Corrigé trop court : minimum 80 caractères pour tout nouveau contenu');
  if(needsExternalFigure(q.question)&&!hasFigureResource(q))
    errors.push('Référence à une figure non rattachée');
  if(hasPdfPageFurniture(q))errors.push('En-tête de page PDF détecté dans le QCM');
  return errors;
}
export function qualityCounts(questions){
  const counts={short_explanation:0,source_dependent_question:0,three_of_four:0,identical_question:0,image_without_figure:0};
  const seen=new Set();
  for(const q of questions){
    if(String(q.explanation??'').trim().length<80)counts.short_explanation++;
    if(/\b(?:selon la diapo|dans le cours|comme vu en cours|sur le support|illustration ci[- ]dessous)\b/i.test(String(q.question||'')))counts.source_dependent_question++;
    if(q.choices?.length===4&&q.answers?.length===3)counts.three_of_four++;
    const key=exactDuplicateKey(q);
    if(key&&seen.has(key))counts.identical_question++;
    if(key)seen.add(key);
    if(needsExternalFigure(q.question)&&!hasFigureResource(q))counts.image_without_figure++;
  }
  return counts;
}
export function assertQualityCeilings(counts,ceilings){
  for(const [name,max] of Object.entries(ceilings)){
    if(!Number.isInteger(max)||max<0)throw new Error('Seuil de qualité invalide : '+name);
    if(!Number.isInteger(counts[name])||counts[name]>max)
      throw new Error(name+': '+counts[name]+' dépasse le seuil historique '+max+'. Revue pédagogique nécessaire.');
  }
}
