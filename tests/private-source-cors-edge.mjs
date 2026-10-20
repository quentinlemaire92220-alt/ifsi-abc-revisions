import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const original=fs.readFileSync('supabase/functions/ifsi-private-sources/index.ts','utf8');
let js=original;
const types=new Map([
 ['const FIELDS: Record<string, number> =','const FIELDS ='],
 ['new Set<string>()','new Set()'],
 ['function response(requestOrigin: string | null, status: number, payload: unknown)','function response(requestOrigin, status, payload)'],
 ['function b64url(bytes: Uint8Array)','function b64url(bytes)'],
 ['function sheetRange(range: string)','function sheetRange(range)'],
 ['async function readRows(token: string): Promise<string[][]>','async function readRows(token)'],
 ['function normalizeState(s: unknown)','function normalizeState(s)'],
 ['STATES.has(s as string)','STATES.has(s)'],
 ['? s as string :','? s :'],
 ['function projectRows(rows: string[][])','function projectRows(rows)'],
 ['async function ownerAuthenticated(request: Request)','async function ownerAuthenticated(request)'],
 ['Deno.serve(async (req: Request) =>','Deno.serve(async (req) =>'],
 ['rows.map(({row, ...rest}: any) => rest)','rows.map(({row, ...rest}) => rest)'],
 ['rows.find((row: any) => row.key === key) as any','rows.find((row) => row.key === key)'],
]);
for(const [before,after] of types){assert.ok(js.includes(before),'TypeScript source changed: '+before);js=js.replace(before,after)}
assert.doesNotThrow(()=>new vm.Script(js),'Source Edge Function ne se transforme pas en JS testable');
assert.ok(original.includes('const origin = "https://quentinlemaire92220-alt.github.io"'),'Origine publique canonique manquante');
assert.ok(original.includes('req.method === "OPTIONS" && reqOrigin === origin'),'Préflight protégé et exempté de JWT manquant');
assert.ok(original.includes('if (!(await ownerAuthenticated(req)))'),'Contrôle Supabase Auth obligatoire pour GET/PATCH');
assert.ok(original.includes('user.id === ownerId'),'Autorisation précise du propriétaire obligatoire');
assert.ok(!original.includes('SUPABASE_SERVICE_ROLE_KEY'),'Aucun privilège Supabase service_role autorisé');

