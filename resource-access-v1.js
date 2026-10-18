// Temporary availability controls; these do not change Drive permissions or source documents.
(()=>{
'use strict';
const unavailable=new Set([
 '1mlwgSvyVXpjGpHD3R08nfofWnUJ3MCCy',
 '1jmXbi76eucP42lg4pJLU6MpApjIf1M8e',
 '1dx5oEeYoqkxMMhjT7CFrFW3g98hydUje',
 '1c0LUu4JhXGSO6GeLZCPlWiXb1heS3bL8'
]);
const message='Fiche temporairement indisponible — accès en cours de vérification.';
function isUnavailable(href){
 try{const url=new URL(href,location.href);return url.hostname==='drive.google.com'&&unavailable.has(url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1]);}catch{return false;}
}
function decorate(root){
 const links=[...(root.matches?.('a[href]')?[root]:[]),...(root.querySelectorAll?.('a[href]')||[])];
 for(const link of links){
  if(!isUnavailable(link.href))continue;
  const note=document.createElement('span');note.className=link.className+' resource-unavailable';
  note.textContent=message;note.setAttribute('role','note');note.dataset.resourceUnavailable='true';
  link.replaceWith(note);
 }
}
function init(){
 const style=document.createElement('style');
 style.textContent='.resource-unavailable{display:block;cursor:default;background:var(--card)!important;color:var(--muted)!important;border:1px dashed var(--line)!important;font-size:13px;line-height:1.5}';
 document.head.appendChild(style);
 const app=document.querySelector('.app');if(!app)return;
 decorate(app);
 // Only inspect inserted nodes; no polling or observation of class/style changes.
 new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)decorate(node);}).observe(app,{childList:true,subtree:true});
}
// Also guard a link inserted and clicked in the same task, before the observer runs.
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a[href]');
 if(link&&isUnavailable(link.href)){event.preventDefault();event.stopImmediatePropagation();decorate(link);}
},true);
window.IFSI_RESOURCE_ACCESS={isUnavailable,decorate};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
