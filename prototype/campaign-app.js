/* Phone application for the expanded story. Works with file:// and a static server. */
(()=>{
'use strict';
const C=window.BoxCampaign,D=window.BoxCampaignData,$=id=>document.getElementById(id);
const QA=new URLSearchParams(location.search).get('qa');
const KEY=QA?'eleventh-box-v04-qa-'+QA.slice(0,60):'eleventh-box-campaign-v04';
const OLD='eleventh-box-psychological-v01';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S=C.fresh(),saveOK=true,corrupt=false;
try{
 const raw=localStorage.getItem(KEY),restored=raw&&C.restore(raw);
 if(restored)S=restored;
 else if(raw){corrupt=true;try{localStorage.setItem(KEY+'-unreadable-backup',raw);}catch{}}
 if(!raw&&!QA){
  const old=JSON.parse(localStorage.getItem(OLD)||'null');
  if(old){S.noteText=typeof old.noteText==='string'?old.noteText:'';S.importedNote=!!S.noteText;S.settings={sound:!!old.sound,large:!!old.largeText};}
 }
}catch{saveOK=false;}
S.roomStart=S.roomStart||{};
let banner=null,searchText='',zoom=false,toastTimer,bannerTimer,lastTick=performance.now(),saveElapsed=0,audio=null,modalReturn=null;
const apps=[['messages','메시지','message-circle','chat'],['search','인터넷','globe','search'],['feed','스레드','at-sign','short'],['gyeot','인스타그램','camera','gyeot'],['files','문서','file-spreadsheet','sheet'],['photos','갤러리','images','photos'],['phone','전화','phone','phone'],['notes','메모','notebook-pen','notes']];
const icon=name=>`<img class="icon" src="assets/icons/${name}.svg" alt="" aria-hidden="true">`;
const button=(label,action,attrs='',cls='button')=>`<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const ib=(name,label,action,attrs='')=>button(icon(name),action,`${attrs} aria-label="${esc(label)}"`,'icon-button');
const callButton=(img,label,action,attrs='',cls='icon-button')=>button(`${icon(img)}<span class="control-label">${label}</span>`,action,`${attrs} aria-label="${esc(label)}"`,cls);
function focusKey(el){return el?.dataset?.action?{action:el.dataset.action,id:el.dataset.id||'',label:el.getAttribute('aria-label')||''}:null;}
function restoreFocus(key){
 if(!key)return;
 const match=[...document.querySelectorAll('button[data-action]')].find(el=>el.dataset.action===key.action&&(el.dataset.id||'')===key.id&&(el.getAttribute('aria-label')||'')===key.label&&!el.closest('[hidden]'));
 if(match)match.focus({preventScroll:true});
 else{$('screen').tabIndex=-1;$('screen').focus({preventScroll:true});}
}
const avatar=key=>{const c=D.contacts[key]||{initial:'도',color:'doha'};return `<span class="avatar ${c.color}">${c.initial}</span>`;};
const name=who=>who==='doha'?'도하':who==='owner'?'서경':D.contacts[who]?.name||who;
const date=d=>d==='11.14'?'11월 14일 토요일':d==='11.08'?'11월 8일 일요일':'11월 7일 토요일';
const fileLink=id=>C.canOpen(S,id)?button(`${icon(D.assets[id].app==='photos'||D.assets[id].app==='gyeot'?'images':'file-spreadsheet')}<span>${esc(D.assets[id].title)}</span>`,'asset',`data-id="${id}"`,'message-file'):'';
function save(){try{S.savedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(S));saveOK=true;}catch{saveOK=false;}}
function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
function sound(){if(!S.settings.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=680;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.018,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.start();o.stop(audio.currentTime+.2);}catch{}}
function viewKey(v=S.view){return [v.screen,v.room,v.asset,v.ending,v.tab].join(':');}
function rememberScroll(){S.scroll[viewKey()]=$('screen').scrollTop;}
function unreadMessage(room){return S.messages.filter(m=>m.room===room).slice(S.read[room]||0).find(m=>!m.mine);}
function updateReadPosition(){
 if(S.view.screen!=='room')return;
 const room=S.view.room,all=S.messages.filter(m=>m.room===room),screen=$('screen'),edge=screen.getBoundingClientRect().bottom;
 let read=S.read[room]||0;
 screen.querySelectorAll('[data-message]').forEach(el=>{if(el.getBoundingClientRect().bottom<=edge+2)read=Math.max(read,all.findIndex(m=>m.id===el.dataset.message)+1);});
 S.read[room]=read;
 $('jump-message').hidden=read>=all.length;
}
function revealMessage(id){
 const screen=$('screen'),el=[...screen.querySelectorAll('[data-message]')].find(el=>el.dataset.message===id);
 if(el)screen.scrollTop+=el.getBoundingClientRect().top-screen.getBoundingClientRect().top-12;
 else screen.scrollTop=screen.scrollHeight;
 updateReadPosition();
}
function go(view,push=true,latest=false){
 if(S.ending&&['preview','publications'].includes(view.screen))view={screen:'result'};
 rememberScroll();if(push){S.stack.push({...S.view});S.stack=S.stack.slice(-40);}
 S.view={...view};banner=null;zoom=false;
 if(view.screen==='room'){
  const count=S.messages.filter(m=>m.room===view.room).length;
  if(S.roomStart[view.room]===undefined)S.roomStart[view.room]=Math.min(Math.max(0,count-8),S.read[view.room]||0);
  S.notices.forEach(n=>{if(n.room===view.room)n.read=true;});
 }
 if(view.screen==='asset'&&C.canOpen(S,view.asset))C.observe(S,view.asset);
 render();
 $('screen').scrollTop=latest?$('screen').scrollHeight:(S.scroll[viewKey()]||0);
 if(view.screen==='room'&&latest===true){const unread=unreadMessage(view.room);if(unread)revealMessage(unread.id);}
 updateReadPosition();
 if(view.screen==='room'&&latest)S.scroll[viewKey()]=$('screen').scrollTop;
 save();
}
function back(){const target=S.stack.pop()||{screen:'home'};go(target,false);}
function resume(){const target=C.nextTarget(S);go(target,true,target.screen==='room');}
function activeRoom(){return C.node(S)?.room;}
function targetLabel(){
 if(S.ending)return S.week?'일주일 뒤 연락':'보낸 글과 연락';
 if(S.call)return S.call.status==='ringing'?`${D.contacts[activeRoom()]?.name||'전화'} · 전화 받기`:`${D.contacts[activeRoom()]?.name||'통화'} · 통화로 돌아가기`;
 if(!S.node)return !S.seen.includes('handoff')?'서경이 남긴 메모':'모서리책방 · 마지막 모임 안내';
 return `${D.contacts[activeRoom()]?.name||'메시지'}${S.pending?' · 답장 기다리는 중':''}`;
}
function resumeRow(){
 const target=C.nextTarget(S);
 if(S.view.screen==='room'&&target.screen==='room'&&target.room===S.view.room)return '';
 if(S.view.screen==='call'||S.locked)return '';
 return `<div class="return-contact">${button(`${icon(S.call?'phone':'message-circle')}<span>${esc(targetLabel())}</span>${icon('chevron-right')}`,'resume','','file-link')}</div>`;
}
function noticeBanner(){
 const n=S.notices.find(n=>n.id===banner);
 $('notification').classList.toggle('visible',!!n&&!S.locked&&S.view.screen!=='call');
 $('notification').innerHTML=n?`${button(`<span class="notification-icon">${icon(n.kind==='call'?'phone':'message-circle')}</span><span><b>${esc(D.contacts[n.room]?.name||'메시지')}</b><small>${n.time}</small><p>${esc(n.text)}</p></span>`,'notice',`data-id="${n.id}"`,'notification-open')}${ib('x','알림 닫기','dismiss')}`:'';
}
function announceNew(oldCount){
 const n=S.notices.slice(oldCount).at(-1);if(!n)return;
 if(S.view.screen==='room'&&S.view.room===n.room){n.read=true;}
 else{banner=n.id;sound();clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>{banner=null;noticeBanner();},6500);}
 noticeBanner();
}
function render(){
 const position=$('screen').scrollTop,focused=document.activeElement?.id,focus=focusKey(document.activeElement),sel=focused==='free-note'?[document.activeElement.selectionStart,document.activeElement.selectionEnd]:null;
 const v=S.view;
 document.querySelector('.phone').classList.toggle('large-text',S.settings.large);
 document.querySelector('.phone').classList.toggle('on-home',S.locked||v.screen==='home');
 $('clock').textContent=S.time;
 const assetTitles={notes:'메모',chat:'대화 기록',search:'인터넷',gyeot:'인스타그램',short:'스레드',photos:'갤러리',sheet:'문서'};
 const titles={messages:'메시지',room:D.contacts[v.room]?.name,files:'문서',search:'인터넷',feed:'스레드',gyeot:'인스타그램',photos:'갤러리',notes:'메모',phone:'전화',asset:assetTitles[D.assets[v.asset]?.app]||'문서',call:'',publications:'보낼 기록',preview:'미리보기',result:S.week?'11월 14일':'보낸 기록',notices:'알림'};
 $('appbar').hidden=S.locked||v.screen==='home'||v.screen==='call';
 $('appbar').innerHTML=`${ib('chevron-left','뒤로','back')}<div class="header-title">${v.screen==='room'?avatar(v.room):''}<span>${esc(titles[v.screen]||'')}${v.screen==='room'?`<small>${esc(D.contacts[v.room]?.description||'')}</small>`:''}</span></div>${ib('notebook-pen','메모 열기','notes')}${ib('ellipsis','설정','menu')}`;
 $('nav').hidden=S.locked;
 $('nav').innerHTML=button('<span class="gesture-bar"></span>','home','aria-label="홈"','home-gesture');
 const views={home,messages,room,asset:assetView,files,search:searchView,feed:feedView,gyeot:instagram,photos,phone,notes,call:callView,publications,preview,result,notices};
 $('screen').className='screen '+(v.screen==='room'?'chat-scroll':'')+(v.screen==='call'?' call-scroll':'');
 $('screen').innerHTML=S.locked?lockscreen():(views[v.screen]||home)();
 if(!S.locked&&!['home','call','room','preview','result','publications','notices'].includes(v.screen))$('screen').insertAdjacentHTML('beforeend',resumeRow());
 $('screen').scrollTop=position;
 if(focused==='free-note'&&$('free-note')){$('free-note').focus();$('free-note').setSelectionRange(...sel);}
 if(focused==='search-q'&&$('search-q'))$('search-q').focus();
 if(focus)restoreFocus(focus);
 const newInRoom=v.screen==='room'&&S.messages.filter(m=>m.room===v.room).length>(S.read[v.room]||0);
 $('jump-message').hidden=!newInRoom;
 noticeBanner();
}
function lockscreen(){return `<div class="lockscreen campaign-lock"><div class="lock-settings">${ib('ellipsis','설정','menu')}</div><div class="lock-symbol">${icon('lock-keyhole')}</div><p class="lock-date">${date(S.day)}</p><div class="lock-clock">${S.time}</div><div class="lock-alerts">${button(`<span class="app-mini memo-mini">${icon('notebook-pen')}</span><div><b>메모 <small>서경 · 18:25</small></b><strong>도하야, 계산대 부탁해</strong><p>누나 맞은편 행사실에 있을게. 내 폰은 계산대에 둘게.</p></div>`,'unlock','data-open="handoff"','lock-alert')}</div><div class="lock-bottom">${button(icon('chevron-up'),'unlock','aria-label="휴대전화 열기"','unlock-button')}<span class="gesture-bar"></span></div></div>`;}
function appButton([id,label,img,cls]){const count=id==='messages'?S.notices.filter(n=>!n.read&&n.kind==='chat').length:id==='phone'&&S.call?1:0;return button(`<span class="app-square ${cls}">${icon(img)}${count?`<b class="badge">${count}</b>`:''}</span><span>${label}</span>`,'app',`data-id="${id}" aria-label="${label}"`,'app');}
function home(){
 const recent=S.notices.filter(n=>!n.read).at(-1);
 return `<div class="home"><div class="home-top">${ib('bell','알림센터','notices')}${ib('settings-2','설정','menu')}</div><div class="clock-widget"><span>${date(S.day)}</span><strong>${S.time}</strong><small>모서리책방</small></div><div class="home-space">${button(`<small>${recent?esc(D.contacts[recent.room]?.name||'메시지'):'최근 항목'}</small><span>${esc(recent?.text||targetLabel())}</span>`,recent?'notice':'resume',recent?`data-id="${recent.id}"`:'','home-contact')}</div><div class="app-grid">${apps.map(appButton).join('')}</div><div class="home-pages"><i></i><i></i></div><div class="home-dock">${apps.filter(x=>['messages','phone','search','photos'].includes(x[0])).map(appButton).join('')}</div></div>`;
}
function messages(){
 const keys=['owner','sujin','narae','taeo','family'];
 keys.sort((a,b)=>{const ma=S.messages.filter(m=>m.room===a).at(-1),mb=S.messages.filter(m=>m.room===b).at(-1);return Number(mb?.id.slice(1)||0)-Number(ma?.id.slice(1)||0);});
 return `<div class="list-heading"><h1>메시지</h1>${ib('notebook-pen','오늘 부탁한 일','asset','data-id="handoff"')}</div>${keys.map(k=>{const c=D.contacts[k],m=S.messages.filter(m=>m.room===k).at(-1),unread=S.notices.some(n=>n.room===k&&!n.read);const fallback={family:'도착했어. 내 가방 카운터 밑에 둘게.',owner:'마지막 낭독회 · 맞은편 행사실',sujin:'제 상자 가져갈게요.',taeo:'열 개 끝. 운송비 8만 들어옴.',narae:'문원생활 강나래입니다.'};return button(`${avatar(k)}<span class="contact-main"><strong>${esc(c.name)}${unread?'<i class="unread-dot"></i>':''}</strong><small>${esc(m?.text||fallback[k])}</small></span><span class="contact-time">${m?.time||'11.07'}</span>`,k==='family'?'asset':'room',`data-id="${k==='family'?'family':k}"`,'contact-row');}).join('')}`;
}
function bubble(m){return `<div class="bubble-row ${m.mine?'mine':''}" data-message="${m.id}"><div class="bubble">${esc(m.text)}${(m.files||[]).map(fileLink).join('')}</div><small>${m.mine?'도하 · ':m.call?name(m.who)+' · ':''}${m.time}${m.call?' · 통화':''}</small></div>`;}
function currentOptions(){
 if(!S.delivered||S.ending)return '';
 const n=C.node(S);if(!n)return '';
 if(n.final){
  const missing=C.requirements(S);return missing.length?missing.map(fileLink).join(''):button('보낼 기록 확인','publications','','reply-choice');
 }
 if(S.call)return button(`${icon('phone')} ${S.call.status==='ringing'?'전화 받기':'통화로 돌아가기'}`,'call','','reply-choice');
 const missing=C.requirements(S);if(missing.length)return `<div class="required-files">${missing.map(fileLink).join('')}</div>`;
 const recipient=n.optionRoom&&n.optionRoom!==n.room?`<div class="reply-recipient">${icon('message-circle')}<span>${esc(D.contacts[n.optionRoom].name)}에게 보내기</span></div>`:'';
 return recipient+C.options(S).map(o=>button(esc(o.label),'choose',`data-id="${o.id}" ${o.enabled?'':'disabled'}`,'reply-choice')).join('');
}
function room(){
 const k=S.view.room,all=S.messages.filter(m=>m.room===k),start=S.roomStart[k]??Math.max(0,all.length-8),shown=all.slice(start);
 const isCurrent=activeRoom()===k;
 let rows='';let lastDate='';for(const m of shown){const d=m.day+(m.week?' · 일주일 뒤':'');if(d!==lastDate){rows+=`<div class="date-divider">${m.day.replace('.','월 ')}일${m.week?' · 남겨진 연락':''}</div>`;lastDate=d;}rows+=bubble(m);}
 if(!all.length){const fallback={owner:'서경은 맞은편 행사실에 있다.',sujin:'09:24 · 상자 가져갈게요. 카운터 서랍 열쇠는 흰 컵에 뒀어요.',taeo:'11:41 · 열 개 끝. 운송비 8만 들어옴.',narae:'안녕하세요. 문원생활 강나래입니다.'};rows=`<div class="conversation-history"><p>${esc(fallback[k]||'')}</p>${k==='sujin'?fileLink('sujinWork'):''}</div>`;}
 return `<div class="chat-body">${start>0?button('이전 대화','older','','older-button'):''}${rows}${isCurrent&&S.pending?'<div class="typing" role="status" aria-label="답장을 기다리고 있습니다"><i></i><i></i><i></i></div>':''}<div class="reply-options">${isCurrent?currentOptions():''}</div>${!isCurrent?resumeRow():''}${S.ending?button(S.week?'다른 연락 보기':'보낸 글과 연락 보기','result','','file-link'):''}</div>`;
}
function assetView(){
 const id=S.view.asset,a=D.assets[id];if(!a||!C.canOpen(S,id))return '<div class="empty">아직 받은 파일이 없습니다.</div>';
 const isWeb=a.app==='search',isChat=a.app==='chat',isInsta=a.app==='gyeot';
 let body=a.body;
 if(id==='incident'&&S.flags.boxCorrected)body=['모서리책방 · 정정','이수진 씨는 오전에 제 허락을 받고 자신의 상자를 가져갔습니다. 기증품의 무단 반출처럼 읽히는 글을 쓴 책임은 저 윤서경에게 있습니다.','기증은 열 상자였고 자료실은 열 상자를 모두 받았습니다. 앞서 수진 씨를 태그한 글을 철회합니다.'];
 if(id==='printed'&&S.flags.timing==='wait')body=[...body.slice(0,3),'일요일 오전 정정 요청이 접수됐습니다. 추가 정정 내용은 별도로 안내할 예정입니다.'];
 return `<article class="${isWeb?'web-page':'page'} document-view ${isChat?'archive-chat':''} ${isInsta?'insta-document':''}"><div class="document-origin">${esc(a.owner||'모서리책방')}<span>${esc(a.date||'')}</span></div><h1>${esc(a.title)}</h1>${a.image?`<button class="document-image ${zoom?'zoomed':''}" data-action="zoom" aria-label="사진 ${zoom?'축소':'확대'}"><img src="${D.photos[a.image]}" alt="${esc(a.title)}"></button>`:''}<div class="document-body">${body.map((p,i)=>isChat?`<div class="archive-line"><p>${esc(p)}</p></div>`:`<p ${p.includes('｜')?'class="record-line"':''}>${esc(p)}</p>`).join('')}</div>${a.links?.length?`<div class="document-links">${a.links.map(fileLink).join('')}</div>`:''}<div class="document-footer">${a.note?`${icon('bookmark')} 열어 본 기록은 메모에 남습니다.`:''}</div></article>`;
}
function availableByApp(...types){return S.unlocked.filter(k=>types.includes(D.assets[k].app));}
function fileRow(id){const a=D.assets[id];return button(`${icon(a.app==='photos'||a.app==='gyeot'?'images':'file-spreadsheet')}<span><strong>${esc(a.title)}</strong><small>${esc(a.owner||'')} · ${esc(a.date||'')}</small></span>${C.canOpen(S,id)&&S.seen.includes(id)?icon('check'):icon('chevron-right')}`,'asset',`data-id="${id}"`,'document-row');}
function files(){const list=availableByApp('sheet','chat');return `<div class="page"><div class="page-heading"><h1>문서</h1>${icon('file-spreadsheet')}</div><p class="section-label">받은 파일과 공유 문서</p>${list.length?list.slice().reverse().map(fileRow).join(''):'<p class="empty-note">받은 파일이 여기에 모입니다.</p>'}</div>`;}
function searchView(){
 const q=searchText.trim().toLowerCase().replace(/\s/g,'');const pool=S.unlocked.filter(id=>['search','short','gyeot'].includes(D.assets[id].app));
 const results=pool.filter(id=>{const a=D.assets[id];return !q||(a.title+' '+a.owner+' '+a.body.join(' ')).toLowerCase().replace(/\s/g,'').includes(q);});
 return `<div class="page"><form class="search-form" id="search-form">${icon('search')}<label class="sr-only" for="search-q">검색어</label><input id="search-q" name="q" value="${esc(searchText)}" placeholder="검색 또는 주소 입력" autocomplete="off"><button aria-label="검색">${icon('arrow-up')}</button></form><div class="search-results">${results.length?results.map(id=>{const a=D.assets[id];return button(`<span class="site-icon">${icon('globe')}</span><span><strong>${esc(a.title)}</strong><small>${esc(a.owner||'')} · ${esc(a.date||'')}</small></span>${icon('chevron-right')}`,'asset',`data-id="${id}"`,'website-row');}).join(''):'<p class="empty">검색 결과가 없습니다.</p>'}</div></div>`;
}
function postHeader(title,owner,time){return `<div class="post-head">${avatar('owner')}<div><strong>${esc(owner)}</strong><small>${esc(time)}</small></div></div>`;}
function feedView(){
 const list=['incident','supporters','meeting','farewell'].filter(id=>C.canOpen(S,id));
 return `<div class="social-page">${list.map(id=>{const a=D.assets[id],corrected=id==='incident'&&S.flags.boxCorrected;return `<section class="feed-post">${postHeader(a.title,a.owner,a.date)}<p>${esc(corrected?'이수진 씨 개인 물건 반환에 관해 정정합니다. 기증품의 무단 반출처럼 읽히는 글을 쓴 책임은 저 윤서경에게 있습니다.':a.body.find((_,i)=>i===1)||a.title)}</p>${button(corrected?'정정한 글 읽기':'글 읽기','asset',`data-id="${id}"`,'plain-link')}</section>`;}).join('')}</div>`;
}
function instagram(){const list=['farewell','boxPhoto','sujinWork'].filter(id=>C.canOpen(S,id));return `<div class="instagram-post">${list.map(id=>{const a=D.assets[id];return `<section>${postHeader(a.title,a.owner,a.date)}${button(`<img src="${D.photos[a.image]}" alt="${esc(a.title)}">`,'asset',`data-id="${id}"`,'photo-full-button')}<div class="post-lower"><strong>${esc(a.title)}</strong><p>${esc(a.body[1])}</p>${button('게시물 열기','asset',`data-id="${id}"`,'plain-link')}</div></section>`;}).join('')}</div>`;}
function photos(){const list=S.unlocked.filter(id=>D.assets[id].image);const unique=list.filter((id,i)=>list.findIndex(x=>D.assets[x].image===D.assets[id].image)===i);return `<div class="page-heading gallery-heading"><h1>사진</h1><small>${unique.length}장</small></div><div class="photo-grid">${unique.map(id=>button(`<img src="${D.photos[D.assets[id].image]}" alt="${esc(D.assets[id].title)}"><span>${esc(D.assets[id].title)}</span>`,'asset',`data-id="${id}"`,'photo-tile')).join('')}</div>`;}
function phone(){
 return `<div class="page"><h1 class="phone-heading">전화</h1>${S.call?`<div class="active-call-row">${button(`${icon('phone')} ${D.contacts[activeRoom()]?.name} · ${S.call.status==='ringing'?'수신 전화':'통화 다시 연결'}`,'call','','button primary')}</div>`:''}<span class="section-label">연락처</span>${['owner','taeo','sujin','narae'].map(k=>button(`${avatar(k)}<span><strong>${D.contacts[k].name}</strong><small>${S.call&&activeRoom()===k?'통화 가능':D.contacts[k].description}</small></span>${icon('message-circle')}`,S.call&&activeRoom()===k?'call':'room',`data-id="${k}"`,'phone-contact')).join('')}<span class="section-label recent-label">최근 통화</span>${S.calls.length?S.calls.slice().reverse().map(c=>`<div class="call-record"><strong>${esc(D.contacts[c.room].name)}</strong><small>${c.day} ${c.time} · 통화 기록</small>${button('대화 기록 보기','room',`data-id="${c.room}"`,'plain-link')}</div>`).join(''):'<p class="empty-note">최근 통화가 없습니다.</p>'}</div>`;
}
function notes(){
 const personal=S.view.tab==='personal';return `<div class="page notes-page"><div class="page-heading"><h1>메모</h1>${icon('notebook-pen')}</div>${fileRow('handoff')}<div class="segments">${button('열어 본 기록','notes-tab','data-id="records"',!personal?'selected':'')}${button('내 메모','notes-tab','data-id="personal"',personal?'selected':'')}</div>${personal?`<label class="sr-only" for="free-note">내 메모</label><textarea id="free-note" class="free-note" placeholder="메모를 입력하세요" maxlength="24000">${esc(S.noteText)}</textarea><div class="note-save" id="note-status">${saveOK?'저장됨':'현재 기기에 저장할 수 없습니다'}</div>${S.importedNote?'<small>이전 회차에서 적은 메모를 함께 보관했습니다.</small>':''}`:S.noteEntries.length?S.noteEntries.slice().reverse().map(n=>button(`<small>${n.day} ${n.time}</small><p>${esc(n.text)}</p>${icon('chevron-right')}`,'asset',`data-id="${n.id}"`,'note-row')).join(''):'<p class="empty-note">열어 본 기록이 여기에 모입니다.</p>'}</div>`;
}
function callView(){
 const c=S.call,n=C.node(S);if(!c||!n)return `<div class="page"><p>통화가 끝났습니다.</p>${button('메시지로','resume')}</div>`;
 const who=D.contacts[n.room];
 if(c.status!=='active')return `<div class="call-screen"><div class="call-menu">${ib('ellipsis','설정','menu')}</div><div class="call-person">${avatar(n.room)}<h1>${who.name}</h1><small>${c.status==='ringing'?'수신 전화':'중단한 통화'}</small></div><div class="call-bottom">${button(icon('phone-off'),'decline','aria-label="지금 받지 않기"','round-call decline')}${button(icon('phone'),'accept','aria-label="'+(c.status==='ringing'?'전화 받기':'통화 재개')+'"','round-call accept')}</div></div>`;
 const l=c.lines[c.index],last=c.index>=c.lines.length-1;
 return `<div class="call-screen"><div class="call-menu">${ib('ellipsis','설정','menu')}</div><div class="call-small-name">${who.name}<small>통화 중</small></div><div class="caption-area"><span class="caption-person">${esc(name(l.who))}</span><div class="call-caption" role="status">${esc(l.text)}</div>${(l.files||[]).map(fileLink).join('')}</div>${last?`<div class="call-question-list">${C.requirements(S).length?C.requirements(S).map(fileLink).join(''):C.options(S).map(o=>button(esc(o.label),'choose',`data-id="${o.id}"`,'spoken-choice')).join('')}</div>`:''}<div class="call-controls">${callButton('message-circle','통화 기록 보기','room',`data-id="${n.room}"`)}${callButton('phone-off','통화 중단','decline','','round-call decline')}${!last?callButton('chevron-right','다음 발화','next-call'):callButton('notebook-pen','메모 열기','notes')}</div></div>`;
}
function publications(){const list=C.endingOptions(S);if(!list.length)return `<div class="page">${resumeRow()}</div>`;return `<div class="page"><div class="draft-sender">${avatar('narae')}<span>보낼 기록<small>각 문안을 열어 확인</small></span></div>${list.map(e=>`<div class="publication-option">${button(`<strong>${esc(e.title)}</strong><small>${esc(e.subtitle)}</small>${icon('chevron-right')}`,'preview',`data-id="${e.id}" ${e.enabled?'':'disabled'}`,'draft-row')}${!e.enabled?`<p class="unavailable-reason">${esc(e.reason)}</p>`:''}</div>`).join('')}${button('메시지로 돌아가기','resume','','button secondary')}</div>`;}
function preview(){
 const e=C.endingOptions(S).find(e=>e.id===S.view.ending&&e.enabled);if(!e)return '<div class="empty">현재 준비된 문안이 없습니다.</div>';
 const p=D.publication(S,e.id);
 return `<article class="page publication-preview"><span class="document-origin">강나래와 확인 중 · 아직 전송하지 않음</span><h1>${esc(p.heading)}</h1><div class="document-body">${p.body.map(x=>`<p>${esc(x)}</p>`).join('')}</div><h2>함께 보내는 자료</h2>${p.attachments.map(fileLink).join('')}<h2>이름과 증언</h2><p>${p.people.map(esc).join('<br>')}</p><div class="publication-cost"><p>${esc(p.cost)}</p></div>${button('이 내용으로 보내기','confirm-ending',`data-id="${e.id}"`,'button primary')}${button('다른 문안 보기','publications','','button secondary')}</article>`;
}
function result(){
 if(!S.ending)return '<div class="empty">보낸 기록이 없습니다.</div>';
 const p=S.publication||D.publication(S,S.ending),list=S.messages.filter(m=>S.week?m.week:(m.day==='11.08'&&m.time==='17:40'&&!m.mine));
 return `<div class="page result-page"><div class="document-origin">${S.week?'11월 14일 · 서경의 휴대전화에 남은 연락':'11월 8일 17:40 · 보낸 기록'}</div>${!S.week?`<h1>${esc(p.heading)}</h1>`:''}<details class="sent-copy"><summary>${S.week?'11월 8일 보낸 글과 첨부':'보낸 글과 첨부 다시 보기'}</summary>${S.week?`<h2>${esc(p.heading)}</h2>`:''}<div class="document-body">${p.body.map(x=>`<p>${esc(x)}</p>`).join('')}</div>${p.attachments.map(fileLink).join('')}</details>${list.map(m=>`<div class="epilogue-person">${avatar(m.room)}<strong>${esc(D.contacts[m.room]?.name||name(m.who))}</strong></div>${bubble(m)}`).join('')}${S.week?`<img class="ending-photo" src="${D.photos.shelf}" alt="11월 7일 비워 둔 책방 선반"><small class="photo-date">11월 7일 남겨 둔 사진</small>${button('남은 기록 둘러보기','home','','button secondary')}`:button('일주일 뒤의 연락','week','','button primary')}</div>`;
}
function notices(){return `<div class="page"><h1>알림</h1>${S.notices.slice().reverse().map(n=>button(`<small>${esc(D.contacts[n.room]?.name||'메시지')} · ${n.day} ${n.time}</small><p>${esc(n.text)}</p>`,'notice',`data-id="${n.id}"`,'notice-row')).join('')||'<p class="empty-note">새 알림이 없습니다.</p>'}</div>`;}
function modal(html){
 if($('overlay').hidden)modalReturn=focusKey(document.activeElement);
 $('overlay').innerHTML=`<div class="sheet-handle"></div>${html}`;$('overlay').hidden=false;$('overlay').setAttribute('role','dialog');$('overlay').setAttribute('aria-modal','true');
 for(const id of ['appbar','screen','nav','notification','jump-message'])$(id).inert=true;
 $('overlay').querySelector('button:not([disabled])')?.focus();
}
function closeModal(){
 $('overlay').hidden=true;$('overlay').innerHTML='';lastTick=performance.now();
 for(const id of ['appbar','screen','nav','notification','jump-message'])$(id).inert=false;
 restoreFocus(modalReturn);modalReturn=null;
}
function settings(){modal(`<h2>설정</h2>${button(`${icon('message-circle')} 현재 연락으로 돌아가기`,'help-resume','','setting-row')}${button(`${icon('clock')} 연락 대기 건너뛰기`,'skip-wait',S.pending?'':'disabled','setting-row')}${button(`${icon('list')} 글자 크기 <span>${S.settings.large?'크게':'기본'}</span>`,'large','','setting-row')}${button(`${icon(S.settings.sound?'volume-2':'volume-x')} 알림 소리 <span>${S.settings.sound?'켬':'끔'}</span>`,'sound','','setting-row')}${button(`${icon('notebook-pen')} 내 메모`,'personal-note','','setting-row')}${button(`${icon('bookmark')} 진행 저장 파일 내려받기`,'export','','setting-row')}${button('처음부터','restart','','setting-row')}<details class="version-info"><summary>버전과 저장</summary><p>열한 번째 상자 · 0.4.1<br>현재 진행과 메모는 이 브라우저에 저장됩니다.</p><p>이전 짧은 버전의 진행도 그대로 남아 있습니다.</p><a href="legacy-v03.html">이전 버전 열기</a></details>${!saveOK?'<p class="storage-warning">브라우저가 저장을 허용하지 않아 새로고침 뒤 이어하기가 어려울 수 있습니다. 진행 저장 파일을 내려받을 수 있습니다.</p>':''}${corrupt?'<p class="storage-warning">읽을 수 없었던 이전 저장은 별도로 보관했습니다. 현재는 새 회차입니다.</p>':''}${button('닫기','close-modal','','button secondary')}`);}
function setChoice(id){
 const oldNode=C.node(S),oldRoom=oldNode?.optionRoom||oldNode?.room,wasCall=!!S.call;
 if(!C.choose(S,id))return;
 if(S.call&&wasCall){S.view={screen:'call'};render();$('screen').scrollTop=0;}
 else{go({screen:'room',room:oldRoom},false,'sent');}
 save();
}
function openNotice(id){const n=S.notices.find(n=>n.id===id);if(!n)return;n.read=true;banner=null;if(n.kind==='result')go({screen:'result'});else if(n.kind==='call'&&S.call)go({screen:'call'});else go({screen:'room',room:n.room},true,true);}
function downloadedState(){const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='열한번째상자_진행저장.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const id=el.dataset.id,a=el.dataset.action;
 switch(a){
  case 'unlock':S.locked=false;go(el.dataset.open?{screen:'asset',asset:el.dataset.open}:{screen:'home'},false);break;
  case 'home':S.locked=false;go({screen:'home'});break;
  case 'app':go({screen:id});break;
  case 'back':back();break;
  case 'asset':if(C.canOpen(S,id))go({screen:'asset',asset:id});break;
  case 'room':go({screen:'room',room:id},true,true);break;
  case 'resume':resume();break;
  case 'older':{const before=$('screen').scrollHeight;S.roomStart[S.view.room]=Math.max(0,(S.roomStart[S.view.room]||0)-8);render();$('screen').scrollTop+=$('screen').scrollHeight-before;save();break;}
  case 'choose':setChoice(id);break;
  case 'call':go({screen:'call'});break;
  case 'accept':if(C.acceptCall(S)){render();save();}break;
  case 'decline':C.pauseCall(S);go({screen:'phone'},false);break;
  case 'next-call':if(C.advanceCall(S)){render();$('screen').scrollTop=0;save();}break;
  case 'notes':go({screen:'notes',tab:'records'});break;
  case 'notes-tab':go({screen:'notes',tab:id},false);break;
  case 'zoom':zoom=!zoom;render();break;
  case 'menu':settings();break;
  case 'close-modal':closeModal();break;
  case 'large':S.settings.large=!S.settings.large;save();render();settings();break;
  case 'sound':S.settings.sound=!S.settings.sound;save();settings();sound();break;
  case 'personal-note':closeModal();go({screen:'notes',tab:'personal'});break;
  case 'help-resume':closeModal();S.locked=false;resume();break;
  case 'skip-wait':{const old=S.notices.length;closeModal();if(C.deliverPending(S,true)){render();announceNew(old);save();}resume();break;}
  case 'notices':go({screen:'notices'});break;
  case 'notice':openNotice(id);break;
  case 'dismiss':banner=null;noticeBanner();break;
  case 'publications':go({screen:'publications'});break;
  case 'preview':if(C.endingOptions(S).some(x=>x.id===id&&x.enabled))go({screen:'preview',ending:id});break;
  case 'confirm-ending':modal(`<h2>이 기록을 보낼까요?</h2><p>${esc(D.publication(S,id).heading)}</p><p>보낸 뒤에는 같은 회차의 결정을 바꿀 수 없습니다.</p>${button('보내기','commit-ending',`data-id="${id}"`,'button primary')}${button('돌아가기','close-modal','','button secondary')}`);break;
  case 'commit-ending':closeModal();if(C.commitEnding(S,id)){go({screen:'result'},false);save();}break;
  case 'week':if(C.openWeek(S)){go({screen:'result'},false);$('screen').scrollTop=0;save();}break;
  case 'result':go({screen:'result'});break;
  case 'restart':modal(`<h2>새로 시작할까요?</h2><p>현재 확장판 진행과 메모를 새 회차로 바꿉니다. 이전 짧은 버전의 저장은 유지됩니다.</p>${button('진행 저장 파일 내려받기','export','','button secondary')}${button('처음부터 시작','restart-confirm','','button danger')}${button('돌아가기','close-modal','','button secondary')}`);break;
  case 'restart-confirm':try{localStorage.setItem(KEY+'-previous',JSON.stringify(S));}catch{}S=C.fresh();S.roomStart={};banner=null;closeModal();save();render();break;
  case 'export':downloadedState();break;
  case 'jump-message':{const unread=unreadMessage(S.view.room);revealMessage(unread?.id);save();break;}
 }
});
document.addEventListener('submit',event=>{if(event.target.id==='search-form'){event.preventDefault();searchText=new FormData(event.target).get('q')||'';render();}});
document.addEventListener('input',event=>{if(event.target.id==='free-note'){S.noteText=event.target.value;save();$('note-status').textContent=saveOK?'저장됨':'현재 기기에 저장할 수 없습니다';}});
$('screen').addEventListener('scroll',updateReadPosition);
document.addEventListener('visibilitychange',()=>{lastTick=performance.now();save();});
window.addEventListener('beforeunload',()=>{rememberScroll();save();});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!$('overlay').hidden){closeModal();return;}
 if(event.key==='Tab'&&!$('overlay').hidden){const els=[...$('overlay').querySelectorAll('button:not([disabled]),a,summary')];if(!els.length)return;const first=els[0],last=els.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
let gesture=null;
document.addEventListener('pointerdown',e=>{if(e.target.closest('.lockscreen')&&!e.target.closest('button'))gesture=e.clientY;});
document.addEventListener('pointerup',e=>{if(gesture!==null&&e.clientY-gesture< -45&&S.locked){S.locked=false;go({screen:'home'},false);}gesture=null;});
setInterval(()=>{
 const now=performance.now(),delta=now-lastTick;lastTick=now;
 if(document.hidden||!$('overlay').hidden||!S.pending)return;
 const bottom=S.view.screen==='room'&&$('screen').scrollHeight-$('screen').scrollTop-$('screen').clientHeight<90;
 const noticeCount=S.notices.length,previousSerial=S.serial,changed=C.tick(S,delta);
 if(changed){
  render();if(bottom&&S.view.screen==='room'&&S.view.room===activeRoom()){
   const first=S.messages.find(m=>m.room===S.view.room&&Number(m.id.slice(1))>previousSerial);
   revealMessage(first?.id);
  }
  announceNew(noticeCount);save();
 }
 saveElapsed+=delta;if(saveElapsed>600){saveElapsed=0;save();}
},100);
if(QA)window.__BOX_QA__={state:()=>JSON.parse(JSON.stringify(S)),key:KEY,dataVersion:D.version};
if(S.locked)S.view={screen:'lock'};
if(S.view.screen==='asset'&&!C.canOpen(S,S.view.asset))S.view={screen:'home'};
render();$('screen').scrollTop=S.scroll[viewKey()]||0;save();
})();
