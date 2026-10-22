'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./engine-v06.js'),D=require('./story-v06.js');
let checks=0;const nodes=new Set(),choices=new Set(),endings=new Set(),samples={};
function ok(v,label){assert.ok(v,label);checks++;}
function begin(){const s=C.fresh();s.locked=false;s.view={screen:'home'};C.observe(s,'handoff');C.observe(s,'farewell');return s;}
function ready(s){if(s.pending){const view=JSON.stringify(s.view);C.deliverPending(s);ok(JSON.stringify(s.view)===view,'delivery preserves current view');}if(s.delivery){C.acknowledge(s,s.delivery.firstMessageId);while(s.delivery)C.tick(s,500);}if(s.call){C.acceptCall(s);while(C.advanceCall(s)){};}for(const id of C.requirements(s)){ok(C.canOpen(s,id),'required file available '+id);C.observe(s,id,{detail:true,page:D.assets[id].requiresPage||0});}}
for(const n of Object.values(D.nodes)){
 ok(!!D.contacts[n.room],'known recipient '+n.id);ok(!n.optionRoom,'no alternate recipient');
 for(const o of n.options)ok(!!D.nodes[o.next],'valid next '+o.id);
 for(const l of n.lines)for(const id of l.files||[]){ok(!!D.assets[id],'attachment exists');ok(['sheet','chat','photos'].includes(D.assets[id].app),'no social/web link disguised as attachment');}
 for(const id of n.requires||[])ok(!!D.assets[id],'required evidence exists');
}
for(const a of Object.values(D.assets)){ok(!a.links?.length,'no cross-app links in evidence');if(a.excerpt){ok(a.body.length<=3,'short evidence excerpt');ok(a.body.join('').length<400,'bounded reading length');}}
let fresh=C.fresh();ok(fresh.schema===6,'separate save schema');ok(fresh.messages.every(m=>!m.text.includes('11번 작은 상자 행사실')),'approval absent from original phone');ok(!C.observe(fresh,'approvalCopy'),'future approval copy inaccessible');ok(!C.commitEnding(fresh,'joint'),'cannot finish early');
C.observe(fresh,'handoff');ok(!fresh.pending,'one background item cannot advance');C.observe(fresh,'farewell');ok(!!fresh.pending,'initial reading schedules first message');const count=fresh.messages.length;for(let i=0;i<5;i++)C.tick(fresh,500);ok(fresh.messages.length===count,'no premature delivery');C.tick(fresh,100);ok(fresh.messages.length===count+1,'first bubble arrives alone');C.tick(fresh,500);ok(fresh.messages.length===count+1,'unread first bubble holds the next one');C.acknowledge(fresh,fresh.delivery.firstMessageId);for(let i=0;i<6;i++)C.tick(fresh,500);ok(fresh.messages.length===count+2,'second bubble after read and 3 seconds');
ok(!C.restore({...fresh,schema:4}),'old save schema refused without overwriting old storage');ok(!C.restore('{bad'),'malformed save refused');ok(!C.restore({...fresh,node:'unknown'}),'unknown node refused');ok(!C.restore({...fresh,seen:['approvalCopy']}),'locked evidence rejected');
const saved=begin();C.tick(saved,500);saved.noteText='<script>내 메모</script>';saved.settings.large=true;const restored=C.restore(JSON.stringify(saved));ok(restored.pending.remaining===2100,'pending time restored');ok(restored.noteText===saved.noteText&&restored.settings.large,'notes and preferences restored');
const targetChoices=Object.values(D.nodes).flatMap(n=>n.options.map(o=>o.id));
let transitions=0;
function run(target=null,alternate=false){const s=begin();let steps=0;while(!D.nodes[s.node]?.final){ok(++steps<75,'route terminates');ready(s);const n=C.node(s);nodes.add(n.id);
 if(n.act<3)ok(!C.canOpen(s,'approvalCopy'),'approval not revealed in first two acts');if(n.act<4)ok(!C.canOpen(s,'driverLog'),'witness withheld until fourth act');if(n.act<5)ok(!s.flags.intentional,'intent withheld until confrontation');
 const options=C.options(s),o=(Array.isArray(target)?target.map(id=>options.find(o=>o.id===id)).find(Boolean):options.find(o=>o.id===target))||(alternate?options.at(-1):options[0]);ok(!!o,'choice exists '+n.id);const before=JSON.stringify(s);
 ok(!C.choose(s,o.id,n.room==='owner'?'sujin':'owner',n.id),'wrong recipient refused');ok(JSON.stringify(s)===before,'wrong-recipient failure has no side effects');ok(!C.choose(s,o.id,n.room,'stale-node'),'stale screen refused');
 const view=JSON.stringify(s.view);ok(C.choose(s,o.id,n.room,n.id),'choice accepted '+o.id);ok(JSON.stringify(s.view)===view,'reply preserves current view');ok(!C.choose(s,o.id,n.room,n.id),'double send refused');choices.add(o.id);transitions++;
 ok(!!C.restore(JSON.stringify(s)),'state roundtrip after each transition');
 }
 ready(s);nodes.add(s.node);ok(s.flags.intentional&&s.flags.culprit==='owner'&&s.flags.deduced,'deduction and deliberate culprit retained');
 const opts=C.endingOptions(s);ok(opts.length===4,'four conclusions');ok(opts.find(o=>o.id==='joint').enabled===!!s.flags.signed,'confirmation gates joint ending');
 for(const o of opts.filter(o=>o.enabled)){const end=C.restore(JSON.stringify(s));ok(C.commitEnding(end,o.id),'ending commits');ok(!C.commitEnding(end,o.id),'ending cannot duplicate');ok(end.time==='21:36'&&end.day==='11.07','same-night deadline preserved');ok(end.messages.filter(m=>m.epilogue).length===3,'today epilogue present');ok(end.flags.intentional,'no ending reduces concealment to accident');ok(C.openWeek(end),'week opens');ok(!C.openWeek(end),'week not duplicated');ok(end.messages.filter(m=>m.mine&&m.week).every(m=>m.room==='owner'),'closing reply sent to sister');ok(!!C.restore(JSON.stringify(end)),'ending restores');endings.add(o.id);if(!samples[o.id])samples[o.id]=end;}
 return s;
}
run();run(null,true);for(const id of targetChoices)run(id);
for(const plan of [['sujin','taeo','owner'],['sujin','owner','taeo'],['taeo','sujin','owner'],['taeo','owner','sujin'],['owner','sujin','taeo'],['owner','taeo','sujin']])run(plan.map(id=>'investigate_'+id));
ok(nodes.size===Object.keys(D.nodes).length,'all authored scenes tested');ok(choices.size===targetChoices.length,'all reply choices tested');ok(endings.size===4,'all endings tested');
for(const n of ['confession','admission']){const s=C.fresh();C.enter(s,n);ok(!C.options(s).length,'no answer before call accepted');C.pauseCall(s);const r=C.restore(JSON.stringify(s));ok(C.acceptCall(r),'call resumes');C.advanceCall(r);const i=r.call.index;C.pauseCall(r);const resumed=C.restore(JSON.stringify(r));C.acceptCall(resumed);ok(resumed.call.index===i,'resume preserves line');}
const app=fs.readFileSync(path.join(__dirname,'phone-v06.js'),'utf8');ok(app.includes('eleventh-box-campaign-v06'),'new storage namespace');ok(!app.includes('localStorage.removeItem'),'preserves old saves');
for(const n of ['index.html','campaign.html']){const html=fs.readFileSync(path.join(__dirname,n),'utf8');for(const f of ['story-v06.js','phone-v06.js','phone-v06.css'])ok(html.includes(f),'entry uses current source '+n+'/'+f);}

