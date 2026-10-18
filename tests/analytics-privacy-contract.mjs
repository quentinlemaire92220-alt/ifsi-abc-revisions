import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const requests=[],storage=new Map();
const context={window:{IFSI_APP_VERSION:'8.30.91'},document:{readyState:'loading',addEventListener(){},getElementById:()=>null},
 localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
 sessionStorage:{getItem:()=>null,setItem(){}},crypto:{randomUUID:()=> '00000000-0000-4000-8000-000000000001'},navigator:{onLine:true},
 fetch:async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true}}};
vm.runInNewContext(fs.readFileSync('analytics-v77.js','utf8'),context);
const api=context.window.IFSI_V77;
assert.equal(await api.track('qcm_start',{resource_type:'qcm',metadata:{mode:'train',count:10,themes:['Conversions'],correct:9,total:10,score:90,result:{correct:9},user_id:'private',notes:'private',courses:[{score:9},'Maths']}}),true);
assert.deepEqual(requests[0].metadata,{mode:'train',count:10,courses:['Maths'],themes:['Conversions']});
assert.equal(requests[0].app_version,'8.30.91');
assert.equal(await api.track('math_case_complete',{resource_type:'math_case',metadata:{correct:2,total:3}}),false);
assert.equal(await api.track('resource_open',{resource_type:'math_case'}),false);
assert.equal(requests.length,1,'Un événement hors contrat ne doit pas atteindre le réseau');
await api.track('qcm_start',{resource_type:'qcm',metadata:{themes:Array(100).fill('x'.repeat(100)),courses:Array(100).fill('y'.repeat(100)),mode:'train'}});
assert.ok(JSON.stringify(requests[1].metadata).length<=1000);
api.setEnabled(false);assert.equal(await api.track('app_open',{resource_type:'app'}),false);assert.equal(requests.length,2);
api.setEnabled(true);context.navigator.onLine=false;assert.equal(await api.track('app_open'),false);assert.equal(requests.length,2);
console.log('✅ Contrat analytics : usage autorisé, résultats et clés inconnues exclus, types DB, opt-out et hors ligne contrôlés sans réseau.');
