(()=>{'use strict';
const V='8.30.39',$=id=>document.getElementById(id);
function css(){
  if($('v8339UiCss'))return;
  const s=document.createElement('style');s.id='v8339UiCss';s.textContent=`
  #v81Body .fc-revision-entry{
    background:linear-gradient(145deg,#f7f4ff,#eef7ff)!important;
    border-color:#cdbef4!important;
    color:#252132!important;
  }
  #v81Body .fc-revision-entry h3,
  #v81Body .fc-revision-entry b{color:#24202f!important}
  #v81Body .fc-revision-entry .small{color:#6c6878!important}
  #v81Body .fc-revision-entry .fc-pill{
    background:#fff!important;color:#40394d!important;border-color:#ded5ef!important
  }
  #v81Body .fc-revision-entry #fcOpen{
    width:100%!important;
    margin-top:8px!important;
    padding:16px 18px!important;
    border-radius:18px!important;
    background:#fff!important;
    color:#6d34d8!important;
    border:2px solid #8a55eb!important;
    font-size:18px!important;
    font-weight:900!important;
    box-shadow:0 8px 22px #6d34d824!important;
  }
  #v81Body .fc-revision-entry #fcOpen:hover{background:#fbf9ff!important}
  #v81Body .fc-entry-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
  #v81Body .fc-entry-actions #fcOpen{grid-column:1/-1!important}
  #v81Body .fc-entry-icon{background:linear-gradient(145deg,#7142dc,#8a5cf0)!important}
  #v81Body .v8312-myrevision .v8312-revision-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  #v81Body .v8339-vocals-card{
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    margin-top:12px;padding:14px 15px;border:1px solid var(--line);
    border-radius:16px;background:color-mix(in srgb,var(--card) 96%,#6941c6 4%);
    cursor:pointer;color:var(--ink);width:100%;text-align:left
  }
  #v81Body .v8339-vocals-left{display:flex;align-items:center;gap:12px;min-width:0}
  #v81Body .v8339-vocals-ico{
    width:46px;height:46px;min-width:46px;border-radius:15px;display:grid;place-items:center;
    background:linear-gradient(145deg,#6540bd,#8f63ea);font-size:23px
  }
  #v81Body .v8339-vocals-card b{display:block;font-size:16px}
  #v81Body .v8339-vocals-card .small{margin-top:3px}
  #v81Body .v8339-vocals-go{font-size:25px;color:var(--muted)}
  body.v72-dark #v81Body .fc-revision-entry{
    background:linear-gradient(145deg,#201b2d,#171a2c)!important;
    border-color:#4d3f71!important;
    color:#f6f2ff!important;
    box-shadow:0 14px 34px #00000033!important;
  }
  body.v72-dark #v81Body .fc-revision-entry h3,
  body.v72-dark #v81Body .fc-revision-entry b{color:#fff!important}
  body.v72-dark #v81Body .fc-revision-entry .small{color:#c5bed3!important}
  body.v72-dark #v81Body .fc-revision-entry .fc-pill{
    background:#242031!important;color:#f6f2ff!important;border-color:#4b425b!important
  }
  body.v72-dark #v81Body .fc-revision-entry #fcOpen{
    background:#fff!important;color:#6d34d8!important;border-color:#8d58ec!important
  }
  body.v72-dark #v81Body .v8339-vocals-card{
    background:#211d2a!important;border-color:#453b55!important;color:#f6f2ff!important
  }
  body.v72-dark #v81Body .v8339-vocals-card .small{color:#c2bbcd!important}
  @media(max-width:620px){
    #v81Body .fc-entry-actions{grid-template-columns:1fr 1fr!important}
    #v81Body .fc-entry-actions .fc-pill:last-of-type{grid-column:1/-1!important}
    #v81Body .fc-entry-actions #fcOpen{grid-column:1/-1!important}
    #v81Body .v8312-myrevision .v8312-revision-grid{grid-template-columns:1fr!important}
  }`;
  document.head.appendChild(s);
}
function patchRevision(){
  const dash=$('v8312MyRevision');if(!dash)return false;
  const grid=dash.querySelector('.v8312-revision-grid');if(!grid)return false;
  const vocals=$('v8312Vocals');
  if(vocals) vocals.remove();
  let card=$('v8339VocalsCard');
  if(!card){
    card=document.createElement('button');
    card.id='v8339VocalsCard';card.type='button';card.className='v8339-vocals-card';
    card.innerHTML=`<span class="v8339-vocals-left"><span class="v8339-vocals-ico">🎙️</span><span><b>Vocaux disponibles</b><span class="small"><span id="v8339VocalsN">0</span> fichiers audio</span></span></span><span class="v8339-vocals-go">›</span>`;
    const start=$('v8312Start');start?.insertAdjacentElement('beforebegin',card);
    card.onclick=()=>window.showVocals?.();
  }
  const n=window.IFSI_V73?.getVocals?.()?.length||0;
  if($('v8339VocalsN'))$('v8339VocalsN').textContent=n;
  const head=dash.querySelector('.v8312-revision-head .small');
  if(head)head.textContent='Tes objectifs de révision et tes priorités du moment.';
  return true;
}
function patchFlashcards(){
  const entry=document.querySelector('#v81Body .fc-revision-entry');
  if(!entry)return false;
  const title=entry.querySelector('h3');
  if(title)title.textContent='Révise autrement qu’avec les QCM';
  const btn=$('fcOpen');
  if(btn)btn.textContent='▰  Ouvrir les flashcards →';
  return true;
}
function apply(){css();patchRevision();patchFlashcards()}
let tries=0;const t=setInterval(()=>{tries++;apply();if((patchRevision()&&patchFlashcards())||tries>100)clearInterval(t)},100);
const root=$('v81Body');if(root)new MutationObserver(()=>requestAnimationFrame(apply)).observe(root,{childList:true,subtree:true});
window.addEventListener('ifsi:v73-ready',()=>requestAnimationFrame(apply));
window.addEventListener('load',()=>setTimeout(apply,0));
window.IFSI_V8339_UI={version:V,apply};
})();