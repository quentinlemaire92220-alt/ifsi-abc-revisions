import fs from 'node:fs';
import vm from 'node:vm';

// Execute the production service worker loader, including compressed packs and overrides.
export async function runtimeDeck({allCards=false}={}){
  const read=p=>fs.readFileSync(p,'utf8');
  const quiet={log(){},warn(){},error(){}};
  const sw=read('sw.js');
  const loader={Response,Blob,DecompressionStream,TextDecoder,Uint8Array,atob,console:quiet,
    fetch:async name=>new Response(read(String(name).replace(/^\.\//,''))),caches:{match:async()=>null}};
  vm.createContext(loader);vm.runInContext(sw.slice(0,sw.indexOf("self.addEventListener('install'")),loader);
  const extra=await vm.runInContext('loadExtras()',loader);
  const questions=[];
  for(let n=1;n<=5;n++){
    loader.base=JSON.parse(read(`questions-${n}.json`));
    const base=vm.runInContext('validQuestions(base.filter(keepQuestion).map(fixKnownContent))',loader);
    if(n===5){const seen=new Set(base.map(q=>q.id));for(const q of extra)if(!seen.has(q.id)){base.push(q);seen.add(q.id)}}
    questions.push(...base);
  }
  const registry=JSON.parse(read('course-registry-v741.json'));
  const window={addEventListener(){},IFSI_V73:{getVocals:()=>[]},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}};
  const context={window,Q:questions,S:[],I:[],registryFixture:registry,console:quiet,
    document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},
    localStorage:{getItem:()=>null,setItem(){}},setInterval:()=>0,clearInterval(){},setTimeout:()=>0,clearTimeout(){},scrollTo(){},MutationObserver:class{observe(){}}};
  vm.createContext(context);
  let source=read('course-registry-v741.js').replace('let registry=null,','let registry=registryFixture,');
  source=source.replace('window.IFSI_V741={','buildCourseIndexes();attachIds();rebuildResourceIndex();window.IFSI_V741={');
  vm.runInContext(source,context);
  const vocab=read('v8355-vocabulary.js');
  const before=vocab.slice(0,vocab.indexOf('function ensure(){')).replace(/let data=\[\]/,'let data=vocabFixture');
  context.vocabFixture=JSON.parse(read('vocabulaire-v1.json')).entries;
  vm.runInContext(before+'window.IFSI_VOCAB={flashcards};})();',context);
  vm.runInContext(read('qcm-subthemes-v1.js'),context);
  const themeSource=read('v79-themes.js');
  vm.runInContext(themeSource.slice(0,themeSource.indexOf('function difficultyOf'))+'window.IFSI_V79.themeOf=themeOf;})();',context);
  const engine=read('v8338-flashcards.js').replace('window.IFSI_V8338_FLASHCARDS={','window.flashcardTest={correctAnswers,atomicCards,contextualizeFront};window.IFSI_V8338_FLASHCARDS={');
  vm.runInContext(allCards?engine.replace('selectCards(candidates,40)','selectCards(candidates,Number.MAX_SAFE_INTEGER)'):engine,context);
  window.IFSI_V8338_FLASHCARDS.rebuild();
  return {deck:window.IFSI_V8338_FLASHCARDS.getDeck(),questions,registry,window,cardsForQuestion:q=>window.flashcardTest.atomicCards(q),answersForQuestion:q=>window.flashcardTest.correctAnswers(q)};
}
