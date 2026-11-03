(()=>{
'use strict';
const VERSION='7.3.2';
const STORAGE='ifsiabc_vocals_v1';
let V=[];
let currentId=null;
let VS=loadState();
const PLAYLIST_STORAGE='ifsiabc_audio_playlist_v1';
let playlist=loadPlaylist(),playlistActive=false,playlistOpen=false;
function loadPlaylist(){try{const p=JSON.parse(localStorage.getItem(PLAYLIST_STORAGE)||'{}');return {ids:[...new Set((Array.isArray(p.ids)?p.ids:[]).filter(id=>typeof id==='string'))],autoplay:p.autoplay!==false};}catch{return {ids:[],autoplay:true}}}
function savePlaylist(){try{localStorage.setItem(PLAYLIST_STORAGE,JSON.stringify(playlist));}catch{playlistMessage('La playlist ne peut pas être enregistrée sur cet appareil.');}}
function playlistMessage(message){const node=document.getElementById('vocalPlaylistMessage');if(node)node.textContent=message;}

const $v=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vocalDuration=x=>window.IFSI_AUDIO_MIRRORS?.durationFor(x)??(Number.isFinite(x.durationSeconds)?x.durationSeconds:null);
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const driveStream=id=>`https://drive.usercontent.google.com/download?export=download&id=${encodeURIComponent(id)}&confirm=t`;
const drivePreview=id=>`https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const driveView=id=>`https://drive.google.com/file/d/${encodeURIComponent(id)}/view?usp=drivesdk`;
const originalAudioSource=x=>localAudioSource(x)||driveStream(x.driveId);
const localAudioSource=x=>/^\.\/assets\/audio\/[\w/-]+\.mp3$/.test(x.localAudio||'')?x.localAudio:null;

function loadState(){
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE)||'{}');
    return {listened:[...new Set(Array.isArray(x.listened)?x.listened:[])],favorites:[...new Set(Array.isArray(x.favorites)?x.favorites:[])],lastId:typeof x.lastId==='string'?x.lastId:null,lastAt:typeof x.lastAt==='string'?x.lastAt:null,positions:x.positions&&typeof x.positions==='object'?x.positions:{}};
  }catch{return {listened:[],favorites:[],lastId:null,lastAt:null,positions:{}}}
}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(VS))}
function has(kind,id){return VS[kind]?.includes(id)}
function toggleArray(kind,id){const s=new Set(VS[kind]||[]);s.has(id)?s.delete(id):s.add(id);VS[kind]=[...s];saveState();renderVocals();renderResume();renderPlayerActions()}
function toggleListened(id){toggleArray('listened',id)}
function toggleFavorite(id){toggleArray('favorites',id)}
function rememberLast(id){VS.lastId=id;VS.lastAt=new Date().toISOString();saveState();renderResume()}
let lastSavedSecond=-1,positionReady=false;
function rememberPosition(){const a=$v('vocalAudio');if(!positionReady||!currentId||!a||!Number.isFinite(a.currentTime))return;const sec=Math.max(0,Math.floor(a.currentTime));if(sec===lastSavedSecond)return;if(!a.paused&&sec%5!==0)return;lastSavedSecond=sec;VS.positions=VS.positions||{};VS.positions[currentId]=sec;saveState()}
function restorePosition(){positionReady=true;const a=$v('vocalAudio');if(!currentId||!a)return;const sec=Number(VS.positions?.[currentId]||0);if(Number.isFinite(sec)&&sec>0&&(!Number.isFinite(a.duration)||sec<a.duration-3)){try{a.currentTime=sec}catch{}}}
function handleVocalEnded(){clearFinishedPosition();if(playlistActive&&playlist.autoplay)stepPlaylist(1,true)}
function clearFinishedPosition(){positionReady=false;if(!currentId)return;VS.positions=VS.positions||{};VS.positions[currentId]=0;lastSavedSecond=0;saveState()}

