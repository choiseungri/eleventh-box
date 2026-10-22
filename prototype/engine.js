(function (root) {
  'use strict';
  const facts = [
    {id:'quantity', title:'상자 수량', claim:'기증 10상자와 수진의 개인 물건 1상자는 별개다.', alternatives:['기증한 건 열 상자네요. 수진 씨 상자는 따로 돌려준 거고요.','열한 상자를 기증하려던 건데, 하나가 없어진 것 같아요.','자료실에서 받은 열 상자에 수진 씨 물건도 들어간 것 같아요.'], pair:['E001','E002'], reply:'기준본도 인수 내역도 열 개네요. 개인 반환은 따로 적혀 있고요.'},
    {id:'photo', title:'사진 시각', claim:'17:12에 게시한 사진은 같은 날 오전 09:06에 찍혔다.', alternatives:['이 사진, 오후에 올라왔지만 찍은 건 오전 9시 6분이네요.','사진이 올라온 오후 5시 12분까지는 상자가 책방에 있었던 것 같아요.','사진 원본에도 촬영 날짜가 안 나와서 언제 찍었는지 모르겠어요.'], pair:['E003','E004'], reply:'오전에 찍고 오후에 올렸네요.'},
    {id:'approval', title:'오전 답장과 오후 수정', claim:'서경은 오전에 반환을 승인하고 오후에 기록을 바꿨다.', alternatives:['누나가 오전에 가져가도 된다고 했네요. 그런데 오후에 표를 기증으로 바꿨어요.','태오 형이 표를 고쳐서 누나도 헷갈린 것 같아요.','누나는 기자님이 물어보신 오후 5시 23분에야 알았던 것 같아요.'], pair:['E005','E006'], reply:'답장도 수정 기록도 서경 씨 이름이네요. 이유는 직접 물어봐 주세요.'}
  ];
  const evidence = {
    E001:{title:'11:45 물품표 기준본', detail:'기증 10 · 수진 개인 반환 1', source:'sheet'},
    E002:{title:'자료실 인수 내역', detail:'접수 예정 10 · 실제 인수 10', source:'intake'},
    E003:{title:'상자 사진 원본 정보', detail:'촬영 11월 7일 09:06:18', source:'photoInfo'},
    E004:{title:'곁 게시물 시각', detail:'같은 사진 · 게시 17:12', source:'gyeot'},
    E005:{title:'수진의 반환 요청과 승인', detail:'서경 09:12 승인 · 수진 09:24 반환', source:'approval'},
    E006:{title:'17:26 표 변경 기록', detail:'윤서경 · 개인 반환 → 기증', source:'history'}
  };
  function fresh() {
    return {schema:1, revision:2, phase:'intro', screen:'home', room:null, page:null, photo:'IMG001', sheetVersion:'current', facts:[], evidence:[], edited:false, pressure:false, introduced:false, early:'none', answer:null, finalCallDone:false, ending:null, epilogue:false, introDone:false, initialCall:'none', activeCall:null, draft:{}, hints:{}, notices:[], selectedFact:'quantity', talkExtra:[], savedAt:null, sound:false, largeText:false, visited:[], scroll:{}, compare:false, comparison:[], ideas:[], factTimes:{}, questionOrder:[], taeo:'none', taeoQuestion:null, taeoTime:null, seen:{}, noteText:'', noteEntries:[], jobs:[], events:{}, pendingFacts:{}, liveMessages:[], chatLimits:{}, briefed:false, preview:'A', returnTo:null};
  }
  function time(s) { if(s.epilogue&&s.screen==='result')return '12:10'; if(s.ending)return '19:30'; if(s.finalCallDone || s.activeCall?.kind==='final')return '19:20'; if(s.flow){if(s.flow.stage>=3)return '19:02';if(s.flow.stage>=2)return '18:47';return '18:40';}if(s.facts.length===3)return '19:02'; if(s.facts.length)return '18:47'; return '18:40'; }
  function submit(s,id,claim,pair) {
    const f=facts.find(x=>x.id===id);
    if(!f || s.ending)return {ok:false,reason:'locked'};
    if(s.facts.includes(id))return {ok:false,reason:'done'};
    if(!Number.isInteger(claim)||claim<0||claim>2||!Array.isArray(pair)||pair.length!==2||new Set(pair).size!==2||pair.some(x=>!s.evidence.includes(x)))return {ok:false,reason:'incomplete'};
    if(claim!==0)return {ok:false,reason:'claim'};
    if(!f.pair.every(x=>pair.includes(x)))return {ok:false,reason:'pair'};
    s.facts.push(id);
    const changed=s.facts.length===1;
    const early=s.facts.length===2 && s.early==='none';
    if(early)s.early='scheduled';
    s.factTimes=s.factTimes||{};s.factTimes[id]=time(s);
    return {ok:true,changed,early,ready:s.facts.length===3,reply:f.reply};
  }
  function rememberIdea(s,id,claim,pair,kind='draft') {
    if(s.ending||!facts.some(f=>f.id===id)||!Number.isInteger(claim)||claim<0||claim>2)return false;
    if(!Array.isArray(pair)||pair.length>2||new Set(pair).size!==pair.length||pair.some(x=>!s.evidence.includes(x)))return false;
    if(!['draft','reconsider','confirmed'].includes(kind))return false;
    s.ideas=s.ideas||[];
    const previous=s.ideas.filter(x=>x.fact===id).at(-1);
    if(previous&&previous.claim===claim&&previous.kind===kind&&previous.pair.slice().sort().join()===pair.slice().sort().join())return false;
    s.ideas.push({fact:id,claim,pair:[...pair],kind,time:time(s)});
    if(s.ideas.length>36)s.ideas.shift();
    return true;
  }
  function completeQuestion(s,key) {
    if(s.ending||s.activeCall?.kind!=='final'||s.activeCall?.part!=='topic'||s.activeCall.topic!==key||!['why','restore','name'].includes(key))return false;
    if(!s.questionOrder.includes(key))s.questionOrder.push(key);
    return true;
  }
  function canCloseQuestions(s) {return s.questionOrder.length>0;}
  function enqueue(s,id,type,delayMs,payload={}) {
    if(s.events[id]||s.jobs.some(j=>j.id===id))return false;
    s.jobs.push({id,type,remaining:Math.max(2300,delayMs),payload});return true;
  }
  function advance(s,delta) {
    for(const job of s.jobs)job.remaining-=Math.max(0,Math.min(delta,500));
    const ready=s.jobs.filter(j=>j.remaining<=0);
    s.jobs=s.jobs.filter(j=>j.remaining>0);return ready;
  }
  function addNote(s,id,text,source=null) {
    if(s.noteEntries.some(n=>n.id===id))return false;
    s.noteEntries.push({id,text,source,time:time(s)});return true;
  }
  function discover(s,id) {
    if(!evidence[id]||s.evidence.includes(id))return false;
    s.evidence.push(id);s.seen[id]=true;
    addNote(s,id,evidence[id].detail,id);return true;
  }
  function canBrief(s) {return s.briefed||Boolean(s.seen.tagPost);}
  function availableFacts(s) {
    if(!s.briefed)return [];
    return facts.filter(f=>s.facts.includes(f.id)||f.pair.every(id=>s.evidence.includes(id)));
  }
  function readyForFinal(s) {return s.flow?s.flow.stage>=3&&!s.ending:s.facts.length===3&&s.edited&&!s.jobs.some(j=>['contactOwner','editSheet','earlyCall'].includes(j.type));}
  function chooseEnding(s,key) {
    if(!['A','B','C'].includes(key)||s.ending||(s.flow?s.flow.stage<4:s.facts.length!==3)||!s.finalCallDone)return false;
    s.ending=key; s.phase='result'; s.screen='result'; s.activeCall=null;s.jobs=[];s.pendingFacts={};if(s.flow)s.flow.stage=5;return true;
  }
  function restore(raw) {
    try {const s=JSON.parse(raw); if(s.schema!==1||!['intro','play','result'].includes(s.phase)||!Array.isArray(s.facts)||!Array.isArray(s.evidence))return null;
      if(s.facts.some(x=>!facts.some(f=>f.id===x))||s.evidence.some(x=>!evidence[x]))return null;
      if(new Set(s.facts).size!==s.facts.length || new Set(s.evidence).size!==s.evidence.length)return null;
      if(s.ending&&(!['A','B','C'].includes(s.ending)||!s.finalCallDone||(s.flow?s.flow.version!==1||s.flow.stage!==5:s.facts.length!==3)))return null;
      const restored=Object.assign(fresh(),s);
      restored.ideas=Array.isArray(s.ideas)?s.ideas.filter(x=>facts.some(f=>f.id===x.fact)&&Number.isInteger(x.claim)&&x.claim>=0&&x.claim<3&&Array.isArray(x.pair)&&x.pair.every(id=>evidence[id])).slice(-36):[];
      restored.questionOrder=Array.isArray(s.questionOrder)?[...new Set(s.questionOrder.filter(x=>['why','restore','name'].includes(x)))]:[];
      restored.comparison=Array.isArray(s.comparison)?[...new Set(s.comparison.filter(x=>s.evidence.includes(x)))].slice(0,2):[];
      restored.factTimes=s.factTimes&&typeof s.factTimes==='object'?s.factTimes:{};
      restored.seen=s.seen&&typeof s.seen==='object'?s.seen:{};
      restored.noteText=typeof s.noteText==='string'?s.noteText:'';
      restored.noteEntries=Array.isArray(s.noteEntries)?s.noteEntries:[];
      restored.jobs=Array.isArray(s.jobs)?s.jobs.filter(j=>typeof j.id==='string'&&typeof j.type==='string'&&Number.isFinite(j.remaining)):[];
      restored.events=s.events&&typeof s.events==='object'?s.events:{};
      restored.liveMessages=Array.isArray(s.liveMessages)?s.liveMessages:[];
      restored.chatLimits=s.chatLimits&&typeof s.chatLimits==='object'?s.chatLimits:{};
      restored.pendingFacts=s.pendingFacts&&typeof s.pendingFacts==='object'?s.pendingFacts:{};
      if(!s.revision){
        restored.briefed=s.initialCall==='done'||s.initialCall==='text'||s.facts.length>0;
        if(s.visited?.includes('short'))restored.seen.tagPost=true;
        for(const id of s.evidence){restored.seen[id]=true;addNote(restored,id,evidence[id].detail,id);}
        if(s.activeCall?.kind==='final')restored.activeCall={...s.activeCall,part:'opening',index:0};
        if(s.finalCallDone)restored.events['public-drafts']=true;
      }
      restored.revision=2;
      return restored;
    }catch{return null;}
  }
  const api={facts,evidence,fresh,time,submit,chooseEnding,restore,rememberIdea,completeQuestion,canCloseQuestions,enqueue,advance,addNote,discover,canBrief,availableFacts,readyForFinal};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.BoxGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
