// Count a short authored list in its first sentence without changing its text.
// Commas group paired axes before conjunctions are considered. A subordinate
// "y compris" clause belongs to its item. Unrecognized prose stays uncounted.
export function countAuthoredListItems(answer,expected){
 if(typeof answer!=='string'||!Number.isInteger(expected)||expected<2)return null;
 const first=answer.split(/[.!?](?:\s|$)/,1)[0].trim();
 if(!first)return null;
 const clean=first.replace(/,\s*y compris\b[^;]*/i,'');
 const split=re=>clean.split(re).map(s=>s.trim()).filter(Boolean);
 if(/\s;\s/.test(clean))return split(/\s*;\s*/).length;
 const comma=split(/,\s*/);
 if(comma.length===expected)return comma.length;
 const conjunction=split(/,\s*|\s+et\s+/);
 if(conjunction.length===expected)return conjunction.length;
 return null;
}
