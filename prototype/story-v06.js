/* v0.6: social evidence and three lines of inquiry, adapted from the 12-chapter novel. */
(function(root){
'use strict';
const base=typeof module!=='undefined'&&module.exports?require('./story-v05.js'):root.BoxCampaignData;
const D={...base,version:'0.6.1',assets:JSON.parse(JSON.stringify(base.assets)),nodes:JSON.parse(JSON.stringify(base.nodes)),photos:{...base.photos}};
const A=(title,app,body,extra={})=>({title,app,body,...extra});
const L=(who,text,files=[])=>({who,text,files});
const O=(id,label,next,effect={},extra={})=>({id,label,next,effect,...extra});
const N=(id,act,room,time,lines,options,extra={})=>D.nodes[id]={id,act,room,time,lines,options,...extra};
Object.assign(D.photos,{sujinBox:'assets/story/sujin-box.png',vanCovered:'assets/story/van-covered.png',vanCart:'assets/story/van-cart.png',naraePortrait:'../assets/characters/narae.png',seogyeongPortrait:'../assets/characters/seogyeong.png'});
Object.assign(D.contacts.owner,{bio:'모서리책방 2018—2026. 문 닫은 뒤에도 같이 읽을 곳을 찾고 있어요.',handle:'moseori.books'});
Object.assign(D.contacts.sujin,{bio:'화요일에 읽고, 수요일에 질문을 고칩니다. 모서리 독서모임.',handle:'sujin_note'});
Object.assign(D.contacts.taeo,{bio:'문원동 소형 운송. 커피는 진하게. 답은 차 세우고 합니다.',handle:'taeo.moves'});
Object.assign(D.contacts.narae,{bio:'문원생활 강나래. 동네 소식과 정정할 것들.',handle:'narae.local'});
for(const [id,a] of Object.entries(D.assets)){if(['short','gyeot'].includes(a.app))a.author='owner';}
Object.assign(D.assets.incident,{detailOnly:true});
Object.assign(D.assets.boxPhoto,{detailOnly:true,comments:[['taeo.moves','오전에 고생했어. 이제 차 청소함.'],['bookandtea','아까 작은 건 누가 들고 가던데요?'],['moseori.books','확인하고 있어요.']]});
Object.assign(D.assets,{
 ownerPromise:A('모임을 옮긴다면','gyeot',['가게를 계속 열 수 있을지 계산기를 몇 번이나 두드렸다. 이번 달에도 쉽지 않다.','새 공간을 맡게 되면 화요일 모임은 꼭 가져가고 싶다. 은숙 어머님이 올라가기 편한 방부터 알아봐야지.'],{author:'owner',owner:'윤서경',handle:'moseori.books',date:'10.20 22:14',image:'shelf',likes:47,comments:[['sujin_note','계단 없는 곳이어야 해요. 이번에는 미리 말씀드려요.'],['moseori.books','응. 나도 그게 먼저야.']]}),
 ownerRent:A('문을 닫고 나서','short',['가게 월세를 내면 내가 쓸 돈이 안 남고, 내 생활비를 남기면 가게가 밀린다. 오래 했다고 잘하게 되는 건 아니네.','그래도 화요일 여섯 시쯤 사람이 모이면 다음 주까지만 더 해 보자고 생각한다.'],{author:'owner',owner:'윤서경',handle:'moseori.books',date:'10.08 23:12',comments:[['taeo.moves','내일 박스 좀 갖다 놓을게. 커피만 줘.'],['moseori.books','커피는 줄 수 있어. 밥은 다음에.']]}),
 sujinMemory:A('다음 주 질문','gyeot',['다 읽은 책보다 아직 못 고른 질문이 오래 남는다.','말 안 하고 듣기만 하신 분도 다음 주엔 다시 오셨으면 좋겠다. 이 노트에는 책 이야기 말고도 별별 게 다 적혀 있다. 그래서 남한테 못 빌려준다.'],{author:'sujin',owner:'이수진',handle:'sujin_note',date:'10.27 21:06',image:'desk',likes:21,comments:[['eunsook.61','저는 듣고만 있어도 좋아요.'],['sujin_note','알아요. 자리 늘 비워 둘게요.']]}),
 sujinPay:A('또 다음 주','short',['밀린 급여 언제 들어오냐고 묻는 것도 이제 미안하다. 내가 받아야 할 돈인데.','사람 좋은 거랑 같이 일하기 편한 건 다른가 보다.'],{author:'sujin',owner:'이수진',handle:'sujin_note',date:'11.03 20:18',comments:[['reading_yun','네 자료랑 노트부터 챙겨. 나중에 찾기 힘들어.'],['sujin_note','토요일에 가려고.']]}),
 sujinRoutine:A('화요일 저녁','short',['모임 끝날 때 “오늘은 할 말 없어요” 하신 분이 신발 신다가 제일 길게 얘기하신다.','다음부터는 마지막 질문을 조금 일찍 끝내야겠다.'],{author:'sujin',owner:'이수진',handle:'sujin_note',date:'10.13 22:05',comments:[['moseori.books','그래서 맨날 문 늦게 닫는 거였구나.'],['sujin_note','그 얘기가 제일 중요할 때도 있잖아요.']]}),
 taeoMemory:A('조수석의 담요','gyeot',['엄마가 차 춥다고 넣어 준 담요. 무릎에 덮으라는 건데 맨날 짐 덮는 데 쓴다.','다음엔 세탁해서 갖다 드려야지.'],{author:'taeo',owner:'박태오',handle:'taeo.moves',date:'10.22 07:40',image:'van',likes:18,comments:[['taeo_sis','저번에도 그 말 했어.'],['taeo.moves','이번엔 진짜로.']]}),
 taeoCosts:A('빈 차로 돌아오는 날','short',['아침 배차 하나 취소. 기름은 이미 넣었는데.','기사 일은 차 세워 놓고 기다리는 시간도 일인데 그건 잘 안 쳐준다. 점심은 편의점으로 결정.'],{author:'taeo',owner:'박태오',handle:'taeo.moves',date:'10.29 12:31',comments:[['moseori.books','토요일 책방 짐 부탁한 건 그대로야. 끝나고 밥 먹고 가.'],['taeo.moves','그건 꼭 간다.']]}),
 naraeMemory:A('퇴근길 책 한 권','gyeot',['책방 취재하러 와서 질문보다 책 고르는 데 시간을 더 썼다.','지역 기자 3년 차. 이제 사장님들이 명함보다 얼굴을 먼저 알아보신다. 장 보다가도 취재 이야기를 듣는다.'],{author:'narae',owner:'강나래',handle:'narae.local',date:'10.16 18:12',image:'naraePortrait',likes:35,comments:[['moseori.books','고르신 책 끝까지 읽고 다음에 얘기해요.'],['narae.local','마감 끝나고요… 이번엔 진짜 읽을게요.']]}),
 naraeCorrection:A('주소를 고쳤습니다','short',['어제 기사에 주민회관 입구를 잘못 적었습니다. 뒤편 문으로 가셔서 기다리셨다는 연락을 받았어요.','온라인 기사는 고쳤고, 종이신문 정정도 요청했습니다. 다음엔 지도만 보고 쓰지 않고 직접 가 보겠습니다.'],{author:'narae',owner:'강나래',handle:'narae.local',date:'10.07 09:32',comments:[['eunsook.61','전화로 알려줘서 고마워요.'],['narae.local','헛걸음하시게 해서 죄송했어요.']]}),
 sujinIntent:A('이번에는 제가 챙길게요','short',['오늘은 원본을 제가 챙기겠습니다. 없어졌다는 말은 이제 더 못 듣겠어요.','누가 뭘 썼는지 그대로 남아 있어야죠.'],{author:'sujin',owner:'이수진',handle:'sujin_note',date:'11.07 08:20',detailOnly:true,comments:[['reading_yun','그 상자라도 먼저 들고 나와.'],['sujin_note','가서 얘기할 거야.'],['moseori.books','수진 씨, 오면 나부터 봐요.']],note:'수진은 아침에 원본을 직접 챙기겠다고 썼다. 상자를 들고 나오라는 댓글에 답했다.'}),
 exitPhoto:A('마지막 날, 오전의 책방','gyeot',['오늘 모서리책방 마지막 날. 저녁 행사 전에 오전 정리부터 찍었습니다.','사진 촬영 09:22. 상자 위 검정 노트가 자꾸 미끄러져서 잠깐 멈추셨다.'],{author:'narae',owner:'강나래',handle:'narae.local',date:'11.07 16:40',image:'sujinBox',likes:64,detailOnly:true,comments:[['bookandtea','수진 선생님이세요? 상자 가져가셨네.'],['sujin_note','기자님, 사진 설명 좀 고쳐 주세요.'],['narae.local','어느 부분인지 메시지 주세요. 확인할게요.']],note:'오전 사진에서 수진은 노트만이 아니라 빨간 테이프 상자 전체를 들고 있다.'}),
 vanPost:A('하나 더 챙긴 날','gyeot',['하나 더 챙겼다. 오늘은 빈손 아님.','나머지는 자료실에 내려놓고 끝.'],{author:'taeo',owner:'박태오',handle:'taeo.moves',date:'11.07 10:03',image:'vanCovered',likes:12,detailOnly:true,comments:[['minwoo_load','담요 밑에 그거 뭐냐ㅋㅋ'],['taeo.moves','별거 아님.'],['minwoo_load','그것도 책방 거 아니냐?']],note:'태오가 올린 차 사진에는 담요로 덮은 다른 짐이 있다. 물건의 주인을 묻는 댓글에는 답하지 않았다.'}),
 residentReplies:A('모서리 기록을 찾고 있습니다','short',['모서리책방 마지막 날을 취재하고 있습니다. 당시 화요일 모임에 참석하셨던 분들 말씀도 듣고 싶어요.','월요일 설명회 자료를 받으셨다면 그때 하셨던 말이 제대로 실렸는지 알려 주세요.'],{author:'narae',owner:'강나래',handle:'narae.local',date:'11.07 18:55',detailOnly:true,comments:[['eunsook.61','저는 지금 장소가 좋다고 썼어요. 계단 못 올라간다고요.'],['reading_yun','저도 아직 결정 못 했다고 했는데 찬성에 들어갔네요.'],['narae.local','두 분께 따로 연락드릴게요.']],note:'참석 주민들이 공개 댓글에서 자신들의 의견이 다르게 실렸다고 말했다.'}),
 sujinReply:A('상자 사진에 관해서','short',['사진 속 상자는 제가 옮긴 게 맞습니다. 제 노트는 따로 챙겼어요. 처음부터 둘을 나눠 말했어야 했네요.','노트 전체 사진은 올리지 않을 겁니다. 모임에서 개인적으로 하신 말씀도 적혀 있어요.'],{author:'sujin',owner:'이수진',handle:'sujin_note',date:'11.07 19:42',detailOnly:true,comments:[['reading_yun','그럼 회의록은 지금 누가 갖고 있어?'],['sujin_note','시키신 곳에 두고 왔어요. 그날 문자 전체를 찾고 있어요.'],['eunsook.61','내가 수업 끝나고 한 얘기도 거기 있죠? 그건 올리지 말아 줘요.'],['sujin_note','네. 그건 안 보여 드릴 거예요.']],note:'수진은 상자 이동을 인정했다. 노트 공개를 거절한 이유는 모임 사람들의 사적인 말이었다.'}),
 vanReveal:A('아침 사진, 안쪽까지','gyeot',['아침에 올린 자리 그대로. 사진 한 장 더 넘겨 보세요.','주인한테 먼저 물어봤어야 했는데. 돌려놓으러 갑니다.'],{author:'taeo',owner:'박태오',handle:'taeo.moves',date:'11.07 19:46',images:['vanCovered','vanCart'],requiresPage:1,detailOnly:true,likes:6,comments:[['minwoo_load','그러니까 먼저 물어보랬지.'],['taeo.moves','알아. 가서 놓고 올게.']],note:'태오가 추가로 올린 두 번째 사진에서 담요 밑 짐은 접이식 운반대였다.'}),
 ownerClarification:A('기증 수량에 관해서','short',['상자 사진은 오전에 찍고 미리 예약해 둔 글입니다. 작은 상자 처리까지 정하기 전에 설명을 써 뒀어요.','개인 노트는 가져가도 된다고 했습니다. 상자 전체에 대해서는 수진 씨와 더 얘기한 뒤 정리하겠습니다.'],{author:'owner',owner:'윤서경',handle:'moseori.books',date:'11.07 19:48',detailOnly:true,comments:[['bookandtea','그럼 기증 상자는 열 개가 맞나요?'],['moseori.books','자료실에 들어간 책은 열 개예요.'],['sujin_note','상자 옮기라고 하신 문자도 확인해 주세요.']],note:'누나는 예약 게시였다고 설명하며 개인 노트 반환만 허락했다고 말했다.'})
});
D.initialAssets=['handoff','farewell','ownerPromise','ownerRent','sujinMemory','sujinPay','sujinRoutine','taeoMemory','taeoCosts','naraeMemory','naraeCorrection'];
for(const id of ['sujinReply','vanReveal','ownerClarification']){D.assets[id].live=true;D.assets[id].date='11.07';}
const n=D.nodes;
n.first_contact.unlock=['incident','sujinIntent'];
n.sister_first.options[0].label='수진 씨는 맞은편에 두고 왔대. 들은 얘기 없어?';
n.sujin_explains.lines=[L('sujin','제 노트 챙겨 온 건 맞아요. 개인 물건은 가져가도 된다고 하셨고요.'),L('sujin','상자는 맞은편에 두고 왔어요. 그걸 전부 가져간 것처럼 쓰시면 안 되죠.'),L('sujin','그때 문자를 찾아볼게요. 지금 그 폰에는 제가 두고 왔다고 한 말이 있을 거예요.')];
n.sister_deflects.lines=[L('owner','행사실 쪽은 아직 정리가 안 됐어. 찾아가는 물건도 많고. 끝나고 같이 보자.'),L('owner','상자 사진은 인스타에 올려 뒀어. 태오한테도 수량 물어 놨어. 너한테 답하라고 했고.')];
n.driver_intro.lines=[L('taeo','도하야. 나 지금 차 세웠어. 누나가 수량 알려 주라네.'),L('taeo','자료실에 내린 건 열 개야. 운송비 8만 원도 받았고.'),L('taeo','열한 개 나온 사진은 오전에 찍은 거야. 인스타 댓글에 나도 써 놨어.')];
n.driver_receipt.lines=[L('taeo','책 상자는 열 개 실었어. 인수증 보낸다.',['intake']),L('taeo','작은 건 수진 씨가 먼저 가져갔어. 나한테 물어봐도 그 뒤는 몰라.')];
n.reporter_records.lines=[L('narae','서경 씨한테 받은 철수표예요. 11번도 자료실로 간다고 적혀 있네요.',['manifest']),L('narae','이건 월요일에 나갈 자료고요.',['supporters']),L('narae','제가 스레드에 오늘 올린 글 있어요. 참석하셨던 분들이 댓글을 주셨는데, 그것도 한번 봐 주세요.')];
n.reporter_records.unlock=['meeting','residentReplies'];n.reporter_records.requires=['manifest','supporters','residentReplies'];
n.reporter_records.hint='파일 두 개와 강나래의 스레드에 달린 주민 댓글을 읽어 보세요.';
n.sujin_minutes.lines=[L('sujin','댓글 보셨어요? 제가 말한 분들이에요. 사본에서 그 부분만 보낼게요.',['opinion']),L('sujin','다른 페이지는 원본을 봐야 해요. 작은 상자에 다 넣어 뒀거든요.')];
n.yesterday.options.forEach(o=>o.next='public_context');
N('public_context',2,'narae','19:22',[L('narae','오전에 찍은 사진 올렸더니 수진 씨가 설명을 고쳐 달라고 하셨어요.'),L('narae','제 인스타에 있는 책방 사진이에요. 댓글도 좀 봐 주세요. 무슨 얘기인지 저도 더 들어봐야겠어요.'),L('narae','태오 씨는 차 사진을 올리셨더라고요. 수진 씨 아침 스레드도 있고요. 두 분 말만 들어서는 잘 모르겠어요.')],[O('compare_socials','사진이랑 댓글부터 보고 올게요.','inspect_posts')],{unlock:['exitPhoto','vanPost']});
N('inspect_posts',2,'narae','19:24',[L('narae','전 인쇄 담당자랑 통화하고 있을게요. 다 보시면 말씀해 주세요.')],[O('start_inquiry','세 사람 얘기를 더 들어보고 싶어요.','investigate_hub')],{requires:['exitPhoto','vanPost','sujinIntent'],hint:'인스타에서 강나래의 수진 사진과 태오의 차 사진, 스레드에서 수진의 아침 글을 열고 댓글까지 읽어 보세요.'});
const all=s=>s.flags.investigatedSujin&&s.flags.investigatedTaeo&&s.flags.investigatedOwner;
N('investigate_hub',3,'narae','+',[L('narae','누구한테 먼저 더 물어볼까요? 전 아직 모르는 게 많네요.')],[
 O('investigate_sujin','수진 씨가 가져간 걸 더 물어볼게요.','sujin_route',{}, {when:s=>!s.flags.investigatedSujin}),
 O('investigate_taeo','태오 형 차에 더 실린 짐이 걸려요. 그걸 물을게요.','taeo_route',{}, {when:s=>!s.flags.investigatedTaeo}),
 O('investigate_owner','누나한테 게시물과 목록 얘기를 다시 해 볼게요.','owner_route',{}, {when:s=>!s.flags.investigatedOwner}),
 O('finish_inquiry','이제 오전 대화 전체를 받아서 비교해 볼게요.','approval_arrives',{}, {when:all})
]);
const inquiryCount=s=>['investigatedSujin','investigatedTaeo','investigatedOwner'].filter(k=>s.flags[k]).length;
n.investigate_hub.lines=[
 {...L('narae','누구한테 먼저 더 물어볼까요? 전 아직 모르는 게 많네요.'),when:s=>inquiryCount(s)===0},
 {...L('narae','얘기는 좀 됐어요? 다른 분 말씀도 더 들어볼까요?'),when:s=>inquiryCount(s)===1},
 {...L('narae','저도 연락 몇 군데 더 해 보고 있어요. 아직 못 물어본 게 있으면 말씀해 주세요.'),when:s=>inquiryCount(s)===2},
 {...L('narae','수진 씨가 대화 전체를 찾았다고 하셨어요. 곧 보내 주신대요.'),when:all}
];
N('sujin_route',3,'sujin','+',[L('sujin','나래 기자님이 연락하셨어요. 사진 보셨죠?')],[O('ask_carried_box','사진에는 노트 아래 상자가 있어요. 노트만 챙겼다고 하셔서요.','sujin_route_reply'),O('ask_refused_photo','사진 설명은 왜 고쳐 달라고 하셨어요?','sujin_route_reply')]);
N('sujin_route_reply',3,'sujin','+',[L('sujin','상자를 들고 나온 건 맞아요. 그 말부터 하면 또 훔쳤다는 얘기가 나올 것 같아서요.'),L('sujin','스레드에 방금 설명 남겼어요. 노트를 통째로 찍어 달라는 분들도 있는데, 그건 못 하겠어요.'),L('sujin','아래 댓글도 보시면 왜 그런지 아실 거예요.')],[O('leave_private_note','노트 속 개인 얘기는 괜찮아요. 상자 옮기라는 문자 전체만 부탁드릴게요.','investigate_hub',{investigatedSujin:true})],{unlock:['sujinReply'],requires:['sujinReply'],hint:'수진의 스레드에서 새 글과 은숙의 댓글을 읽어 보세요.'});
N('taeo_route',3,'taeo','+',[L('taeo','나래 기자가 차에 다른 짐도 있었냐고 묻네. 너도 그 사진 봤어?')],[O('ask_blanket','응. 담요 밑에 덮어 둔 건 뭐야?','taeo_route_photos'),O('ask_extra_load','하나 더 챙겼다고 썼던데. 무슨 뜻이야?','taeo_route_photos')]);
N('taeo_route_photos',3,'taeo','+',[L('taeo','그건… 말로 설명하면 더 이상하겠다.'),L('taeo','인스타에 아까 거랑 같은 자리 사진 두 장 더 올렸어. 한 장 넘겨 봐.')],[O('recognize_cart','접이식 운반대네. 그거 형 물건이야?','taeo_route_admits')],{unlock:['vanReveal'],requires:['vanReveal'],hint:'태오의 새 인스타 게시물에서 다음 사진을 넘겨 담요 아래 짐을 확인하세요.'});
N('taeo_route_admits',3,'taeo','+',[L('taeo','책방 거야. 닫으면 안 쓸 줄 알고 실었어. 먼저 물어봤어야 했는데.'),L('taeo','그래서 짐 얘기 자꾸 피했어. 지금 돌려놓으러 갈게.')],[O('return_cart','운반대는 돌려놔. 그리고 아침에 어디 들렀는지도 확인해 줘.','investigate_hub',{investigatedTaeo:true})]);
N('owner_route',3,'owner','+',[L('owner','기자가 계속 전화하네. 너도 사진 때문에 그래?')],[O('ask_post_count','사진에는 전부 기증한다고 써 있고 인수증은 열 개야. 누나가 쓴 거지?','owner_route_post'),O('ask_promise','수진 씨가 화낼 만한 일은 없었어? 새 공간 얘기도 봤어.','owner_route_post')]);
N('owner_route_post',3,'owner','+',[L('owner','내가 예약해 둔 글이야. 작은 상자 처리 정하기 전에 설명을 써 뒀어.'),L('owner','스레드에도 답 남겼어. 수진 씨랑 직접 얘기하고 고칠 건 고칠게.'),L('owner','나도 모임은 계속하고 싶어. 그거 하나 믿고 여기까지 버틴 건데.')],[O('wait_for_full_chat','알겠어. 수진 씨 쪽 문자도 받아 볼게.','investigate_hub',{investigatedOwner:true})],{unlock:['ownerClarification'],requires:['ownerClarification'],hint:'누나의 스레드 새 글에서 기증 수량에 답한 댓글과 수진의 답글을 확인하세요.'});
for(const id of ['sister_denies','sister_notebook','ask_copy','deduction','check_sujin','check_driver'])delete n[id];
n.approval_arrives.lines=[L('sujin','전체 대화 찾았어요. 아까 말씀드린 게 이거예요. 앞뒤 같이 보냅니다.',['approvalCopy']),L('sujin','태오 씨한테도 아침에 이 화면 보냈어요. 준비실 못 찾아서 물어봤거든요.')];
n.approval_arrives.time='20:03';
n.independent_copy.lines=[L('taeo','운반대 돌려놓고 아침 대화도 찾았어. 9시 16분에 받았네.',['driverCopy']),L('taeo','이 문장이 그 폰에는 없어?')];
n.driver_witness.lines=[L('taeo','업무 메모 봤는데 9시 38분이네. 담요 가지러 행사실 갔다가 누나 만났어.'),L('taeo','준비실 잠그고 있길래 열어 달랬더니 기록 상자 들어 있어서 못 연다고 했어.',['driverLog']),L('taeo','수진 씨가 반납한 건 계산대 서랍 열쇠고. 그 방 열쇠는 누나가 갖고 있었어.')];
n.version_check.lines=[L('narae','아침 철수표 찾았어요. 여기에는 행사실에 둔다고 적혀 있네요.',['manifestHistory']),L('narae','오후에는 이 칸이 바뀌었어요. 수정한 이름도 남아 있고요. 한번 보실래요?')];
n.version_check.options=[O('ask_changed_location','누나는 상자 위치를 알고 있었네요. 왜 없어진 것처럼 썼는지 물어볼게요.','confront',{deduced:true}),O('ask_missing_messages','문자가 빠지고 보관 장소도 바뀌었어요. 누나한테 둘 다 물을게요.','confront',{deduced:true})];
n.final_ready.lines=[L('narae','받은 자료로 초안 써 봤어요. 수진 씨가 왜 상자를 옮겼는지부터 적었고요.'),L('narae','지금 보내면 아직 인쇄 멈춰 달라고 할 수 있어요. 문안 먼저 읽어 보실래요?')];
n.reporter_intro.lines=[L('narae','안녕하세요. 문원생활 강나래예요. 지금 도하 씨가 보고 계신 거죠?'),L('narae','서경 씨한테 들었어요. 상자 일 때문에 연락드렸어요. 회의록도 거기 들어 있다면서요?')];
n.statement.lines=[L('owner','내가 한 일 적었어. 수진 씨한테도 보냈고.',['sisterStatement']),L('owner','나래 기자한테 전달해도 돼.')];
const originalPublication=D.publication;
D.publication=(s,id)=>{const p=originalPublication(s,id);return {...p,attachments:p.attachments,body:p.body};};
if(typeof module!=='undefined'&&module.exports)module.exports=D;root.BoxCampaignData=D;
})(typeof globalThis!=='undefined'?globalThis:this);
