(()=>{
'use strict';
function difficulty(q){return window.IFSI_V72?.difficulty?.(q)||'medium'}
function orderedProgressive(){
  if(!Array.isArray(Q)||!Q.length)return alert('Les questions ne sont pas encore chargées.');
  let pool=Q;
  const course=document.getElementById('course')?.value;
  if(course)pool=pool.filter(q=>(q.course||q.theme)===course);
  const count=Math.min(n===999?pool.length:n,pool.length);
  const groups={
    easy:shuffle(pool.filter(q=>difficulty(q)==='easy')),
    medium:shuffle(pool.filter(q=>difficulty(q)==='medium')),
    hard:shuffle(pool.filter(q=>difficulty(q)==='hard'))
  };
  const target={easy:Math.ceil(count/3),medium:Math.ceil(count/3),hard:count-2*Math.ceil(count/3)};
  const out=[];
  for(const key of ['easy','medium','hard'])out.push(...groups[key].splice(0,Math.max(0,target[key])));
  for(const key of ['easy','medium','hard'])while(out.length<count&&groups[key].length)out.push(groups[key].shift());
  if(!out.length)return alert('Aucune question disponible.');
  begin(out);
  // begin() mélange les séries standards. Pour ce mode uniquement, on restaure l’ordre pédagogique.
  session=[...out];i=0;res=[];done=false;show('quiz');draw();
  if(localStorage.getItem('ifsiabc_v7_mode')==='exam'){
    const started=Number(localStorage.getItem('ifsiabc_v72_timer_start')||Date.now());
    localStorage.setItem('ifsiabc_resume_v1',JSON.stringify({ids:session.map(q=>q.id),index:0,results:[],savedAt:Date.now(),mode:'exam',examAnswers:{},examStartedAt:started}));
  }
}
window.startProgressive=orderedProgressive;
if(window.IFSI_V72)window.IFSI_V72.runProgressive=orderedProgressive;
function hook(){const b=document.getElementById('v72Progressive');if(!b)return false;b.onclick=orderedProgressive;return true}
let tries=0;const t=setInterval(()=>{tries++;if(hook()||tries>100)clearInterval(t)},100);
})();