const socialGate=C.fresh();C.unlock(socialGate,'vanReveal');
ok(!C.observe(socialGate,'vanReveal'),'feed cannot satisfy detail requirement');
ok(!C.observe(socialGate,'vanReveal',{detail:true,page:0}),'first photo cannot satisfy second-photo clue');
ok(C.observe(socialGate,'vanReveal',{detail:true,page:1}),'second photo and comments satisfy clue');
const timing=begin();ready(timing);const initial=C.node(timing);C.choose(timing,'ready',initial.room,initial.id);
ok(timing.pending.remaining===15000,'new person waits 15 seconds');
for(let i=0;i<29;i++)ok(!C.tick(timing,500),'no new contact before 15 seconds');
ok(!C.tick(timing,499),'no new contact at 14999 ms');ok(C.tick(timing,1),'new contact at 15000 ms');
ready(timing);const first=C.node(timing);C.choose(timing,'identify',first.room,first.id);ok(timing.pending.remaining===2600,'same person uses short pause');
const drip=C.fresh();C.enter(drip,'owner_route_post');const firstCount=drip.messages.length;
ok(drip.delivery.queue.length===2,'three-line turn starts with only one bubble');
for(let i=0;i<120;i++)C.tick(drip,500);ok(drip.messages.length===firstCount,'unread first bubble holds remaining messages for a full minute');
ok(!C.options(drip).length,'reply choices hidden during remaining messages');
ok(!C.acknowledge(drip,'different-message'),'unrelated visible message cannot start timer');
ok(C.acknowledge(drip,drip.delivery.firstMessageId),'first visible bubble starts timer');
for(let i=0;i<5;i++)C.tick(drip,500);C.tick(drip,499);ok(drip.messages.length===firstCount,'second bubble waits until 3 seconds');
const dripRestored=C.restore(JSON.stringify(drip));ok(dripRestored.delivery.remaining===1,'read state and remaining interval survive refresh');
ok(!C.acknowledge(dripRestored,dripRestored.delivery.firstMessageId),'re-reading first bubble cannot reset timer');
C.tick(dripRestored,1);ok(dripRestored.messages.length===firstCount+1,'second bubble at exactly 3 seconds');
for(let i=0;i<6;i++)C.tick(dripRestored,500);ok(dripRestored.messages.length===firstCount+2&&!dripRestored.delivery,'third bubble after another 3 seconds');
const filesLater=C.fresh();C.enter(filesLater,'reporter_records');ok(C.canOpen(filesLater,'manifest')&&!C.canOpen(filesLater,'supporters'),'attachments unlock only with their bubble');
C.acknowledge(filesLater,filesLater.delivery.firstMessageId);for(let i=0;i<6;i++)C.tick(filesLater,500);ok(C.canOpen(filesLater,'supporters'),'second attachment arrives with second bubble');
ok(drip.assetDates.ownerClarification==='11.07 '+drip.time,'branch-created posts use actual current story time');
ok(D.contacts.owner.name==='윤서경'&&D.contacts.owner.description==='개인 휴대전화','store phone uses owner real name for personal number');
const hub=C.fresh();C.enter(hub,'investigate_hub');ok(C.options(hub).length===3,'three suspects before decisive evidence');
ok(!C.canOpen(hub,'approvalCopy')&&!C.canOpen(hub,'driverLog')&&!C.canOpen(hub,'manifestHistory'),'no decisive sister proof before suspect choice');
const socials=Object.values(D.assets).filter(a=>['short','gyeot'].includes(a.app));
for(const person of Object.keys(D.contacts))for(const appType of ['short','gyeot'])ok(socials.some(a=>a.author===person&&a.app===appType&&a.date.startsWith('10.')),'background posts on both apps '+person+'/'+appType);
ok(!Object.values(D.nodes).flatMap(n=>n.lines.map(l=>l.text)).some(t=>t.includes('이동 지시, 열쇠, 목록 수정')),'removed analytical reporter phrase');

const report={version:D.version,pass:true,checks,routes:targetChoices.length+8,transitions,scenes:nodes.size,replies:choices.size,endings:[...endings],evidence:Object.keys(D.assets).length,verified:'Pure state transitions, recipient enforcement, evidence gates, save/restore, branching. Browser verification recorded separately.'};
fs.mkdirSync(path.join(__dirname,'qa-v06'),{recursive:true});fs.writeFileSync(path.join(__dirname,'qa-v06/engine-results.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(__dirname,'qa-v06/ending-samples.json'),JSON.stringify(samples,null,2));console.log(JSON.stringify(report,null,2));