const ownerId='12ff735d-828b-4dd5-8566-cd78ca46de5f';
const approvedOrigin='https://quentinlemaire92220-alt.github.io';
const fakeRows=[
 ['cellules::p01','B1','Cellules','Présent','À vérifier','Absent','Brouillon privé','NE_JAMAIS_RETOURNER_CECI'],
 ['respiratoire::p01','B1','Respiratoire','À vérifier','À vérifier','Présent','En cours']
];
function createHarness(userId=ownerId){
 const calls=[];
 let handle;
 const secret={
  SUPABASE_URL:'https://fake-project.supabase.co',
  SUPABASE_ANON_KEY:'public-key',
  IFSI_SOURCE_OWNER_UID:ownerId,
  IFSI_SOURCE_SHEET_ID:'private-sheet-id-for-test',
  IFSI_GOOGLE_SERVICE_ACCOUNT_JSON:JSON.stringify({
   client_email:'fake-account@fake-project.iam.gserviceaccount.com',
   private_key:'-----BEGIN PRIVATE KEY-----\nAQAB\n-----END PRIVATE KEY-----\n'
  })
 };
 async function fetchMock(url,options={}){
  const address=String(url);calls.push({url:address,method:options.method||'GET',body:options.body});
  if(address.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:userId,email_confirmed_at:'2026-10-20T13:00:00Z'})};
  if(address==='https://oauth2.googleapis.com/token')return {ok:true,json:async()=>({access_token:'fake-google-token'})};
  if(address.includes('sheets.googleapis.com') && options.method==='PUT')return {ok:true,json:async()=>({updatedCells:1})};
  if(address.includes('sheets.googleapis.com'))return {ok:true,json:async()=>({values:fakeRows})};
  throw Error('Unexpected HTTP call');
 }
 vm.runInNewContext(js,{
  Deno:{env:{get(k){return secret[k]}},serve(fn){handle=fn}},
  Response,URLSearchParams,Headers,Uint8Array,TextEncoder,atob,btoa,
  crypto:{subtle:{importKey:async()=>({}),sign:async()=>new Uint8Array([1,2,3])}},
  fetch:fetchMock,
 });
 return {calls,handler:handle};
}
const request=(method='GET',origin=approvedOrigin,bearer='',body)=>({
 method,headers:new Headers({
   ...(origin?{Origin:origin}:{}),
   ...(bearer?{Authorization:'Bearer '+bearer}:{}),
 }),json:async()=>body,
});
{
 const {handler,calls}=createHarness();
 const p=await handler(request('OPTIONS'));
 assert.equal(p.status,204,'Préflight validé sans identifiants');
 assert.equal(p.headers.get('Access-Control-Allow-Origin'),approvedOrigin,'CORS limité à l’origine officielle');
 assert.ok(p.headers.get('Access-Control-Allow-Headers').includes('authorization'),'En-tête JWT autorisé par le CORS');
 assert.equal(calls.length,0,'Préflight ne doit jamais atteindre Supabase Auth ou Google');
 const bad=await handler(request('OPTIONS','https://attacker.example'));
 assert.equal(bad.status,403,'Origine tierce rejetée au préflight');
 assert.equal(bad.headers.has('Access-Control-Allow-Origin'),false,'Pas de CORS pour origines non autorisées');
 const unauth=await handler(request('GET'));
 assert.equal(unauth.status,403,'GET sans JWT rejeté même si préflight public');
 assert.equal(calls.length,0,'GET non autorisé ne doit pas lire les sources');
}
{
 const {handler,calls}=createHarness('different-user-id');
 const denied=await handler(request('GET',approvedOrigin,'valid.other.jwt'));
 assert.equal(denied.status,403,'Un autre compte Supabase ne peut pas consulter les sources');
 assert.ok(!calls.some(x=>x.url.includes('sheets.googleapis.com')),'L’utilisateur non autorisé ne déclenche aucune lecture Sheets');
}
{
 const {handler,calls}=createHarness();
 const result=await handler(request('GET',approvedOrigin,'valid.owner.jwt'));
 assert.equal(result.status,200,'Le propriétaire peut lire le registre');
 const json=await result.json();
 assert.equal(json.rows.length,2,'Les deux entrées de test doivent être lues');
 assert.equal(json.rows[0].transcript,'Présent');
 assert.equal(json.rows[0].official,'Absent');
 assert.ok(!JSON.stringify(json).includes('NE_JAMAIS_RETOURNER_CECI'),'Le serveur ne doit pas retourner les liens ou notes privées');
 assert.ok(!Object.hasOwn(json.rows[0],'row'),'Les numéros internes de ligne doivent rester côté serveur');
 const conflict=await handler(request('PATCH',approvedOrigin,'valid.owner.jwt',{
  courseKey:'cellules::p01',field:'transcript',expected:'Absent',next:'Présent'
 }));
 assert.equal(conflict.status,409,'Un conflit doit refuser d’écraser la valeur');
 const invalid=await handler(request('PATCH',approvedOrigin,'valid.owner.jwt',{
  courseKey:'cellules::p01',field:'notes',expected:'Présent',next:'Absent'
 }));
 assert.equal(invalid.status,400,'Les autres colonnes sont non modifiables');
 assert.ok(!calls.some(c=>c.method==='PUT'),'Aucune écriture en conflit ou champ interdit');
 const updated=await handler(request('PATCH',approvedOrigin,'valid.owner.jwt',{
  courseKey:'cellules::p01',field:'transcript',expected:'Présent',next:'Absent'
 }));
 assert.equal(updated.status,200,'Modification autorisée en contexte contrôlé');
 const put=calls.find(c=>c.method==='PUT');
 assert.ok(put,'Une écriture Google Sheets doit être lancée');
 assert.ok(put.url.includes('valueInputOption=RAW'),'Écriture sans exécution de formules');
 assert.ok(put.url.includes('D2'),'Seule la colonne transcript D est mise à jour');
 assert.deepEqual(JSON.parse(put.body).values,[['Absent']]);
}
console.log('✅ Edge Function : CORS sans JWT pour OPTIONS, propriétaire obligatoire, lecture restreinte et conflits protégés');
