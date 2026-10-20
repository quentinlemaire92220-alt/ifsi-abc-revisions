import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const client=fs.readFileSync('private-sources-v1.js','utf8');
const backend=fs.readFileSync('supabase/functions/ifsi-private-sources/index.ts','utf8');
const followup=fs.readFileSync('course-followup-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8'));
const ctx={window:{},document:{getElementById:()=>null},fetch:()=>{throw Error('Aucun fetch au chargement initial')}};
vm.runInNewContext(client,ctx,{filename:'private-sources-v1.js'});
const sync=ctx.window.IFSI_PRIVATE_SOURCES;
assert.ok(sync&&typeof sync.normalizeRow==='function'&&typeof sync.mount==='function');
assert.equal(Array.from(sync.states).join('|'),'À vérifier|Présent|Absent');
const r=sync.normalizeRow({key:'systeme_respiratoire::p01',transcript:'Présent',captures:null,official:'Non trouvé',production:'BROUILLON_PRIVÉ'});
assert.equal(r.transcript,'Présent');
assert.equal(r.captures,'À vérifier');
assert.equal(r.official,'À vérifier');
assert.equal(r.production,'BROUILLON_PRIVÉ');
assert.equal(sync.normalizeRow({key:'../../file',transcript:'Présent'}),null);
assert.equal(sync.sourceRecord('systeme_respiratoire'),null,'Ne pas inventer une présence avant connexion');
assert.ok(!/\b(localStorage|sessionStorage)\.setItem\b/.test(client),'Le token ne doit pas être persisté en storage');
assert.ok(client.includes('create_user:false'),'La demande Magic Link publique ne doit pas créer un nouveau compte');
assert.ok(!client.includes('create_user:true'),'Inscription libre interdite dans le pilote privé');
assert.ok(client.includes("auth/v1/otp?redirect_to="),'Le retour du Magic Link doit cibler GitHub Pages');
assert.ok(client.includes('acceptMagicLinkRedirect();'),'La session du lien doit être consommée dès le chargement');
assert.ok(client.includes('history?.replaceState'),'Le fragment contenant les jetons doit être supprimé');
assert.ok(!client.includes('cfOwnerCode')&&!client.includes('verifyOtp'),'Ancien écran de code OTP conservé malgré le lien magique');
assert.ok(!client.includes('refresh_token'),'Ne pas exploiter ni conserver le jeton de renouvellement');
const callbackLocation={hash:'#access_token=aaa.bbb.ccc&refresh_token=dont-keep-me&type=magiclink',pathname:'/ifsi-abc-revisions/',search:''};
let scrubbed=false,networkCalls=0;
const callbackWindow={
 location:callbackLocation,
 history:{state:null,replaceState(_state,_title,url){scrubbed=true;assert.equal(url,'/ifsi-abc-revisions/');callbackLocation.hash='';}}
};
vm.runInNewContext(client,{
 window:callbackWindow,URLSearchParams,document:{getElementById:()=>null},
 fetch:()=>{networkCalls++;throw Error('Ne pas appeler le réseau avant affichage')}
},{filename:'private-sources-v1.js'});
assert.equal(scrubbed,true,'Le lien de connexion ne doit pas rester dans la barre d’adresse');
assert.equal(callbackLocation.hash,'','Fragment sensible encore dans l’URL');
assert.equal(networkCalls,0,'Réseau déclenché avant contrôle de compte');
const rejectedLocation={hash:'#error=access_denied&error_code=otp_expired',pathname:'/ifsi-abc-revisions/',search:''};
let rejectionScrubbed=false;
vm.runInNewContext(client,{
 window:{location:rejectedLocation,history:{state:null,replaceState(){rejectionScrubbed=true;rejectedLocation.hash=''}}},
 URLSearchParams,document:{getElementById:()=>null},
 fetch:()=>{throw Error('No network expected')}
});
assert.equal(rejectionScrubbed,true,'Les liens invalides ou expirés doivent être purgés');
assert.ok(!/service_role|sb_secret_|IFSI_SOURCE_SHEET_ID|IFSI_GOOGLE_SERVICE_ACCOUNT_JSON/.test(client),'Un secret serveur apparaît dans le client');
assert.ok(!/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{15,}/.test(client),'ID de registre privé présent en clair');
assert.ok(backend.includes('IFSI_SOURCE_OWNER_UID')&&backend.includes('user.id === ownerId'),'Autorisation par UUID signée requise');
assert.ok(backend.includes('ownerAuthenticated(req)'),'Le serveur doit contrôler la session');
assert.ok(backend.includes('reqOrigin !== origin'),'Origine HTTP à contrôler');
assert.ok(backend.includes('https://quentinlemaire92220-alt.github.io'),'Origine GitHub Pages non strictement autorisée');
assert.ok(backend.includes('req.method === "OPTIONS" && reqOrigin === origin'),'Le préflight doit fonctionner sans JWT');
const preflightIndex=backend.indexOf('req.method === "OPTIONS" && reqOrigin === origin');
const authenticationIndex=backend.indexOf('ownerAuthenticated(req)');
assert.ok(preflightIndex>=0 && authenticationIndex>preflightIndex,'Authentification exigée avant le préflight');
assert.ok(backend.includes('if (reqOrigin !== origin) return response(null, 403'),'Origines tierces non bloquées');
assert.ok(backend.includes('if (!(await ownerAuthenticated(req)))'),'Les vraies opérations doivent rester authentifiées');

assert.ok(backend.includes('Object.hasOwn(FIELDS, field)'),'Modification réservée aux trois colonnes sources');
assert.ok(backend.includes('target[field] !== expected'),'Conflits de statut non contrôlés');
assert.ok(backend.includes('valueInputOption=RAW'),'Écriture Google Sheets explicite et sans formule');
assert.ok(!backend.includes('SUPABASE_SERVICE_ROLE_KEY')&&!backend.includes('service_role'),'Aucune clé admin en transit');
assert.ok(backend.includes('return response(reqOrigin, 503'),'Intégration incomplète doit échouer fermée');
assert.ok(!/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{15,}/.test(backend),'ID de Sheets privé dans le dépôt');
assert.ok(followup.includes('data-ifsi-source-course'),'Emplacement des statuts absent dans les cartes et les séances');
assert.ok(followup.includes('sourceCourseId(e)'),'Séance sans cours explicite doit avoir un rattachement sûr');
assert.ok(followup.includes('matches.length===1'),'Un titre ambigu ne doit jamais être rattaché arbitrairement');
assert.ok(index.includes('private-sources-v1.js'),'Nouveau module absent du HTML');
const scripts=[...index.matchAll(/<script src="\.\/([^"?]+\.js)\?v=\d+"><\/script>/g)].map(m=>m[1]);
assert.equal(scripts[0],'private-sources-v1.js','L’authentification doit traiter le fragment avant tout autre script');
assert.ok(scripts.indexOf('private-sources-v1.js')<scripts.indexOf('analytics-v77.js'),'Le jeton ne doit pas rester dans l’URL pendant les statistiques');
assert.ok(sw.includes("'./private-sources-v1.js'"),'Nouveau module absent du cache PWA');
assert.ok(registry.courses.length>=45,'Catalogue inattendu');
console.log('✅ Pilote de sources privées : verrouillage, 3 états, erreurs et contrat de confidentialité');
