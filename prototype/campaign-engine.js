/* Pure state machine. No DOM, network, clocks, or storage side effects. */
(function(root){
'use strict';
const D=typeof module!=='undefined'&&module.exports?require('./campaign-data.js'):root.BoxCampaignData;
const DELAY=2600, ENDINGS=['joint','limited','full','private'];
function fresh(){return {schema:4,revision:1,phase:'prologue',locked:true,day:'11.07',time:'18:32',node:null,delivered:false,pending:null,call:null,flags:{},choices:[],unlocked:[...D.initialAssets],seen:[],messages:[],notices:[],calls:[],noteEntries:[],noteText:'',settings:{sound:false,large:false},view:{screen:'lock'},stack:[],scroll:{},read:{},ending:null,week:false,assisted:[],serial:0,importedNote:false,savedAt:null};}
function node(s){return D.nodes[s.node]||null;}
function addMessage(s,room,line,extra={}){
 const m={id:'m'+(++s.serial),room,who:line.who,text:line.text,files:[...(line.files||[])],day:s.day,time:s.time,mine:line.who==='doha',...extra};
 s.messages.push(m);return m;
}
function notify(s,room,text,kind='chat',target=null){
 const n={id:'n'+(++s.serial),room,text,kind,target,day:s.day,time:s.time,read:false};s.notices.push(n);return n;
}
function unlock(s,id){if(!D.assets[id])return false;if(!s.unlocked.includes(id))s.unlocked.push(id);return true;}
function canOpen(s,id){return !!(D.assets[id]&&s.unlocked.includes(id));}
function observe(s,id){
 if(!canOpen(s,id))return false;
 if(!s.seen.includes(id)){
  s.seen.push(id);
  const a=D.assets[id];if(a.note)s.noteEntries.push({id,day:s.day,time:s.time,text:a.note});
 }
 // Links are available only from an actually opened source; this is never a quiz.
 for(const linked of D.assets[id].links||[])unlock(s,linked);
 if(s.phase==='prologue'&&['handoff','farewell'].every(k=>s.seen.includes(k)))schedule(s,'prologue_reply');
 return true;
}
function enter(s,id,continuedCall=false){
 const n=D.nodes[id];if(!n||s.ending)return false;
 s.node=id;s.delivered=true;s.pending=null;s.phase=n.act===0?'prologue':'story';s.day=n.day||s.day;s.time=n.time;
 for(const a of n.unlock||[])unlock(s,a);
 if(n.effect)Object.assign(s.flags,n.effect);
 if(n.onEnter)n.onEnter(s);
 const lines=n.lines.filter(l=>!l.when||l.when(s));
 for(const l of lines)for(const a of l.files||[])unlock(s,a);
 if(n.kind==='call'){
  s.call={node:id,index:0,status:continuedCall?'active':'ringing',started:continuedCall,lines};
  if(continuedCall&&lines[0])addMessage(s,n.room,lines[0],{call:true});
  else notify(s,n.room,'전화가 왔습니다.','call',{screen:'call'});
 }else{
  s.call=null;
  for(const l of lines)addMessage(s,n.room,l);
  if(lines.length)notify(s,n.room,lines.find(l=>l.who!=='doha')?.text||lines[0].text);
 }
 return true;
}
function schedule(s,id,delay=DELAY){
 if(s.ending||s.pending||!D.nodes[id]||s.node===id)return false;
 s.node=id;s.delivered=false;s.call=null;
 s.pending={id:'delivery:'+id,node:id,remaining:Math.max(DELAY,delay)};
 return true;
}
function tick(s,delta){
 if(!s.pending||!Number.isFinite(delta)||delta<=0||s.ending)return false;
 s.pending.remaining-=Math.min(delta,500);
 if(s.pending.remaining>0)return false;
 const id=s.pending.node;return enter(s,id);
}
function deliverPending(s,assisted=false){
 if(!s.pending||s.ending)return false;
 const id=s.pending.node;
 if(assisted)s.assisted.push({node:id,action:'skip-wait',day:s.day,time:s.time});
 return enter(s,id);
}
function acceptCall(s){
 if(!s.call||!['ringing','paused'].includes(s.call.status))return false;
 const c=s.call;c.status='active';
 if(!c.started&&c.lines[0]){addMessage(s,node(s).room,c.lines[0],{call:true});c.started=true;}
 return true;
}
function pauseCall(s){
 if(!s.call||s.call.status==='paused')return false;
 s.call.status='paused';return true;
}
function callReady(s){return !s.call||(s.call.status==='active'&&s.call.index>=s.call.lines.length-1);}
function advanceCall(s){
 if(!s.call||s.call.status!=='active'||s.call.index>=s.call.lines.length-1)return false;
 s.call.index++;addMessage(s,node(s).room,s.call.lines[s.call.index],{call:true});return true;
}
function requirements(s,o=null){
 const n=node(s);return [...new Set([...(n?.requires||[]),...(o?.requires||[])])].filter(id=>!s.seen.includes(id));
}
function options(s){
 const n=node(s);if(!n||!s.delivered||s.ending||!callReady(s))return [];
 return n.options.filter(o=>!o.when||o.when(s)).map(o=>({...o,missing:requirements(s,o),enabled:requirements(s,o).length===0}));
}
function choose(s,id){
 const n=node(s),o=options(s).find(x=>x.id===id);if(!o||!o.enabled)return false;
 const wasCall=!!s.call;
 addMessage(s,n.optionRoom||n.room,{who:'doha',text:o.label,files:o.files||[]},{choice:id});
 s.choices.push({node:n.id,id,day:s.day,time:s.time});
 Object.assign(s.flags,o.effect||{});
 if(wasCall)s.calls.push({node:n.id,room:n.room,day:s.day,time:s.time,complete:true});
 s.call=null;
 const next=D.nodes[o.next];
 if(wasCall&&next?.kind==='call'&&next.continuation)return enter(s,o.next,true);
 return schedule(s,o.next);
}
function endingOptions(s){
 if(!node(s)?.final||!s.delivered||s.ending||requirements(s).length)return [];
 return D.endingOptions(s);
}
function commitEnding(s,id){
 if(!endingOptions(s).some(x=>x.id===id&&x.enabled))return false;
 s.ending=id;s.phase='ended';s.day='11.08';s.time='17:40';s.pending=null;s.call=null;s.week=false;
 const entry=D.publication(s,id);s.publication=JSON.parse(JSON.stringify(entry));
 addMessage(s,'narae',{who:'doha',text:entry.heading+' — 이 내용으로 보내겠습니다.'},{choice:'ending:'+id});
 for(const l of D.endingMessages(s).today)addMessage(s,l.who,l);
 notify(s,'narae','보낸 글과 연락을 확인할 수 있습니다.','result',{screen:'result'});
 return true;
}
function openWeek(s){
 if(!s.ending||s.week)return false;
 s.week=true;s.day='11.14';s.time='12:10';
 for(const l of D.endingMessages(s).week)addMessage(s,l.who,l,{week:true});
 notify(s,'owner','일주일 뒤의 연락','result',{screen:'result'});
 return true;
}
function restore(raw){
 try{
  const x=typeof raw==='string'?JSON.parse(raw):raw;
  if(!x||x.schema!==4||!['prologue','story','ended'].includes(x.phase)||typeof x.locked!=='boolean')return null;
  if(x.node!==null&&!D.nodes[x.node])return null;
  if(x.ending&&!ENDINGS.includes(x.ending))return null;
  if((x.phase==='ended')!==Boolean(x.ending))return null;
  const s={...fresh(),...x};
  if(!Array.isArray(s.unlocked)||s.unlocked.some(k=>!D.assets[k])||!Array.isArray(s.seen)||s.seen.some(k=>!s.unlocked.includes(k)))return null;
  for(const k of ['choices','messages','notices','calls','noteEntries','assisted'])if(!Array.isArray(s[k]))return null;
  if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags))return null;
  if(s.pending&&(!D.nodes[s.pending.node]||s.pending.node!==s.node||!Number.isFinite(s.pending.remaining)||s.pending.remaining<0||s.delivered))return null;
  if(s.call){
   if(s.call.node!==s.node||node(s)?.kind!=='call'||!['ringing','active','paused'].includes(s.call.status)||!Number.isInteger(s.call.index)||!Array.isArray(s.call.lines)||s.call.index<0||s.call.index>=s.call.lines.length)return null;
  }
  if(s.ending&&(s.pending||s.call))return null;
  if(!Number.isInteger(s.serial)||s.serial<0)return null;
  if(s.messages.some(m=>typeof m.text!=='string'||!Array.isArray(m.files)||m.files.some(id=>!D.assets[id])))return null;
  if(new Set(s.messages.map(m=>m.id)).size!==s.messages.length)return null;
  s.noteText=typeof s.noteText==='string'?s.noteText.slice(0,24000):'';
  s.settings={...fresh().settings,...s.settings};
  s.view=s.view&&typeof s.view==='object'?s.view:{screen:'home'};
  s.scroll=s.scroll&&typeof s.scroll==='object'?s.scroll:{};
  s.stack=Array.isArray(s.stack)?s.stack.slice(-40):[];
  s.read=s.read&&typeof s.read==='object'?s.read:{};
  return s;
 }catch{return null;}
}
function nextTarget(s){
 if(s.ending)return {screen:'result'};
 if(s.call)return {screen:'call'};
 if(s.phase==='prologue'&&!s.node){
  if(!s.seen.includes('handoff'))return {screen:'asset',asset:'handoff'};
  if(!s.seen.includes('farewell'))return {screen:'asset',asset:'farewell'};
 }
 const n=node(s);if(n)return {screen:'room',room:n.room};
 return {screen:'home'};
}
const api={DELAY,fresh,node,unlock,canOpen,observe,enter,schedule,tick,deliverPending,acceptCall,pauseCall,advanceCall,callReady,requirements,options,choose,endingOptions,commitEnding,openWeek,restore,nextTarget};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.BoxCampaign=api;
})(typeof globalThis!=='undefined'?globalThis:this);
