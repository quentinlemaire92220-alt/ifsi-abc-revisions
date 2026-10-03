(()=>{
'use strict';
const INCIDENT_VERSION='7.1.1';
function currentQuestion(){try{return session?.[i]||null}catch{return null}}
function patchReport(){
  const modal=document.getElementById('v71ReportModal');
  const share=document.getElementById('v71ReportShare');
  if(!modal||!share)return false;
  const notes=[...modal.querySelectorAll('.small')];
  const note=notes.find(x=>x.textContent.includes('Aucune donnée'));
  if(note)note.innerHTML='Aucune donnée n’est envoyée automatiquement.<br><b>Après « Partager », choisis WhatsApp puis le groupe « Problème technique ».</b>';
  share.textContent='Partager vers Problème technique';
  share.onclick=async()=>{
    const q=currentQuestion();if(!q)return;
    const type=document.getElementById('v71ReportType')?.value||'Autre';
    const detail=document.getElementById('v71ReportNote')?.value.trim()||'';
    const date=new Date().toLocaleString('fr-FR');
    const text=`🚩 INCIDENT – IFSI ABC\nVersion : V${INCIDENT_VERSION}\nDate : ${date}\nCours : ${q.course||q.theme||''}\nQuestion : ${q.number?'Q'+q.number:'—'}\nID : ${q.id}\nType : ${type}\nÉnoncé : ${q.question}${detail?'\nDétail : '+detail:''}\n\n➡️ À poster dans le groupe « Problème technique ».\nAppli : ${location.origin+location.pathname}`;
    try{
      if(navigator.share){
        await navigator.share({title:`Incident IFSI ABC V${INCIDENT_VERSION}`,text});
        modal.classList.add('hidden');return;
      }
      await navigator.clipboard.writeText(text);
      alert('Signalement copié. Ouvre WhatsApp et colle-le dans le groupe « Problème technique ».');
      modal.classList.add('hidden');
    }catch(e){
      if(e?.name==='AbortError')return;
      try{await navigator.clipboard.writeText(text);alert('Signalement copié. Colle-le dans le groupe « Problème technique ».');modal.classList.add('hidden')}
      catch{prompt('Copie ce signalement puis poste-le dans « Problème technique » :',text)}
    }
  };
  return true;
}
function versionUI(){
  const u=document.getElementById('update');
  if(u&&Array.isArray(Q)&&Q.length)u.textContent='Application prête • V7.1.1 locale : signalements standardisés pour le groupe Problème technique.';
  const b=u?.parentElement?.querySelector('b');if(b)b.textContent='V7.1.1 local';
}
let tries=0;const t=setInterval(()=>{tries++;versionUI();if(patchReport()||tries>120)clearInterval(t)},125);
})();