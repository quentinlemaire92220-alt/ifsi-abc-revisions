(()=>{'use strict';
const V='8.5', $=id=>document.getElementById(id);
function css(){if($('v85css'))return;const s=document.createElement('style');s.id='v85css';s.textContent=`
body.v85-home .app{padding-top:8px}
body.v85-home .head{margin:0 0 10px;gap:10px}
body.v85-home .head .logo{width:42px;height:42px;border-radius:13px}
body.v85-home .head h1{font-size:20px}
body.v85-home .head .small{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:72vw}
body.v85-home #v76Home{gap:10px}
body.v85-home #v76Home>.v76-hero{display:none!important}
body.v85-home #v82Primary{padding:12px;border-radius:18px;box-shadow:0 6px 18px rgba(55,39,94,.06)}
body.v85-home #v82Primary .v82-primary-head{display:none!important}
body.v85-home #v82Primary .v82-mainbtn{margin:0;padding:14px 16px;border-radius:15px;box-shadow:none}
body.v85-home #v82Primary .v82-mainbtn b{font-size:17px}
body.v85-home #v82Primary .v82-mainbtn span{font-size:11px;margin-top:2px}
body.v85-home #v82Primary .v82-navgrid{grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px}
body.v85-home #v82Primary .v82-nav{min-height:76px;padding:10px 7px;border-radius:14px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}
body.v85-home #v82Primary .v82-nav .ico{font-size:23px;margin:0 0 5px}
body.v85-home #v82Primary .v82-nav b{font-size:12px;line-height:1.15}
body.v85-home #v82Primary .v82-nav small{display:none}
body.v85-home .v76-today{padding:12px;border-radius:18px;box-shadow:none}
body.v85-home .v76-title-row h3{font-size:16px}
body.v85-home .v76-title-row .small{display:none}
body.v85-home .v76-title-row .badge{font-size:10px;padding:4px 7px}
body.v85-home .v76-tasks{grid-template-columns:repeat(3,1fr)!important;gap:7px;margin-top:9px}
body.v85-home .v76-task{padding:10px 7px;border-radius:13px;text-align:center}
body.v85-home .v76-task b{font-size:20px;margin:0}
body.v85-home .v76-task span{font-size:10px;display:block;margin-top:2px}
body.v85-home .v76-quote{display:none!important}
body.v85-home #v742Changelog{margin:0!important;box-shadow:none}
body.v85-home #v742Changelog>details{margin-top:4px!important}
body.v85-home #v76More{border-radius:16px;margin:0}
body.v85-home #v76More>summary{padding:12px 2px;font-size:14px}
body.v85-home #v76MoreBody{display:grid;gap:9px}
body.v85-home #v76MoreBody>.section{margin:8px 2px 4px}
body.v85-home #v76MoreBody>.card{margin:0}
body.v85-home nav{bottom:8px}
@media(max-width:420px){
 body.v85-home .app{padding-left:10px;padding-right:10px}
 body.v85-home .head .small{display:none}
 body.v85-home #v82Primary .v82-mainbtn{padding:13px 14px}
 body.v85-home #v82Primary .v82-nav{min-height:72px}
}
`;document.head.appendChild(s)}
function compactLabels(){
 const err=$('v76ErrTask')?.querySelector('span'),voc=$('v76VocTask')?.querySelector('span'),day=$('v76DayTask')?.querySelector('span');
 if(err)err.textContent='Erreurs';if(voc)voc.textContent='Vocaux';if(day)day.textContent='Questions';
 const sum=$('v76More')?.querySelector('summary');if(sum)sum.textContent='⚙️ Plus';
}
function moveSecondary(){
 const more=$('v76MoreBody');const home=$('home');if(!more||!home)return;
 const changelog=$('v742Changelog');if(changelog&&changelog.parentElement!==more)more.appendChild(changelog);
 const sections=[...home.children].filter(x=>x.classList?.contains('section'));
 const appTitle=sections.find(x=>x.textContent.trim()==='Application');
 const appCard=appTitle?.nextElementSibling?.classList?.contains('card')?appTitle.nextElementSibling:null;
 [appTitle,appCard].forEach(x=>{if(x&&x.parentElement!==more)more.appendChild(x)});
}
function state(){
 const home=$('home');document.body.classList.toggle('v85-home',!!home&&!home.classList.contains('hidden'));
}
function apply(){css();compactLabels();moveSecondary();state()}
let tries=0;const t=setInterval(()=>{tries++;apply();if(($('v82Primary')&&document.querySelector('.v76-today'))||tries>180)clearInterval(t)},100);
new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('storage',apply);
window.IFSI_V85={version:V,apply};
})();