(()=>{'use strict';
window.IFSI_V8422_CHANGELOG={
 version:'8.30.122',
 patch:()=>{
  const present=window.IFSI_V8421_CHANGELOG?.patch?.();
  const item=document.getElementById('v8422Change');
  if(item)item.dataset.date='2026-10-24';
  return present;
 }
};
window.IFSI_V8422_CHANGELOG.patch();
})();