function addStyles(){
  if($v('v73css'))return;
  const s=document.createElement('style');s.id='v73css';s.textContent=`
  nav.v73-nav{grid-template-columns:repeat(6,1fr)}
  .v73-head{display:grid;gap:11px}.v73-filters{display:grid;grid-template-columns:2fr 1fr 1fr;gap:9px}
  .v73-list{display:grid;gap:9px}.v73-card{border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--card)}
  .v73-card .title{font-weight:850;line-height:1.3;margin:7px 0 11px}.v73-card .num{font-size:11px;font-weight:900;color:var(--p)}
  .v73-card-actions{display:grid;grid-template-columns:1fr auto;gap:8px}.v73-icon{border:1px solid var(--line);background:var(--card);border-radius:12px;min-width:44px;padding:8px 10px;font-size:18px;cursor:pointer}.v73-icon.on{background:#fff0f5;border-color:#e7a4bc}
  .v73-status{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.v73-mini{font-size:11px;font-weight:800;border-radius:999px;padding:4px 8px;background:#f2eff8;color:#5c3ba7}.v73-mini.done{background:#eaf8ef;color:#216e3b}.v73-mini.provisional{background:#efe9fa;color:#6540a3}
  .v73-player{position:sticky;top:8px;z-index:4;border:1px solid #bbaae8;background:var(--card)}
  .v73-player audio{display:block;width:100%;margin-top:12px}.v73-drive-fallback{margin-top:12px;border:1px solid var(--line);border-radius:13px;padding:10px;background:#f7f5fb}.v73-drive-fallback iframe{display:block;width:100%;height:150px;border:0;border-radius:10px;background:#f2eff8;margin-top:8px}
  .v73-player-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}.v73-player-actions .btn{min-width:0}
  .v73-resume{border:1px solid #cfc2ee;background:#faf8ff}.v73-resume .row{align-items:flex-start}.v73-resume-title{font-weight:850;margin:3px 0}.v73-empty{text-align:center;padding:24px 10px;color:var(--muted)}
  body.v72-dark .v73-card,body.v72-dark .v73-player,body.v72-dark .v73-resume{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v73-icon{background:#211e2a;color:#f4f0fb;border-color:#4a4358}body.v72-dark .v73-icon.on{background:#3a2430}
  @media(min-width:700px){.v73-list{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:620px){nav.v73-nav button{font-size:10px;padding:8px 0}.v73-filters{grid-template-columns:1fr}.v73-player{position:static}.v73-drive-fallback iframe{height:145px}.v73-player-actions{grid-template-columns:1fr}.v73-card-actions{grid-template-columns:1fr auto}}
  `;document.head.appendChild(s);
}

