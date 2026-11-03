// A generic instruction is not the whole question: the displayed theme and
// the five propositions carry its subject. Keep substantive stem collisions
// blocking; accept generic reuse only with distinct themes AND disjoint choices.
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function hasDistinctGenericContexts(group){
 if(!Array.isArray(group)||group.length<2)return false;
 if(!group.every(q=>/^quelles (?:associations sont exactes|distinctions sont correctes)$/.test(norm(q.question))))return false;
 const themes=group.map(q=>norm(q.theme));
 if(themes.some(t=>t.length<8)||new Set(themes).size!==group.length)return false;
 const choices=group.flatMap(q=>q.choices||[]).map(norm);
 return group.every(q=>q.choices?.length===5)&&choices.every(c=>c.length>=15)&&new Set(choices).size===group.length*5;
}
