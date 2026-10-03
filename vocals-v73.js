(()=>{
'use strict';
const VERSION='7.3';
let V=[];
const $v=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const drivePreview=id=>`https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const driveView=id=>`https://drive.google.com/file/d/${encodeURIComponent(id)}/view?usp=drivesdk`;

function addStyles(){
  if($v('v73css'))return;
  const s=document.createElement('style');s.id='v73css';s.textContent=`
  nav.v73-nav{grid-template-columns:repeat(6,1fr)}
  .v73-head{display:grid;gap:11px}.v73-filters{display:grid;grid-template-columns:2fr 1fr;gap:9px}
  .v73-list{display:grid;gap:9px}.v73-card{border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--card)}
  .v73-card .title{font-weight:850;line-height:1.3;margin:7px 0 11px}.v73-card .num{font-size:11px;font-weight:900;color:var(--p)}
  .v73-player{position:sticky;top:8px;z-index:4;border:1px solid #bbaae8;background:var(--card)}
  .v73-player iframe{display:block;width:100%;height:150px;border:0;border-radius:13px;background:#f2eff8;margin-top:12px}
  .v73-player-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.v73-player-actions .btn{flex:1;min-width:150px}
  .v73-empty{text-align:center;padding:24px 10px;color:var(--muted)}
  body.v72-dark .v73-card,body.v72-dark .v73-player{background:#211e2a;color:#f4f0fb;border-color:#3b3548}
  @media(min-width:700px){.v73-list{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:620px){nav.v73-nav button{font-size:10px;padding:8px 0}.v73-filters{grid-template-columns:1fr}.v73-player{position:static}.v73-player iframe{height:145px}}
  `;document.head.appendChild(s);
}

function injectUI(){
  if(!$v('vocals')){
    const sec=document.createElement('section');sec.id='vocals';sec.className='hidden';
    sec.innerHTML=`
      <div class="card v73-head">
        <div class="row"><div><h2 style="margin:0">🎧 Vocaux</h2><div class="small"><span id="vocalCount">0</span> vocaux Drive</div></div><span class="badge">Audio</span></div>
        <div class="warn">🌐 Internet nécessaire pour écouter les vocaux. Les fichiers restent hébergés sur Google Drive et s’ouvrent en lecture seule.</div>
        <div class="v73-filters"><input id="vocalSearch" type="text" autocomplete="off" placeholder="Rechercher un vocal…"><select id="vocalCourse"></select></div>
      </div>
      <div id="vocalPlayer" class="card v73-player hidden">
        <div class="row"><div><div class="small" id="vocalPlayerCourse"></div><h3 id="vocalPlayerTitle" style="margin:3px 0 0"></h3></div><button id="vocalClose" class="btn outline" type="button">Fermer</button></div>
        <iframe id="vocalFrame" title="Lecteur audio Google Drive" loading="lazy" allow="autoplay"></iframe>
        <div class="v73-player-actions"><a id="vocalDrive" class="btn outline" target="_blank" rel="noopener">Ouvrir dans Drive ↗</a></div>
        <div class="small" style="margin-top:8px">Si le lecteur intégré ne démarre pas sur ton appareil, utilise « Ouvrir dans Drive ».</div>
      </div>
      <div id="vocalList" class="v73-list"></div>`;
    const quiz=$v('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',sec);else document.querySelector('.app')?.appendChild(sec);
    $v('vocalSearch').oninput=renderVocals;$v('vocalCourse').onchange=renderVocals;$v('vocalClose').onclick=closePlayer;
  }
  const nav=document.querySelector('nav');
  if(nav&&!$v('nv')){
    nav.classList.add('v73-nav');
    const err=[...nav.querySelectorAll('button')].find(b=>b.textContent.includes('Erreurs'));
    const b=document.createElement('button');b.id='nv';b.type='button';b.innerHTML='🎧<br>Vocaux';b.onclick=showVocals;
    if(err)nav.insertBefore(b,err);else nav.appendChild(b);
  }
  patchShow();injectHomeNews();
}

let showPatched=false;
function patchShow(){
  if(showPatched||typeof window.show!=='function')return;
  const baseShow=window.show;
  window.show=function(id){
    if(id==='vocals'){
      ['home','sheets','infographics','quiz','result','progress'].forEach(v=>$v(v)?.classList.add('hidden'));
      $v('vocals')?.classList.remove('hidden');
      document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));
      $v('nv')?.classList.add('on');renderVocals();return;
    }
    $v('vocals')?.classList.add('hidden');$v('nv')?.classList.remove('on');baseShow(id);
  };
  showPatched=true;
}

