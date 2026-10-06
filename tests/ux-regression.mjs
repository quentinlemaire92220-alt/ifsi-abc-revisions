import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
const meta=JSON.parse(read('build-meta.json'));

assert.match(meta.version,/^\d+\.\d+(?:\.\d+)?$/,'Version build-meta invalide');
assert.match(String(meta.build),/^\d+$/,'Build build-meta invalide');

const appVersion=read('app-version-v742.js');
assert.ok(appVersion.includes(`const VERSION='${meta.version}'`),'app-version désynchronisée de build-meta');

const index=read('index.html');
assert.ok(index.includes(`sw.js?v=${meta.build}`),'Service worker non cache-busté avec le build courant');
const scriptRefs=[...index.matchAll(/<script src="\.\/([^"?]+\.js)\?v=(\d+)"><\/script>/g)];
assert.ok(scriptRefs.length>=40,`Trop peu de modules JS versionnés dans index.html: ${scriptRefs.length}`);
for(const [,name,build] of scriptRefs)assert.equal(build,String(meta.build),`Cache-busting désynchronisé pour ${name}`);

const sw=read('sw.js');
assert.ok(sw.includes(`V${meta.version} build ${meta.build}`),'Entête service worker désynchronisé');
assert.ok(sw.includes(`ifsi-abc-v${meta.version.replaceAll('.','-')}-local-`),'Nom de cache PWA désynchronisé');

const moduleMatch=sw.match(/const MODULES=\[(.*?)\];for/s);
assert.ok(moduleMatch,'Liste MODULES absente du service worker');
const swModules=[...moduleMatch[1].matchAll(/"([^"]+\.js)"/g)].map(m=>m[1]);
const indexModules=scriptRefs.map(m=>m[1]);
const releaseChangelog=`v${meta.build}-changelog.js`;
assert.ok(indexModules.includes(releaseChangelog),`Changelog de release absent de l’index: ${releaseChangelog}`);
assert.deepEqual(swModules,indexModules,'index.html et service worker ne chargent pas les mêmes modules dans le même ordre');

const baseMatch=sw.match(/const BASE_ASSETS=\[(.*?)\];/s);
assert.ok(baseMatch,'Liste BASE_ASSETS absente du service worker');
const baseAssets=[...baseMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1].replace(/^\.\//,'').replace(/\?.*$/,''));
for(const name of swModules)assert.ok(baseAssets.includes(name),`Module absent du pré-cache PWA: ${name}`);

const features=read('features-v9.js');
assert.match(features,/function ensureSingleFavoriteButton\(\)/,'Garde-fou favori QCM unique absent');
assert.match(features,/cleanMetaText\(theme\)===cleanMetaText\(course\)/,'Déduplication Cours/Thème absente');

const themes=read('v79-themes.js');
assert.match(themes,/function clearCourseCustomizer\(\)/,'Nettoyage du personnalisateur historique absent');
assert.match(themes,/querySelector\('#v79Builder'\)\?\.remove\(\)/,'Ancien builder Cours non supprimé');
assert.match(themes,/querySelector\('#v79ThemesCard'\)\?\.remove\(\)/,'Ancienne carte Thèmes non supprimée');

const course=read('v74-pack.js');
assert.ok(course.includes('Réviser ce cours'),'Action Réviser ce cours absente');
assert.ok(course.includes('Tous les QCM du cours'),'Action Tous les QCM du cours absente');
assert.ok(!course.includes('QCM favoris de ce cours'),'Ancienne action Favoris du cours réintroduite');

const revision=read('v81-suite.js');
for(const token of ['id="vcrCourse"','id="vcrTheme"','data-cdiff','data-ccount','data-cmode','id="vcrLaunch"'])assert.ok(revision.includes(token),`Constructeur Révision incomplet: ${token}`);
assert.ok(revision.includes('Correction après chaque question.'),'Texte mode Entraînement absent');
assert.ok(revision.includes('Correction et résultat uniquement à la fin.'),'Texte mode Examen absent');

const redesign=read('v8309-revision-redesign.js');
for(const token of ['v8309WeakBtn','Plus de filtres','v8309-quick','v8309-exam','v8309-goal'])assert.ok(redesign.includes(token),`Révision allégée incomplète: ${token}`);

const homeResources=read('v8312-home-revision.js');
for(const token of ["h.querySelector('.v76-today')?.remove()","📚 Ressources ajoutées","resourceEntries()","appEntries()","Voir toutes les ressources →","v8312MyRevision","dash=document.createElement('div')","grid-template-columns:minmax(0,1.8fr) repeat(3,minmax(0,.55fr))"])assert.ok(homeResources.includes(token),`Accueil/Révision V8.30.15 incomplet: ${token}`);
assert.ok(!homeResources.includes('data-newsfilter="app"'),'Les évolutions techniques ne doivent plus être affichées dans les filtres de l’accueil');
assert.ok(!homeResources.includes("if(!dash)return false"),'Ma révision ne doit plus dépendre de la présence de l’ancien dashboard');

const baseChangelog=read('changelog-v742.js');
for(const token of ["function seedUnified(card)","if(!$('v742Changelog'))injectUnified()","new MutationObserver(()=>{removeLegacy();if(!$('v742Changelog'))injectUnified()})"])assert.ok(baseChangelog.includes(token),`Garde-fou changelog historique absent: ${token}`);
assert.ok(!baseChangelog.includes('alreadyCurrent'),'Le journal historique ne doit plus réinitialiser une version moderne');

const startup=read('v8303-home-startup.js');
for(const token of ["if(!$('v742Changelog'))window.IFSI_CHANGELOG?.refresh?.()","if(ready||++ticks>=20)clearInterval(timer)"])assert.ok(startup.includes(token),`Stabilisation démarrage incomplète: ${token}`);
assert.ok(!startup.includes('ticks>=80'),'La boucle de synchronisation accueil ne doit plus durer 8 secondes');

const settings=read('v87-settings.js');
for(const token of ['Journal des évolutions','Historique UX/UI, technique et correctifs','window.IFSI_V8312?.appEntries?.()'])assert.ok(settings.includes(token),`Journal technique Paramètres incomplet: ${token}`);

console.log(`✅ Régression UX et cohérence release contrôlées pour V${meta.version} build ${meta.build}`);
