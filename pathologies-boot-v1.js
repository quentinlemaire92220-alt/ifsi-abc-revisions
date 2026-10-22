/* IFSI ABC — onglet public informatif, contenu Pathologies CONDITIONNEL.
 * Aucun catalogue n'est inclus dans ce fichier ni dans index.html.
 * La publication éventuelle de contenus validés nécessite un changement de code distinct,
 * une approbation explicite du lot et une CI. Ne jamais embarquer les brouillons ici.
 */
(function(root){
'use strict';
const BUNDLE_KEY='IFSI_PATHOLOGIES_PUBLISHED_BUNDLE';
function start(){
 if(root.IFSI_APP_FEATURES?.pathologies!==true)return Object.freeze({mounted:false,reason:'feature_hidden'});
 const engine=root.IFSI_PATHOLOGIES;
 const catalog=root[BUNDLE_KEY];
 if(!Array.isArray(catalog)||catalog.length===0){
  engine?.showShell?.();
  return Object.freeze({mounted:false,reason:'no_published_catalog'});
 }
 if(!engine||typeof engine.activate!=='function')return Object.freeze({mounted:false,reason:'engine_unavailable'});
 const result=engine.activate(catalog);
 if(!result.activated){
  engine.showShell?.();
  return Object.freeze({mounted:false,reason:'catalog_rejected',errors:result.errors});
 }
 return Object.freeze({mounted:true,count:result.count});
}
root.IFSI_PATHOLOGIES_BOOT=Object.freeze({start});
start();
})(window);
