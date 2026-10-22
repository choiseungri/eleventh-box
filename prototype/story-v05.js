/* Story adapted from 전체스토리_소설_v0.5.md. Dialogue never performs navigation. */
(function(root){
'use strict';
const contacts={
 owner:{name:'윤서경',initial:'서',color:'seogyeong',description:'개인 휴대전화',image:'seogyeong'},
 sujin:{name:'이수진',initial:'수',color:'sujin',description:'화요일 독서모임',image:'sujin'},
 taeo:{name:'박태오',initial:'태',color:'taeo',description:'운송 기사',image:'taeo'},
 narae:{name:'강나래',initial:'나',color:'narae',description:'문원생활 기자',image:'narae'}
};
const L=(who,text,files=[])=>({who,text,files});
const O=(id,label,next,effect={})=>({id,label,next,effect});
const A=(title,app,body,extra={})=>({title,app,body,...extra});
const photos={boxes:'../assets/scenes/IMG001-boxes.png',receipt:'../assets/scenes/IMG002-receipt.png',tangerines:'../assets/scenes/IMG003-tangerines.png',shelf:'../assets/scenes/IMG004-shelf.png',desk:'../assets/scenes/IMG005-desk.png',van:'../assets/scenes/IMG006-van.png'};
const assets={
 handoff:A('도하야, 계산대 부탁해','notes',[
  '누나 맞은편 행사실에 있을게. 이건 가게 폰이야. 연락 오면 도하라고 하고 받아 줘. 나는 개인폰으로 연락할게.',
  '마지막 낭독회는 6시 45분부터 7시 20분까지. 인스타에 마지막 날 사진 올렸어. 네 의자도 챙겨 놨다.',
  '파란 접시 잊지 말고. 끝나면 밥 먹자. 이번엔 내가 살게.'
 ],{owner:'윤서경',date:'11.07 18:25',note:'나는 도하. 누나의 가게 휴대전화를 맡았다. 누나는 맞은편 행사실에 있다.'}),
 farewell:A('마지막 토요일','gyeot',[
  '모서리책방, 오늘 문을 닫습니다. 여덟 해 동안 같이 읽어 주셔서 고맙습니다.',
  '수진 선생님, 태오, 주말마다 계산대를 지켜 준 도하에게도. 마지막 낭독회는 맞은편 행사실에서 6시 45분에 시작합니다.'
 ],{owner:'모서리책방',handle:'moseori.books',date:'11.07 17:02',image:'shelf',likes:128,note:'수진은 독서모임을 맡았고, 태오는 책방 운송을 도왔다.'}),
 incident:A('상자를 찾고 있습니다','short',[
  '오늘 자료실로 보내려던 기록 한 상자의 소재를 확인하고 있습니다. 오전에 상자를 가져가신 @sujin_note, 연락 부탁드립니다.',
  '남은 기록까지 안전하게 전달하고 마무리하겠습니다.'
 ],{owner:'모서리책방',handle:'moseori.books',date:'11.07 17:28',comments:[['dongne_reader','기증할 상자를 왜 가져가셨지…'],['sujin_note','아침에 말씀하신 곳에 뒀어요. 제 노트만 챙겼고요.'],['moseori.books','수진 씨, 전화로 이야기해요.']],note:'누나는 사라진 기록 상자와 수진의 이름을 함께 공개했다.'}),
 boxPhoto:A('열한 상자에 담긴 여덟 해','gyeot',[
  '열한 상자에 담긴 여덟 해. 오늘 자료실로 보냅니다.',
  '마지막 짐까지 도와준 태오, 고마워.'
 ],{owner:'모서리책방',handle:'moseori.books',date:'11.07 17:12',image:'boxes',likes:86,comments:[['taeo.moves','오전에 고생했어. 난 이제 차 청소함.']],note:'오후 게시물에는 열한 상자가 보인다. 태오는 댓글에서 오전 운송을 말한다.'}),
 photoInfo:A('IMG_1107 · 상자','photos',['촬영: 2026.11.07 오전 9:06','큰 상자 10개, 빨간 테이프를 붙인 작은 상자 1개.'],{owner:'이 기기의 사진',date:'11.07 09:06',image:'boxes',note:'열한 상자 사진은 오후 게시 전에, 오전 9시 6분에 찍었다.'}),
 intake:A('달빛자료실 인수증','sheet',['접수 예정 10상자 / 실제 인수 10상자','11월 7일 11:40 · 모서리책방 → 달빛자료실'],{owner:'박태오가 보낸 PDF',date:'11.07 18:48',excerpt:true,note:'태오가 운송한 기증품은 예정대로 열 상자 모두 도착했다.'}),
 manifest:A('철수표 · 오후에 받은 파일','sheet',['11번 · 회의 기록 / 자료실 기증 / 소재 확인 중','11월 7일 17:26 · 윤서경 수정'],{owner:'강나래가 받은 사본',date:'11.07 17:26',excerpt:true,note:'누나가 오후에 보낸 목록은 11번을 기증품으로 적었다.'}),
 meeting:A('월요일 주민설명회','search',['11월 9일 월요일 19:00 · 주민회관','자료 인쇄 마감: 11월 7일 토요일 22:00. 모서리 주민모임의 의견 자료를 다시 싣습니다.'],{owner:'문원 생활문화 안내',date:'11.02',note:'설명회 자료는 오늘 밤 10시에 인쇄 마감한다.'}),
 supporters:A('설명회 배포자료 · 발췌','sheet',['2024년 모서리 주민모임: 참여 주민 23명 전원 지지.','자료 제공: 윤서경 / 2026년 11월 설명회에 재수록 예정.'],{owner:'강나래가 받은 인쇄 예정본',date:'11.07 19:02',excerpt:true,note:'이번 설명회 자료는 23명 전원 지지라고 적었다.'}),
 opinion:A('회의록 · 의견 부분','sheet',['2024.06.11 · 참석 23명 / 찬성 17명, 반대·보류 6명.','“임대 조건 유지가 먼저.” “계단 이용이 어려워 지금 장소를 남겨 주세요.”','출석 서명과 공간에 대한 의견은 별도 칸입니다.'],{owner:'이수진이 보관한 사본',date:'11.07 19:12',excerpt:true,note:'회의록에는 반대·보류 여섯 명의 의견이 있다. 제출본에는 빠져 있다.'}),
 request:A('어제 주고받은 문자','chat',['11.06 20:08 · 수진｜월요일 자료에 또 전원 찬성이라고 적혔어요. 내일 회의록 원본을 나래 기자님께 보여 드릴게요.','20:11 · 서경｜일단 내일 와. 상자는 내가 정리해 둘게.'],{owner:'수진의 휴대전화에서 보낸 사본',date:'11.06',excerpt:true,note:'수진은 어제 누나에게 회의록 원본을 기자에게 보여 주겠다고 말했다.'}),
 approvalCopy:A('수진의 오전 대화 사본','chat',[
  '09:11 · 수진｜11번 작은 상자는 어떻게 할까요?',
  '09:12 · 서경｜11번 작은 상자 행사실 준비실 안 선반 밑에 놔줘. 원본 보러 올 사람 있어서 그래. 네 노트는 챙기고. 문은 닫기만 해.',
  '09:24 · 수진｜시키신 대로 뒀어요. 서랍 열쇠는 흰 컵에요.'
 ],{owner:'수진의 휴대전화 · 대화 내보내기',date:'11.07 20:03',excerpt:true,note:'수진의 전화기에는 09:12 이동 지시가 남아 있다. 이 가게 전화기에는 해당 문장이 없다.'}),
 driverCopy:A('태오가 아침에 받은 화면', 'chat',[
  '09:16 · 수진 → 태오｜행사실 준비실이 어디예요? 서경 씨가 이쪽에 두래요.',
  '함께 받은 화면: 09:12 · 서경｜11번 작은 상자 행사실 준비실 안 선반 밑에 놔줘. 원본 보러 올 사람 있어서 그래. 네 노트는 챙기고. 문은 닫기만 해.'
 ],{owner:'태오의 휴대전화 · 09:16 수신 기록',date:'11.07 20:12',excerpt:true,note:'태오는 공개글이 올라오기 전인 오전 09:16에 같은 승인 화면을 받았다.'}),
 driverLog:A('태오의 아침 업무 메모','sheet',['09:38 · 행사실 담요 회수 못 함. 서경이 준비실 잠금. “기록 상자 들어 있어서 지금은 못 열어. 행사 끝나고 줄게.”','09:41 · 주차료 결제 후 출발. 차에는 기증 상자 10개.'],{owner:'박태오 · 당시 작성한 업무 메모',date:'11.07 09:38',excerpt:true,note:'누나는 09:38에 준비실 속 기록 상자를 알고 있었고 직접 문을 잠갔다.'}),
 manifestHistory:A('철수표 · 11번 수정 이력','sheet',['11:45 · 회의 원본 / 행사실 임시 보관','17:26 · 자료실 기증 / 소재 확인 중','수정 계정: 윤서경. 두 버전 모두 공유 문서에 보관돼 있습니다.'],{owner:'공유 문서 버전 기록',date:'11.07',excerpt:true,note:'17:26에 누나가 보관 장소를 지우고 기증품의 소재를 모른다고 바꿨다.'}),
 recovery:A('준비실에서 확인한 물품','sheet',['20:52 · 도하·수진·서경 함께 확인. 서경의 열쇠로 준비실을 열었습니다.','선반 밑 행사 천 뒤에서 11번 상자를 찾았습니다. 회의록과 의견지 원본이 들어 있습니다.','수진의 개인 노트는 상자에 없습니다. 아침에 챙겼다는 설명과 같습니다.'],{owner:'도하와 수진의 확인 기록',date:'11.07 20:52',excerpt:true,note:'상자를 함께 열었다. 회의록 원본이 남아 있었고 수진의 노트만 빠져 있었다.'}),
 sisterStatement:A('서경의 확인문','sheet',['회의록의 반대 의견이 다시 공개되면 새 공간 운영 제안에 문제가 생길까 봐 원본 상자를 숨겼습니다.','제가 상자를 옮기라고 했고 준비실을 잠갔습니다. 가게 폰의 승인 대화도 제가 지웠습니다.','위치를 알면서 수진 씨가 가져간 상자를 찾는다고 썼습니다. 정정하겠습니다. — 윤서경'],{owner:'윤서경이 작성한 확인문',date:'11.07 21:05',excerpt:true,note:'서경은 의견 공개를 막으려고 상자와 승인 대화를 숨겼다고 확인했다.'}),
 redacted:A('정정용 회의록 발췌','sheet',['찬성 17명 / 반대·보류 6명. 원본과 대조했습니다.','이름·연락처·서명을 가린 의견 부분입니다. 수진과 해당 주민들이 이 발췌의 공개에 동의했습니다.'],{owner:'수진과 주민들이 확인한 사본',date:'11.07 21:18',excerpt:true,note:'공개에 동의한 의견 발췌를 받았다. 개인 정보는 가려져 있다.'}),
 contract:A('도하의 기록집 번역','sheet',['원고 예정 문장: “주민 23명 전원 지지로 시작한 새 문화공간.”','번역자 윤도하 / 선지급 800,000원 / 본문 번역 착수 전.'],{owner:'도하의 작업 계약 메모',date:'10.28',excerpt:true,note:'내 번역 원고에도 같은 지지 문장이 들어갈 예정이다.'})
};
const nodes={};
function N(id,act,room,time,lines,options,extra={}){nodes[id]={id,act,room,time,lines,options,...extra};}
N('prologue_reply',0,'owner','18:33',[L('owner','도하야, 가게 폰 보고 있지?'),L('owner','행사 곧 시작해. 책 찾으러 오시면 서랍에 봉투 있어. 파란 접시는 네가 가져가고.')],[O('ready','응. 끝나면 연락해.','first_contact'),O('dinner','알았어. 끝나고 밥은 누나가 사.','first_contact')]);
N('first_contact',1,'sujin','18:34',[L('sujin','서경 씨, 스레드에 올린 글 확인하셨어요? 제 이름이 올라가 있어서요.'),L('sujin','상자 가져간 사람이 저라고 적으시면 사람들이 어떻게 생각하겠어요.')],[O('identify','수진 씨, 저 도하예요. 누나 대신 가게 보고 있어요. 글부터 볼게요.','read_accusation')],{unlock:['incident']});
N('read_accusation',1,'sujin','18:36',[L('sujin','아, 도하 씨구나. 모서리책방 계정에 오늘 올린 글이에요.'),L('sujin','댓글에 제 계정까지 달렸어요. 확인하고 연락 주세요.')],[O('ask_box','글 봤어요. 오전에 상자 가져가신 건 맞아요?','sujin_explains'),O('ask_permission','가져가라고 했다는 게 무슨 말이에요?','sujin_explains')],{requires:['incident'],hint:'홈에서 스레드를 열고 모서리책방의 최근 글을 읽어 보세요.'});
N('sujin_explains',1,'sujin','18:39',[L('sujin','네. 작은 상자는 제가 들고 나왔어요. 서경 씨가 행사실 준비실에 두래서요.'),L('sujin','제 검정 노트만 빼고, 상자는 안쪽 선반 밑에 놨어요.'),L('sujin','아침에 문자로 얘기했어요. 지금 그 폰에도 제가 두고 왔다고 보낸 말은 있을 거예요.')],[O('check_sister','누나한테 무슨 일인지 물어볼게요.','sister_first'),O('wait_here','알겠어요. 어디에 뒀는지 확인하고 연락드릴게요.','sister_first')]);
N('sister_first',1,'owner','18:41',[L('owner','수진 씨 연락 왔어? 나 지금 무대 옆이야.'),L('owner','작은 상자 때문에 그래. 기록을 자료실에 같이 보내기로 했는데 수진이가 먼저 들고 나갔어.'),L('owner','급여 32만 원은 아침에 정산했고. 끝나면 내가 얘기할게.')],[O('sister_location','수진 씨는 누나가 준비실에 두라고 했대.','sister_deflects'),O('sister_missing','상자가 지금 어디 있는지는 몰라?','sister_deflects')]);
N('sister_deflects',1,'owner','18:43',[L('owner','준비실은 내가 닫았어. 행사 물건 섞일까 봐. 끝나고 볼게.'),L('owner','인스타에 올린 상자 사진 있어. 작은 것도 같이 찍혔을 거야.'),L('owner','태오한테 운송 개수 물어 놨어. 너한테 답하라고 했어.')],[O('look_photo','응. 사진 보고 태오 형 답 기다릴게.','driver_intro')],{unlock:['boxPhoto','photoInfo']});
N('driver_intro',2,'taeo','18:47',[L('taeo','도하야. 나 지금 차 세웠어. 누나가 수량 알려 주라네.'),L('taeo','큰 거 열 개. 오전에 자료실에 다 내렸어. 운송비도 8만 받았고.'),L('taeo','인스타 열한 개 사진 얘기면 그거 오전 사진이야. 내 댓글도 있어.')],[O('saw_eleven','사진 봤어. 작은 상자는 형 차에 안 실은 거네?','driver_receipt'),O('photo_time','오전에 찍고 오후에 올린 거구나. 인수증도 있어?','driver_receipt')],{requires:['boxPhoto'],hint:'인스타그램에서 상자 사진과 태오의 댓글을 확인하세요.'});
N('driver_receipt',2,'taeo','18:48',[L('taeo','응. 작은 건 수진 씨가 먼저 가져갔어. 어디에 놨는지는 못 봤고.'),L('taeo','인수증 보낸다. 열 개 받았다고 써 있어. 사진 원본도 가게 폰 갤러리에 있을 거야.',['intake'])],[O('receipt_read','예정도 열 개네. 기증품은 다 도착했어.','reporter_intro')],{requires:['intake'],hint:'태오가 보낸 인수증에서 예정 수량과 실제 수량을 읽어 보세요.'});
N('reporter_intro',2,'narae','19:02',[L('narae','안녕하세요. 문원생활 강나래입니다. 지금 답하시는 분이 도하 씨 맞나요?'),L('narae','서경 씨가 계산대는 동생분이 맡았다고 하셔서요. 오늘 상자에 회의록 원본이 들어 있다고 들었습니다.')],[O('reporter_yes','네. 수진 씨가 어디에 뒀는지 확인 중이에요.','reporter_records')]);
N('reporter_records',2,'narae','19:05',[L('narae','서경 씨가 오후에 보낸 철수표예요. 11번이 기증품으로 적혀 있습니다.',['manifest']),L('narae','그리고 월요일 설명회 자료입니다. 주민 23명이 전부 지지했다고 돼 있어요.',['supporters']),L('narae','수진 씨는 그 내용부터 고쳐 달라고 하셨어요. 설명회 공지는 인터넷에서 볼 수 있고요. 오늘 밤 10시가 인쇄 마감입니다.')],[O('ask_minutes','수진 씨한테 회의록 얘기를 더 들어볼게요.','sujin_minutes')],{unlock:['meeting'],requires:['manifest','supporters'],hint:'받은 파일에서 11번 항목과 주민 지지 인원만 확인하세요.'});
N('sujin_minutes',2,'sujin','19:12',[L('sujin','나래 기자님이 연락하셨어요. 제가 갖고 있는 사본부터 보내요. 연락처는 가렸어요.',['opinion']),L('sujin','최은숙 선생님 기억하세요? 보행기 두고 들어오시던 분. 그분이 새 공간 계단 때문에 지금 장소를 남겨 달라고 쓰셨어요.'),L('sujin','그 말이 전원 찬성으로 바뀌었어요. 다른 페이지 원본은 그 작은 상자에 있고요.')],[O('six_people','반대하거나 보류한 분이 여섯 명이네요. 누나는 이걸 봤어요?','yesterday'),O('missing_opinions','원본을 찾으면 이 의견부터 확인할 수 있겠네요.','yesterday')],{requires:['opinion'],hint:'수진이 보낸 회의록에서 참석 인원과 의견을 비교하세요.'});
N('yesterday',2,'sujin','19:18',[L('sujin','재작년에도 말씀드렸어요. 어제도 원본을 보여 드리겠다고 했고요.',['request']),L('sujin','제가 상자를 챙긴 이유부터 제대로 설명해 주셨으면 좋겠어요. 지금은 제가 원본을 없앤 사람처럼 돼 있잖아요.')],[O('tell_sister','누나한테 먼저 물어볼게요.','sister_denies'),O('keep_copy','사본 잘 받았어요. 원본도 확인할게요.','sister_denies')]);
N('sister_denies',3,'owner','19:26',[L('owner','행사 끝났어. 아직 인사하는 분들 있어서 좀 걸려.'),L('owner','회의록 얘기도 들었어. 옛날 자료 옮기면서 빠진 게 있나 봐. 내가 정리할게.')],[O('permission_question','수진 씨한테 상자를 준비실에 두라고 했어?','sister_notebook'),O('approval_question','아침에 가져가도 된다고 문자했다던데. 이 폰에는 안 보여.','sister_notebook')]);
N('sister_notebook',3,'owner','19:28',[L('owner','노트 가져가란 얘기였겠지. 그걸 상자째 가져간 것 같은데.'),L('owner','수진이랑 내가 얘기할게. 너는 봉투만 챙겨 줘. 원고 일까지 신경 쓰기 싫잖아.')],[O('need_original','그래도 상자는 확인해야지. 수진 씨 쪽 대화도 받아 볼게.','ask_copy'),O('notebook_difference','노트랑 회의록 상자는 다른 거잖아. 원문을 볼게.','ask_copy')]);
N('ask_copy',3,'sujin','19:34',[L('sujin','서경 씨랑 이야기됐어요? 저 아직 근처에 있어요.')],[O('request_copy','이 폰에는 오전 허락이 안 보여요. 수진 씨 전화기에도 남아 있나요?','approval_arrives')]);
N('approval_arrives',3,'sujin','20:03',[L('sujin','집에 들어갈까 하다가 다시 확인했어요. 제 폰에는 있어요. 앞뒤 대화까지 같이 보냅니다.',['approvalCopy']),L('sujin','준비실을 못 찾아서 태오 씨한테도 아침에 이 화면 보냈어요. 그쪽에서도 확인해 보셔도 돼요.')],[O('compare_copy','여기엔 상자째 옮기라고 적혀 있네요. 태오 형한테도 확인할게요.','independent_copy')],{requires:['approvalCopy'],hint:'수진의 사본에서 09:12 문장을 확인하세요. 가게 폰의 오전 대화와 비교할 수 있습니다.'});
N('independent_copy',3,'taeo','20:12',[L('taeo','수진 씨한테 연락 왔어. 아침에 받은 거 찾았다. 9시 16분에 받았어.',['driverCopy']),L('taeo','누나가 행사실 준비실에 두라고 했네. 네가 보고 있는 폰에는 이게 없어?')],[O('gone_here','응. 9시 24분에 두고 왔다는 말만 남아 있어.','driver_witness'),O('key_question','응. 그런데 준비실은 누가 잠갔는지 알아?','driver_witness')],{requires:['driverCopy'],hint:'태오가 오전에 받은 사본의 수신 시각과 문장을 확인하세요.'});
N('driver_witness',4,'taeo','20:17',[L('taeo','준비실은 누나가 잠갔어. 내가 담요 가지러 갔다가 만났거든.'),L('taeo','안에 기록 상자 있어서 못 연다고, 끝나고 가져가래. 내 업무 메모에도 적어 뒀네.',['driverLog']),L('taeo','수진 씨가 반납한 건 계산대 서랍 열쇠야. 준비실 열쇠는 누나 검은 끈에 달린 거.')],[O('known_location','그럼 누나는 아침부터 상자가 거기 있는 걸 알았네.','version_check')],{requires:['driverLog'],hint:'태오의 메모에서 누나가 문을 잠근 시각과 한 말을 읽어 보세요.'});
N('version_check',4,'narae','20:23',[L('narae','공유 문서 버전 기록도 받았습니다. 오전 파일에는 행사실 보관이라고 적혀 있어요.',['manifestHistory']),L('narae','오후 5시 26분에 서경 씨가 기증품으로 바꿨습니다. 상자를 찾는다는 글은 그 2분 뒤에 올라왔고요.'),L('narae','도하 씨는 상자가 어디서 없어졌다고 보세요? 확인하신 내용대로 말씀해 주세요.')],[O('theory_sister','누나가 준비실에 보관해 놓고, 없어진 것처럼 말한 것 같아요.','deduction',{deduced:true}),O('theory_sujin','수진 씨가 옮긴 뒤 다시 가져갔을 수도 있지 않을까요?','check_sujin'),O('theory_driver','태오 형이 나중에 차에 실었을 가능성은요?','check_driver')],{requires:['manifestHistory'],hint:'철수표에서 오전의 보관 장소가 오후에 어떻게 바뀌었는지 보세요.'});
N('check_sujin',4,'narae','20:24',[L('narae','수진 씨가 다시 들어갔다는 자료는 아직 없어요. 준비실은 서경 씨가 잠갔고 열쇠도 갖고 계셨죠.'),L('narae','상자 위치를 알고 있던 사람이 나중에 어떤 말을 했는지 다시 볼까요?')],[O('reconsider_sujin','누나는 아침에 알고 있었는데, 오후에는 모르는 것처럼 썼네요.','deduction',{deduced:true})]);
N('check_driver',4,'narae','20:24',[L('narae','자료실에는 예정된 큰 상자 열 개가 도착했어요. 준비실은 태오 씨가 담요도 못 꺼내게 잠겨 있었고요.'),L('narae','태오 씨를 의심할 새 근거는 없어요. 누가 보관 장소를 지웠는지부터 확인하죠.')],[O('reconsider_driver','철수표를 바꾸고 소재를 모른다고 쓴 건 누나네요.','deduction',{deduced:true})]);
N('deduction',4,'narae','20:26',[L('narae','네. 이동 지시, 열쇠, 목록 수정은 서경 씨에게 연결됩니다. 수진 씨에게는 승인받은 이동이 확인됐고요.'),L('narae','왜 그랬는지는 직접 물어봐야 해요. 제가 상자 위치와 원본 확인도 요청하겠습니다.')],[O('ask_motive','누나한테 승인 대화랑 준비실 얘기부터 물을게요.','confront')]);
N('confront',4,'owner','20:31',[L('owner','나래 기자가 준비실 열어 달라는데. 너 뭘 보낸 거야?')],[O('confront_facts','아침에 상자 옮기라고 누나가 보냈잖아. 직접 잠그기도 했고. 왜 없어진 것처럼 썼어?','first_crack'),O('confront_deleted','수진 씨랑 태오 형 폰에는 승인 문자가 남아 있어. 이 폰에서는 왜 없어?','first_crack')]);
N('first_crack',4,'owner','20:32',[L('owner','너 지금 어디까지 본 거야.'),L('owner','수진이랑 내가 해결할게. 오늘은 일단 마감부터 하자.')],[O('say_motive','회의록을 기자한테 보여 주겠다고 해서 숨긴 거야?','confession'),O('open_first','준비실부터 열어 줘. 내가 수진 씨랑 같이 확인할게.','confession')]);
N('confession',5,'owner','20:37',[L('owner','그걸 오늘 열게 할 수가 없었어.'),L('owner','회의록에 반대한 사람들 말 있잖아. 내가 제출할 때 그 부분 뺐어. 전원 지지라고 보냈고.'),L('owner','그게 지금 나오면 새 공간 운영 얘기가 끝날 것 같았어. 그래서 상자를 준비실에 두라고 했어. 문 잠근 것도 나야.')],[O('ask_delete','승인 대화도 누나가 지웠어?','admission')],{kind:'call'});
N('admission',5,'owner','20:40',[L('owner','응. 이 가게 폰에서 내가 지웠어. 네가 계산대 맡기 전에.'),L('owner','수진이가 가져간 것처럼 보이면, 회의록 얘기는 오늘 못 할 줄 알았어.'),L('owner','네 번역 일도 거기랑 연결돼 있잖아. 오늘만 넘기고 싶었어.')],[O('name_responsibility','내 일 때문에 그랬다고 쓰지 마. 결정한 건 누나야. 상자부터 열자.','recover_box',{boundary:true}),O('stop_delay','더 미루면 인쇄돼. 지금 열쇠 가져와. 수진 씨도 부를게.','recover_box',{boundary:false})],{kind:'call',continuation:true,effect:{culprit:'owner',intentional:true}});
N('recover_box',5,'sujin','20:52',[L('sujin','준비실 앞이에요. 서경 씨도 왔어요.'),L('sujin','선반 뒤에 있네요. 열기 전에 사진 찍었어요. 회의록 원본도 다 있어요. 같이 확인한 내용 보낼게요.',['recovery']),L('sujin','글에는 상자 찾았다고만 쓰지 말아 주세요. 제가 왜 가져갔는지도 써야 해요.')],[O('correct_actions','누나가 옮기라고 했고 숨겼다는 것까지 적을게요.','statement')],{requires:['recovery'],hint:'함께 확인한 기록에서 상자의 위치와 내용물을 확인하세요.'});
N('statement',5,'owner','21:05',[L('owner','확인문 썼어. 내가 한 일 그대로 적었어.',['sisterStatement']),L('owner','수진 씨한테도 보냈어. 나래 기자한테 전달해도 돼.')],[O('attach_statement','원본 기록이랑 같이 보낼게. 누나 글도 직접 고쳐 줘.','consent',{signed:true}),O('evidence_first','확인문은 보관할게. 정정은 원본 자료로 먼저 요청할 거야.','consent',{signed:false})],{requires:['sisterStatement'],hint:'누나가 확인문에 행동과 이유를 직접 적었는지 확인하세요.'});
N('consent',5,'sujin','21:18',[L('sujin','의견 쓰신 분들께 연락드렸어요. 이름이랑 연락처 가린 이 부분은 공개해도 된대요.',['redacted']),L('sujin','개인 노트는 제가 가져갈게요. 모임 사람들 사적인 말까지 나갈 필요는 없어요.')],[O('respect_scope','네. 동의받은 의견 부분만 쓸게요.','own_work',{consent:true})],{requires:['redacted'],hint:'공개용 발췌의 범위와 동의를 확인하세요.'});
N('own_work',5,'owner','21:22',[L('owner','네 기록집 계약 메모도 여기 있어. 원고에 그 문장이 들어갈 거야.',['contract']),L('owner','일 멈추면 당장 돈은 어떡해. 선금 받았잖아.')],[O('hold_translation','틀린 문장인 걸 알았으니까 번역은 보류할게. 담당자한테 내가 설명할 거야.','final_ready',{holdWork:true}),O('ask_corrected_source','정정한 원고를 달라고 할게. 이 문장 그대로는 못 옮겨.','final_ready',{holdWork:true})],{requires:['contract'],hint:'계약 메모에서 번역할 예정인 문장을 확인하세요.'});
N('final_ready',5,'narae','21:30',[L('narae','지금까지 받은 자료로 정정 문안 준비했어요. 승인받은 이동과 서경 씨의 고의 은닉을 구분해 적었습니다.'),L('narae','오늘 보내면 인쇄 담당자에게 해당 페이지 보류를 요청할 수 있어요. 어떤 범위로 보낼지 읽어 보고 정해 주세요.')],[],{final:true});
function endingOptions(s){return [
 {id:'joint',title:'확인문과 증거를 함께 보낸다',subtitle:'서경의 확인문을 첨부해 인쇄 전 정정을 요청합니다.',enabled:!!s.flags.signed,reason:'앞서 누나의 확인문을 전달하지 않기로 했습니다.'},
 {id:'limited',title:'기자에게 확인된 자료를 맡긴다',subtitle:'원본을 대조한 기사와 공식 정정을 요청합니다.',enabled:true},
 {id:'full',title:'동의받은 발췌로 직접 공개한다',subtitle:'상자 이동 경위와 가린 회의록을 도하 이름으로 올립니다.',enabled:!!s.flags.consent,reason:'의견 발췌의 공개 동의가 필요합니다.'},
 {id:'private',title:'외부 정정을 미룬다',subtitle:'증거는 보관하고 누나의 수습을 기다립니다. 오늘 인쇄는 진행됩니다.',enabled:true}
];}
function publication(s,id){
 const common=['윤서경은 이수진에게 11번 상자를 행사실 준비실로 옮기도록 지시했습니다. 이후 직접 문을 잠가 원본을 보관했습니다.','서경은 회의록의 반대·보류 의견이 공개되는 것을 막으려고 승인 대화를 자신의 가게 휴대전화에서 삭제하고, 상자 소재를 모르는 것처럼 수진의 이름을 공개했습니다.','회의 참석자는 23명이며 찬성 17명, 반대·보류 6명입니다. 수진의 승인받은 이동 경위와 주민 의견의 정정을 요청합니다.'];
 const p={joint:['상자 은닉과 주민 의견 정정 요청','서경의 확인문과 대조한 증거를 기자와 설명회 담당자에게 보냅니다.'],limited:['취재 및 공식 정정 요청','기자가 당사자를 확인하고 정정문을 작성합니다.'],full:['11번째 상자의 이동 경위를 알립니다','도하 이름으로 공개합니다. 주민의 이름·연락처·서명은 가립니다.'],private:['증거 보관 · 정정 유예','외부로 정정 근거를 보내지 않습니다. 오늘 인쇄될 자료에는 기존 지지 문장이 남습니다.']}[id];
 return {heading:p[0],body:id==='private'?['누나의 승인 삭제와 고의 은닉을 확인했습니다. 수진의 승인받은 이동과 여섯 사람의 의견을 입증할 자료를 보관합니다.','오늘은 외부 정정을 요청하지 않고 누나의 후속 조치를 기다립니다.']:common,attachments:id==='private'?[]:['approvalCopy','driverCopy','manifestHistory','redacted',...(id==='joint'?['sisterStatement']:[])],people:['윤서경 · 이동 지시, 대화 삭제, 원본 은닉','이수진 · 승인받은 이동, 사본 및 원본 확인','윤도하 · 기록 대조 및 전달'],cost:p[1]};
}
function endingMessages(s){
 const id=s.ending;
 const today=id==='private'?[L('narae','알겠습니다. 자료 전달은 보류할게요. 인쇄 담당자는 오늘 밤 기존 안대로 진행한다고 합니다.'),L('sujin','상자 찾은 건 확인했어요. 그런데 제 이름 올라간 글은요? 오늘 고친다고 하지 않았어요?'),L('owner','내가 내일 다시 얘기해 볼게. 오늘은 좀 쉬자.')]:[L('narae',id==='full'?'도하 씨가 올린 발췌 확인했어요. 기사에도 원본 대조 결과를 싣겠습니다. 인쇄 담당자는 해당 페이지를 보류했대요.':'자료 받았습니다. 인쇄 담당자가 해당 페이지를 보류했어요. 주민 의견을 다시 확인하기로 했습니다.'),L('sujin','누가 어디로 옮기라고 했는지까지 적혀 있네요. 그 문장이 필요했어요. 원래 글도 저는 보관해 둘게요.'),L('owner','내가 한 일 적어서 글 고쳤어. 미안하다는 말로 끝낼 수 없는 건 알아.')];
 const week=id==='private'?[L('sujin','설명회 자료에 그대로 실렸어요. 제가 상자 가져갔다는 얘기도 아직 들려요. 제 사본으로 직접 정정 요청할게요.'),L('narae','수진 씨에게 자료를 받았습니다. 배포된 인쇄본의 정정은 별도로 요청하고 있어요.'),L('owner','수진 씨가 정정 요청했대. 나도 이제 내가 한 일 설명할게.')]:[L('sujin','새 모임은 1층 방으로 구했어요. 의견지도 돌려드렸고요. 자기 말이 그대로 있는지 한 분씩 확인하셨어요.'),L('narae','설명회 자료의 전원 지지 문장이 정정됐어요. 서경 씨의 운영 제안은 재검토 중이라고 합니다.'),L('owner','정정 필요한 배포처 확인하고 있어. 네 계약 담당자에게도 잘못된 원고를 보냈다고 말했어.'),L('owner','접시는 안 깨졌어?'),L('doha','응.')];
 return {today,week};
}
const initialMessages=[{room:'sujin',who:'sujin',day:'11.06',time:'18:10',text:'내일 오전에 갈게요. 모임 자료도 같이 확인해요.'},{room:'sujin',who:'sujin',day:'11.07',time:'09:24',text:'시키신 대로 뒀어요. 서랍 열쇠는 흰 컵에요.'}];
const api={version:'0.5.0',contacts,photos,assets,nodes,endingOptions,publication,endingMessages,initialMessages,initialAssets:['handoff','farewell']};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.BoxCampaignData=api;
})(typeof globalThis!=='undefined'?globalThis:this);