function installPlaylistUI(){
  const sec=$v('vocals');if(!sec||$v('vocalPlaylist'))return;
  const css=document.createElement('style');css.textContent=`
  #vocals .v73-head{grid-area:head}#vocals .v73-catalog{min-width:0;grid-area:catalog}
  .v73-playlist{grid-area:playlist;min-width:0;align-self:start}
  .v73-playlist-box{margin-top:0}.v73-playlist-box h3{margin:0}.v73-queue{list-style:none;padding:0;margin:14px 0;display:grid;gap:9px}
  .v73-queue li{display:flex;align-items:center;gap:8px;border:1px solid var(--line);padding:10px;border-radius:14px;min-width:0}
  .v73-queue li[aria-current=true]{border-color:var(--p);background:color-mix(in srgb,var(--p) 12%,var(--card))}
  .v73-queue-title{border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;flex:1;min-width:0;font:inherit;overflow-wrap:anywhere}
  .v73-queue-title b{display:block;font-size:14px}.v73-queue-title small{display:block;color:var(--muted);margin-top:4px}
  .v73-queue-tools{display:grid;grid-template-columns:1fr 1fr;gap:3px;flex:none}.v73-queue-tools button{min-width:36px;min-height:36px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);cursor:pointer}
  .v73-queue-tools button:last-child{grid-column:1/-1}.v73-queue-tools button:disabled{opacity:.35;cursor:default}
  .v73-playlist-controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.v73-playlist-controls .btn{flex:1}
  .v73-add-playlist{width:100%;margin-top:9px;background:transparent;color:var(--p)}.v73-add-playlist[aria-pressed=true]{background:#eaf8ef;color:#216e3b}
  .v73-playlist-message{min-height:1.4em;margin-top:10px}.v73-auto{display:flex;align-items:center;gap:8px;font-size:13px;margin-top:14px}.v73-auto input{width:20px;height:20px;accent-color:var(--p)}
  #vocalPlaylistClose{display:none}#vocalPlayer{position:static;margin-top:12px}.v73-playlist-shade{display:none}
  body.v72-dark .v73-playlist-box{background:#211e2a;border-color:#3b3548;color:#f4f0fb}body.v72-dark .v73-queue-tools button{background:#211e2a;color:#f4f0fb}body.v72-dark .v73-add-playlist{color:#c8b6ff;border-color:#655984}
  body.v72-dark .v73-add-playlist[aria-pressed=true]{background:#20392b;color:#b6efd0;border-color:#568067}
  body.v72-dark .v73-drive-fallback{background:#282330;border-color:#4a4358}
  #vocals button:focus-visible{outline:3px solid var(--a);outline-offset:3px}
  @media(min-width:1120px){body:has(#vocals:not(.hidden)) .app{max-width:1400px}#vocals{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(320px,1fr);grid-template-areas:'head head' 'catalog playlist';gap:14px}.v73-playlist{position:sticky;top:12px;max-height:calc(100dvh - 120px);overflow:auto}.v73-catalog #vocalResume{margin-top:0}}
  @media(max-width:1119px){.v73-playlist{display:none}.v73-playlist.is-open{display:block;position:fixed;inset:12px 12px 100px auto;width:min(440px,calc(100vw - 24px));z-index:1002;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:12px;box-shadow:0 16px 60px #0006}#vocalPlaylistClose{display:inline-block}.v73-playlist-shade.is-open{display:block;position:fixed;inset:0;background:#0008;z-index:1001}.v73-playlist-box{box-shadow:none}body:has(#vocals:not(.hidden) .v73-playlist.is-open){overflow:hidden}}
  @media(max-width:420px){.v73-playlist.is-open{inset:8px 8px 96px;width:calc(100vw - 16px);padding:8px}.v73-queue-tools button{min-width:32px}.v73-playlist-box{padding:12px}}
  `;document.head.appendChild(css);
  const head=sec.querySelector('.v73-head');const button=document.createElement('button');button.id='vocalPlaylistToggle';button.className='btn outline';button.type='button';button.setAttribute('aria-controls','vocalPlaylist');button.setAttribute('aria-expanded','false');button.onclick=openPlaylist;head.querySelector('.row').appendChild(button);
  const catalog=document.createElement('div');catalog.className='v73-catalog';catalog.append($v('vocalResume'),$v('vocalList'));sec.appendChild(catalog);
  const shade=document.createElement('div');shade.className='v73-playlist-shade';shade.onclick=closePlaylist;sec.appendChild(shade);
  const aside=document.createElement('aside');aside.id='vocalPlaylist';aside.className='v73-playlist';aside.setAttribute('aria-label','Ma playlist audio');
  aside.innerHTML=`<div class="card v73-playlist-box"><div class="row"><h3 id="vocalPlaylistTitle">🎧 Ma playlist</h3><button id="vocalPlaylistClose" class="btn outline" type="button">Fermer la playlist</button></div><p id="vocalPlaylistCount" class="small"></p><button id="vocalPlaylistPlay" class="btn primary full" type="button">▶ Tout écouter</button><ol id="vocalPlaylistQueue" class="v73-queue"></ol><label class="v73-auto"><input id="vocalPlaylistAuto" type="checkbox">Enchaîner automatiquement les vocaux</label><p class="small">Playlist enregistrée sur cet appareil.</p><div id="vocalPlaylistMessage" class="small v73-playlist-message" role="status" aria-live="polite"></div></div>`;
  sec.appendChild(aside);aside.appendChild($v('vocalPlayer'));
  const controls=document.createElement('div');controls.className='v73-playlist-controls';controls.innerHTML='<button id="vocalPlaylistPrev" class="btn outline" type="button">⏮ Précédent</button><button id="vocalPlaylistNext" class="btn outline" type="button">Suivant ⏭</button><div id="vocalPlaylistNow" class="small" aria-live="polite"></div>';
  $v('vocalAudio').insertAdjacentElement('afterend',controls);
  $v('vocalPlaylistPrev').onclick=()=>stepPlaylist(-1);$v('vocalPlaylistNext').onclick=()=>stepPlaylist(1);
  $v('vocalPlaylistClose').onclick=closePlaylist;$v('vocalPlaylistPlay').onclick=()=>playPlaylist(playlist.ids[0]);
  $v('vocalPlaylistAuto').onchange=e=>{playlist.autoplay=e.target.checked;savePlaylist();};
  document.addEventListener('keydown',e=>{if(!playlistOpen||$v('vocals').classList.contains('hidden')||!window.matchMedia('(max-width:1119px)').matches)return;if(e.key==='Escape')closePlaylist();if(e.key==='Tab'){const all=[...aside.querySelectorAll('button,input,a,audio')].filter(el=>!el.disabled&&el.getClientRects().length);const first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
  renderPlaylist();
}
function openPlaylist(){playlistOpen=true;$v('vocalPlaylist')?.classList.add('is-open');document.querySelector('.v73-playlist-shade')?.classList.add('is-open');$v('vocalPlaylistToggle')?.setAttribute('aria-expanded','true');if(window.matchMedia('(max-width:1119px)').matches)$v('vocalPlaylistClose')?.focus();}
function closePlaylist(){playlistOpen=false;$v('vocalPlaylist')?.classList.remove('is-open');document.querySelector('.v73-playlist-shade')?.classList.remove('is-open');$v('vocalPlaylistToggle')?.setAttribute('aria-expanded','false');$v('vocalPlaylistToggle')?.focus();}
function playPlaylist(id,quiet=false){if(!playlist.ids.includes(id))return;playVocal(id,{playlist:true,quiet});}
function stepPlaylist(delta,automatic=false){
  if(!playlistActive)return;const i=playlist.ids.indexOf(currentId),next=playlist.ids[i+delta];
  if(i<0||!next){if(automatic)playlistMessage('Playlist terminée.');return;}
  playPlaylist(next,true);
}
function addPlaylist(id){if(!V.some(x=>x.id===id))return;if(!playlist.ids.includes(id)){playlist.ids.push(id);savePlaylist();renderVocals();playlistMessage('Audio ajouté à ma playlist.');}else openPlaylist();}
function editPlaylist(id,action){
  const i=playlist.ids.indexOf(id);if(i<0)return;
  if(action==='remove'){playlist.ids.splice(i,1);if(currentId===id)playlistActive=false;}
  else{const target=i+(action==='up'?-1:1);if(target<0||target>=playlist.ids.length)return;[playlist.ids[i],playlist.ids[target]]=[playlist.ids[target],playlist.ids[i]];}
  savePlaylist();renderVocals();
  const button=[...$v('vocalPlaylistQueue').querySelectorAll('button[data-queue-action]')].find(b=>b.dataset.queueId===id&&b.dataset.queueAction===action&&!b.disabled);
  (button||$v('vocalPlaylistPlay')).focus();
}
function renderPlaylist(){
  const queue=$v('vocalPlaylistQueue');if(!queue)return;
  $v('vocalPlaylistToggle').textContent='☷ Ma playlist · '+playlist.ids.length;
  $v('vocalPlaylistCount').textContent=playlist.ids.length+(playlist.ids.length>1?' vocaux':' vocal')+' · Toutes matières';
  $v('vocalPlaylistPlay').disabled=!playlist.ids.length;$v('vocalPlaylistAuto').checked=playlist.autoplay;
  queue.innerHTML=playlist.ids.map((id,i)=>{const x=V.find(v=>v.id===id);if(!x)return '';return `<li aria-current="${playlistActive&&currentId===id}"><span>${i+1}</span><button class="v73-queue-title" type="button" data-queue-play="${esc(id)}"><b>${esc(x.title)}</b><small>${esc(x.course)} · Vocal ${String(x.number).padStart(2,'0')}</small></button><div class="v73-queue-tools"><button type="button" data-queue-id="${esc(id)}" data-queue-action="up" aria-label="Monter ${esc(x.title)}" ${i===0?'disabled':''}>↑</button><button type="button" data-queue-id="${esc(id)}" data-queue-action="down" aria-label="Descendre ${esc(x.title)}" ${i===playlist.ids.length-1?'disabled':''}>↓</button><button type="button" data-queue-id="${esc(id)}" data-queue-action="remove" aria-label="Retirer ${esc(x.title)}">×</button></div></li>`;}).join('')||'<li class="small">Ajoute des vocaux depuis les cartes pour préparer ton écoute.</li>';
  queue.querySelectorAll('[data-queue-play]').forEach(b=>b.onclick=()=>playPlaylist(b.dataset.queuePlay));queue.querySelectorAll('[data-queue-action]').forEach(b=>b.onclick=()=>editPlaylist(b.dataset.queueId,b.dataset.queueAction));
  const i=playlistActive?playlist.ids.indexOf(currentId):-1,next=V.find(v=>v.id===playlist.ids[i+1]);
  $v('vocalPlaylistPrev').disabled=i<=0;$v('vocalPlaylistNext').disabled=i<0||i>=playlist.ids.length-1;
  $v('vocalPlaylistNow').textContent=i>=0?`${i+1} / ${playlist.ids.length}${next?' · À suivre : '+next.title:' · Dernier vocal'}`:'Écoute individuelle';
}

function injectUI(){
  if(!$v('vocals')){
    const sec=document.createElement('section');sec.id='vocals';sec.className='hidden';
    sec.innerHTML=`
      <div class="card v73-head">
        <div class="row"><div><h2 style="margin:0">🎧 Vocaux</h2><div class="small"><span id="vocalCount">0</span> affichés • <span id="vocalListenedCount">0</span>/<span id="vocalTotalCount">0</span> écoutés • <span id="vocalFavoriteCount">0</span> favoris</div></div><span class="badge">Audio</span></div>
        <div class="warn">🌐 Internet nécessaire pour écouter. ❤️ Favoris, ✅ écoutés et dernier vocal sont enregistrés uniquement sur cet appareil. Ils sont inclus dans l’export/import manuel de progression.</div>
        <div class="v73-filters"><input id="vocalSearch" type="text" autocomplete="off" placeholder="Rechercher un vocal…"><select id="vocalCourse"></select><select id="vocalStateFilter"><option value="all">Tous</option><option value="todo">À écouter</option><option value="done">Écoutés</option><option value="favorites">Favoris</option></select></div>
      </div>
      <div id="vocalResume" class="card v73-resume hidden">
        <div class="row"><div><div class="small">▶ Reprendre le dernier vocal consulté</div><div id="vocalResumeTitle" class="v73-resume-title"></div><div id="vocalResumeCourse" class="small"></div></div><button id="vocalResumeBtn" class="btn primary" type="button">Reprendre</button></div>
        <div class="small" style="margin-top:8px">Le lecteur intégré reprend automatiquement près de la dernière position enregistrée sur cet appareil.</div>
      </div>
      <div id="vocalPlayer" class="card v73-player hidden">
        <div class="row"><div><div class="small" id="vocalPlayerCourse"></div><h3 id="vocalPlayerTitle" style="margin:3px 0 0"></h3></div><button id="vocalClose" class="btn outline" type="button">Fermer</button></div>
        <div id="vocalProvisionalNote" class="small hidden" style="margin-top:6px"></div>
        <audio id="vocalAudio" controls preload="metadata" playsinline></audio>
        <div id="vocalFallback" class="v73-drive-fallback hidden"><div class="small">Le flux audio direct n’est pas disponible pour ce fichier. Le lecteur Google Drive de secours est utilisé.</div><iframe id="vocalFrame" title="Lecteur audio Google Drive de secours" loading="lazy" allow="autoplay"></iframe></div>
        <div class="v73-player-actions"><button id="vocalPlayerListened" class="btn outline" type="button">✅ Marquer écouté</button><button id="vocalPlayerFavorite" class="btn outline" type="button">♡ Ajouter aux favoris</button><button id="vocalFallbackBtn" class="btn outline" type="button">Lecteur Drive de secours</button><a id="vocalDrive" class="btn outline" target="_blank" rel="noopener">Ouvrir dans Drive ↗</a></div>
        <div class="small" style="margin-top:8px">Le lecteur natif permet pause, reprise et déplacement dans le vocal. Si Drive refuse le flux direct, utilise le lecteur de secours ou ouvre le fichier dans Drive.</div>
      </div>
      <div id="vocalList" class="v73-list"></div>`;
    const quiz=$v('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',sec);else document.querySelector('.app')?.appendChild(sec);
    $v('vocalSearch').oninput=renderVocals;$v('vocalCourse').onchange=renderVocals;$v('vocalStateFilter').onchange=renderVocals;$v('vocalClose').onclick=closePlayer;$v('vocalFallbackBtn').onclick=()=>currentId&&useDriveFallback(currentId);const audio=$v('vocalAudio');if(audio){audio.addEventListener('error',()=>{if(currentId)useDriveFallback(currentId)});audio.addEventListener('loadedmetadata',restorePosition);audio.addEventListener('timeupdate',rememberPosition);audio.addEventListener('pause',rememberPosition);audio.addEventListener('ended',handleVocalEnded)}
    $v('vocalResumeBtn').onclick=()=>VS.lastId&&playVocal(VS.lastId);
    $v('vocalPlayerListened').onclick=()=>currentId&&toggleListened(currentId);$v('vocalPlayerFavorite').onclick=()=>currentId&&toggleFavorite(currentId);
  }
  const nav=document.querySelector('nav');
  if(nav&&!$v('nv')){
    nav.classList.add('v73-nav');
    const err=[...nav.querySelectorAll('button')].find(b=>b.textContent.includes('Erreurs'));
    const b=document.createElement('button');b.id='nv';b.type='button';b.innerHTML='🎧<br>Vocaux';b.onclick=showVocals;
    if(err)nav.insertBefore(b,err);else nav.appendChild(b);
  }
  installPlaylistUI();patchShow();injectHomeNews();
}

let showPatched=false;
function patchShow(){
  if(showPatched||typeof window.show!=='function')return;
  const baseShow=window.show;
  window.show=function(id){
    if(id==='vocals'){
      ['home','sheets','infographics','quiz','result','progress'].forEach(v=>$v(v)?.classList.add('hidden'));
      $v('vocals')?.classList.remove('hidden');document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));$v('nv')?.classList.add('on');renderVocals();renderResume();return;
    }
    $v('vocals')?.classList.add('hidden');$v('nv')?.classList.remove('on');baseShow(id);
  };
  showPatched=true;
}

function injectHomeNews(){
  const home=$v('home');if(!home)return;let card=$v('v73News');
  if(!card){card=document.createElement('div');card.id='v73News';card.className='card';const app=[...home.querySelectorAll('.section')].find(x=>x.textContent.trim()==='Application');if(app)app.insertAdjacentElement('beforebegin',card);else home.appendChild(card)}
  card.innerHTML='<b>🎧 Vocaux améliorés</b><div class="small" style="margin-top:5px">Tu peux maintenant marquer les vocaux comme écoutés, les ajouter aux favoris et reprendre rapidement le dernier fichier consulté.</div>';
}

function populateCourses(){
  const sel=$v('vocalCourse');if(!sel)return;const current=sel.value||'Toutes les matières';
  const courses=[...new Set(V.map(x=>x.course))].sort((a,b)=>a.localeCompare(b,'fr'));
  sel.innerHTML=['Toutes les matières',...courses].map(c=>`<option value="${esc(c)}">${esc(c)}${c==='Toutes les matières'?'':` (${V.filter(x=>x.course===c).length})`}</option>`).join('');
  if([...sel.options].some(o=>o.value===current))sel.value=current;
}

function validState(){const ids=new Set(V.map(x=>x.id));VS.listened=VS.listened.filter(id=>ids.has(id));VS.favorites=VS.favorites.filter(id=>ids.has(id));playlist.ids=playlist.ids.filter(id=>ids.has(id));savePlaylist();if(VS.lastId&&!ids.has(VS.lastId)){VS.lastId=null;VS.lastAt=null}saveState()}
function updateStats(filteredCount){if($v('vocalCount'))$v('vocalCount').textContent=filteredCount;if($v('vocalListenedCount'))$v('vocalListenedCount').textContent=VS.listened.length;if($v('vocalTotalCount'))$v('vocalTotalCount').textContent=V.length;if($v('vocalFavoriteCount'))$v('vocalFavoriteCount').textContent=VS.favorites.length}

function renderVocals(){
  const list=$v('vocalList');if(!list)return;
  const term=norm($v('vocalSearch')?.value.trim()||''),course=$v('vocalCourse')?.value||'Toutes les matières',state=$v('vocalStateFilter')?.value||'all';
  const a=V.filter(x=>{
    if(course!=='Toutes les matières'&&x.course!==course)return false;if(term&&!norm(`${x.title} ${x.course}`).includes(term))return false;
    if(state==='todo'&&has('listened',x.id))return false;if(state==='done'&&!has('listened',x.id))return false;if(state==='favorites'&&!has('favorites',x.id))return false;return true;
  });
  renderPlaylist();updateStats(a.length);
  if(!a.length){list.innerHTML='<div class="card v73-empty">Aucun vocal ne correspond à ce filtre.</div>';return}
  list.innerHTML=a.map(x=>{
    const done=has('listened',x.id),fav=has('favorites',x.id);
    return `<article class="v73-card"><div class="row"><div><span class="badge">${esc(x.course)}</span> <span class="num">Vocal ${String(x.number).padStart(2,'0')}</span></div><button class="v73-icon ${fav?'on':''}" type="button" data-favorite="${esc(x.id)}" aria-label="${fav?'Retirer des favoris':'Ajouter aux favoris'}">${fav?'♥':'♡'}</button></div><div class="title">${esc(x.title)}</div><div class="v73-status">${done?'<span class="v73-mini done">✓ Écouté</span>':'<span class="v73-mini">À écouter</span>'}${x.provisional?'<span class="v73-mini provisional" title="'+esc(x.provisionalReason||'Support officiel non disponible')+'">Provisoire</span>':''}${fav?'<span class="v73-mini">♥ Favori</span>':''}${Number.isFinite(vocalDuration(x))?'<span class="v73-mini">'+Math.floor(vocalDuration(x)/60)+':'+String(Math.floor(vocalDuration(x)%60)).padStart(2,'0')+'</span>':''}</div><div class="v73-card-actions"><button class="btn primary" type="button" data-vocal="${esc(x.id)}">▶ Écouter dans l’appli</button><button class="btn outline" type="button" data-listened="${esc(x.id)}">${done?'↩ À réécouter':'✓ Écouté'}</button></div><button class="btn outline v73-add-playlist" type="button" data-playlist-add="${esc(x.id)}" aria-pressed="${playlist.ids.includes(x.id)}">${playlist.ids.includes(x.id)?'✓ Dans la playlist':'+ Playlist'}</button></article>`;
  }).join('');
  list.querySelectorAll('[data-playlist-add]').forEach(b=>b.onclick=()=>{addPlaylist(b.dataset.playlistAdd);});
  list.querySelectorAll('[data-vocal]').forEach(b=>b.onclick=()=>playVocal(b.dataset.vocal));
  list.querySelectorAll('[data-listened]').forEach(b=>b.onclick=()=>toggleListened(b.dataset.listened));
  list.querySelectorAll('[data-favorite]').forEach(b=>b.onclick=()=>toggleFavorite(b.dataset.favorite));
}

function renderResume(){
  const box=$v('vocalResume');if(!box)return;const x=V.find(v=>v.id===VS.lastId);if(!x){box.classList.add('hidden');return}
  $v('vocalResumeTitle').textContent=x.title;$v('vocalResumeCourse').textContent=`${x.course} • Vocal ${String(x.number).padStart(2,'0')}`;box.classList.remove('hidden');
}
function renderPlayerActions(){
  if(!currentId)return;const done=has('listened',currentId),fav=has('favorites',currentId);const d=$v('vocalPlayerListened'),f=$v('vocalPlayerFavorite');if(d)d.textContent=done?'↩ Marquer à réécouter':'✅ Marquer écouté';if(f)f.textContent=fav?'♥ Retirer des favoris':'♡ Ajouter aux favoris';
}
function useDriveFallback(id){
  const x=V.find(v=>v.id===id);if(!x)return;const fallback=$v('vocalFallback');if(fallback&&!fallback.classList.contains('hidden'))return;rememberPosition();positionReady=false;const a=$v('vocalAudio');if(a){a.pause();a.removeAttribute('src');a.load();a.classList.add('hidden')}const f=$v('vocalFrame');if(f)f.src=x.driveId?drivePreview(x.driveId):(localAudioSource(x)||'about:blank');fallback?.classList.remove('hidden');if(playlistActive)playlistMessage('Lecteur Drive : utilise Suivant pour passer au prochain audio.');
}
function playVocal(id,options={}){
  const x=V.find(v=>v.id===id);if(!x)return;playlistMessage('');playlistActive=options.playlist===true;const previous=$v('vocalAudio');if(previous){rememberPosition();positionReady=false;previous.pause();currentId=null;previous.removeAttribute('src');previous.load()}const frame=$v('vocalFrame');if(frame)frame.src='about:blank';$v('vocalFallback')?.classList.add('hidden');currentId=id;lastSavedSecond=-1;rememberLast(id);$v('vocalPlayerCourse').textContent=`${x.course} • Vocal ${String(x.number).padStart(2,'0')}`;$v('vocalPlayerTitle').textContent=x.title;const note=$v('vocalProvisionalNote');if(note){note.textContent=x.provisional?'Provisoire — '+(x.provisionalReason||'Source officielle incomplète')+'. Voix de synthèse.':'';note.classList.toggle('hidden',!x.provisional);}const open=$v('vocalDrive');if(open){open.href=x.driveId?driveView(x.driveId):(localAudioSource(x)||'#');open.textContent=x.driveId?'Ouvrir dans Drive ↗':'Ouvrir le MP3 ↗';}const fb=$v('vocalFallbackBtn');if(fb)fb.classList.toggle('hidden',!x.driveId);renderPlayerActions();$v('vocalPlayer').classList.remove('hidden');const a=$v('vocalAudio');if(a){a.classList.remove('hidden');a.src=localAudioSource(x)||window.IFSI_AUDIO_MIRRORS?.sourceFor(x)||originalAudioSource(x);a.load();const p=a.play();if(p?.catch)p.catch(()=>{if(currentId===id&&$v('vocalFallback').classList.contains('hidden'))playlistMessage('Appuie sur Lecture dans le lecteur pour continuer.');})}renderPlaylist();if(!options.quiet){openPlaylist();$v('vocalPlayer').scrollIntoView({behavior:'smooth',block:'nearest'});}
}
function closePlayer(){playlistMessage('');rememberPosition();positionReady=false;const a=$v('vocalAudio');if(a){a.pause();a.removeAttribute('src');a.load();a.classList.remove('hidden')}const f=$v('vocalFrame');if(f)f.src='about:blank';$v('vocalFallback')?.classList.add('hidden');$v('vocalPlayer')?.classList.add('hidden');currentId=null;playlistActive=false;lastSavedSecond=-1;renderPlaylist()}
function showVocals(){window.show?.('vocals')}
window.showVocals=showVocals;

async function loadVocals(){
  try{const r=await fetch('./vocals.json',{cache:'no-store'});if(!r.ok)throw new Error('catalogue indisponible');const catalogue=await r.json();await window.IFSI_AUDIO_MIRRORS?.ready;V=catalogue;V.sort((a,b)=>a.course.localeCompare(b.course,'fr')||a.number-b.number);validState();populateCourses();renderVocals();renderResume();setVersion();lockVersion();window.dispatchEvent(new CustomEvent('ifsi:v73-ready',{detail:{count:V.length}}));return true}
  catch(e){console.error('Vocaux',e);const list=$v('vocalList');if(list)list.innerHTML='<div class="card v73-empty">Impossible de charger le catalogue des vocaux.</div>';return false}
}
function setVersion(){const u=$v('update');if(u&&V.length)u.textContent=`Application prête • V${VERSION} locale : ${V.length} vocaux Drive, favoris, écoutés et reprise locale.`;const b=u?.parentElement?.querySelector('b');if(b)b.textContent=`V${VERSION} local`}
function lockVersion(){let ticks=0;const t=setInterval(()=>{setVersion();if(++ticks>=40)clearInterval(t)},250)}

addStyles();injectUI();loadVocals();
window.addEventListener('storage',e=>{if(e.key===STORAGE){VS=loadState();renderVocals();renderResume();renderPlayerActions()}});
window.addEventListener('storage',e=>{if(e.key===PLAYLIST_STORAGE){playlist=loadPlaylist();const ids=new Set(V.map(x=>x.id));playlist.ids=playlist.ids.filter(id=>ids.has(id));if(!playlist.ids.includes(currentId))playlistActive=false;renderVocals();}});
window.IFSI_V73={version:VERSION,getVocals:()=>V,getState:()=>JSON.parse(JSON.stringify(VS)),play:playVocal,toggleListened,toggleFavorite,render:renderVocals,getPlaylist:()=>JSON.parse(JSON.stringify(playlist)),getCurrentId:()=>currentId};
})();
