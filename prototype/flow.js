(function(root){
  'use strict';
  function init(s){
    if(!s.flow||s.flow.version!==1){
      s.flow={version:1,stage:s.ending?5:s.finalCallDone?4:s.edited||s.facts.length?2:s.phase==='intro'?0:1,route:null,insights:[],shareStarted:false,secondRoute:null,secondComplete:false,assisted:[]};
      if(s.evidence.includes('E005'))insight(s,'sujin');
      if(s.taeo==='done'||s.evidence.includes('E002'))insight(s,'taeo');
      if(s.evidence.includes('E003')&&s.evidence.includes('E004'))insight(s,'photo');
      if(s.early==='done'){s.flow.secondRoute='owner';s.flow.secondComplete=true;if(s.flow.stage===2)s.flow.stage=3;}
      if(s.activeCall?.kind==='final')s.flow.stage=3;
    }
    return s.flow;
  }
  function pick(s,route){if(s.flow.stage>1||!['sujin','taeo','photo','direct'].includes(route))return false;s.flow.stage=1;s.flow.route=route;return true;}
  function insight(s,route){if(!s.flow.insights.includes(route))s.flow.insights.push(route);if(!s.flow.route||(s.flow.stage<=1&&!s.flow.shareStarted))s.flow.route=route;}
  function observe(s,key){
    if(key==='E005')insight(s,'sujin');
    if(key==='E002')insight(s,'taeo');
    if((key==='E003'||key==='E004')&&s.evidence.includes('E003')&&s.evidence.includes('E004'))insight(s,'photo');
    return key==='E006'&&s.flow.stage===2&&s.flow.secondRoute==='records'&&s.edited;
  }
  function canShare(s){return s.flow.stage===1&&!s.flow.shareStarted&&s.flow.insights.includes(s.flow.route);}
  function joinFirst(s,route){if(s.flow.stage>=3||!['sujin','taeo','photo','direct'].includes(route))return false;s.briefed=true;s.flow.stage=2;s.flow.route=route;s.flow.shareStarted=true;return true;}
  function summary(s){
    if(s.flow.route==='sujin')return s.evidence.includes('E005')?'수진 씨한테 가져가도 된다고 한 답장 봤어요.':'수진 씨는 자기 물건을 돌려받은 거래요.';
    if(s.flow.route==='taeo')return s.taeo==='done'?'태오 형이 처음부터 열 개만 옮겼대요.':'자료실엔 열 상자를 받았다고 적혀 있어요.';
    if(s.flow.route==='photo')return '사진은 오후에 올라왔는데 찍은 건 아침이네요.';
    return '공지 보고 연락드려요. 같이 확인해 주실 수 있을까요?';
  }
  function completeSecond(s,route){if(s.flow.stage!==2||s.flow.secondComplete)return false;s.flow.secondRoute=route;s.flow.secondComplete=true;s.flow.stage=3;return true;}
  const api={init,pick,insight,observe,canShare,joinFirst,summary,completeSecond};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.BoxFlow=api;
})(globalThis);
