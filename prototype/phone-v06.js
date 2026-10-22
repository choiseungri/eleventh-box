/* Local phone simulation. All app/room changes require an explicit navigation action. */
(()=>{
'use strict';
const C=window.BoxCampaign,D=window.BoxCampaignData,$=id=>document.getElementById(id);
const qa=new URLSearchParams(location.search).get('qa');
const KEY=qa?'eleventh-box-v06-qa-'+qa.slice(0,60):'eleventh-box-campaign-v06';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=k=>`<img class="icon" src="assets/icons/${k}.svg" alt="">`;
const btn=(text,action,attrs='',cls='')=>`<button class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;
const ib=(i,label,action,attrs='')=>btn(icon(i),action,`${attrs} aria-label="${label}"`,'icon-button');
const avatar=k=>`<img class="avatar" src="assets/avatars/${D.contacts[k]?.image||'doha'}.webp" alt="">`;
const who=k=>D.contacts[k]?.name||'도하';
const apps=[['messages','메시지','message-circle'],['feed','스레드','at-sign'],['gyeot','인스타그램','camera'],['photos','사진','images'],['files','파일','file-spreadsheet'],['notes','메모','notebook-pen'],['search','인터넷','globe'],['phone','전화','phone']];
const labelApp=type=>({short:'스레드',gyeot:'인스타그램',photos:'사진',sheet:'파일',chat:'대화 사본',notes:'메모',search:'인터넷'}[type]||'파일');
let S=C.fresh(),saveOK=true,storageWarning='',banner=null,draft=null,scrollPositions={},history=[],query='',lastTick=performance.now(),elapsed=0,zoom=false;
try{const raw=localStorage.getItem(KEY);if(raw){const saved=C.restore(raw);if(saved)S=saved;else{localStorage.setItem(KEY+'-unreadable-backup',raw);storageWarning='읽을 수 없는 저장은 별도로 보관했습니다.';}}}catch{saveOK=false;}
let menuOpen=false,focusBefore=null;
function save(){try{S.savedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(S));saveOK=true;}catch{saveOK=false;}}
function viewKey(v=S.view){return `${v.screen}:${v.room||v.asset||v.ending||v.author||''}`;}
function navigate(view,push=true){
 scrollPositions[viewKey()]=$('screen').scrollTop;
 if(push){history.push({...S.view});if(history.length>40)history.shift();}
 S.view=view;S.locked=false;zoom=false;
 if(view.screen==='asset'&&C.canOpen(S,view.asset)&&!['short','gyeot'].includes(D.assets[view.asset].app))C.observe(S,view.asset);
 if(view.screen==='room'){
  S.notices.forEach(n=>{if(n.room===view.room)n.read=true;});
  if(banner?.room===view.room)banner=null;
 }
 render();
 if(view.screen==='room'){$('screen').scrollTop=$('screen').scrollHeight;}
 else $('screen').scrollTop=scrollPositions[viewKey()]||0;
 observeVisible();save();
}
function attachment(id){
 const a=D.assets[id];
 if(!a||!C.canOpen(S,id)||!['sheet','chat','photos'].includes(a.app))return '';
 return btn(`<span class="attachment-icon">${icon(a.app==='photos'?'images':'file-spreadsheet')}</span><span><b>${esc(a.title)}</b><small>${a.app==='chat'?'대화 사본':a.app==='photos'?'사진':'문서'} · 열기</small></span>${icon('chevron-right')}`,'asset',`data-id="${id}"`,'attachment');
}
function unread(room){return S.notices.filter(n=>!n.read&&(!room||n.room===room));}
function render(){
 const previous=$('screen').scrollTop,v=S.view;
 const phone=document.querySelector('.phone');
 phone.className='phone '+(S.locked||v.screen==='home'?'wallpaper':'')+(S.settings.large?' large-text':'');
 phone.dataset.screen=v.screen;phone.dataset.node=S.delivered?S.node||'':'waiting';
 $('clock').textContent=S.time;
 $('appbar').hidden=S.locked||['home','call'].includes(v.screen);
 $('nav').hidden=S.locked;
 $('appbar').innerHTML=header();
 const views={home,messages,room,feed:()=>socialList('short'),gyeot:()=>socialList('gyeot'),asset:assetView,files,photos,notes,search:internet,phone:phoneView,call:callView,notices,publications,preview,result};
 $('screen').className='screen screen-'+(S.locked?'lock':v.screen);
 $('screen').innerHTML=S.locked?lockscreen():(views[v.screen]||home)();
 $('composer').innerHTML=!S.locked&&v.screen==='room'?composer():'';
 $('composer').hidden=!$('composer').innerHTML;
 $('nav').innerHTML=btn('<span class="gesture"></span>','home','aria-label="홈 화면"','home-gesture');
 $('screen').scrollTop=previous;
 renderBanner();
 updateJump();
 observeVisible();
}
function header(){
 const v=S.view,heading={messages:'메시지',feed:'Threads',gyeot:'Instagram',photos:'사진',files:'파일',notes:'메모',search:'인터넷',phone:'전화',notices:'알림',publications:'정정 문안',preview:'보내기 전 확인',result:'남은 연락'}[v.screen];
 const title=v.screen==='room'?`<div class="room-heading">${avatar(v.room)}<span><b>${esc(who(v.room))}</b><small>${esc(D.contacts[v.room]?.description)}</small></span></div>`:`<b class="brand ${v.screen==='gyeot'?'insta-brand':''}">${esc(heading||labelApp(D.assets[v.asset]?.app))}</b>`;
 return ib('chevron-left','뒤로','back')+title+ib('ellipsis','설정','settings');
}
function lockscreen(){return `<section class="lockscreen"><div class="lock-top">${ib('settings-2','설정','settings')}</div><p>11월 7일 토요일</p><div class="lock-time">${S.time}</div><div class="lock-owner">서경의 가게 휴대전화</div>${btn(`<span class="mini-app">${icon('notebook-pen')}</span><div><small>메모 · 18:25</small><b>도하야, 계산대 부탁해</b><p>누나 맞은편 행사실에 있을게.</p></div>`,'unlock-note','','lock-notice')}<div class="unlock-area">${btn('위로 밀어서 열기','unlock','','unlock-text')}<span class="gesture"></span></div></section>`;}
function appItem(a,dock=false){const [id,title,i]=a,n=id==='messages'?unread().length:0;return btn(`<span class="app-icon app-${id}">${icon(i)}${n?`<i class="badge">${n}</i>`:''}</span>${dock?'':`<span>${title}</span>`}`,'app',`data-id="${id}" aria-label="${title}"`,'app-tile');}
function home(){const n=unread().at(-1);return `<section class="home"><div class="home-top"><span>11월 7일 토요일</span>${ib('settings-2','설정','settings')}</div><div class="home-time">${S.time}</div><div class="home-widget">${n?btn(`<small>메시지 · ${esc(who(n.room))}</small><p>${esc(n.text)}</p>`,'notice',`data-id="${n.id}"`,'widget-message'):`<span class="widget-date">토요일</span><strong>7</strong><span>마지막 낭독회<br>18:45 · 맞은편 행사실</span>`}</div><div class="app-grid">${apps.filter(a=>!['messages','phone'].includes(a[0])).map(a=>appItem(a)).join('')}</div><div class="home-spacer"></div><div class="page-dots">● ○</div><div class="dock">${apps.filter(a=>['messages','phone','search','photos'].includes(a[0])).map(a=>appItem(a,true)).join('')}</div></section>`;}
function messages(){
 const keys=Object.keys(D.contacts).sort((a,b)=>Number(S.messages.filter(m=>m.room===b).at(-1)?.id.slice(1)||0)-Number(S.messages.filter(m=>m.room===a).at(-1)?.id.slice(1)||0));
 return `<section class="message-list"><div class="large-title"><h1>메시지</h1>${icon('message-circle')}</div><div class="list-search">${icon('search')} 대화</div>${keys.map(k=>{const m=S.messages.filter(m=>m.room===k).at(-1),n=unread(k).length;return btn(`${avatar(k)}<span class="contact-copy"><b>${esc(who(k))}</b><span>${esc(m?.text||D.contacts[k].description)}</span></span><span class="contact-meta"><small>${m?.time||''}</small>${n?'<i class="unread-dot"></i>':''}${icon('chevron-right')}</span>`,'room',`data-id="${k}"`,'contact-row');}).join('')}</section>`;
}
function bubble(m){return `<div class="bubble-row ${m.mine?'mine':''}" data-message="${m.id}"><div class="bubble">${esc(m.text)}${m.files.map(attachment).join('')}</div><small>${m.call?'통화 기록 · ':''}${m.time}</small></div>`;}
function room(){const k=S.view.room,all=S.messages.filter(m=>m.room===k),count=S.historyExpanded?.[k]?all.length:10,shown=all.slice(-count);let day='',body='';for(const m of shown){if(day!==m.day){day=m.day;body+=`<div class="date-divider">11월 ${Number(day.split('.')[1])}일${m.day==='11.14'?' · 일주일 뒤':''}</div>`;}body+=bubble(m);}
 return `<section class="conversation">${all.length>count?btn('이전 대화 보기','older','','older'):''}${body||'<div class="empty-state">아직 주고받은 메시지가 없습니다.</div>'}${(S.pending||S.delivery)&&C.node(S)?.room===k?'<div class="typing" aria-label="답장 입력 중"><i></i><i></i><i></i></div>':''}${S.ending?btn('남은 연락 읽기','result','','quiet-button'):''}</section>`;
}
function composer(){
 const n=C.node(S),k=S.view.room;
 if(!n||n.room!==k||S.ending)return `<div class="idle-composer"><span>메시지</span>${icon('arrow-up')}</div>`;
 if(S.call)return btn(`${icon('phone')} ${S.call.status==='ringing'?'윤서경 · 수신 전화':'중단한 통화로 돌아가기'}`,'call','','call-banner');
 if(!S.delivered)return '<div class="idle-composer"><span>답장을 기다리는 중</span></div>';
 if(S.delivery)return '<div class="idle-composer"><span>메시지를 받는 중</span></div>';
 if(n.final)return `<div class="reply-recipient">${esc(who(k))}에게 답장</div>${btn('정정 문안 읽기','publications','','primary wide')}`;
 const options=C.options(S),missing=C.requirements(S);
 if(missing.length)return `<div class="reply-recipient">${esc(who(k))}에게 답장</div><div class="read-reminder">${icon('message-circle')} ${missing.some(id=>['short','gyeot'].includes(D.assets[id].app))?'게시물과 댓글을 읽고 답장하기':'받은 자료를 읽고 답장하기'}</div>`;
 if(draft&&draft.room===k&&draft.node===n.id)return `<div class="reply-recipient">${esc(who(k))}에게 보낼 답장 ${btn('다시 고르기','clear-draft','','text-button')}</div><div class="send-row"><div class="draft-text">${esc(draft.label)}</div>${btn(icon('arrow-up'),'send',`data-node="${n.id}" data-room="${k}" aria-label="${esc(who(k))}에게 전송"`,'send-button')}</div>`;
 return `<div class="reply-recipient">${esc(who(k))}에게 답장 <span>선택 후 전송</span></div><div class="quick-replies">${options.map(o=>btn(esc(o.label),'draft',`data-id="${o.id}" data-node="${n.id}" data-room="${k}" ${o.enabled?'':'disabled'}`,'reply-choice')).join('')}</div>`;
}
function socialPost(id,detail=false){
 const original={...D.assets[id],date:S.assetDates?.[id]||D.assets[id].date};
 const a=id==='incident'&&S.ending&&S.ending!=='private'?{...original,body:['정정합니다. 수진 씨는 제가 부탁한 장소에 상자를 옮겼습니다. 저는 위치를 알면서 수진 씨 이름을 올렸습니다.','회의록의 반대 의견이 공개되는 것을 막으려고 상자를 숨겼습니다. 승인 대화도 제가 지웠습니다. 잘못된 주민 지지 자료를 정정하겠습니다.']}:original;
 const comments=a.comments||[],liked=!!S.likes?.[id],author=a.author||'owner',imgs=a.images||(a.image?[a.image]:[]),index=Math.min(S.photoPages?.[id]||0,Math.max(0,imgs.length-1));
 const observe=`data-observe="${id}" data-detail="${detail?'true':'false'}" data-photo-page="${index}"`;
 const app=a.app==='short'?'feed':'gyeot';
 return `<article class="social-post ${a.app==='short'?'thread-post':'insta-post'}" data-post="${id}"><div class="post-header">${btn(`${avatar(author)}<span><b>${esc(a.handle||a.owner)}</b><small>${esc(a.date)}</small></span>`,'profile',`data-id="${author}" data-screen="${app}"`,'post-author')}<span class="post-dots">•••</span></div>${imgs.length?`<div class="post-media">${btn(`<img class="post-photo" src="${D.photos[imgs[index]]}" alt="${esc(a.title)} · 사진 ${index+1}">`,'asset',`data-id="${id}"`,'photo-button')}${imgs.length>1?`<div class="photo-pagination"><span>${index+1} / ${imgs.length}</span>${btn(icon('chevron-left'),'photo-previous',`data-id="${id}" aria-label="이전 사진" ${index===0?'disabled':''}`,'photo-arrow')}${btn(icon('chevron-right'),'photo-next',`data-id="${id}" aria-label="다음 사진" ${index===imgs.length-1?'disabled':''}`,'photo-arrow')}</div>`:''}</div>`:''}<div class="post-copy" ${a.detailOnly?'':observe}>${a.body.map(t=>`<p>${esc(t)}</p>`).join('')}</div><div class="social-actions">${ib('heart',liked?'좋아요 취소':'좋아요','like',`data-id="${id}" aria-pressed="${liked}"`)}${btn(`${icon('message-circle')}<span>${comments.length||''}</span>`,'asset',`data-id="${id}" aria-label="${esc(a.title)} 답글 보기"`,'social-comment')}<span>${a.likes?`좋아요 ${a.likes+(liked?1:0)}개`:''}</span></div>${detail?`<div class="comments" ${a.detailOnly?observe:''}>${comments.map(([u,t])=>`<p><b>${esc(u)}</b> ${esc(t)}</p>`).join('')||'<p class="muted">아직 답글이 없습니다.</p>'}</div>`:comments.length?btn(`답글 ${comments.length}개 보기`,'asset',`data-id="${id}"`,'comments-link'):''}</article>`;
}
function socialList(type){
 const author=S.view.author,app=type==='short'?'feed':'gyeot';
 const list=S.unlocked.filter(id=>D.assets[id].app===type&&(!author||D.assets[id].author===author)).sort((a,b)=>(S.assetDates?.[b]||D.assets[b].date||'').localeCompare(S.assetDates?.[a]||D.assets[a].date||''));
 const c=D.contacts[author];
 const top=author?`<section class="profile-header">${avatar(author)}<div><h1>${esc(c.name)}</h1><span>@${esc(c.handle)}</span></div><p>${esc(c.bio)}</p><small>게시물 ${list.length}개</small>${btn('전체 피드','app',`data-id="${app}"`,'profile-back')}</section>`:`<div class="profile-strip" aria-label="팔로우하는 사람">${Object.keys(D.contacts).map(k=>btn(`${avatar(k)}<span>${esc(who(k))}</span>`,'profile',`data-id="${k}" data-screen="${app}"`,'profile-chip')).join('')}</div>`;
 return `<div class="social-feed">${top}${list.length?list.map(id=>socialPost(id)).join(''):'<div class="empty-state">아직 표시할 게시물이 없습니다.</div>'}<p class="feed-end">게시물을 모두 확인했습니다</p></div>`;
}
function assetView(){const a=D.assets[S.view.asset];if(!a||!C.canOpen(S,S.view.asset))return '<div class="empty-state">아직 받은 자료가 없습니다.</div>';if(['short','gyeot'].includes(a.app))return socialPost(S.view.asset,true);
 return `<article class="document ${a.app==='notes'?'note-document':''} ${a.app==='chat'?'chat-document':''}"><div class="document-meta">${esc(a.owner)}<small>${esc(a.date)}</small></div><h1>${esc(a.title)}</h1>${a.image?btn(`<img src="${D.photos[a.image]}" alt="${esc(a.title)}">`,'zoom','','document-photo '+(zoom?'zoomed':'')):''}${a.excerpt?'<div class="omission">… 관련 부분 발췌 …</div>':''}<div class="document-body">${a.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>${a.excerpt?'<div class="omission">… 나머지 내용 중략 …</div>':''}${a.note?'<p class="saved-footnote">읽은 내용이 메모에 남았습니다.</p>':''}</article>`;
}
function fileRow(id){const a=D.assets[id];return btn(`${icon(a.app==='photos'?'images':a.app==='notes'?'notebook-pen':'file-spreadsheet')}<span><b>${esc(a.title)}</b><small>${esc(a.owner)}</small></span>${icon('chevron-right')}`,'asset',`data-id="${id}"`,'file-row');}
function files(){return `<section class="files-page"><h1>최근 항목</h1><p class="muted">받은 문서와 대화 사본</p>${S.unlocked.filter(id=>['sheet','chat'].includes(D.assets[id].app)).reverse().map(fileRow).join('')||'<div class="empty-state">받은 파일이 여기에 모입니다.</div>'}</section>`;}
function photos(){const list=S.unlocked.filter(id=>D.assets[id].app==='photos');return `<div class="photos-page"><h1>보관함</h1><div class="photo-grid">${list.map(id=>btn(`<img src="${D.photos[D.assets[id].image]}" alt="${esc(D.assets[id].title)}"><span>${esc(D.assets[id].date)}</span>`,'asset',`data-id="${id}"`,'photo-tile')).join('')}</div>${!list.length?'<div class="empty-state">이 회차에서 확인할 사진이 없습니다.</div>':''}</div>`;}
function notes(){return `<section class="notes-page">${fileRow('handoff')}<h2>읽은 기록</h2>${S.noteEntries.slice().reverse().map(n=>`<article class="note-entry"><small>${n.day} · ${n.time}</small><p>${esc(n.text)}</p></article>`).join('')||'<p class="muted">자료를 읽으면 기록이 남습니다.</p>'}<h2>내 메모</h2><textarea id="free-note" placeholder="직접 적어 두기" maxlength="24000">${esc(S.noteText)}</textarea><small id="note-status">${saveOK?'저장됨':'저장할 수 없음'}</small></section>`;}
function internet(){const ids=S.unlocked.filter(id=>D.assets[id].app==='search'&&(!query||D.assets[id].body.join(' ').includes(query)||D.assets[id].title.includes(query)));return `<section class="browser-page"><form id="search-form"><label>${icon('search')}<input id="search-q" name="q" placeholder="검색 또는 주소 입력" value="${esc(query)}"></label><button aria-label="검색">${icon('arrow-up')}</button></form>${ids.map(fileRow).join('')||'<p class="empty-state">검색 결과가 없습니다.</p>'}</section>`;}
function phoneView(){return `<section class="phone-page"><h1>최근 통화</h1>${S.call?btn(`${avatar(C.node(S).room)}<span>${esc(who(C.node(S).room))}<small>${S.call.status==='ringing'?'수신 전화':'중단한 통화'}</small></span>${icon('phone')}`,'call','','file-row'):''}${S.calls.map(c=>`<div class="call-record">${avatar(c.room)}<span>${esc(who(c.room))}<small>${c.time} · 통화</small></span></div>`).join('')||'<p class="muted">완료한 통화가 없습니다.</p>'}<h2>연락처</h2>${Object.keys(D.contacts).map(k=>btn(`${avatar(k)}<span>${esc(who(k))}</span>${icon('message-circle')}`,'room',`data-id="${k}"`,'file-row')).join('')}</section>`;}
function callView(){const c=S.call,n=C.node(S);if(!c||!n)return `<div class="call-ended"><h1>통화 종료</h1><p>대화 내용은 메시지에 남았습니다.</p>${btn('홈 화면','home','','primary')}</div>`;const person=D.contacts[n.room];if(c.status!=='active')return `<div class="incoming-call">${avatar(n.room)}<h1>${person.name}</h1><p>${c.status==='ringing'?'수신 전화':'중단한 통화'}</p><div class="call-buttons">${btn(icon('phone-off'),'decline','aria-label="나중에 받기"','call-circle decline')}${btn(icon('phone'),'accept','aria-label="전화 받기"','call-circle accept')}</div></div>`;const l=c.lines[c.index],last=c.index>=c.lines.length-1;return `<div class="active-call"><div class="call-person">${avatar(n.room)}<b>${person.name}</b><small>통화 중 · 대화 자막</small></div><div class="call-caption">${esc(l.text)}</div>${last?`<div class="call-replies"><small>전화로 답하기</small>${C.options(S).map(o=>btn(esc(o.label),'speak',`data-id="${o.id}" data-node="${n.id}" data-room="${n.room}"`,'reply-choice')).join('')}</div>`:btn('계속 듣기','next-call','','listen-next')}<div class="call-controls">${btn(icon('phone-off'),'decline','aria-label="통화 잠시 중단"','call-circle decline')}</div></div>`;}
function notices(){return `<section class="notice-list">${S.notices.slice().reverse().map(n=>btn(`${avatar(n.room)}<div><b>${esc(who(n.room))}</b><small>${n.time}</small><p>${esc(n.text)}</p></div>`,'notice',`data-id="${n.id}"`,'notice-row')).join('')||'<p class="empty-state">새 알림이 없습니다.</p>'}</section>`;}
function publications(){return `<section class="publication-list"><p class="muted">강나래와 확인 중인 문안</p>${C.endingOptions(S).map(e=>`<div>${btn(`<b>${e.title}</b><span>${e.subtitle}</span>${icon('chevron-right')}`,'preview',`data-id="${e.id}" ${e.enabled?'':'disabled'}`,'ending-option')}${e.enabled?'':`<p class="muted">${esc(e.reason)}</p>`}</div>`).join('')}</section>`;}
function preview(){const id=S.view.ending;if(!C.endingOptions(S).some(e=>e.id===id&&e.enabled))return '<p>현재 보낼 수 없는 문안입니다.</p>';const p=D.publication(S,id);return `<article class="document"><div class="document-meta">${id==='private'?'아직 결정하지 않았습니다':'아직 전송하지 않았습니다'}</div><h1>${esc(p.heading)}</h1><div class="document-body">${p.body.map(t=>`<p>${esc(t)}</p>`).join('')}</div>${p.attachments.length?'<h2>첨부 자료</h2>':''}${p.attachments.map(attachment).join('')}<p class="publication-cost">${esc(p.cost)}</p>${btn(id==='private'?'정정 유예 결정':'이 내용으로 보내기','confirm-ending',`data-id="${id}"`,'primary wide')}</article>`;}
function result(){if(!S.ending)return '';const p=S.publication;const msgs=S.messages.filter(m=>S.week?m.week:m.epilogue);return `<section class="result-page"><small>${S.week?'11월 14일 · 일주일 뒤':'11월 7일 · 21:36'}</small><h1>${S.week?'남은 연락':esc(p.heading)}</h1><details><summary>선택한 기록 다시 읽기</summary>${p.body.map(t=>`<p>${esc(t)}</p>`).join('')}</details>${msgs.map(m=>`<div class="result-person">${avatar(m.room)}${esc(who(m.room))}</div>${bubble(m)}`).join('')}${S.week?btn('홈 화면으로','home','','quiet-button'):btn('일주일 뒤','week','','primary wide')}</section>`;}
function renderBanner(){const show=!!banner&&!S.locked&&S.view.screen!=='call';$('notification').hidden=!show;$('notification').innerHTML=show?`${btn(`${avatar(banner.room)}<div><b>${esc(who(banner.room))}</b><small>${banner.time}</small><p>${esc(banner.text)}</p></div>`,'notice',`data-id="${banner.id}"`,'notification-open')}${ib('x','알림 닫기','dismiss')}`:'';}
function announce(old){const n=S.notices.slice(old).at(-1);if(!n)return;if(S.view.screen==='room'&&S.view.room===n.room){n.read=true;return;}banner=n;renderBanner();if(S.settings.sound){try{const ctx=new(window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.018,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15);o.start();o.stop(ctx.currentTime+.16);o.onended=()=>ctx.close();}catch{}}}
function observeVisible(){
 if(S.locked||document.hidden||menuOpen)return;
 const edge=$('screen').getBoundingClientRect();let changed=false;
 if(S.view.screen==='room'&&S.delivery&&!S.delivery.started&&S.view.room===S.delivery.room){
  const first=$('screen').querySelector(`[data-message="${S.delivery.firstMessageId}"]`);
  if(first){const r=first.getBoundingClientRect();if(r.top>=edge.top-2&&r.bottom<=edge.bottom+2)changed=C.acknowledge(S,S.delivery.firstMessageId)||changed;}
 }
 $('screen').querySelectorAll('[data-observe]').forEach(el=>{
  const r=el.getBoundingClientRect();
  if(r.top>=edge.top-2&&r.bottom<=edge.bottom+2&&!S.seen.includes(el.dataset.observe)){
   if(C.observe(S,el.dataset.observe,{detail:el.dataset.detail==='true',page:Number(el.dataset.photoPage||0)}))changed=true;
  }
 });
 if(changed)save();
}
function updateJump(){const e=$('screen');$('jump-message').hidden=!(S.view.screen==='room'&&e.scrollHeight-e.scrollTop-e.clientHeight>180);}
function modal(html){focusBefore=document.activeElement;menuOpen=true;$('overlay').innerHTML=`<div class="sheet-handle"></div>${html}${btn('닫기','close','','quiet-button wide')}`;$('overlay').hidden=false;for(const id of ['screen','composer','appbar','nav','notification'])$(id).inert=true;$('overlay').querySelector('button')?.focus();}
function close(){menuOpen=false;$('overlay').hidden=true;for(const id of ['screen','composer','appbar','nav','notification'])$(id).inert=false;lastTick=performance.now();if(focusBefore?.isConnected)focusBefore.focus();}
function settings(){const n=C.node(S);modal(`<h2>설정</h2>${btn(`글자 크기 <span>${S.settings.large?'크게':'기본'}</span>`,'large','','setting-row')}${btn(`알림 소리 <span>${S.settings.sound?'켬':'끔'}</span>`,'sound','','setting-row')}${btn('진행 저장 파일 내려받기','export','','setting-row')}${btn('처음부터','restart','','setting-row')}<details><summary>지금 확인할 내용</summary><p>${esc(n?.hint||(!S.node?'누나의 메모와 인스타그램의 마지막 날 게시물을 확인하세요.':'현재 대화의 마지막 메시지를 읽고 답장을 골라 보세요.'))}</p></details><p class="version">열한 번째 상자 · 0.6.1<br>이 브라우저에 진행을 저장합니다. 이전 판본의 저장은 별도로 남아 있습니다.</p>${!saveOK?'<p>현재 저장을 사용할 수 없습니다. 진행 저장 파일로 보관할 수 있습니다.</p>':''}<p>${esc(storageWarning)}</p>`);}
function chooseReply(id,recipient,node){const current=C.node(S);if(!current||node!==current.id||recipient!==current.room)return false;const inRoom=S.view.screen==='room'&&S.view.room===recipient,inCall=S.view.screen==='call'&&S.call;if(!inRoom&&!inCall)return false;const result=C.choose(S,id,recipient,node);if(!result)return false;draft=null;render();if(inRoom)$('screen').scrollTop=$('screen').scrollHeight;else $('screen').scrollTop=0;save();return true;}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const id=el.dataset.id,a=el.dataset.action;
 switch(a){
 case 'unlock-note':navigate({screen:'asset',asset:'handoff'},false);break;
 case 'unlock':case 'home':navigate({screen:'home'});break;
 case 'app':navigate({screen:id});break;
 case 'back':navigate(history.pop()||{screen:'home'},false);break;
 case 'asset':if(C.canOpen(S,id))navigate({screen:'asset',asset:id});break;
 case 'room':navigate({screen:'room',room:id});break;
 case 'older':S.historyExpanded={...S.historyExpanded,[S.view.room]:true};render();$('screen').scrollTop=0;break;
 case 'draft':{const n=C.node(S),o=C.options(S).find(o=>o.id===id&&o.enabled);if(o&&n.id===el.dataset.node&&n.room===el.dataset.room&&S.view.room===n.room){draft={...o,node:n.id,room:n.room};render();$('screen').scrollTop=$('screen').scrollHeight;}break;}
 case 'clear-draft':draft=null;render();break;
 case 'send':if(draft)chooseReply(draft.id,el.dataset.room,el.dataset.node);break;
 case 'speak':chooseReply(id,el.dataset.room,el.dataset.node);break;
 case 'notice':{const n=S.notices.find(n=>n.id===id);if(!n)break;n.read=true;banner=null;navigate(n.kind==='call'&&S.call?{screen:'call'}:n.kind==='result'?{screen:'result'}:{screen:'room',room:n.room});break;}
 case 'dismiss':banner=null;renderBanner();break;
 case 'call':navigate({screen:'call'});break;
 case 'accept':C.acceptCall(S);render();save();break;
 case 'decline':C.pauseCall(S);navigate({screen:'phone'});break;
 case 'next-call':C.advanceCall(S);render();save();break;
 case 'profile':navigate({screen:el.dataset.screen,author:id});break;
 case 'photo-next':case 'photo-previous':{const images=D.assets[id]?.images||[];const next=Math.max(0,Math.min(images.length-1,(S.photoPages?.[id]||0)+(a==='photo-next'?1:-1)));S.photoPages={...S.photoPages,[id]:next};render();save();break;}
 case 'like':S.likes={...S.likes,[id]:!S.likes?.[id]};render();save();break;
 case 'zoom':zoom=!zoom;render();break;
 case 'jump':$('screen').scrollTop=$('screen').scrollHeight;updateJump();break;
 case 'settings':settings();break;
 case 'close':close();break;
 case 'large':S.settings.large=!S.settings.large;render();save();settings();break;
 case 'sound':S.settings.sound=!S.settings.sound;save();settings();break;
 case 'export':{const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=u;link.download='열한번째상자_v06_진행.json';link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);break;}
 case 'restart':modal(`<h2>처음부터 시작할까요?</h2><p>현재 회차는 이전 저장으로 보관합니다.</p>${btn('새 회차 시작','restart-confirm','','primary wide')}`);break;
 case 'restart-confirm':try{localStorage.setItem(KEY+'-previous',JSON.stringify(S));}catch{}close();S=C.fresh();draft=null;banner=null;history=[];scrollPositions={};render();save();break;
 case 'publications':navigate({screen:'publications'});break;
 case 'preview':if(C.endingOptions(S).some(e=>e.id===id&&e.enabled))navigate({screen:'preview',ending:id});break;
 case 'confirm-ending':if(C.endingOptions(S).some(e=>e.id===id&&e.enabled))modal(`<h2>${id==='private'?'정정을 미룰까요?':'이 내용으로 보낼까요?'}</h2><p>${esc(D.publication(S,id).cost)}</p>${btn(id==='private'?'정정 유예 확정':'보내기','commit',`data-id="${id}"`,'primary wide')}`);break;
 case 'commit':close();if(C.commitEnding(S,id))navigate({screen:'result'});break;
 case 'week':if(C.openWeek(S))navigate({screen:'result'},false);break;
 case 'result':navigate({screen:'result'});break;
 }
});
document.addEventListener('submit',e=>{if(e.target.id==='search-form'){e.preventDefault();query=new FormData(e.target).get('q')||'';render();}});
document.addEventListener('input',e=>{if(e.target.id==='free-note'){S.noteText=e.target.value;save();$('note-status').textContent=saveOK?'저장됨':'저장할 수 없음';}});
$('screen').addEventListener('scroll',()=>{observeVisible();updateJump();});
document.addEventListener('load',e=>{if(e.target.tagName==='IMG')observeVisible();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)close();if(e.key==='Tab'&&menuOpen){const buttons=[...$('overlay').querySelectorAll('button,summary')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
let touchStart=null;
$('screen').addEventListener('pointerdown',e=>{if(S.locked&&!e.target.closest('button'))touchStart=e.clientY;});
$('screen').addEventListener('pointerup',e=>{if(touchStart!==null&&touchStart-e.clientY>45&&S.locked)navigate({screen:'home'});touchStart=null;});
document.addEventListener('visibilitychange',()=>{lastTick=performance.now();save();});
window.addEventListener('beforeunload',save);
setInterval(()=>{const now=performance.now(),delta=now-lastTick;lastTick=now;if(document.hidden||menuOpen||(!S.pending&&!S.delivery))return;const nearBottom=$('screen').scrollHeight-$('screen').scrollTop-$('screen').clientHeight<100,old=S.notices.length;if(C.tick(S,delta)){render();if(nearBottom&&S.view.screen==='room'&&S.view.room===C.node(S)?.room)$('screen').scrollTop=$('screen').scrollHeight;observeVisible();announce(old);save();}elapsed+=delta;if(elapsed>800){save();elapsed=0;}},100);
if(S.locked)S.view={screen:'lock'};
if(S.view.screen==='asset'&&!C.canOpen(S,S.view.asset))S.view={screen:'home'};
render();if(S.view.screen==='room')$('screen').scrollTop=$('screen').scrollHeight;save();
})();