function injectHomeNews(){
  const home=$v('home');if(!home||$v('v73News'))return;
  const card=document.createElement('div');card.id='v73News';card.className='card';
  card.innerHTML='<b>🎧 Nouveau : les vocaux dans l’appli</b><div class="small" style="margin-top:5px">Écoute les vocaux de révision depuis l’onglet Vocaux sans quitter le site. Une connexion Internet reste nécessaire pour le streaming Drive.</div>';
  const app=[...home.querySelectorAll('.section')].find(x=>x.textContent.trim()==='Application');if(app)app.insertAdjacentElement('beforebegin',card);else home.appendChild(card);
}

function populateCourses(){
  const sel=$v('vocalCourse');if(!sel)return;const current=sel.value||'Toutes les matières';
  const courses=[...new Set(V.map(x=>x.course))].sort((a,b)=>a.localeCompare(b,'fr'));
  sel.innerHTML=['Toutes les matières',...courses].map(c=>`<option value="${esc(c)}">${esc(c)}${c==='Toutes les matières'?'':` (${V.filter(x=>x.course===c).length})`}</option>`).join('');
  if([...sel.options].some(o=>o.value===current))sel.value=current;
}

function renderVocals(){
  const list=$v('vocalList');if(!list)return;
  const term=norm($v('vocalSearch')?.value.trim()||''),course=$v('vocalCourse')?.value||'Toutes les matières';
  const a=V.filter(x=>(course==='Toutes les matières'||x.course===course)&&(!term||norm(`${x.title} ${x.course}`).includes(term)));
  $v('vocalCount').textContent=a.length;
  if(!a.length){list.innerHTML='<div class="card v73-empty">Aucun vocal ne correspond à cette recherche.</div>';return}
  list.innerHTML=a.map(x=>`<article class="v73-card"><div class="row"><span class="badge">${esc(x.course)}</span><span class="num">Vocal ${String(x.number).padStart(2,'0')}</span></div><div class="title">${esc(x.title)}</div><button class="btn primary full" type="button" data-vocal="${esc(x.id)}">▶ Écouter dans l’appli</button></article>`).join('');
  list.querySelectorAll('[data-vocal]').forEach(b=>b.onclick=()=>playVocal(b.dataset.vocal));
}

function playVocal(id){
  const x=V.find(v=>v.id===id);if(!x)return;
  if(!navigator.onLine){alert('Une connexion Internet est nécessaire pour écouter les vocaux Google Drive.');return}
  $v('vocalPlayerCourse').textContent=`${x.course} • Vocal ${String(x.number).padStart(2,'0')}`;
  $v('vocalPlayerTitle').textContent=x.title;$v('vocalFrame').src=drivePreview(x.driveId);$v('vocalDrive').href=driveView(x.driveId);
  $v('vocalPlayer').classList.remove('hidden');$v('vocalPlayer').scrollIntoView({behavior:'smooth',block:'start'});
}
function closePlayer(){const f=$v('vocalFrame');if(f)f.src='about:blank';$v('vocalPlayer')?.classList.add('hidden')}
function showVocals(){window.show?.('vocals')}
window.showVocals=showVocals;

async function loadVocals(){
  try{const r=await fetch('./vocals.json',{cache:'no-store'});if(!r.ok)throw new Error('catalogue indisponible');V=await r.json();V.sort((a,b)=>a.course.localeCompare(b.course,'fr')||a.number-b.number);populateCourses();renderVocals();setVersion();lockVersion();return true}
  catch(e){console.error('Vocaux',e);const list=$v('vocalList');if(list)list.innerHTML='<div class="card v73-empty">Impossible de charger le catalogue des vocaux.</div>';return false}
}
function setVersion(){const u=$v('update');if(u&&V.length)u.textContent=`Application prête • V${VERSION} locale : ${V.length} vocaux Drive avec lecteur intégré.`;const b=u?.parentElement?.querySelector('b');if(b)b.textContent=`V${VERSION} local`}
function lockVersion(){let ticks=0;const t=setInterval(()=>{setVersion();if(++ticks>=40)clearInterval(t)},250)}

addStyles();injectUI();loadVocals();
window.IFSI_V73={version:VERSION,getVocals:()=>V,play:playVocal,render:renderVocals};
})();
