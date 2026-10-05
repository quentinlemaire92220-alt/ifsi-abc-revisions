import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
const has=(src,marker,msg)=>assert(src.includes(marker),msg||`Marqueur absent: ${marker}`);

const suites=[
  {
    file:'v81-suite.js',
    markers:[
      "document.querySelectorAll('[data-qmin]').forEach",
      "document.querySelectorAll('[data-mock]').forEach",
      "document.querySelectorAll('[data-pre]').forEach",
      "document.querySelectorAll('[data-pren]').forEach",
      "$('v81Weak').onclick=startWeak",
      "$('v81StartPre').onclick=startPre",
      "$('v81Back').onclick=()=>window.show?.('home')",
      "typeof begin==='function'?begin(qs)"
    ]
  },
  {
    file:'v828-revision-clean.js',
    markers:[
      "if(id!=='v81Hub')$('v81Hub')?.classList.add('hidden')",
      "window.IFSI_V81.showHub=function()",
      "ensureToggle(goal,'v828GoalToggle'",
      "ensureToggle(pre,'v828PreToggle'",
      "ensureToggle(search,'v828SearchToggle'"
    ]
  },
  {
    file:'v87-settings.js',
    markers:[
      "$('v87Home').onclick",
      "$('v87Courses').onclick",
      "$('v87Anat').onclick",
      "$('v87Center').onclick",
      "$('v87Settings').onclick",
      "$('v87ExportResults').onclick",
      "$('v87ExportBackup').onclick",
      "$('v87Update').onclick",
      "$('v87Reload').onclick",
      "$('v87Improve').onclick"
    ]
  },
  {
    file:'v79-themes.js',
    markers:[
      "querySelectorAll('[data-v79theme]')",
      "querySelectorAll('[data-v79diff]')",
      "querySelectorAll('[data-v79count]')",
      "querySelectorAll('[data-v79mode]')",
      "querySelectorAll('[data-v79choose]')",
      "querySelectorAll('[data-v79quick]')",
      "$79('v79Launch').onclick"
    ]
  },
  {
    file:'v74-pack.js',
    markers:[
      "querySelectorAll('[data-v74result]')",
      "querySelectorAll('[data-course74]')",
      "querySelectorAll('[data-docfav]')",
      "querySelectorAll('[data-vocal74]')",
      "querySelectorAll('[data-vocalfav74]')",
      "querySelectorAll('[data-favqopen]')",
      "querySelectorAll('[data-favqremove]')",
      "querySelectorAll('[data-favvopen]')",
      "querySelectorAll('[data-favvremove]')"
    ]
  },
  {
    file:'vocals-v73.js',
    markers:[
      "querySelectorAll('[data-vocal]')",
      "querySelectorAll('[data-listened]')",
      "querySelectorAll('[data-favorite]')",
      "vocalPlayerListened",
      "vocalPlayerFavorite"
    ]
  },
  {
    file:'v83-anatomy-interactive.js',
    markers:[
      "$('v83Back').onclick",
      "querySelectorAll('[data-v83diagram]')",
      "querySelectorAll('[data-v83mode]')",
      "$('v83Reveal')?.addEventListener('click'",
      "querySelectorAll('[data-v83choice]')",
      "$('v83FullTest')?.addEventListener('click'",
      "$('v83Restart')?.addEventListener('click'",
      "$('v83Fav')?.addEventListener('click'",
      "$('v83ZoomOpen')?.addEventListener('click'",
      "$('v83ZoomClose')?.addEventListener('click'",
      "$('v83ZoomPlus')?.addEventListener('click'",
      "$('v83ZoomMinus')?.addEventListener('click'",
      "$('v83ZoomReset')?.addEventListener('click'"
    ]
  },
  {
    file:'calculs-parcours-v1.js',
    markers:[
      "$('calcContinue').onclick",
      "querySelectorAll('[data-calcprog]')",
      "querySelectorAll('[data-calc20]')"
    ]
  }
];

for(const suite of suites){
  const src=read(suite.file);
  for(const marker of suite.markers)has(src,marker,`${suite.file}: câblage manquant pour ${marker}`);
}

for(const [file,prefix] of [
  ['v814-respiratory-atlas.js','v814'],
  ['v815-urinary-atlas.js','v815'],
  ['v816-endocrine-atlas.js','v816'],
  ['v817-immune-atlas.js','v817'],
  ['v822-nervous-atlas.js','v822'],
  ['v823-cardiovascular-atlas.js','v823'],
  ['v824-digestive-atlas.js','v824']
]){
  const src=read(file);
  for(const marker of [
    `querySelectorAll('[data-${prefix}id]')`,
    `querySelectorAll('[data-${prefix}open]')`,
    `querySelectorAll('[data-${prefix}fav]')`,
    `$('${prefix}Back').onclick`,
    `$('${prefix}ZoomOpen').onclick`,
    `$('${prefix}Close').onclick`,
    `$('${prefix}Plus').onclick`,
    `$('${prefix}Minus').onclick`,
    `$('${prefix}Reset').onclick`
  ])has(src,marker,`${file}: câblage manquant pour ${marker}`);
}

const index=read('index.html');
for(const marker of [
  'onclick="startQuick()"',
  'onclick="startCustom()"',
  'onclick="startErrors()"',
  'onclick="validateQ()"',
  'onclick="nextQ()"',
  'onclick="showProgress()"'
])has(index,marker,`index.html: bouton principal non câblé: ${marker}`);

const v82=read('v82-nav-anatomy.js');
for(const marker of [
  "$('v82Back')?.addEventListener('click'",
  "querySelectorAll('[data-v82toggle]')",
  "querySelectorAll('[data-v82diagram]')",
  "querySelectorAll('[data-v82fav]')",
  "$('v82Continue').onclick",
  "$('v82Courses').onclick",
  "$('v82Anat').onclick",
  "$('v82Center').onclick"
])has(v82,marker,`v82-nav-anatomy.js: câblage actif manquant: ${marker}`);

console.log('✅ Audit boutons: câblage statique principal OK.');
