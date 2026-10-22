(() => {
  'use strict';
  const G=window.BoxGame,D=window.BoxStory,F=window.BoxFlow,$=id=>document.getElementById(id);
  const qa=new URLSearchParams(location.search).get('qa');
  const KEY=qa?'eleventh-box-qa-'+qa.slice(0,48):'eleventh-box-psychological-v01';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let S=G.fresh(),saveOK=true;
  try{S=G.restore(localStorage.getItem(KEY))||S;}catch{saveOK=false;}
  S.stack=S.stack||[];
  F.init(S);
  if(S.activeCall?.kind==='final'||S.finalCallDone)S.jobs=S.jobs.filter(j=>!['earlyCall','familyReady','factsReady'].includes(j.type));
  if(!S.playabilityMigration){
    const old='낭독회 끝났대요. 서경 씨랑 얘기해 보시겠어요?';
    for(const m of S.liveMessages)if(m.text===old)m.text='낭독회 끝나면 서경 씨랑 얘기해 보시겠어요?';
    for(const n of S.notices){if(n.text===old)n.text='낭독회 끝나면 서경 씨랑 얘기해 보시겠어요?';if(S.ending&&n.text==='기사 고쳤습니다.'&&n.target?.page==='news')n.time='19:30';}
    for(const m of S.liveMessages)if(m.id==='route-shared')m.file=true;
    S.playabilityMigration=true;
  }
  if(S.dialogueRevision!==3&&window.BoxDialogue){
    for(const m of S.liveMessages)m.text=window.BoxDialogue(m.text);
    for(const n of S.notices)n.text=window.BoxDialogue(n.text);
    if(S.pressureText)S.pressureText=window.BoxDialogue(S.pressureText);
    S.dialogueRevision=3;
  }
  if(['evidence','comparison'].includes(S.screen))S.screen='notes';
  if(S.activeCall?.kind==='final'&&!S.activeCall.part){S.activeCall.part='opening';S.activeCall.index=0;}
  let banner=null,observer,timers=new Map(),toastTimer,bannerTimer,followLatest=false,search='',zoom=false,audio=null,lastTick=performance.now(),lastSave=0;
  const files={IMG001:'IMG001-boxes.png',IMG002:'IMG002-receipt.png',IMG003:'IMG003-tangerines.png',IMG004:'IMG004-shelf.png',IMG005:'IMG005-desk.png',IMG006:'IMG006-van.png'};
  const asset=id=>'../assets/scenes/'+files[id];
  const apps=[['chat','메시지','message-circle'],['search','인터넷','globe'],['short','스레드','at-sign'],['gyeot','인스타그램','camera'],['sheet','문서','file-spreadsheet'],['photos','갤러리','images'],['phone','전화','phone'],['notes','메모','notebook-pen']];
  const names={sujin:'이수진',seogyeong:'도하',taeo:'태오',narae:'강나래 기자'};
  const initials={sujin:'수',seogyeong:'서',taeo:'태',narae:'나'};
  const icon=(name,cls='')=>`<img class="icon ${cls}" src="assets/icons/${name}.svg" alt="" aria-hidden="true">`;
  const act=(label,action,attrs='',cls='button')=>`<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
  const ib=(name,label,action,attrs='')=>act(icon(name),action,`${attrs} aria-label="${label}"`,'icon-button');
  const avatar=(person,size='')=>`<span class="avatar ${person} ${size}">${initials[person]}</span>`;
  const contactAvatar=person=>person==='seogyeong'?'<span class="avatar doha">도</span>':avatar(person);
  const fixedTitle=s=>String(s).replaceAll('곁','인스타그램').replaceAll('짧게','스레드').replaceAll('톡 ·','메시지 ·').replaceAll('셀 ·','문서 ·');
  function save(){try{S.savedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(S));saveOK=true;}catch{saveOK=false;}}
  function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2400);}
  function chime(ring=false){if(!S.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=ring?480:700;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.start();o.stop(audio.currentTime+.28);}catch{}}
  function notify(from,text,target,time){
    const sourceRoom=target?.screen==='room'?target.room:from==='메시지 · 강나래'?'narae':from==='메시지 · 이수진'?'sujin':from==='메시지 · 태오'?'taeo':null;
    const inOpenRoom=!S.activeCall&&S.screen==='room'&&S.room===sourceRoom;
    const atBottom=$('screen').scrollHeight-$('screen').scrollTop-$('screen').clientHeight<90;
    const n={id:'n'+Date.now()+S.notices.length,from,text,target,time:time||G.time(S),read:inOpenRoom&&atBottom};S.notices.push(n);if(S.notices.length>30)S.notices.shift();
    if(inOpenRoom){if(atBottom)followLatest=true;else S.unreadRoom=S.room;}
    else if(!S.activeCall){banner=n.id;chime();clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>{if(banner===n.id){banner=null;drawBanner();}},6000);}
    save();drawBanner();
  }
  function drawBanner(){const n=S.notices.find(x=>x.id===banner);$('notification').classList.toggle('visible',Boolean(n)&&!S.activeCall&&S.phase!=='intro');$('notification').innerHTML=n?`${act(`<span class="notification-icon">${icon('message-circle')}</span><span><b>${esc(fixedTitle(n.from))}</b><small>${n.time}</small><p>${esc(n.text)}</p></span>`,'notice',`data-id="${n.id}"`,'notification-open')}${ib('x','알림 닫기','dismiss')}`:'';}
  function message(id,room,who,text,options={}){if(S.liveMessages.some(m=>m.id===id))return;S.liveMessages.push({id,room,who,text,time:G.time(S),read:false,...options});}
  function viewKey(){return [S.screen,S.room,S.page,S.photo,S.sheetVersion].join(':');}
  function navigate(screen,opts={},push=true){
    if(S.activeCall)return;
    S.scroll[viewKey()]=$('screen').scrollTop;
    if(push)S.stack.push({screen:S.screen,room:S.room,page:S.page,photo:S.photo,sheetVersion:S.sheetVersion});
    if(S.ending&&['proof','publication','preview'].includes(screen))screen='result';
    Object.assign(S,opts);S.screen=screen;
    if(screen==='notes')S.seen.notes=true;
    if(screen==='room')S.notices.forEach(n=>{if(n.target?.room===S.room)n.read=true;});
    if(!S.visited.includes(screen))S.visited.push(screen);
    banner=null;zoom=false;render();
    $('screen').scrollTop=S.scroll[viewKey()]??(screen==='room'?$('screen').scrollHeight:0);save();
  }
  function openConversation(person){
    navigate('room',{room:person});
    $('screen').scrollTop=$('screen').scrollHeight;
    S.scroll[viewKey()]=$('screen').scrollTop;S.unreadRoom=null;
    if($('jump-message'))$('jump-message').hidden=true;save();
  }
  function source(id){const map={E001:['sheet',{sheetVersion:'baseline'}],E002:['web',{page:'intake'}],E003:['photoInfo',{photo:'IMG001'}],E004:['gyeot',{}],E005:['room',{room:'sujin'}],E006:['history',{}],tagPost:['short',{}],newVersion:['sheet',{sheetVersion:'current'}]};if(id==='E005')S.chatLimits.sujin=30;if(map[id])navigate(...map[id]);}
  function markSeen(key){
    if(key.startsWith('E')){if(G.discover(S,key)){save();document.querySelectorAll(`[data-saved="${key}"]`).forEach(el=>el.textContent='메모에 저장됨');}if(F.observe(S,key))requestRecordComparison();updateFlowPanel();save();return;}
    if(S.seen[key])return;S.seen[key]=true;
    if(key==='tagPost'){
      G.addNote(S,'post','17:28 · 서경의 공개글에 수진의 계정이 태그돼 있다.','tagPost');
      if(!S.ending)G.enqueue(S,'tag-notice','tagNotice',3500);
    }
    if(key==='latestSujin'&&!S.pressure&&!S.ending)G.enqueue(S,'read-pressure','pressure',3800);
    if(key==='sheetCurrent'&&S.flow.stage===2&&!S.edited)G.enqueue(S,'owner-contact','contactOwner',3500);
    if(key==='newVersion')G.addNote(S,'newVersion','18:47 · 물품 11번이 ‘개인 반환’으로 바뀌었다. 이전 버전도 남아 있다.','newVersion');
    updateFlowPanel();save();
  }
  function recordView(){
    if(S.phase==='intro'||S.activeCall||!$('overlay').hidden)return;
    if(S.screen==='short')markSeen('tagPost');
    if(S.screen==='gyeot')markSeen('E004');
    if(S.screen==='photoInfo'&&S.photo==='IMG001')markSeen('E003');
    if(S.screen==='web'&&S.page==='intake')markSeen('E002');
    if(S.screen==='sheet'){
      if(S.sheetVersion==='baseline')markSeen('E001');
      else if(S.edited&&S.sheetVersion!=='previous')markSeen('newVersion');
      else markSeen('sheetCurrent');
    }
    if(S.screen==='history'){markSeen('E006');if(S.edited)markSeen('newVersion');}
    if(S.screen==='room'&&document.querySelector('[data-observe="E005"]'))markSeen('E005');
  }
  function watch(){
    observer?.disconnect();timers.forEach(clearTimeout);timers.clear();
    observer=new IntersectionObserver(entries=>{for(const e of entries){const key=e.target.dataset.observe;clearTimeout(timers.get(key));if(e.intersectionRatio>=.65)timers.set(key,setTimeout(()=>{if(!document.hidden&&$('overlay').hidden&&!S.activeCall)markSeen(key);},650));}},{root:$('screen'),threshold:.65});
    document.querySelectorAll('[data-observe="latestSujin"]').forEach(el=>observer.observe(el));
  }
  function render(){
    const noteFocus=document.activeElement?.id==='free-note',selection=noteFocus?[document.activeElement.selectionStart,document.activeElement.selectionEnd]:null;
    const position=$('screen').scrollTop;
    document.querySelector('.phone').classList.toggle('large-text',S.largeText);
    document.querySelector('.phone').classList.toggle('on-home',S.screen==='home'||S.phase==='intro');
    $('clock').textContent=G.time(S);
    const title={home:'',chat:'메시지',room:names[S.room],notes:'메모',search:'인터넷',short:'Threads',gyeot:'Instagram',sheet:'문서',history:'버전 기록',photos:'갤러리',photo:'',photoInfo:'상세정보',phone:'전화',proof:'강나래 기자',compare:'자료 비교',publication:'게시물 작성',preview:'미리보기',records:'공개 자료',result:'메시지',notices:'알림',web:S.page==='intake'?'달빛자료실':S.page==='event'?'모서리책방':'문원생활'}[S.screen]||'';
    const special=S.phase==='intro'||Boolean(S.activeCall);
    $('appbar').hidden=special||S.screen==='home';
    $('appbar').innerHTML=`${ib('chevron-left','뒤로','back')}<div class="header-title">${S.screen==='room'?contactAvatar(S.room):''}<span>${title}${S.screen==='room'?'<small>모서리책방</small>':''}</span></div>${S.screen==='room'&&S.room==='taeo'&&!S.ending?ib('phone','태오에게 전화','taeo-menu'):ib('notebook-pen','메모','notes')}${ib('ellipsis','더 보기','menu')}`;
    $('nav').hidden=special;
    $('nav').innerHTML=act('<span class="gesture-bar"></span>','home','aria-label="홈"','home-gesture');
    const views={home,chat,room,notes,search:searchView,short:threads,gyeot:instagram,sheet,history,photos,photo:photoView,photoInfo,phone,proof,compare,publication,preview,records,result,notices,web};
    $('screen').innerHTML=S.phase==='intro'?lockscreen():S.activeCall?callView():(views[S.screen]||home)();
    if(S.activeCall)$('screen').insertAdjacentHTML('afterbegin',`<div class="call-menu">${ib('ellipsis','설정','menu')}</div>`);
    if(!special&&['short','room','photoInfo','gyeot','sheet','history','notes','phone'].includes(S.screen))$('screen').insertAdjacentHTML('beforeend','<div id="flow-actions"></div>');
    updateFlowPanel();
    $('screen').className='screen '+(S.screen==='room'?'chat-scroll':'');
    $('screen').scrollTop=position;
    if(noteFocus&&$('free-note')){$('free-note').focus();$('free-note').setSelectionRange(...selection);}
    if(followLatest&&S.screen==='room'){$('screen').scrollTop=$('screen').scrollHeight;followLatest=false;}
    const jump=$('jump-message');if(jump){jump.hidden=!(S.unreadRoom===S.room&&S.screen==='room'&&!S.activeCall);}
    drawBanner();watch();recordView();save();
  }
  function lockscreen(){return `<div class="lockscreen"><div class="lock-symbol">${icon('lock-keyhole')}</div><div class="lock-settings">${ib('ellipsis','설정','menu')}</div><p class="lock-date">11월 7일 토요일</p><div class="lock-clock">18:40</div><div class="lock-alerts">${act(`<span class="app-mini threads-mini">${icon('at-sign')}</span><div><b>스레드 <small>17:28</small></b><strong>모서리책방</strong><p>기증 기록 중 한 상자가 따로 반출된 경위를 확인하고 있습니다.<br><span class="mention">@sujin_note</span> 연락 부탁해.</p></div>`,'unlock','','lock-alert')}</div><div class="lock-bottom">${act(icon('chevron-up'),'unlock','aria-label="휴대전화 열기"','unlock-button')}<span class="gesture-bar"></span></div></div>`;}
  function appButton([id,label,img]){const count=id==='chat'?S.notices.filter(n=>!n.read&&n.target?.screen==='room').length:id==='phone'&&S.early==='pending'?1:0;return `<button class="app" data-action="app" data-app="${id}" aria-label="${label}"><span class="app-square ${id}">${icon(img)}${count?`<b class="badge">${count}</b>`:''}</span><span>${label}</span></button>`;}
  function home(){return `<div class="home"><div class="home-top">${ib('bell','알림센터','notices')}${ib('settings-2','설정','menu')}</div><div class="clock-widget"><span>11월 7일 토요일</span><strong>${G.time(S)}</strong><small>문원시&nbsp; 12°</small></div><div class="home-space">${homeContact()}</div><div class="app-grid">${apps.map(appButton).join('')}</div><div class="home-pages"><i></i><i></i></div><div class="home-dock">${apps.filter(x=>['chat','phone','search','photos'].includes(x[0])).map(appButton).join('')}</div></div>`;}
  function chat(){const rows=[['sujin',S.seen.tagPost?'제 상자였다고 써 주세요.':'상자 가져갑니다.','18:36'],['narae',S.briefed?'확인하신 기록을 함께 보겠습니다.':'안녕하세요. 문원생활 강나래입니다.','18:38'],['taeo',S.taeo==='done'?'담요는 급한 거 끝나면 챙겨 줘.':'오늘 운송 관련 연락','17:40'],['seogyeong','응. 내가 직접 말할게.','18:25']];return `<div class="list-heading"><h1>메시지</h1>${ib('square-pen','새 대화','contacts')}</div><div class="search-placeholder">${icon('search')} 검색</div>${rows.map(([id,text,time])=>{const latest=S.liveMessages.filter(m=>m.room===id).at(-1);return act(`${contactAvatar(id)}<span class="contact-main"><strong>${names[id]}</strong><small>${esc(latest?.text||text)}</small></span><span class="contact-time">${latest?.time||time}</span>`,'room',`data-room="${id}"`,'contact-row');}).join('')}`;}
  function baseMessages(person){
    if(person==='sujin')return [
      ...D.publicMessages('C').map(([id,day,who,text])=>({id,who,text,time:day.split(' ')[1],day:day.split(' ')[0],mine:who==='서경'})),
      ...(S.seen.tagPost?[{id:'M033',who:'수진',text:'왜 저를 태그하셨어요? 아침에 가져가라고 하셨잖아요.',time:'17:31'},{id:'M034',who:'서경',text:'내가 정리할게. 지금 더 커지면 안 돼',time:'17:33',mine:true},{id:'M035',who:'수진',text:'벌써 제 이름 올라갔잖아요.',time:'17:34'},{id:'M036',who:'수진',text:'행사 끝나면 태그부터 내려 주세요. 제 상자였다고도 써 주시고요.',time:'18:36'}]:[]),
      ...(S.pressure&&S.seen.tagPost?[{id:'pressure',who:'수진',text:S.pressureText||'사장님, 답 좀 주세요. 제 이름 아직 그대로예요.',time:S.pressureTime||'18:40'}]:[])
    ];
    if(person==='taeo')return [
      {id:'T1',who:'태오',text:'내일 아홉시. 큰 거 열 개 맞지',day:'11/06',time:'19:40'},
      {id:'T2',who:'서경',text:'응. 작은 빨간 건 수진이 가져가. 차에는 큰 것만',time:'19:42',mine:true},
      {id:'T3',who:'태오',text:'담요는 이번엔 돌려줘라. 트렁크 추움',time:'19:44'},
      {id:'T4',who:'태오',text:'9시18분에 열 개 실었어. 수진이는 방금 작은 거 가져갔고. 나 출발',day:'11/07',time:'09:25'},
      {id:'T5',who:'태오',text:'열 개 끝. 인수증 찍어서 보냈어.',time:'11:41',attachment:true},
      {id:'T6',who:'태오',text:'운송비 8만 들어옴. 접시는 안 깨졌지',time:'12:01'},
      {id:'T7',who:'서경',text:'접시는 도하 거야 ㅋㅋ 담요 오늘 줄게. 빈 선반 밑에 접어뒀어',time:'12:02',mine:true},
      ...(S.seen.tagPost?[{id:'T8',who:'태오',text:'댓글 달았어. 내 차에서 없어진 것처럼 돼서',time:'17:40'}]:[])
    ];
    if(person==='seogyeong')return [
      {id:'S1',who:'서경',text:'폰 바꿨다. 최근 대화만 옮겼어.',day:'11/03',time:'10:12',mine:true},{id:'S2',who:'도하',text:'접시 사진은 왜 옮김. 그거 내 거잖아',time:'10:13'},{id:'S3',who:'서경',text:'그건 오늘 찍었어. 사진 말고 접시를 가져가',time:'10:13',mine:true},{id:'S4',who:'도하',text:'토요일에 가져갈게. 귤 담긴 채로 줘',time:'10:14'},{id:'S5',who:'서경',text:'ㅇㅇ 귤도 가져가. 너무 샀어.',time:'10:15',mine:true},{id:'S6',who:'도하',text:'끝나면 밥은. 또 귤 먹고 끝내지 말고',day:'11/05',time:'22:11'},{id:'S7',who:'서경',text:'먹자. 네가 골라. 그날은 설거지 없는 데로',time:'22:11',mine:true},{id:'S8',who:'서경',text:'오늘 공지 내가 손댄 뒤로 말이 더 꼬였어. 와서 같이 좀 봐줘',day:'11/07',time:'18:22',mine:true},{id:'S9',who:'도하',text:'가는 중. 수진 씨 얘기?',time:'18:24'},{id:'S10',who:'서경',text:'응. 내가 직접 말할게',time:'18:25',mine:true}
    ];
    return [{id:'N1',who:'강나래',text:'문원생활 강나래입니다. 폐점 날 취재해도 될까요?',day:'11/05',time:'15:02'},
      ...(S.seen.tagPost?[{id:'N2',who:'강나래',text:'공지엔 열한 개인데 자료실엔 열 개네요. 원래 표도 볼 수 있을까요?',day:'11/07',time:'18:38'}]:[]),
      ...(S.briefed&&!S.flow.shareStarted?[{id:'N3',who:'도하',text:'동생 윤도하입니다. 지금 누나 폰 맡고 있어요.',time:'18:40',mine:true},{id:'N4',who:'강나래',text:'네. 보신 내용이랑 자료 같이 보내 주세요.',time:'18:40'}]:[])
    ];
  }
  function bubble(m){return `<div class="bubble-row ${m.mine||m.who==='도하'&&S.room!=='seogyeong'?'mine':''}" ${m.id==='M036'?'data-observe="latestSujin"':''}><div class="bubble">${esc(m.text)}${m.file?act(`${icon('file-spreadsheet')} 철수표 · 17:26`,'received-sheet','','message-file'):''}${m.attachment?act(`<img src="${asset('IMG002')}" alt="인수증" class="chat-photo">`,'photo','data-id="IMG002"','attachment'):''}</div><small>${m.mine?(m.who==='서경'?'서경 · ':m.who==='도하'?'도하 · ':''):''}${m.time}${m.pending?' · 전송됨':m.mine?' · 읽음':''}</small></div>`;}
  function room(){
    const base=baseMessages(S.room),live=S.liveMessages.filter(m=>m.room===S.room),limit=S.chatLimits[S.room]||({sujin:4,narae:2,taeo:3,seogyeong:3}[S.room]||4),shown=[...base.slice(-limit),...live];
    const hasApproval=shown.some(m=>m.id==='M031')&&shown.some(m=>m.id==='M032');
    let rows=shown.map(m=>`${m.day?`<div class="date-divider">${m.day.replace('/','월 ')}일</div>`:''}${bubble(m)}${m.id==='M032'&&hasApproval?`<div class="inline-record" data-observe="E005"><span data-saved="E005">${S.evidence.includes('E005')?'메모에 저장됨':'09:12 승인 · 09:24 반환'}</span></div>`:''}`).join('');
    const pending=S.jobs.some(j=>['introReply','factReply','routeSujin','routeShared','secondSujin','secondRecords','draftsReady','familyReady'].includes(j.type)&&((['introReply','routeSujin','secondSujin'].includes(j.type)&&S.room==='sujin')||(['factReply','routeShared','secondRecords','draftsReady','familyReady'].includes(j.type)&&S.room==='narae')))&&S.liveMessages.filter(m=>m.room===S.room&&m.mine).at(-1)?.pending===false;
    let actions='';
    if(!S.ending&&S.room==='sujin'&&S.flow.stage<=1&&!S.flow.insights.includes('sujin')&&!S.jobs.some(j=>j.type==='routeSujin'))actions=act('상자 얘기 여쭤봐도 될까요?','ask-sujin','','reply-choice');
    if(!S.ending&&S.room==='taeo')actions=act(`${icon('phone')} 전화`,'taeo-menu','','reply-choice');
    if(!S.ending&&S.room==='narae'){
      if(!S.briefed)actions='';
      else actions=G.availableFacts(S).length?'<details class="optional-checks"><summary>자료 더 확인하기</summary>'+G.availableFacts(S).map(f=>act(`${S.facts.includes(f.id)?icon('check'):icon('file-spreadsheet')} ${f.id==='quantity'?'상자 수량':f.id==='photo'?'사진 시각':'오전 승인과 오후 수정'}`,'fact',`data-id="${f.id}"`,'reply-choice')).join('')+'</details>':'';
      if(S.finalCallDone&&S.events['public-drafts'])actions+=act('게시물 작성','publication','','reply-choice');
    }
    return `<div class="chat-body">${base.length>limit?act('이전 대화','older','','older-button'):''}${rows}${pending?'<div class="typing"><i></i><i></i><i></i></div>':''}${!S.briefed&&S.room==='sujin'&&!S.seen.notes&&!live.some(m=>m.mine)?act(`${icon('notebook-pen')} 서경이 남긴 메모`,'notes','','note-link'):''}<div class="reply-options">${actions}</div></div>`;
  }
  function notes(){const mode=S.notesMode||'records';return `<div class="page notes-page"><div class="page-heading"><h1>메모</h1>${icon('notebook-pen')}</div><details class="owner-note" ${!S.briefed?'open':''}><summary>오늘 부탁할 일 <small>서경 · 18:25</small></summary><p>도하야, 계산대 부탁해.<br>기자님 연락은 네가 좀 봐 줘.<br>공개할 글은 나랑 먼저 확인하고.<br>낭독회는 7시 20분에 끝나.</p></details><div class="segments">${act('최근 기록','notes-tab','data-mode="records"',mode==='records'?'selected':'')}${act('내 메모','notes-tab','data-mode="personal"',mode==='personal'?'selected':'')}</div>${mode==='personal'?`<label class="sr-only" for="free-note">내 메모</label><textarea id="free-note" class="free-note" placeholder="메모를 입력하세요" maxlength="12000">${esc(S.noteText)}</textarea><div id="note-status" class="note-save">${saveOK?'저장됨':'이 기기에 저장할 수 없습니다'}</div>`:`${S.noteEntries.length?S.noteEntries.map(n=>`<button class="note-row" data-action="note-source" data-id="${n.source||''}"><small>${n.time}</small><p>${esc(n.text)}</p>${n.source?icon('chevron-right'):''}</button>`).join(''):'<div class="empty-note">읽은 기록이 여기에 모입니다.</div>'}${S.evidence.length>=2?act(`${icon('grid-2x2')} 나란히 보기`,'compare','','plain-link'):''}${!S.briefed&&G.canBrief(S)?act(`${icon('message-circle')} 강나래 기자`,'room','data-room="narae"','contact-link'):''}`}</div>`;}
  function postHead(person,handle,time){return `<div class="post-head">${avatar(person)}<div><strong>${person==='seogyeong'?'모서리책방':names[person]}</strong><small>${handle} · ${time}</small></div>${ib('ellipsis','게시물 정보','post-info')}</div>`;}
  function threads(){const fixed=['A','C'].includes(S.ending);return `<div class="social-page">${postHead('seogyeong','@seogyeong_m','11.07')}<div class="thread-line"><div class="post-copy" data-observe="tagPost">${fixed?'<p>오전에 승인한 개인 물건 반환이었습니다.<br>반출 표현과 수진 태그를 철회합니다.</p>':'<p>오늘 기증 기록 중 한 상자가 따로 반출된 경위를 확인하고 있습니다.</p><p><span class="mention">@sujin_note</span> 연락 부탁해.<br>정확히 정리해 다시 알리겠습니다.</p>'}<small class="post-date">17:28${fixed?' · 19:30 수정':''}</small></div><div class="social-actions">${icon('heart')}${act(icon('message-circle'),'comments','aria-label="댓글 3개"','icon-button')}${icon('share-2')}<small>공유 7 · 조회 1,432</small></div>${S.commentsOpen?`<div class="comment">${avatar('sujin','small')}<div><strong>이수진</strong><p>제 물건 가져갔어요. 허락받았고요. 태그는 내려주세요.</p>${act('메시지','room','data-room="sujin"','plain-link')}</div></div><div class="comment">${avatar('seogyeong','small')}<div><strong>모서리책방</strong><p>수진아 전화로 얘기하자.</p></div></div><div class="comment">${avatar('taeo','small')}<div><strong>박태오</strong><p>제 차에는 큰 상자 열 개만 실었습니다.</p>${act('메시지','room','data-room="taeo"','plain-link')}</div></div>`:act('댓글 3개','comments','','subtle-link')}${fixed?act('정정문과 자료','records',`data-id="${S.ending}"`,'plain-link'):''}</div><details class="older-post"><summary>11월 3일 게시물</summary>${postHead('seogyeong','@seogyeong_m','11.03')}<p>모임에서 남긴 열한 상자의 기록은 달빛자료실에 기증합니다. 마지막 낭독회는 토요일 저녁입니다.</p>${fixed?'<div class="correction">기증은 10상자입니다. 개인 반환 물건 1상자가 포함돼 있었습니다.</div>':''}</details></div>`;}
  function instagram(){return `<div class="instagram-post">${postHead('seogyeong','corner_seo','11.07')}<button class="photo-full-button" data-action="photo" data-id="IMG001"><img src="${asset('IMG001')}" alt="책방에 놓인 큰 상자 열 개와 작은 상자 한 개"></button><div class="post-lower"><div class="social-actions">${icon('heart')}${icon('message-circle')}${icon('send')}<span class="push"></span>${icon('bookmark')}</div><div data-observe="E004"><p><strong>corner_seo</strong> 열한 상자에 담긴 여덟 해. 오늘 자료실로 보냅니다.</p><small class="post-date">11월 7일 17:12</small></div>${['A','C'].includes(S.ending)?'<p class="correction">19:30 정정 · 오전 촬영 사진이며 실제 기증은 10상자입니다.</p>':''}<details><summary>댓글 1개</summary><p class="comment-copy"><strong>taeo_van</strong> 오전에 고생했어. 난 이제 차 청소함.</p></details>${act('원본 사진','open-original','','plain-link')}${act('예약 정보','schedule','','subtle-link')}</div><details class="older-post"><summary>이전 게시물</summary><img src="${asset('IMG003')}" alt="귤과 접시"><p>서경 · 너무 많이 샀네.</p><img src="${asset('IMG005')}" alt="닫힌 노트가 놓인 책상"><p>수진 · 화요일 저녁이 비었습니다.</p><img src="${asset('IMG006')}" alt="담요가 놓인 밴 조수석"><p>태오 · 담요 한 장은 아직 책방에 있음.</p></details></div>`;}
  function sheet(){const version=S.sheetVersion||'current',base=version==='baseline',isOld=version==='previous',returned=base||(!isOld&&S.edited);return `<div class="page"><div class="file-heading"><span class="file-icon">${icon('file-spreadsheet')}</span><div><strong>모서리_철수_1107</strong><small>보기 전용</small></div></div><div class="segments">${act('현재','version','data-version="current"',version==='current'?'selected':'')}${act('11:45','version','data-version="baseline"',base?'selected':'')}${S.edited||isOld?act('17:26','version','data-version="previous"',isOld?'selected':''):''}</div><div class="sheet-summary"><span>기증 합계</span><strong>${returned?'10':'11'}<small>상자</small></strong></div><div class="item-card" data-observe="${base?'E001':S.edited&&!isOld?'newVersion':'sheetCurrent'}"><div class="item-number">11</div><h2>수업안·개인 노트·영수증</h2><dl><dt>주인</dt><dd>이수진</dd><dt>처리</dt><dd>${returned?'개인 반환':'기증'}</dd><dt>받는 곳</dt><dd>${returned?'이수진':'달빛자료실'}</dd><dt>확인</dt><dd>${returned?'09:24 반환':'확인 중'}</dd></dl></div><details class="file-details"><summary>기증 물품 01–10</summary>${['모임 안내지 2019','모임 안내지 2020','공개 배포자료 2021','공개 배포자료 2022','행사 인쇄물 2023','행사 인쇄물 2024','매장 운영기록 2019–2022','매장 운영기록 2023–2026','독서모임 추천목록','장서 기증목록'].map((x,i)=>`<div class="file-item"><span>${String(i+1).padStart(2,'0')}</span><div>${x}<small>모서리책방 → 달빛자료실 · 11:40 인수</small></div></div>`).join('')}</details>${act(`${icon('clock')} 버전 기록`,'history','','file-link')}${act(`${icon('file-spreadsheet')} 정산`,'settlement','','file-link')}</div>`;}
  function history(){return `<div class="page">${S.edited?`<div class="revision" data-observe="newVersion"><div class="revision-dot"></div><small>18:47 · 윤서경</small><h2>물품 3개 셀 변경</h2><p>기증 → 개인 반환<br>달빛자료실 → 이수진<br>확인 중 → 09:24 반환</p>${act('이 버전 열기','version','data-version="current"','plain-link')}</div>`:''}<div class="revision" data-observe="E006"><div class="revision-dot"></div><small>17:26 · 윤서경</small><h2>물품 3개 셀 변경</h2><div class="change-line"><span>처리</span><del>개인 반환</del><b>기증</b></div><div class="change-line"><span>받는 곳</span><del>이수진</del><b>달빛자료실</b></div><div class="change-line"><span>확인</span><del>09:24 반환</del><b>확인 중</b></div><small>기증 합계 10 → 11 · 자동 갱신</small></div><div class="revision"><div class="revision-dot"></div><small>11:45 · 윤서경</small><h2>기준본 저장</h2>${act('이 버전 열기','version','data-version="baseline"','plain-link')}</div></div>`;}
  function photos(){return `<div class="page-heading gallery-heading"><h1>사진</h1><small>4장</small></div><div class="photo-grid">${['IMG004','IMG002','IMG001','IMG003'].map(id=>act(`<img src="${asset(id)}" alt="${id==='IMG001'?'상자':id==='IMG002'?'인수증':id==='IMG003'?'귤과 접시':'빈 책장'}">`,'photo',`data-id="${id}"`,'photo-tile')).join('')}</div>`;}
  function photoView(){return `<div class="photo-view ${zoom?'zoom':''}"><img src="${asset(S.photo)}" alt="선택한 사진"></div><div class="photo-toolbar">${ib(zoom?'search':'plus',zoom?'축소':'확대','zoom')}${ib('info','상세정보','photo-info')}${ib('notebook-pen','메모','notes')}</div>${S.photo==='IMG002'?act('달빛자료실','web','data-page="intake"','album-link'):''}`;}
  function photoInfo(){const data={IMG001:['2026.11.07 09:06:18','3024 × 4032','철수 전 상자'],IMG002:['2026.11.07 11:40:12','1600 × 2200','자료실 인수 확인'],IMG003:['2026.11.03 09:18:06','3024 × 3024','아침'],IMG004:['2026.11.07 17:02:10','3024 × 4032','마지막 날']}[S.photo];return `<div class="page"><img src="${asset(S.photo)}" alt="선택한 사진" class="info-thumb"><div class="info-card" ${S.photo==='IMG001'?'data-observe="E003"':''}><h2>${data[2]}</h2><dl><dt>촬영</dt><dd>${data[0]}</dd><dt>크기</dt><dd>${data[1]}</dd><dt>보관</dt><dd>이 기기</dd></dl></div></div>`;}
  function searchView(){const q=search.trim().replace(/\s/g,'');let links=[['intake','달빛자료실','기증 인수 기록'],['news','문원생활','모서리책방 관련 기사'],['event','모서리책방','마지막 날 안내']];if(q&&!/모서리|기증|자료|달빛|상자|문원|기사|낭독|행사/.test(q))links=[];return `<div class="page"><form id="search-form" class="search-form">${icon('search')}<input id="query" name="q" value="${esc(search)}" placeholder="검색 또는 주소 입력" maxlength="40" aria-label="검색"><button aria-label="검색">${icon('arrow-up')}</button></form><h2 class="small-heading">${q?'검색 결과':'즐겨찾기'}</h2>${links.map(([id,title,desc])=>act(`<span class="site-icon">${icon('globe')}</span><span><strong>${title}</strong><small>${desc}</small></span>${icon('chevron-right')}`,'web',`data-page="${id}"`,'website-row')).join('')}${!links.length?'<p class="empty">검색 결과가 없습니다.</p>':''}</div>`;}
  function web(){if(S.page==='intake')return `<article class="web-page"><div class="site-masthead">달빛자료실</div><small>공개 인수 기록 · 11월 7일</small><h1>모서리책방 활동자료<br>10상자 인수</h1><div class="receipt-card" data-observe="E002"><span>기증 인수 확인</span><dl><dt>인수번호</dt><dd>D-1107-10</dd><dt>접수 예정</dt><dd>10상자</dd><dt>실제 인수</dt><dd>10상자</dd><dt>접수 시각</dt><dd>11:40</dd></dl><p>접수 예정 목록과 일치했습니다.</p></div>${act('인수증','photo','data-id="IMG002"','plain-link')}<details><summary>인수 대상</summary><p>모임 안내지, 공개 배포자료, 행사 인쇄물과 매장 운영 기록입니다. 내부 정리와 공개 여부 검토는 별도로 진행합니다.</p></details></article>`;
    if(S.page==='event')return `<article class="web-page"><div class="site-masthead">모서리책방</div><h1>마지막 낭독회</h1><p>11월 7일 · 18:45–19:20<br>맞은편 2층 행사실<br>진행 윤서경</p><p>개인 물품은 계산대에서 찾아가세요.</p><details><summary>행사실 안내</summary><p>내선 070-0000-0102<br>공용 컴퓨터에서 낭독 자료와 책방의 공유 문서를 확인할 수 있습니다.</p></details></article>`;
    return `<article class="web-page"><div class="site-masthead">문원생활</div><small>강나래 기자 · ${S.ending?'19:30 수정':'17:46 입력'}</small><h1>${S.ending?'기증 10상자 확인…<br>별도 상자는 개인 물건':'책방 공지는 11상자,<br>자료실 인수는 10상자'}</h1><p>${S.ending?'오전에 반환을 승인받은 개인 물건이었다. 앞선 기사에서 충분히 설명하지 못한 반환 경위를 바로잡는다.':'운영자 윤서경 씨는 별도 반출 경위를 확인하고 있다고 답했다. 자료실은 예정된 열 상자를 인수했다고 밝혔다.'}</p>${S.ending==='B'?'<p>당사자를 태그한 책방 공지는 현재 유지되고 있다.</p>':''}${S.ending==='C'?'<p>책방이 공개한 대화의 주소와 개인 사정은 이 기사에 싣지 않는다.</p>':''}<details><summary>기사 전문</summary><p>모서리책방은 오늘 영업을 마치고 마지막 낭독회를 연다. ${S.ending?'반환 승인과 수정 기록을 대조했다.':'당사자 설명과 원기록을 확인한 뒤 19시 30분 기사를 수정한다.'}</p></details>${act('자료실 인수 내역','web','data-page="intake"','plain-link')}</article>`;}
  function excerpt(id){const e=D.excerpts[id];return e?`<section class="excerpt"><small>${esc(fixedTitle(e.source))}</small>${['E003','E004'].includes(id)?`<img src="${asset('IMG001')}" alt="상자 사진">`:''}${e.lines.map(x=>`<p>${esc(x)}</p>`).join('')}</section>`:'';}
  function compare(){return `<div class="page"><div class="comparison-pickers">${S.evidence.map(id=>act(`${S.comparison.includes(id)?icon('check'):icon('plus')} ${fixedTitle(G.evidence[id].title)}`,'compare-toggle',`data-id="${id}"`,S.comparison.includes(id)?'chip selected':'chip')).join('')}</div><div class="comparison-grid">${S.comparison.map(excerpt).join('')}</div>${S.returnTo==='proof'?act('작성 중인 메시지','return-proof','','plain-link'):''}</div>`;}
  function proof(){const f=G.facts.find(x=>x.id===S.selectedFact);if(!G.availableFacts(S).some(x=>x.id===f.id))return '<div class="empty">작성 중인 메시지가 없습니다.</div>';const d=S.draft[f.id]||{claim:null,pair:[]},pending=S.pendingFacts[f.id];return `<div class="page"><h2 class="small-heading">${f.title}</h2>${S.facts.includes(f.id)?`<div class="sent-confirmation">${icon('check')} ${esc(f.reply)}</div>`:`${f.alternatives.map((x,i)=>act(`${icon(d.claim===i?'check':'circle')}<span>${x}</span>`,'claim',`data-index="${i}" ${pending?'disabled':''}`,d.claim===i?'claim selected':'claim')).join('')}<div class="attachment-label">첨부 ${d.pair.length}</div>${S.evidence.map(id=>act(`${icon(d.pair.includes(id)?'check':'file-spreadsheet')}<span>${fixedTitle(G.evidence[id].title)}</span>`,'attach',`data-id="${id}" ${pending?'disabled':''}`,d.pair.includes(id)?'attachment-choice selected':'attachment-choice')).join('')}${d.pair.length===2?act(`${icon('grid-2x2')} 나란히 보기`,'compare-draft','','plain-link'):''}<div class="compose-actions">${act(icon('notebook-pen'),'keep-idea',`aria-label="내 판단 메모" ${d.claim===null||pending?'disabled':''}`,'icon-button')}${act(pending?'전송됨':`${icon('send')} 보내기`,'submit',`${pending||d.claim===null||d.pair.length!==2?'disabled':''}`,'send-button')}</div>`}${S.ideas.some(i=>i.fact===f.id)?`<details class="idea-history"><summary>내 메모</summary>${S.ideas.filter(i=>i.fact===f.id).slice(-4).map(i=>`<small>${i.time} · ${i.kind==='confirmed'?'확인함':i.kind==='reconsider'?'다시 확인 중':'내 생각'}</small><p>${f.alternatives[i.claim]}</p>`).join('')}</details>`:''}${act('대화로 돌아가기','room','data-room="narae"','plain-link')}</div>`;}
  function phone(){return `<div class="page"><h1 class="phone-heading">전화</h1><small class="section-label">연락처</small>${act(`${avatar('narae')}<span><strong>강나래 기자</strong><small>010-0000-0044</small></span>${icon('phone')}`,'call-initial',G.canBrief(S)&&!S.ending?'':'disabled','phone-contact')}${act(`${avatar('taeo')}<span><strong>태오</strong><small>010-0000-0033</small></span>${icon('phone')}`,'taeo-menu',S.ending?'disabled':'','phone-contact')}${act(`${avatar('seogyeong')}<span><strong>모서리 행사실</strong><small>070-0000-0102</small></span>${icon('phone')}`,S.early==='pending'?'call-early':'call-final',((S.early==='pending'||G.readyForFinal(S))&&!S.ending)?'':'disabled','phone-contact')}<div class="section-label recent-label">최근 통화</div>${S.early==='pending'?'<div class="missed-call">행사실 · 부재중</div>':''}${S.initialCall==='done'?'<div class="call-record">강나래 기자 · 발신</div>':''}${S.taeo==='done'?'<div class="call-record">태오 · 발신</div>':''}${S.early==='done'?'<div class="call-record">행사실 · 수신</div>':''}${S.finalCallDone?'<div class="call-record">행사실 · 19:20</div>':''}</div>`;}
  function finalOpening(){const lines=[['서경','도하야. 행사 끝났어.'],['도하',S.flow.secondRoute==='sujin'?'수진 씨랑 얘기했어. 글이 아직 그대로라고 하더라.':S.flow.secondRoute==='records'?'표 고친 기록 봤어. 누나한테 물어볼 게 있어.':S.answer==='hold'?'아까는 누나한테 직접 듣고 싶어서 말 안 했어.':'아까 그 얘기 마저 하자.']];if(!S.evidence.includes('E005')&&!S.flow.insights.includes('sujin'))lines.push(['도하','그 작은 상자, 수진 씨 거였어?'],['서경','응. 아침에 가져가라고 했어. 기증에서 뺐고.']);return lines;}
  function finalClosing(){return [['서경','처음에 표를 기증으로 고친 것도 나야.'],['도하','그거랑 가져가라고 했던 거, 같이 쓸게.'],['서경',S.questionOrder[0]==='name'?'넌 수진이 이름부터 물었는데. 난 마지막 인사 걱정만 했네.':'바빴다고 넘어가려 했어. 네가 안 물었으면.'],['서경','내가 알고 허락했다고 써. 내 이름으로.'],['서경','그냥 다 올릴까. 또 잘라 올리면 못 믿을까 봐.'],['도하','올릴 건 내가 다시 볼게.'],['서경','응. 의자만 치우고 갈게.']];}
  function callLines(){const c=S.activeCall;if(c.kind==='initial')return [['강나래','문원생활 강나래입니다. 서경 씨 전화 맞으시죠?'],['도하','동생 윤도하입니다. 지금 누나 폰 맡고 있어요.'],['강나래','공지랑 자료실 수량이 달라서요. 원래 기록을 볼 수 있을까요?'],['강나래','보신 내용은 메시지로 주세요. 주소 같은 개인 얘기는 빼 주시고요.']];if(c.kind==='early')return [['서경','기자님이 행사실로 전화했더라.'],['서경','표는 여기서 다시 고쳐 놨어.'],['서경','너는 어디까지 보냈어?']];if(c.kind==='taeo')return D.taeoLines(S.taeoQuestion||'count',{photo:S.evidence.some(id=>['E003','E004'].includes(id)),edit:S.evidence.includes('E006')||S.early==='done'||S.finalCallDone});if(c.part==='opening')return finalOpening();if(c.part==='topic')return D.questions[c.topic].lines;return finalClosing();}
  function callView(){const c=S.activeCall,person=c.kind==='initial'?'narae':c.kind==='taeo'?'taeo':'seogyeong',name=person==='seogyeong'?'모서리 행사실':names[person];if(c.ringing||c.connecting)return `<div class="call-screen"><div class="call-person">${avatar(person,'call-avatar')}<h1>${name}</h1><small>${c.connecting?'연결 중…':'전화가 왔습니다'}</small></div><div class="call-bottom">${c.ringing?act(icon('phone'),'answer-call','aria-label="전화 받기"','round-call accept'):''}${act(icon('phone-off'),'end-call','aria-label="통화 종료"','round-call decline')}</div></div>`;
    if(c.kind==='final'&&c.part==='questions')return `<div class="call-screen"><div class="call-small-name">${name}<small>통화 중</small></div><div class="call-question-list">${Object.entries(D.questions).map(([id,q])=>act(`${S.questionOrder.includes(id)?icon('check'):''}<span>${{why:'왜 기증으로 다시 넣었어?',restore:'방금 표를 되돌린 것도 누나야?',name:'수진 씨 태그는 왜 그대로야?'}[id]}</span>`,'ask-question',`data-id="${id}"`,'spoken-choice')).join('')}${G.canCloseQuestions(S)?act('그럼 올릴 글 한번 볼게.','close-questions','','spoken-choice primary'):''}</div><div class="call-bottom">${act(icon('phone-off'),'end-call','aria-label="통화 종료"','round-call decline')}</div></div>`;
    if(c.kind==='early'&&c.part==='choice')return `<div class="call-screen"><div class="call-small-name">${name}<small>통화 중</small></div><div class="call-question-list">${act('본 건 기자님께 보냈어.','call-choice','data-answer="tell"','spoken-choice')}${act('아직 보고 있어. 올리기 전에 누나랑 얘기할게.','call-choice','data-answer="hold"','spoken-choice')}</div><div class="call-bottom">${act(icon('phone-off'),'end-call','aria-label="통화 종료"','round-call decline')}</div></div>`;
    const lines=callLines(),line=lines[Math.min(c.index,lines.length-1)];return `<div class="call-screen"><div class="call-small-name">${name}<small>통화 중</small></div><div class="caption-area"><span class="caption-person">${line[0]}</span>${act(esc(line[1]),'next-call',`aria-label="${esc(line[0]+': '+line[1])}"`,'call-caption')}</div><div class="call-controls">${ib(S.sound?'volume-2':'volume-x','효과음 전환','toggle-sound')}${act(icon('phone-off'),'end-call','aria-label="통화 종료"','round-call decline')}${ib('chevron-right','계속','next-call')}</div></div>`;
  }
  function beginCall(kind,incoming=false){if(S.activeCall||S.ending)return;if(kind==='initial'&&!G.canBrief(S))return;if(kind==='final'&&!G.readyForFinal(S))return;if(kind==='taeo'&&S.flow.stage<=1)F.pick(S,'taeo');if(kind==='final')S.jobs=S.jobs.filter(j=>!['earlyCall','familyReady','factsReady'].includes(j.type));S.activeCall={kind,index:0,part:kind==='final'?'opening':'lines',ringing:incoming,connecting:!incoming,ringRemaining:18000,returnScreen:S.screen};banner=null;if(incoming){if(kind==='early')S.early='ringing';chime(true);}else G.enqueue(S,'connect-'+Date.now(),'connected',2800,{kind});render();$('screen').scrollTop=0;}
  function endCall(){const c=S.activeCall;if(!c)return;S.jobs=S.jobs.filter(j=>j.type!=='connected');if(c.kind==='early')S.early='pending';if(c.kind==='initial')S.initialCall='missed';S.activeCall=null;render();save();}
  function finishCall(){const c=S.activeCall;if(!c)return;S.activeCall=null;
    if(c.kind==='initial'){S.initialCall='done';S.briefed=true;G.enqueue(S,'reporter-followup','reporterHello',3300);openConversation('narae');}
    if(c.kind==='taeo'){const first=S.taeo!=='done';S.taeo='done';S.taeoTime=G.time(S);F.insight(S,'taeo');G.addNote(S,'taeo','태오: 출발과 인수 모두 10상자. 표를 수정한 경위는 모른다고 했다.');if(first)G.enqueue(S,'taeo-blanket','taeoLife',4200);openConversation('taeo');}
    if(c.kind==='early'){S.early='done';if(S.flow.stage===2){message('owner-brief-call','narae','도하','누나랑 잠깐 통화했어요. 표를 다시 고쳤대요.',{mine:true,pending:true});G.enqueue(S,'owner-brief-read','readMessage',2400,{messageId:'owner-brief-call'});finishSecondRoute('owner');}openConversation('narae');}
    if(c.kind==='final'){S.finalCallDone=true;S.flow.stage=4;message('owner-finished','narae','도하','누나랑 얘기했어요. 올릴 글부터 볼게요.',{mine:true,pending:true});G.enqueue(S,'owner-finished-read','readMessage',2400,{messageId:'owner-finished'});G.enqueue(S,'public-drafts','draftsReady',3400);openConversation('narae');}
    render();
  }
  function nextCall(){const c=S.activeCall;if(!c||c.connecting||c.ringing)return;const lines=callLines();if(c.index<lines.length-1){c.index++;render();return;}if(c.kind==='early'){c.part='choice';render();return;}if(c.kind==='final'){if(c.part==='opening'){c.part='questions';c.index=0;render();return;}if(c.part==='topic'){G.completeQuestion(S,c.topic);c.part='questions';c.index=0;render();return;}}finishCall();}
  const publicTexts={A:'기증은 10상자였고, 별도 상자는 이수진 씨의 개인 물건입니다. 제가 반환을 승인했습니다.\n\n알고도 분류를 바꾸고 수진 씨를 태그했습니다. 제 공지로 의심받게 한 점 사과드립니다.\n\n사건 관련 자료를 공개합니다. 개인 내용은 가렸습니다. 윤서경.',B:'철수 과정에 수량 혼선이 있었습니다. 기증은 10상자로 마쳤고 기사에도 반영했습니다. 마지막까지 와주신 분들께 감사드립니다. 윤서경.',C:'기증은 10상자였고, 수진 씨는 자신의 물건을 가져갔습니다. 제가 알고 승인했습니다. 오후에 표와 공지를 잘못 고쳤습니다.\n\n전체 대화와 표를 공개합니다. 윤서경.'};
  function publication(){return `<div class="page"><div class="draft-sender">${avatar('seogyeong')}<span>모서리책방<small>공개 게시물</small></span></div>${[['A','승인과 공지 책임을 함께 정정','사건 자료 · 개인 내용 가림'],['B','수량 혼선으로 정리','기사 링크'],['C','원문 전체 공개','대화 · 표 · 정산']].map(([id,title,desc])=>act(`<strong>${title}</strong><small>${desc}</small>${icon('chevron-right')}`,'preview',`data-id="${id}"`,'draft-row')).join('')}</div>`;}
  function materialSnippet(id){
    if(id==='A'){const m=D.publicMessages('A').find(m=>m[0]==='M031');return `<div class="redacted">개인 대화 5개를 가렸습니다.</div><p>${m[1]} · ${m[2]}<br>${esc(m[3])}</p>`;}
    if(id==='C')return `<div class="private-excerpt"><small>공개되는 대화</small>${D.publicMessages('C').filter(m=>['M025','M026','M029'].includes(m[0])).map(m=>`<p><small>${m[1]} · ${m[2]}</small><br>${esc(m[3])}</p>`).join('')}</div>`;
    return '<div class="original-post"><small>기존 게시물 · 유지</small><p>한 상자가 따로 반출된 경위를 확인하고 있습니다. @sujin_note 연락 부탁해.</p></div>';
  }
  function preview(){const id=S.preview||'A';return `<div class="page"><div class="draft-sender">${avatar('seogyeong')}<span>모서리책방<small>미리보기</small></span></div><p class="public-copy">${esc(publicTexts[id])}</p>${materialSnippet(id)}${id!=='B'?act(`${icon('file-spreadsheet')} 첨부 자료`,'records',`data-id="${id}"`,'file-link'):''}${act('게시','publish',`data-id="${id}"`,'button primary')}${act('취소','publication','','button secondary')}</div>`;}
  function records(){const id=S.ending||S.recordMode||S.preview;if(!S.finalCallDone)return '';const rows=D.publicMessages(id);return `<div class="page"><div class="document-label">${S.ending?'공개 자료':'미리보기'} · ${id==='A'?'개인 내용 가림':'대화 원문'}</div>${rows.map((m,i)=>`${id==='A'&&i===5?'<div class="redacted">11월 6일~7일 개인 대화 5개를 가렸습니다.</div>':''}<div class="document-message"><small>${m[1]} · ${m[2]}</small><p>${esc(m[3])}</p></div>`).join('')}<details class="file-details"><summary>물품표 · 변경 기록</summary>${excerpt('E001')}${excerpt('E006')}<div class="excerpt"><small>18:47 · 윤서경</small><p>기증 → 개인 반환<br>달빛자료실 → 이수진<br>확인 중 → 09:24 반환</p></div></details>${id==='A'?`<details><summary>사진 시각</summary>${excerpt('E003')}${excerpt('E004')}</details>`:''}${id==='C'?'<details><summary>정산 내역</summary><p>이수진 · 밀린 급여 320,000원<br>박태오 · 운송비 80,000원<br>윤도하 · 행사 간식비 22,000원</p></details>':''}</div>`;}
  function result(){const id=S.ending||'A';if(!S.epilogue)return `<div class="page">${postHead('seogyeong','@seogyeong_m','19:30')}<p class="public-copy">${esc(publicTexts[id])}</p>${id!=='B'?act('첨부 자료','records',`data-id="${id}"`,'file-link'):''}${act('문원생활 기사','web','data-page="news"','file-link')}${act('기존 게시물','app','data-app="short"','file-link')}${act('일주일 뒤','epilogue','','button primary')}</div>`;
    const sujin={A:'제 이름 붙은 글도 고쳐졌네요. 도하 씨께도 전해 주세요. 여분 열쇠는 태오 씨 편에 보냈어요.',B:'기사는 바뀌었네요. 근데 제 이름 붙은 글은 그대로예요. 다음 모임 연락에서는 빼 주세요.',C:'제 물건인 건 알겠네요. 제 주소랑 밀린 월세까지요. 그 얘긴 옮기지 말아 달라고 했잖아요.'}[id];
    const sister={A:S.questionOrder[0]==='name'?'수진이 열쇠 받았어. 네가 이름부터 물었던 거 자꾸 생각나. 접시 돌려줄게. 밥 먹자':'수진이 열쇠 받았어. 답장은 내일 하려고. 접시 돌려줄게. 밥 먹자',B:'열쇠 받았어. 짐도 다 뺐고. 밥은 다음에 먹자. 오늘 좀 피곤해',C:'캡처는 다음날 내렸어. 벌써 열여덟 번 공유됐더라. 내가 올리자고 했는데… 수진이한테 내가 다시 말할게.'}[id];
    return `<div class="chat-body"><div class="date-divider">11월 14일 토요일</div><div class="epilogue-person">${avatar('sujin','small')} 이수진 → 서경</div>${bubble({text:sujin,time:'12:10',who:'수진'})}<div class="epilogue-person">${avatar('seogyeong','small')} 서경 → 도하</div>${bubble({text:sister,time:'12:11',mine:true,who:'서경'})}<img class="ending-photo" src="${asset('IMG004')}" alt="11월 7일의 빈 책장"><small class="photo-date">11월 7일에 남긴 사진</small>${act('11월 7일 기록','home','','button secondary')}${act('처음부터','restart','','plain-link')}</div>`;}
  function notices(){return `<div class="page"><h1>알림</h1>${S.notices.filter(n=>S.seen.tagPost||n.target?.room!=='sujin'||!/[태그이름]/.test(n.text)).slice().reverse().map(n=>act(`<small>${esc(fixedTitle(n.from))} · ${n.time}</small><p>${esc(n.text)}</p>`,'notice',`data-id="${n.id}"`,'notice-row')).join('')||'<p class="empty">알림이 없습니다.</p>'}</div>`;}
  function modal(html){$('overlay').innerHTML=`<div class="sheet-handle"></div>${html}`;$('overlay').hidden=false;$('overlay').querySelector('button')?.focus();}
  function closeModal(){$('overlay').hidden=true;$('overlay').innerHTML='';lastTick=performance.now();}
  function menu(){modal(`<h2>설정</h2>${act(`${icon('arrow-up')} 다음 장으로`,'advance-progress','','setting-row progress-setting')}${act(`${icon(S.sound?'volume-2':'volume-x')} 효과음 <span>${S.sound?'켬':'끔'}</span>`,'sound','','setting-row')}${act(`${icon('list')} 글자 크기 <span>${S.largeText?'크게':'기본'}</span>`,'text-size','','setting-row')}${act(`${icon('info')} 도움`,'hint','','setting-row')}${act(`${icon('notebook-pen')} 메모`,'modal-notes','','setting-row')}${act('처음부터','restart','','setting-row')}${!saveOK?'<p class="storage-warning">이 기기에 진행을 저장할 수 없습니다.</p>':''}${act('닫기','close-modal','','button secondary')}`);}
  function hint(){let text;const f=S.flow;if(f.stage<=1){text=F.canShare(S)?'지금 확인한 내용을 강나래 기자에게 물어볼 수 있어요.':f.route==='sujin'?'수진과의 메시지에서 상자 얘기를 물어보세요.':f.route==='taeo'?'태오에게 전화하거나 자료실 인수 기록을 볼 수 있어요.':f.route==='photo'?'인스타그램 게시물에서 원본 사진을 열어 보세요.':'수진, 태오, 사진 중 궁금한 쪽부터 살펴보세요.';}else if(f.stage===2)text=S.edited?'문서에 새 버전이 왔어요. 본 뒤 누구에게 물을지 고를 수 있어요.':'기자가 서경에게 확인하고 있어요. 답장을 기다리거나 다른 기록을 볼 수 있어요.';else if(f.stage===3)text='모서리 행사실로 전화해 서경과 얘기할 수 있어요.';else text='공개할 글을 직접 골라 주세요.';modal(`<h2>도움</h2><p>${text}</p>${act('다음 장으로','advance-progress','','button primary')}${act('닫기','close-modal','','button secondary')}`);}
  function homeContact(){if(S.ending)return act(`<small>메시지</small><span>${S.epilogue?'마지막으로 읽던 대화':'게시한 글과 기사'}</span>`,'view-result','','home-contact');const n=S.notices.filter(n=>!n.read&&(S.seen.tagPost||n.target?.room!=='sujin')).at(-1);return n?act(`<small>${esc(fixedTitle(n.from))}</small><span>${esc(n.text)}</span>`,'notice',`data-id="${n.id}"`,'home-contact'):'';}
  function flowPanel(){
    if(S.ending||S.activeCall||(S.screen==='notes'&&S.notesMode==='personal'))return '';
    const f=S.flow;
    if(f.stage<=1){
      if(f.shareStarted)return '';
      if(F.canShare(S))return `<div class="flow-options">${act(`${icon('message-circle')} 강나래 기자에게 연락`,'share-route','','reply-choice')}</div>`;
      if(S.screen==='short'||(S.screen==='room'&&S.room==='narae')||S.screen==='notes')return `<div class="flow-options">${act(`${icon('message-circle')} 수진에게 메시지`,'choose-route','data-route="sujin"','reply-choice')}${act(`${icon('phone')} 태오에게 전화`,'choose-route','data-route="taeo"','reply-choice')}${act(`${icon('camera')} 책방 사진 게시물`,'choose-route','data-route="photo"','reply-choice')}</div>`;
    }
    if(f.stage===2&&!S.edited&&((S.screen==='room'&&S.room==='narae')||(S.screen==='sheet'&&S.sheetVersion==='previous')))return '';
    if(f.stage===2&&!S.edited)return `<div class="flow-options">${act(`${icon('file-spreadsheet')} 기자가 받은 철수표`,'received-sheet','','reply-choice')}</div>`;
    if(f.stage===2&&S.edited){
      if(f.secondRequested)return '';
      if(!S.seen.newVersion)return `<div class="flow-options">${act(`${icon('file-spreadsheet')} 철수표 · 새 버전`,'version','data-version="current"','reply-choice')}</div>`;
      return `<div class="flow-options">${act(`${icon('phone')} 행사실로 전화`,'second-route','data-route="owner"','reply-choice')}${act(`${icon('message-circle')} 수진에게 메시지`,'second-route','data-route="sujin"','reply-choice')}${act(`${icon('clock')} 기자와 수정 기록 비교`,'second-route','data-route="records"','reply-choice')}</div>`;
    }
    if(f.stage===3&&!S.finalCallDone)return `<div class="flow-options">${act(`${icon('phone')} 모서리 행사실`,'call-final','','reply-choice')}</div>`;
    return '';
  }
  function updateFlowPanel(){const el=$('flow-actions');if(el)el.innerHTML=flowPanel();}
  function askSujin(){if(S.flow.stage>1||S.jobs.some(j=>j.type==='routeSujin'))return;F.pick(S,'sujin');const id='ask-sujin-'+Date.now();message(id,'sujin','도하',(S.introduced?'':'도하예요. 누나 폰 맡았어요. ')+ '상자 얘기 여쭤봐도 될까요?',{mine:true,pending:true});G.enqueue(S,id+'read','readMessage',2400,{messageId:id});G.enqueue(S,'route-sujin','routeSujin',5000);openConversation('sujin');}
  function shareRoute(force=false){
    if(S.flow.stage>1||S.flow.shareStarted)return;
    if(!F.canShare(S)){if(!force)return;F.pick(S,'direct');}
    const route=S.flow.route;S.flow.shareStarted=true;
    const id='route-share-'+Date.now();message(id,'narae','도하',(S.briefed?'':'기자님, 도하예요. 누나 폰 맡고 있어요. ')+F.summary(S),{mine:true,pending:true});
    G.enqueue(S,id+'read','readMessage',2400,{messageId:id});G.enqueue(S,'route-shared','routeShared',5200,{route});openConversation('narae');
  }
  function finishSecondRoute(route){if(F.completeSecond(S,route)){S.jobs=S.jobs.filter(j=>j.type!=='earlyCall');G.enqueue(S,'family-ready','familyReady',3400);}}
  function requestRecordComparison(){
    if(S.flow.secondRequested||S.flow.secondComplete)return;S.flow.secondRequested=true;
    const id='compare-records-'+Date.now();message(id,'narae','도하','17시 26분에 기증으로 바꾸고, 18시 47분에 다시 돌려놨네요.',{mine:true,pending:true});
    G.enqueue(S,id+'read','readMessage',2400,{messageId:id});G.enqueue(S,'second-records','secondRecords',5200);save();
  }
  function chooseSecond(route){
    if(S.flow.stage!==2||!S.edited||!S.seen.newVersion||S.flow.secondRequested)return;
    S.flow.secondRoute=route;
    if(route==='owner'){beginCall('early');return;}
    if(route==='records'){navigate('history');return;}
    S.flow.secondRequested=true;const id='tell-sujin-'+Date.now();message(id,'sujin','도하',(S.introduced?'':'도하예요. 누나 폰 맡고 있어요. ')+'표가 다시 바뀌었어요. 개인 반환으로요.',{mine:true,pending:true});
    G.enqueue(S,id+'read','readMessage',2400,{messageId:id});G.enqueue(S,'second-sujin','secondSujin',5400);openConversation('sujin');
  }
  function advanceProgress(){
    closeModal();banner=null;S.flow.assisted.push({stage:S.flow.stage,time:G.time(S)});
    if(S.activeCall){
      S.jobs=S.jobs.filter(j=>j.type!=='connected');
      if(S.activeCall.kind==='early'){S.activeCall.connecting=false;S.activeCall.ringing=false;S.activeCall.part='choice';render();return;}
      finishCall();save();return;
    }
    if(S.ending){S.epilogue=true;navigate('result');return;}
    if(S.flow.stage<=1){
      S.phase='play';S.introDone=true;S.seen.tagPost=true;S.seen.notes=true;S.flow.stage=1;
      const waiting=S.jobs.find(j=>j.type==='routeShared');
      if(waiting){S.jobs=S.jobs.filter(j=>j.id!==waiting.id);runJob(waiting);S.events[waiting.id]=true;openConversation('narae');}
      else {S.flow.shareStarted=false;shareRoute(true);}
      save();return;
    }
    if(S.flow.stage===2){
      S.jobs=S.jobs.filter(j=>!['contactOwner','editSheet','earlyCall','secondSujin','secondRecords'].includes(j.type));
      S.events['owner-contact']=true;S.events['sheet-edit']=true;S.edited=true;S.seen.newVersion=true;
      G.addNote(S,'assisted-change','진행 도움 · 표가 다시 개인 반환으로 바뀐 뒤로 이동했다.','newVersion');
      finishSecondRoute('help');navigate('phone');beginCall('final');save();return;
    }
    if(S.flow.stage===3){beginCall('final');return;}
    if(S.flow.stage>=4){
      const waiting=S.jobs.find(j=>j.type==='draftsReady');if(waiting){S.jobs=S.jobs.filter(j=>j.id!==waiting.id);runJob(waiting);}
      S.events['public-drafts']=true;navigate(S.screen==='preview'?'preview':'publication');save();
    }
  }
  function requestFact(){const f=G.facts.find(x=>x.id===S.selectedFact),d=S.draft[f.id];if(!d||d.claim===null||d.pair.length!==2||S.pendingFacts[f.id]||S.facts.includes(f.id))return;const payload={id:f.id,claim:d.claim,pair:[...d.pair]};S.pendingFacts[f.id]=payload;const key='f-'+Date.now();message(key,'narae','도하',f.alternatives[d.claim],{mine:true,pending:true});G.enqueue(S,key+'read','readMessage',2400,{messageId:key});G.enqueue(S,key+'reply','factReply',5800,{...payload,messageId:key});openConversation('narae');}
  function runJob(job){const p=job.payload;
    if(job.type==='routeSujin'){S.introduced=true;F.insight(S,'sujin');const text='제 노트랑 수업안이에요. 가져가도 된다고 하셔서 가져온 거고요.';message(job.id,'sujin','수진',text);G.addNote(S,'sujin-says','수진: 본인 노트와 수업안이며, 허락받고 가져왔다고 했다.','E005');notify('메시지 · 이수진',text,{screen:'room',room:'sujin'});return true;}
    if(job.type==='routeShared'){
      if(!F.joinFirst(S,p.route))return true;
      const text={sujin:'개인 물건이었다는 거죠. 그런데 제가 받은 표엔 아직 기증으로 적혀 있어요.',taeo:'자료실도 열 개 받았대요. 그런데 제가 받은 표엔 열한 개예요.',photo:'오전 사진이었군요. 자료실은 열 개 받았는데, 이 표엔 열한 개예요.',direct:'제가 받은 표 보내 드릴게요. 자료실은 열 개 받았대요.'}[p.route];
      message(job.id,'narae','강나래',text,{file:true});notify('메시지 · 강나래',text,{screen:'room',room:'narae'});if(S.seen.sheetCurrent)G.enqueue(S,'owner-contact','contactOwner',3500);return true;
    }
    if(job.type==='secondSujin'){S.introduced=true;const text='그건 맞아요. 근데 제 이름 붙은 글은 아직 그대로예요.';message(job.id,'sujin','수진',text);notify('메시지 · 이수진',text,{screen:'room',room:'sujin'});finishSecondRoute('sujin');return true;}
    if(job.type==='secondRecords'){const text='두 번 고쳤네요. 바뀐 내용은 남겨 뒀어요. 이유는 서경 씨 얘기도 들어봐야겠어요.';message(job.id,'narae','강나래',text);notify('메시지 · 강나래',text,{screen:'room',room:'narae'});finishSecondRoute('records');return true;}
    if(job.type==='familyReady'){const text='낭독회 끝나면 서경 씨랑 얘기해 보시겠어요?';message(job.id,'narae','강나래',text);notify('메시지 · 강나래',text,{screen:'phone'});return true;}
    if(job.type==='connected'){if(S.activeCall&&S.activeCall.kind===p.kind){S.activeCall.connecting=false;render();}return true;}
    if(job.type==='readMessage'){const m=S.liveMessages.find(m=>m.id===p.messageId);if(m)m.pending=false;return true;}
    if(job.type==='tagNotice'){notify('메시지 · 이수진','왜 저를 태그하셨어요? 아침에 가져가라고 하셨잖아요.',{screen:'room',room:'sujin'},'17:31');return true;}
    if(job.type==='pressure'){if(!S.seen.tagPost||S.ending)return true;S.pressure=true;S.pressureTime=G.time(S);S.pressureText=S.introduced?'도하 씨, 제 이름 붙은 글 좀 봐 주세요.':'사장님, 답 좀 주세요. 제 이름 아직 그대로예요.';notify('메시지 · 이수진',S.pressureText,{screen:'room',room:'sujin'});return true;}
    if(job.type==='introReply'){S.introduced=true;message('introReply','sujin','수진',S.seen.tagPost?'도하 씨, 제 상자였다고 써 주세요. 개인 얘긴 빼 주시고요.':'네. 아침에 가져가라고 하신 대화 있어요.');notify('메시지 · 이수진',S.liveMessages.at(-1).text,{screen:'room',room:'sujin'});return true;}
    if(job.type==='reporterHello'){message('reporterHello','narae','강나래','공지랑 자료실 기록부터 볼까요?');notify('메시지 · 강나래','공지랑 자료실 기록부터 볼까요?',{screen:'room',room:'narae'});return true;}
    if(job.type==='factReply'){
      delete S.pendingFacts[p.id];const r=G.submit(S,p.id,p.claim,p.pair);const f=G.facts.find(f=>f.id===p.id);G.rememberIdea(S,p.id,p.claim,p.pair,r.ok?'confirmed':'reconsider');
      const reply=r.ok?r.reply:r.reason==='pair'?{quantity:'책방 표랑 자료실 인수 내역을 같이 볼 수 있을까요?',photo:'찍은 시간하고 올린 시간을 같이 보고 싶어요.',approval:'아침 답장이랑 오후 수정 기록도 같이 보내 주세요.'}[p.id]:'이 자료만으론 잘 모르겠어요. 원문을 한 번 더 볼 수 있을까요?';
      message(job.id,'narae','강나래',reply);notify('메시지 · 강나래',reply,{screen:'room',room:'narae'});
      if(r.ok){G.addNote(S,'fact-'+p.id,f.claim);if(S.flow.stage<=1){S.flow.stage=2;S.flow.shareStarted=true;}if(r.changed)G.enqueue(S,'owner-contact','contactOwner',3500);if(r.ready&&S.flow.stage===2)finishSecondRoute('records');}return true;
    }
    if(job.type==='contactOwner'){message('owner-contact','narae','강나래','서경 씨랑 통화했어요. 아침 기록도 확인해 달라고 했고요.');notify('메시지 · 강나래',S.liveMessages.at(-1).text,{screen:'room',room:'narae'});G.enqueue(S,'sheet-edit','editSheet',3500);return true;}
    if(job.type==='editSheet'){S.edited=true;notify('문서','모서리_철수_1107 · 새 버전이 있습니다.',{screen:'sheet',sheetVersion:'current'});return true;}
    if(job.type==='earlyCall'){if(!S.edited||S.activeCall){G.enqueue(S,job.id,job.type,3200,p);return false;}if(!S.ending&&!S.finalCallDone)beginCall('early',true);return true;}
    if(job.type==='factsReady'){message('facts-ready','narae','강나래','기록은 확인했어요. 서경 씨 얘기도 들어봐 주세요.');notify('메시지 · 강나래',S.liveMessages.at(-1).text,{screen:'room',room:'narae'});return true;}
    if(job.type==='taeoLife'){message('taeo-blanket','taeo','태오','이따 담요도 챙겨 줘. 내일 또 써야 돼.');notify('메시지 · 태오',S.liveMessages.at(-1).text,{screen:'room',room:'taeo'});return true;}
    if(job.type==='draftsReady'){message('public-drafts','narae','강나래','올릴 글 한번 봐 주세요. 자료는 제가 확인했어요.');notify('메시지 · 강나래',S.liveMessages.at(-1).text,{screen:'publication'});return true;}
    if(job.type==='published'){if(S.epilogue)S.notices.push({id:'published-ack',from:'메시지 · 강나래',text:'기사 고쳤습니다.',target:{screen:'web',page:'news'},time:'19:30',read:true});else notify('메시지 · 강나래','기사 고쳤습니다.',{screen:'web',page:'news'},'19:30');return true;}
    return true;
  }
  document.addEventListener('input',e=>{if(e.target.id==='free-note'){S.noteText=e.target.value;save();$('note-status').textContent=saveOK?'저장됨':'저장할 수 없습니다';}});
  document.addEventListener('submit',e=>{if(e.target.id==='search-form'){e.preventDefault();search=new FormData(e.target).get('q')||'';render();}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action,id=b.dataset.id;switch(a){
    case 'choose-route':{const route=b.dataset.route;F.pick(S,route);if(route==='sujin')navigate('room',{room:'sujin'});else if(route==='taeo'){S.taeoQuestion='count';beginCall('taeo');}else navigate('gyeot');break;}
    case 'ask-sujin':askSujin();break;
    case 'share-route':shareRoute();break;
    case 'second-route':chooseSecond(b.dataset.route);break;
    case 'open-original':navigate('photoInfo',{photo:'IMG001'});break;
    case 'received-sheet':navigate('sheet',{sheetVersion:'previous'});break;
    case 'jump-message':S.unreadRoom=null;$('screen').scrollTop=$('screen').scrollHeight;$('jump-message').hidden=true;break;
    case 'advance-progress':advanceProgress();break;
    case 'unlock':S.phase='play';S.introDone=true;S.flow.stage=1;navigate('short',{},false);break;
    case 'home':navigate('home');break;
    case 'back':{const v=S.stack.pop();v?navigate(v.screen,v,false):navigate('home',{},false);break;}
    case 'app':navigate(b.dataset.app);break;
    case 'room':navigate('room',{room:b.dataset.room});break;
    case 'older':S.chatLimits[S.room]=(S.chatLimits[S.room]||5)+6;render();$('screen').scrollTop=0;break;
    case 'notes':navigate('notes');break;
    case 'notes-tab':S.notesMode=b.dataset.mode;render();break;
    case 'note-source':if(id)source(id);break;
    case 'introduce':{const mid='introduce-'+Date.now();message(mid,'sujin','도하','도하예요. 누나 폰 맡았어요.',{mine:true,pending:true});G.enqueue(S,mid+'read','readMessage',2400,{messageId:mid});G.enqueue(S,'intro-reply','introReply',5500);render();$('screen').scrollTop=$('screen').scrollHeight;break;}
    case 'comments':S.commentsOpen=!S.commentsOpen;render();break;
    case 'post-info':modal('<h2>공개 게시물</h2><p>모서리책방 · 윤서경</p>'+act('닫기','close-modal','','button'));break;
    case 'schedule':modal('<h2>예약 정보</h2><dl><dt>예약 설정</dt><dd>11월 7일 10:00</dd><dt>게시 완료</dt><dd>11월 7일 17:12</dd></dl>'+act('닫기','close-modal','','button'));break;
    case 'web':navigate('web',{page:b.dataset.page});break;
    case 'version':navigate('sheet',{sheetVersion:b.dataset.version});break;
    case 'history':navigate('history');break;
    case 'settlement':modal('<h2>정산</h2><dl><dt>이수진</dt><dd>밀린 급여 · 320,000원</dd><dt>박태오</dt><dd>운송비 · 80,000원</dd><dt>윤도하</dt><dd>행사 간식비 · 22,000원</dd></dl>'+act('닫기','close-modal','','button'));break;
    case 'photo':navigate('photo',{photo:id});break;
    case 'photo-info':navigate('photoInfo');break;
    case 'zoom':zoom=!zoom;render();break;
    case 'compare':S.returnTo=null;navigate('compare');break;
    case 'compare-draft':S.comparison=[...S.draft[S.selectedFact].pair];S.returnTo='proof';navigate('compare');break;
    case 'return-proof':navigate('proof');break;
    case 'compare-toggle':if(S.comparison.includes(id))S.comparison=S.comparison.filter(x=>x!==id);else if(S.comparison.length<2)S.comparison.push(id);else S.comparison=[S.comparison[1],id];render();break;
    case 'fact':if(G.availableFacts(S).some(f=>f.id===id))navigate('proof',{selectedFact:id});break;
    case 'claim':(S.draft[S.selectedFact]||(S.draft[S.selectedFact]={claim:null,pair:[]})).claim=Number(b.dataset.index);render();break;
    case 'attach':{const d=S.draft[S.selectedFact]||(S.draft[S.selectedFact]={claim:null,pair:[]});if(d.pair.includes(id))d.pair=d.pair.filter(x=>x!==id);else if(d.pair.length<2)d.pair.push(id);else toast('첨부는 두 개까지 가능합니다.');render();break;}
    case 'keep-idea':{const d=S.draft[S.selectedFact];if(G.rememberIdea(S,S.selectedFact,d.claim,d.pair)){G.addNote(S,'idea-'+Date.now(),'내 생각: '+G.facts.find(f=>f.id===S.selectedFact).alternatives[d.claim]);toast('메모에 저장됨');}render();break;}
    case 'submit':requestFact();break;
    case 'call-initial':beginCall('initial');break;
    case 'call-early':beginCall('early');break;
    case 'call-final':beginCall('final');break;
    case 'taeo-menu':if(!S.ending)modal(`<h2>태오</h2>${Object.entries(D.taeoQuestions).map(([id,q])=>act(id==='count'?'아침에 상자를 몇 개 실었어?':'옮기는 동안 빠진 건 없어?','taeo-question',`data-id="${id}"`,'spoken-choice')).join('')}${act('취소','close-modal','','button secondary')}`);break;
    case 'taeo-question':S.taeoQuestion=id;closeModal();beginCall('taeo');break;
    case 'answer-call':S.activeCall.ringing=false;render();break;
    case 'end-call':endCall();break;
    case 'next-call':nextCall();break;
    case 'call-choice':S.answer=b.dataset.answer;finishCall();break;
    case 'ask-question':S.activeCall.part='topic';S.activeCall.topic=id;S.activeCall.index=0;render();break;
    case 'close-questions':if(G.canCloseQuestions(S)){S.activeCall.part='closing';S.activeCall.index=0;render();}break;
    case 'toggle-sound':S.sound=!S.sound;render();break;
    case 'publication':if(S.finalCallDone&&S.events['public-drafts'])navigate('publication');break;
    case 'preview':navigate('preview',{preview:id});break;
    case 'records':if(S.finalCallDone)navigate('records',{recordMode:S.ending||id});break;
    case 'publish':if(G.chooseEnding(S,id)){banner=null;render();$('screen').scrollTop=0;G.enqueue(S,'published','published',3500);}break;
    case 'epilogue':S.epilogue=true;banner=null;render();$('screen').scrollTop=0;break;
    case 'view-result':navigate('result');break;
    case 'notices':navigate('notices');break;
    case 'notice':{const n=S.notices.find(n=>n.id===id);if(n){n.read=true;banner=null;navigate(n.target.screen,n.target);}break;}
    case 'dismiss':banner=null;drawBanner();break;
    case 'menu':menu();break;
    case 'contacts':navigate('phone');break;
    case 'close-modal':closeModal();break;
    case 'modal-notes':closeModal();navigate('notes');break;
    case 'sound':S.sound=!S.sound;chime();save();menu();break;
    case 'text-size':S.largeText=!S.largeText;render();menu();break;
    case 'hint':hint();break;
    case 'restart':modal('<h2>처음부터 시작할까요?</h2><p>현재 진행과 메모가 지워집니다.</p>'+act('처음부터','confirm-restart','','button danger')+act('취소','close-modal','','button secondary'));break;
    case 'confirm-restart':S=G.fresh();S.stack=[];F.init(S);banner=null;closeModal();render();$('screen').scrollTop=0;break;
  }save();});
  setInterval(()=>{
    const now=performance.now(),delta=Math.min(now-lastTick,500);lastTick=now;
    if(document.hidden||!$('overlay').hidden)return;
    let changed=false;
    if(S.activeCall?.ringing){S.activeCall.ringRemaining-=delta;if(S.activeCall.ringRemaining<=0){endCall();changed=true;}}
    for(const job of G.advance(S,delta)){if(runJob(job))S.events[job.id]=true;changed=true;}
    if(changed)render();
    if(now-lastSave>1000&&S.jobs.length){save();lastSave=now;}
  },100);
  document.addEventListener('visibilitychange',()=>{lastTick=performance.now();save();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('overlay').hidden)closeModal();});
  window.addEventListener('beforeunload',()=>{S.scroll[viewKey()]=$('screen').scrollTop;save();});
  let gesture=null;
  document.addEventListener('pointerdown',e=>{if(e.target.closest('.lockscreen,.home-gesture,.sheet-handle'))gesture={y:e.clientY,lock:S.phase==='intro',sheet:Boolean(e.target.closest('.sheet-handle'))};});
  document.addEventListener('pointerup',e=>{if(!gesture)return;const delta=e.clientY-gesture.y;if(gesture.sheet&&delta>50)closeModal();else if(delta < -45){if(gesture.lock){S.phase='play';S.introDone=true;S.flow.stage=1;navigate('short',{},false);}else navigate('home');}gesture=null;});
  render();$('screen').scrollTop=S.scroll[viewKey()]||0;
})();
