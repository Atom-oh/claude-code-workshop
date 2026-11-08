---
remarp: true
block: ch3-guardrails-dlp
---
<!-- Slide 1: Cover (PDF p1) -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 3. 가드레일과 DLP
## 무엇을 못 하게 할 것인가 (2026.11, Claude Code v2.1.319, Bedrock 기준)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=[].some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch3.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
/* Chapter-local helper: code block whose lines light up when a point is picked. */
window.__c3codepick = function (F, name, preId, lines, map) {
  var pre = document.querySelector('.slide-deck #' + preId) || document.getElementById(preId);
  if (!pre) return;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  pre.innerHTML = lines.map(function (l) {
    var t = esc(l).replace(/(\s\/\/\s.*|^\s*#.*)$/, '<span class="c">$1</span>');
    return '<span class="ln">' + (t || ' ') + '</span>';
  }).join('');
  var lns = Array.prototype.slice.call(pre.querySelectorAll('.ln'));
  F.pick(name, { onShow: function (key) {
    var on = key ? (map[key] || []) : [];
    pre.classList.toggle('has-sel', !!key);
    lns.forEach(function (ln, i) { ln.classList.toggle('on', on.indexOf(i + 1) >= 0); });
  }});
};
:::

:::notes
{timing: 0.25min}
[요약]
• Chapter 3 가드레일과 DLP, 무엇을 못 하게 할 것인가
• Claude Code v2.1.319 (2026-11-08 리허설 검증), Amazon Bedrock, 공식 문서 기준

Chapter 3을 시작하겠습니다. 이번 챕터의 질문은 하나입니다. Claude Code가 무엇을 못 하게 할 것인가.
Ch1에서 통제는 도구 호출 지점에 건다고 말씀드렸는데요, 이번 챕터에서는 그 지점에 실제로 무엇을 어떤 순서로 거는지 보겠습니다.
이번에도 단계별 그림과 클릭하는 패널로 진행합니다.
:::

---
<!-- Slide 2: Agenda (PDF p2) -->
@type: content
@fit: off

## 강의 18분, 실습 32분
네 개의 Part와 Lab, 권한 기초에서 감사 기록까지

:::html
<div class="fsi fsi-agenda">
  <div class="fsi-grid-4">
    <div class="pick"><span class="k">PART 01 / 3분</span><span class="t">설정, 권한 기초</span><span class="d">스코프 우선순위, 평가 순서, 잠금 키</span></div>
    <div class="pick"><span class="k">PART 02 / 5분</span><span class="t">auto mode와 안전의 경계</span><span class="d">auto mode, 승인 추가, 분류기 모델, 경계</span></div>
    <div class="pick"><span class="k">PART 03 / 7분</span><span class="t">DLP 5층</span><span class="d">권한, 샌드박스, 훅, Guardrails, 반출 채널</span></div>
    <div class="pick"><span class="k">PART 04 / 3분</span><span class="t">확장 통제와 감사</span><span class="d">플러그인, <span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 외부 시스템을 Claude Code 도구로 붙이는 표준">MCP</span>, <span class="rp-detail" tabindex="0" data-tip="Claude Code 화면과 동작을 바꾸는 작은 코드 (Ch5)">mod</span>, 남는 기록</span></div>
  </div>
  <div class="fsi-grid-2">
    <div class="pick lab"><span class="k">LAB / 32분</span><span class="t">DLP 훅, fail-open, auto mode</span><span class="d">TASK 00부터 03과 07, 선택 TASK 04부터 06</span></div>
    <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">규칙 문법, 훅 이벤트, OS 차이, MCP 통제, 감사 기록</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• 강의 18분: Part 1 권한 기초 3분, Part 2 auto mode와 경계 5분, Part 3 DLP 5층 7분, Part 4 확장 통제와 감사 3분
• 실습 32분: DLP 훅, fail-open, auto mode (TASK 00부터 03, 07), 선택 TASK 04부터 06
• 더 알아보기는 질문이 나오면 펼침

오늘 순서입니다. 먼저 가드레일을 읽기 위한 문법, 즉 권한 규칙이 어떻게 합쳐지고 평가되는지 봅니다.
두 번째로 auto mode와 안전의 경계, 세 번째가 이 챕터의 중심인 DLP 5층, 마지막으로 확장 통제와 감사 기록입니다.
이번 챕터는 강의를 18분으로 줄이고 실습을 32분으로 늘렸습니다. DLP 훅을 만들고 fail-open을 직접 확인한 뒤, auto mode로 경계를 긋고 마지막에 TASK 07로 원복합니다. TASK 04부터 06은 선택입니다.

[약어]
• DLP: Data Loss Prevention, 민감 정보 유출 방지
:::

---
<!-- Slide 3: Pre-survey (PDF p3, p4) -->
@type: content
@fit: off

## 138명 중 51명이 고른 주제
사전 설문, 망분리와 보안(DLP, 감사로그)에 대한 기대

:::html
<div class="fsi fsi-survey c3-survey">
  <div class="sv-big">
    <span class="eyebrow">PRE-SURVEY</span>
    <div class="num"><span id="c3-survey-num">51</span></div>
    <p class="lead">참가 확정자 <b>138명 중 51명</b>이 "망분리, 보안(<span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span>, 감사로그)"를 기대 주제로 골랐습니다.</p>
    <p class="why">이 챕터는 그 기대에 답하는 시간입니다. 무엇을 막을 수 있고, 무엇이 기록으로 남는지 정리합니다.</p>
  </div>
  <div class="bars" id="c3-survey-bars">
    <div class="bar lo" data-v="51"><span class="lb">망분리, 보안</span><span class="tr"><i></i></span><span class="v">51명</span></div>
    <div class="bar" data-v="44"><span class="lb">규제, 감사 대응</span><span class="tr"><i></i></span><span class="v">44명</span></div>
    <div class="bar" data-v="58"><span class="lb">팀 표준화</span><span class="tr"><i></i></span><span class="v">58명</span></div>
    <p class="cap">복수 선택 응답, 막대 길이는 응답 인원</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var host = document.getElementById('c3-survey-bars');
  var bars = Array.prototype.slice.call(host.querySelectorAll('.bar'));
  function grow(on) { bars.forEach(function (b, i) { var w = on ? (b.dataset.v / 58 * 100) : 0; setTimeout(function () { b.querySelector('i').style.width = w + '%'; }, on ? 120 * i : 0); }); }
  F.countUp('#c3-survey-num', 51, { decimals: 0, suffix: '' });
  F.onEnter(host, function () { grow(false); setTimeout(function () { grow(true); }, 60); });
  grow(true);
});
:::

:::notes
{timing: 0.25min}
[요약]
• 참가 확정자 138명 중 51명이 망분리, 보안(DLP, 감사로그)을 기대 주제로 선택
• 규제, 감사 대응 44명, 팀 표준화 58명 (복수 선택)

{cue: pause}
사전 설문에서 138명 중 51명이 망분리와 보안, 특히 DLP와 감사로그를 기대 주제로 골라 주셨습니다. 규제와 감사 대응도 44명이었습니다.
이 챕터는 그 질문에 답하는 시간입니다. 무엇을 막을 수 있는지, 그리고 막지 못한 것은 무엇으로 기록이 남는지까지 정리하겠습니다.

[출처]
• 이번 워크숍 사전 설문, 참가 확정자 138명, 복수 선택
:::

---
<!-- Slide 4: Part 01 divider (PDF p5) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 03 / PART 01</span>
  <div class="name">설정, 권한 기초</div>
  <p class="what">가드레일을 읽기 위한 문법</p>
  <ol>
    <li><b>01</b>누가 이기는가</li>
    <li><b>02</b>deny가 항상 이긴다</li>
    <li><b>03</b>잠금 키</li>
  </ol>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• Part 1은 가드레일을 읽기 위한 문법
• 규칙이 합쳐지는 방식, deny 우선, managed 전용 잠금 키

첫 번째 Part는 가드레일을 읽기 위한 문법입니다. 여러 곳에 흩어진 권한 규칙이 어떻게 합쳐지고, 누가 이기는지, 그리고 사용자가 풀 수 없게 잠그는 키가 무엇인지 보겠습니다.
:::

---
<!-- Slide 5: Permission evaluation order (PDF p6, p7) -->
@type: content
@fit: off

## deny가 항상 이긴다
권한 평가 순서와 Tool(specifier) 규칙 문법

:::html
<div id="c3-sv-eval"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var S1 = {id:'s1',x:30,y:70,w:230,h:76,t:'Managed',s:'관리자 배포',c:'danger'};
  var S2 = {id:'s2',x:30,y:197,w:230,h:76,t:'Project',s:'.claude/settings.json',c:'success'};
  var S3 = {id:'s3',x:30,y:324,w:230,h:76,t:'User',s:'~/.claude/settings.json',c:'accent'};
  var M = {id:'m',x:330,y:192,w:220,h:86,t:'합쳐진 규칙',s:'모든 스코프',c:'ink'};
  var D1 = {id:'d1',x:620,y:40,w:240,h:74,t:'1 deny 일치',c:'danger'};
  var D2 = {id:'d2',x:620,y:150,w:240,h:74,t:'2 ask 일치',c:'warning'};
  var D3 = {id:'d3',x:620,y:260,w:240,h:74,t:'3 allow 일치',c:'success'};
  var D4 = {id:'d4',x:620,y:370,w:240,h:74,t:'4 일치 없음',c:'muted'};
  var R1 = {id:'r1',x:920,y:40,w:240,h:74,t:'즉시 거부',s:'어느 스코프에 있든',c:'danger'};
  var R2 = {id:'r2',x:920,y:150,w:240,h:74,t:'사용자에게 확인',c:'warning'};
  var R3 = {id:'r3',x:920,y:260,w:240,h:74,t:'확인 없이 실행',c:'success'};
  var R4 = {id:'r4',x:920,y:370,w:240,h:74,t:'권한 모드 기본 동작',c:'muted'};
  var ALL = [S1,S2,S3,M,D1,D2,D3,D4,R1,R2,R3,R4];
  var merge = [{f:'s1',t:'m',c:'danger',side:'h',o:0},{f:'s2',t:'m',c:'success',side:'h',o:0},{f:'s3',t:'m',c:'accent',side:'h',o:0}];
  var rule = ['"deny": [','  "Read(./.env)",            // 정확한 파일','  "Read(./secrets/**)",      // gitignore 스타일 글롭','  "Bash(curl *)",            // 명령 패턴','  "WebFetch(domain:pastebin.com)",','  "mcp__untrusted-server"    // MCP 서버 전체','],','"ask":   ["Bash(git push *)"],','"allow": ["Bash(npm run test *)"]'];
  F.stepviz('#c3-sv-eval', [
    {kicker:'STEP 1', title:'모든 스코프를 합친 뒤 평가합니다',
     body:'규칙은 <b>Managed, Project, User</b> 등 모든 스코프에서 <b>합쳐진 뒤</b> 평가됩니다. 어느 파일에 적혔는지보다 <b>무엇이 적혔는지</b>가 결과를 정합니다.',
     facts:['스코프별 규칙이 한 목록으로 합쳐짐','평가는 deny, ask, allow 순서','어디에 있든 deny에 걸리면 거부'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, hot:['s1','s2','s3','m'], edges:merge.concat([{f:'m',t:'d1',c:'ink',side:'h',o:1}]),
     snip:{hd:'규칙 문법',path:'permissions (Tool(specifier) 한 가지 형식)',lines:rule,hl:[],note:'형식은 <b>Tool(specifier)</b> 하나입니다. 다음 단계부터 평가 순서대로 봅니다.'}},
    {kicker:'STEP 2', title:'1 deny 일치: 즉시 거부',
     body:'합쳐진 목록에서 <b>deny에 일치하면 바로 거부</b>입니다. user에 allow가 있어도, managed나 project에 deny가 있으면 거부됩니다.',
     facts:['어느 스코프의 deny든 동일','ask, allow는 보지 않음','민감 파일, 위험 명령, 외부 도메인 차단에 사용'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, hot:['m','d1','r1'], edges:[{f:'m',t:'d1',c:'danger',side:'h',o:0},{f:'d1',t:'r1',c:'danger',o:1}],
     snip:{hd:'deny 예시',path:'permissions.deny',lines:rule,hl:[1,2,3,4,5,6,7],note:'경로는 <b>./ 기준 상대 경로</b>, MCP는 <b>mcp__서버명</b> 단위입니다.'}},
    {kicker:'STEP 3', title:'2 ask 일치: 사람에게 확인',
     body:'deny에 걸리지 않고 <b>ask에 일치하면</b> 사용자에게 확인을 받습니다. git push처럼 사람이 꼭 봐야 하는 동작에 씁니다.',
     facts:['deny 다음에 평가','사용자가 승인해야 실행','Part 2: auto mode에서도 분류기보다 먼저'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, hot:['m','d1','d2','r2'], edges:[{f:'m',t:'d1',c:'ink',side:'h',o:0},{f:'d1',t:'d2',c:'muted',l:'일치 없음',o:1},{f:'d2',t:'r2',c:'warning',o:2}],
     snip:{hd:'ask 예시',path:'permissions.ask',lines:rule,hl:[8],note:'사람 확인이 필요한 동작을 <b>좁게</b> 적습니다.'}},
    {kicker:'STEP 4', title:'3 allow 일치: 확인 없이 실행',
     body:'deny와 ask에 걸리지 않고 <b>allow에 일치하면</b> 묻지 않고 실행합니다. 테스트처럼 반복되는 안전한 명령을 넣습니다.',
     facts:['앞의 두 단계를 통과한 경우에만','넓은 패턴일수록 위험','Bash 패턴은 우회가 쉬움, 샌드박스와 함께'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, hot:['m','d1','d2','d3','r3'], edges:[{f:'m',t:'d1',c:'ink',side:'h',o:0},{f:'d1',t:'d2',c:'muted',o:1},{f:'d2',t:'d3',c:'muted',l:'일치 없음',o:2},{f:'d3',t:'r3',c:'success',o:3}],
     snip:{hd:'allow 예시',path:'permissions.allow',lines:rule,hl:[9],note:'Bash 패턴은 파이프나 서브셸로 <b>우회가 쉽습니다</b>. 그래서 샌드박스와 함께 씁니다.'}},
    {kicker:'STEP 5', title:'4 일치 없음: 모드가 정합니다',
     body:'어느 규칙에도 일치하지 않으면 <b>현재 권한 모드의 기본 동작</b>을 따릅니다. 복잡한 판단은 규칙 대신 <b>훅</b>으로 넘깁니다.',
     facts:['default면 확인, acceptEdits면 편집 자동 등','모드는 Part 2에서 정리','복잡한 판단은 훅 (Part 3)'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, hot:['m','d1','d2','d3','d4','r4'], edges:[{f:'m',t:'d1',c:'ink',side:'h',o:0},{f:'d1',t:'d2',c:'muted',o:1},{f:'d2',t:'d3',c:'muted',o:2},{f:'d3',t:'d4',c:'muted',l:'일치 없음',o:3},{f:'d4',t:'r4',c:'muted',o:4}],
     stagger:0.4,
     snip:{hd:'현장에서 걸리는 지점',path:'',lines:['# Bash 패턴은 우회가 쉬움: 샌드박스와 함께','# 경로는 ./ 기준 상대 경로','# MCP는 mcp__서버명 단위','# 복잡한 판단은 훅으로'],hl:[],note:'규칙은 <b>문법</b>이고, 강제력은 다음 장의 <b>잠금 키</b>에서 나옵니다.'}}
  ], {legend:[['danger','거부'],['warning','사람 확인'],['success','바로 실행'],['muted','다음 단계로']]});
});
:::

:::notes
{timing: 1.25min}
[요약]
• 권한 규칙은 Managed, Project, User 등 모든 스코프에서 합쳐진 뒤 평가
• 평가 순서: deny, ask, allow, 일치 없음이면 권한 모드 기본 동작
• 어디에 있든 deny에 걸리면 거부
• 형식은 Tool(specifier), 경로는 ./ 상대 경로, MCP는 mcp__서버명 단위
• Bash 패턴은 우회가 쉬우니 샌드박스와 함께, 복잡한 판단은 훅으로

{cue: demo}
권한 규칙이 어떻게 평가되는지 단계별로 보겠습니다.
첫째, 규칙은 여러 스코프에 적혀 있지만 평가 전에 한 목록으로 합쳐집니다. 그래서 어느 파일에 있느냐보다 무엇이 있느냐가 중요합니다.
둘째, deny에 일치하면 바로 거부입니다. user에 allow가 있어도 managed에 deny가 있으면 거부됩니다.
셋째, ask에 일치하면 사람에게 묻고, 넷째, allow에 일치하면 묻지 않고 실행합니다.
마지막으로 어디에도 일치하지 않으면 현재 권한 모드의 기본 동작을 따릅니다.
오른쪽 문법을 보시면 형식은 Tool 괄호 지정자 하나입니다. 현장에서 자주 걸리는 지점은 Bash 패턴이 우회가 쉽다는 것인데요, 그래서 Part 3의 샌드박스와 함께 씁니다.

[약어]
• MCP: Model Context Protocol, 외부 시스템을 도구로 붙이는 표준
:::

---
<!-- Slide 6: Quick check 1 (PDF p8) -->
@type: content
@fit: off

## user allow, managed deny라면?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c3-qc-1">
  <p class="q">user settings에 allow "Bash(curl *)", managed에 deny "Bash(curl *)". 결과는?</p>
  <div class="opts">
    <button class="opt"><b>A</b>그대로 실행</button>
    <button class="opt"><b>B</b>확인 후 실행</button>
    <button class="opt right"><b>C</b>거부</button>
    <button class="opt"><b>D</b>나중 설정이 이김</button>
  </div>
  <p class="ans">정답 C. 권한 규칙은 합쳐지고, deny가 먼저 평가됩니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c3-qc-1'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 C, 거부
• 규칙은 합쳐진 뒤 deny가 먼저 평가되므로 user의 allow는 의미 없음

퀴즈입니다. user settings에는 curl을 허용하는 allow가, managed에는 같은 패턴의 deny가 있습니다. 결과는 무엇일까요?
{cue: pause}
정답은 C, 거부입니다. 방금 본 것처럼 규칙은 먼저 합쳐지고 deny가 가장 먼저 평가됩니다. 나중에 적은 설정이 이기는 방식이 아닙니다.
:::

---
<!-- Slide 7: Lock keys (PDF p9) -->
@type: content
@fit: off

## 조직이 거는 잠금 스위치 여섯 개
managed에 배포하는 잠금, 일부는 어느 설정 파일에나

:::html
<div class="fsi c3-keys">
  <div class="list" data-pick="c3-lock">
    <button class="pick" data-key="a"><span class="t">allowManagedPermissionRulesOnly</span><span class="k">규제 환경 기본</span></button>
    <button class="pick" data-key="b"><span class="t">permissions.disableBypassPermissionsMode</span><span class="k">항상</span></button>
    <button class="pick" data-key="c"><span class="t">allowManagedHooksOnly</span><span class="k">DLP 훅과 함께</span></button>
    <button class="pick" data-key="d"><span class="t">allowedHttpHookUrls</span><span class="k">감사 수집기만</span></button>
    <button class="pick" data-key="e"><span class="t">minimumVersion</span><span class="k">보안 수정 반영</span></button>
    <button class="pick" data-key="f"><span class="t">strictKnownMarketplaces</span><span class="k">Part 4</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-lock">
    <p class="hint">키를 누르면 효과와 권고가 나옵니다. managed settings로 배포하고, 일부 키는 어느 설정 파일에나 둘 수 있습니다.</p>
    <div data-for="a"><p class="eff">사용자, 프로젝트의 권한 규칙을 무시합니다.</p><p class="rec"><b>권고</b>규제 환경의 기본값으로 둡니다.</p></div>
    <div data-for="b"><p class="eff">권한 우회 모드(bypassPermissions)를 금지합니다.</p><p class="rec"><b>권고</b>항상 켭니다.</p></div>
    <div data-for="c"><p class="eff">managed와 허용된 훅만 실행합니다.</p><p class="rec"><b>권고</b>DLP 훅과 함께 써서 사용자가 훅을 끄거나 바꾸지 못하게 합니다.</p></div>
    <div data-for="d"><p class="eff">HTTP 훅이 보낼 수 있는 목적지를 제한합니다. 어느 설정 파일에나 둘 수 있고, 배열은 병합됩니다.</p><p class="rec"><b>권고</b>감사 수집기만 허용합니다.</p></div>
    <div data-for="e"><p class="eff">자동 업데이트가 이 버전 아래로 설치하지 않습니다. 어느 설정 파일에나 둘 수 있습니다.</p><p class="rec"><b>권고</b>보안 수정이 반영된 버전을 하한으로 둡니다.</p></div>
    <div data-for="f"><p class="eff">플러그인 출처를 허용 목록으로 제한합니다.</p><p class="rec"><b>권고</b>Part 4 확장 통제에서 다룹니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-lock'); });
:::

:::notes
{timing: 1min}
[요약]
• 잠금 스위치는 managed settings로 배포, 일부는 어느 설정 파일에나 둘 수 있음
• allowManagedPermissionRulesOnly: 사용자, 프로젝트 권한 규칙 무시 (규제 환경 기본)
• disableBypassPermissionsMode: 우회 모드 금지 (항상)
• allowManagedHooksOnly: managed와 허용된 훅만, allowedHttpHookUrls: 목적지 제한 (어느 파일에나, 배열 병합)
• minimumVersion: 자동 업데이트 하한 (어느 파일에나), strictKnownMarketplaces: 플러그인 출처

규칙이 문법이라면 강제력은 잠금 스위치에서 나옵니다. managed settings로 배포하는 스위치들이고, 일부는 어느 설정 파일에나 둘 수 있습니다.
{cue: demo}
하나씩 열어 보면, allowManagedPermissionRulesOnly는 사용자와 프로젝트의 권한 규칙을 아예 무시합니다. 규제 환경이라면 기본으로 권합니다.
disableBypassPermissionsMode는 모든 확인을 생략하는 우회 모드를 금지합니다. 이건 항상 켜시길 권합니다.
allowManagedHooksOnly는 Part 3의 DLP 훅과 짝입니다. 사용자가 훅을 끄거나 바꾸지 못하게 합니다. allowedHttpHookUrls는 HTTP 훅이 감사 수집기로만 가게 하고, minimumVersion은 자동 업데이트가 그 버전 아래로는 설치하지 않게 합니다. 이 두 키는 어느 설정 파일에나 둘 수 있습니다.
strictKnownMarketplaces는 Part 4에서 다시 봅니다.
:::

---
<!-- Slide 8: Part 02 divider (PDF p10) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 03 / PART 02</span>
  <div class="name">auto mode와 안전의 경계</div>
  <p class="what">auto mode, 승인 피로와 사고 사이</p>
  <ol>
    <li><b>01</b>승인 피로와 권한 모드</li>
    <li><b>02</b>auto mode 판정 순서</li>
    <li><b>03</b>승인 추가와 분류기 모델</li>
    <li><b>04</b>어디까지 허용할까</li>
  </ol>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• Part 2는 auto mode와 안전의 경계
• 승인 피로, 권한 모드, auto mode 판정 순서, 승인 추가, 분류기 모델, 경계 설계

두 번째 Part는 auto mode와 안전의 경계입니다. 승인을 많이 받는 것이 정말 안전한지부터 질문해 보겠습니다.
:::

---
<!-- Slide 9: Approval fatigue (PDF p11) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">APPROVAL FATIGUE</span>
  <div class="big">확인 창이 많으면<br>사람은 <em>읽지 않고</em> 누릅니다</div>
  <p class="lead">프롬프트 수를 줄이는 것이 오히려 안전을 높일 수 있습니다.</p>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• 확인 창이 많으면 사람은 읽지 않고 누름 (승인 피로)
• 프롬프트 수를 줄이는 것이 오히려 안전을 높일 수 있음

{cue: pause}
확인 창이 너무 자주 뜨면 어떻게 될까요. 사람은 읽지 않고 누르게 됩니다.
그래서 확인을 많이 받는 것이 곧 안전은 아닙니다. 정말 봐야 할 것만 사람에게 묻고, 나머지는 장치에 맡기는 것이 오히려 안전을 높입니다. auto mode가 그 장치입니다.
:::

---
<!-- Slide 10: Permission modes (PDF p12) -->
@type: content
@fit: off

## 모드는 묻지 않는 범위를 정한다
권한 모드 한눈에, Bedrock 대화형 세션은 v2.1.283 이상에서 auto로 시작

:::html
<div class="fsi c3-keys">
  <div class="list" data-pick="c3-modes">
    <button class="pick" data-key="def"><span class="t">default (Manual)</span><span class="k">처음 보는 저장소</span></button>
    <button class="pick" data-key="ae"><span class="t">acceptEdits</span><span class="k">반복 편집</span></button>
    <button class="pick" data-key="plan"><span class="t">plan</span><span class="k">설계 검토</span></button>
    <button class="pick" data-key="auto"><span class="t">auto</span><span class="k">일상 개발</span></button>
    <button class="pick" data-key="da"><span class="t">dontAsk</span><span class="k">CI, 헤드리스</span></button>
    <button class="pick" data-key="bp"><span class="t">bypassPermissions</span><span class="k">격리 환경만</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-modes">
    <p class="hint">모드를 누르면 묻지 않고 실행하는 범위와 맞는 경우가 나옵니다.</p>
    <div data-for="def"><p class="eff">묻지 않는 것: 읽기만</p><p class="rec"><b>맞는 경우</b>처음 보는 저장소, 운영 환경</p></div>
    <div data-for="ae"><p class="eff">묻지 않는 것: 읽기, 파일 편집, mkdir, mv, cp 같은 파일 명령</p><p class="rec"><b>맞는 경우</b>익숙한 저장소의 반복 편집</p></div>
    <div data-for="plan"><p class="eff">묻지 않는 것: 읽기, 그리고 (auto 가능 시) 분류기가 승인한 명령</p><p class="rec"><b>맞는 경우</b>설계 검토, 큰 변경 전</p></div>
    <div data-for="auto"><p class="eff">묻지 않는 것: 전부, 백그라운드 안전 검사와 함께</p><p class="rec"><b>맞는 경우</b>경계 설정을 마친 뒤 일상 개발</p></div>
    <div data-for="da"><p class="eff">묻지 않는 것: 작업 폴더 읽기와 사전 승인 도구만, 나머지는 거부</p><p class="rec"><b>맞는 경우</b><span class="rp-detail" tabindex="0" data-tip="Continuous Integration. 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인">CI</span>, 헤드리스</p></div>
    <div data-for="bp"><p class="eff">묻지 않는 것: 전부, 검사 없음</p><p class="rec"><b>맞는 경우</b>격리된 컨테이너, VM만</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-modes'); });
:::

:::notes
{timing: 0.5min}
[요약]
• 모드는 묻지 않고 실행하는 범위를 정함
• default는 읽기만, acceptEdits는 파일 편집과 파일 명령까지, plan은 읽기와 분류기가 승인한 명령
• auto는 전부 실행하되 백그라운드 안전 검사, Bedrock 대화형 세션은 v2.1.283 이상에서 auto로 시작
• dontAsk는 사전 승인 도구만, bypassPermissions는 격리된 컨테이너, VM만

Ch1에서 본 권한 모드를 이번에는 묻지 않고 실행하는 범위로 다시 정리합니다.
{cue: demo}
auto를 먼저 눌러 보겠습니다. 전부 실행하되 뒤에서 안전 검사가 함께 돕니다. Bedrock 대화형 세션은 v2.1.283 이상에서 이 모드로 시작합니다.
default는 읽기만 묻지 않고, acceptEdits는 파일 편집과 mkdir, mv, cp 같은 파일 명령까지 묻지 않습니다. plan은 읽기와, auto를 쓸 수 있으면 분류기가 승인한 명령까지입니다.
dontAsk는 사전 승인 도구만 쓰고 나머지는 거부하니 CI에 맞고, bypassPermissions는 검사가 전혀 없으니 격리된 컨테이너나 VM에서만 씁니다.
:::

---
<!-- Slide 11: Auto mode two gates (PDF p13) -->
@type: content
@fit: off

## 권한 규칙이 첫 문, 분류기가 둘째 문
auto mode의 판정 순서

:::html
<div id="c3-sv-auto"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var RQ = {id:'rq',x:10,y:200,w:190,h:84,t:'도구 호출',s:'Bash, Edit 등',c:'accent'};
  var G1 = {id:'g1',x:230,y:200,w:210,h:84,t:'permissions.deny',c:'danger'};
  var G2 = {id:'g2',x:460,y:200,w:210,h:84,t:'permissions.ask',c:'warning'};
  var G3 = {id:'g3',x:690,y:200,w:210,h:84,t:'좁은 allow',s:'작업 폴더 안',c:'success'};
  var G4 = {id:'g4',x:950,y:200,w:210,h:84,t:'분류기',s:'별도 모델 호출',c:'info'};
  var O1 = {id:'o1',x:230,y:360,w:210,h:76,t:'즉시 거부',s:'분류기도 못 풂',c:'danger'};
  var O2 = {id:'o2',x:460,y:360,w:210,h:76,t:'항상 사람 확인',s:'분류기가 대신 못 함',c:'warning'};
  var O3 = {id:'o3',x:690,y:360,w:210,h:76,t:'바로 실행',s:'분류기 생략',c:'success'};
  var O4 = {id:'o4',x:950,y:360,w:210,h:76,t:'차단 또는 허용',c:'info'};
  var N = [RQ,G1,G2,G3,G4,O1,O2,O3,O4];
  var Z = [{x:220,y:150,w:690,h:300,l:'GATE 1 권한 규칙'},{x:930,y:150,w:240,h:300,l:'GATE 2',tone:'info'}];
  var chain = function (k) { var e = [{f:'rq',t:'g1',c:'accent',o:0}]; var ids = ['g1','g2','g3','g4']; for (var i = 0; i < k; i++) e.push({f:ids[i],t:ids[i+1],c:'muted',o:i+1}); return e; };
  F.stepviz('#c3-sv-auto', [
    {kicker:'OVERVIEW', title:'문이 두 개입니다',
     body:'auto mode에서도 <b>deny와 ask는 분류기보다 먼저</b> 평가됩니다. 권한 규칙이 첫 번째 문, 분류기가 두 번째 문입니다.',
     facts:['1 permissions.deny','2 permissions.ask','3 좁은 allow, 작업 폴더','4 분류기'],
     zones:Z, nodes:N, hot:['rq','g1','g2','g3','g4'], edges:chain(3), stagger:0.5,
     snip:{hd:'판정 순서',path:'auto mode',lines:['1 permissions.deny   즉시 거부','2 permissions.ask    항상 사람에게 확인','3 좁은 allow, 작업 폴더  분류기를 거치지 않음','4 분류기             별도 모델이 판정'],hl:[1,2,3,4],note:'<b>Bash(*)</b> 같은 넓은 allow는 auto 동안 <b>정지</b>됩니다.'}},
    {kicker:'GATE 1-1', title:'deny는 누구도 못 풉니다',
     body:'permissions.deny에 걸리면 <b>즉시 거부</b>입니다. 분류기도, 사용자의 의도 표현도 풀지 못합니다.',
     facts:['분류기, 사용자 의도로 못 풂','가장 단단한 경계','고객 원장 경로, 운영 DB 도구 등'],
     zones:Z, nodes:N, hot:['rq','g1','o1'], edges:[{f:'rq',t:'g1',c:'accent',o:0},{f:'g1',t:'o1',c:'danger',o:1}],
     snip:{hd:'예시',path:'permissions',lines:['"deny": ["Read(./secrets/**)"]'],hl:[1],note:'deny는 auto mode에서도 <b>첫 번째</b>입니다.'}},
    {kicker:'GATE 1-2', title:'ask는 분류기가 대신 못 합니다',
     body:'permissions.ask에 걸리면 <b>항상 사람에게</b> 확인합니다. 분류기가 안전하다고 판단해도 대신 승인하지 못합니다.',
     facts:['사람 확인이 반드시 필요한 동작','git push, PR 생성, 배포 스크립트','auto에서도 그대로 확인 창'],
     zones:Z, nodes:N, hot:['rq','g1','g2','o2'], edges:chain(1).concat([{f:'g2',t:'o2',c:'warning',o:2}]),
     snip:{hd:'예시',path:'permissions',lines:['"ask": ["Bash(git push *)", "Bash(gh pr create *)"]'],hl:[1],note:'"push만은 꼭 묻게" 하고 싶다면 <b>ask</b>입니다.'}},
    {kicker:'GATE 1-3', title:'좁은 allow는 바로 통과합니다',
     body:'<b>Bash(npm test)</b> 같은 좁은 allow와 읽기, 작업 폴더 안 편집은 <b>분류기를 거치지 않고</b> 실행합니다.',
     facts:['분류기 호출이 없어 빠르고 비용 없음','Bash(*) 같은 넓은 allow는 auto 동안 정지','좁게 적을수록 안전'],
     zones:Z, nodes:N, hot:['rq','g1','g2','g3','o3'], edges:chain(2).concat([{f:'g3',t:'o3',c:'success',o:3}]), stagger:0.4,
     snip:{hd:'예시',path:'permissions',lines:['"allow": ["Bash(npm test)"]','','# 넓은 패턴은 auto 동안 정지','"allow": ["Bash(*)"]'],hl:[1],note:'넓게 열어 둔 allow는 auto에서 <b>효과가 없습니다</b>.'}},
    {kicker:'GATE 2', title:'남은 것은 분류기가 판정합니다',
     body:'앞의 문을 모두 지난 호출은 <b>분류기</b>가 판정합니다. 순서는 <b>hard_deny, soft_deny, allow 예외, 사용자 명시 의도</b>입니다.',
     facts:['hard_deny: 무조건 막음','soft_deny: 막되 명시 의도로 풀림','allow 예외, 사용자 명시 의도 순'],
     zones:Z, nodes:N, hot:['rq','g4','o4'], edges:chain(3).concat([{f:'g4',t:'o4',c:'info',o:4}]), stagger:0.4,
     snip:{hd:'분류기 판정 순서',path:'GATE 2',lines:['hard_deny','soft_deny','allow 예외','사용자 명시 의도'],hl:[1,2,3,4],note:'분류기는 <b>별도 모델 호출</b>입니다. 어떤 모델을 쓰는지는 뒤에서 봅니다.'}}
  ], {legend:[['danger','거부'],['warning','사람 확인'],['success','바로 실행'],['info','분류기 판정']]});
});
:::

:::notes
{timing: 0.75min}
[요약]
• auto mode에서도 deny와 ask가 분류기보다 먼저 평가
• deny는 즉시 거부, 분류기나 사용자 의도로 못 풂
• ask는 항상 사람 확인, 분류기가 대신 승인 못 함
• 좁은 allow와 읽기, 작업 폴더 편집은 분류기 생략, Bash(*) 같은 넓은 allow는 정지
• 분류기 판정: hard_deny, soft_deny, allow 예외, 사용자 명시 의도 순

{cue: demo}
auto mode가 어떻게 판정하는지 보겠습니다. 문이 두 개라고 기억하시면 됩니다.
첫 번째 문은 Part 1에서 본 권한 규칙입니다. deny에 걸리면 즉시 거부이고, 분류기나 사용자의 의도로도 풀지 못합니다. ask에 걸리면 분류기가 안전하다고 봐도 반드시 사람에게 묻습니다.
Bash npm test처럼 좁게 허용한 명령과 읽기, 작업 폴더 안 편집은 분류기를 거치지 않고 바로 실행합니다. 대신 Bash 별표처럼 넓은 allow는 auto 동안 정지됩니다.
두 번째 문이 분류기입니다. hard_deny, soft_deny, allow 예외, 사용자 명시 의도 순서로 판정합니다.
:::

---
<!-- Slide 12: Classifier defaults (PDF p14) -->
@type: content
@fit: off

## 설정하지 않아도 막는 네 가지
분류기가 기본으로 막는 것과 통과시키는 것

:::html
<div class="fsi c3-cats">
  <div class="fsi-grid-4" data-pick="c3-cats">
    <button class="pick" data-key="exec"><span class="k">EXEC</span><span class="t">외부 코드 실행</span></button>
    <button class="pick" data-key="exfil"><span class="k">EXFIL</span><span class="t">데이터 반출</span></button>
    <button class="pick" data-key="destroy"><span class="k">DESTROY</span><span class="t">되돌릴 수 없는 일</span></button>
    <button class="pick" data-key="prod"><span class="k">PROD</span><span class="t">운영</span></button>
  </div>
  <div class="lower">
    <div class="panel" data-pick-panel="c3-cats">
      <p class="hint">범주를 누르면 분류기가 기본으로 막는 예가 나옵니다.</p>
      <div data-for="exec"><h4>외부 코드 실행</h4><p>curl | bash 같은 다운로드 후 실행</p></div>
      <div data-for="exfil"><h4>데이터 반출</h4><p>민감 데이터 외부 전송, 라이브 자격증명 출력</p></div>
      <div data-for="destroy"><h4>되돌릴 수 없는 일</h4><p>force push, git reset --hard, terraform destroy, 클라우드 대량 삭제</p></div>
      <div data-for="prod"><h4>운영</h4><p>운영 배포, 마이그레이션, prod 이름의 원격 대상</p></div>
    </div>
    <div class="pass">
      <div><span class="tag ok">통과</span>작업 폴더 파일 작업</div>
      <div><span class="tag ok">통과</span>lock 파일에 선언된 의존성 설치</div>
      <div><span class="tag ok">통과</span>읽기 전용 HTTP</div>
      <div><span class="tag no">특수</span>rm 루트, 홈, 작업 폴더는 훅 allow로도 불가</div>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-cats'); });
:::

:::notes
{timing: 0.25min}
[요약]
• 분류기는 설정하지 않아도 네 범주를 기본으로 막음
• EXEC 외부 코드 실행, EXFIL 데이터 반출, DESTROY 되돌릴 수 없는 일, PROD 운영
• 작업 폴더 파일 작업, lock 파일 의존성 설치, 읽기 전용 HTTP는 통과
• rm 루트, 홈, 작업 폴더는 훅 allow로도 불가

분류기는 아무것도 설정하지 않아도 기본으로 막는 규칙을 갖고 있습니다.
{cue: demo}
네 범주를 눌러 보겠습니다. 외부 코드 실행, 예를 들어 curl로 받아 bash로 바로 실행하는 것. 데이터 반출, 민감 데이터를 밖으로 보내거나 살아 있는 자격증명을 출력하는 것. 되돌릴 수 없는 일, force push나 terraform destroy. 그리고 운영 배포와 마이그레이션입니다.
오른쪽처럼 작업 폴더 파일 작업, lock 파일에 선언된 의존성 설치, 읽기 전용 HTTP는 통과합니다. 루트나 홈, 작업 폴더를 지우는 rm은 훅으로 허용해도 불가합니다.
:::

---
<!-- Slide 13: Adding approvals (PDF p15) -->
@type: content
@fit: off

## 확인 창이 반복되면 무엇을 고칠까
승인을 추가하는 여섯 가지 방법

:::html
<div class="fsi c3-keys">
  <div class="list" data-pick="c3-approve">
    <button class="pick" data-key="env"><span class="t">autoMode.environment</span><span class="k">가장 먼저</span></button>
    <button class="pick" data-key="allow"><span class="t">autoMode.allow</span><span class="k">soft_deny 예외</span></button>
    <button class="pick" data-key="perm"><span class="t">permissions.allow (좁게)</span><span class="k">분류기 전 승인</span></button>
    <button class="pick" data-key="talk"><span class="t">대화에서 명시</span><span class="k">그 턴</span></button>
    <button class="pick" data-key="retry"><span class="t">/permissions, Recently blocked</span><span class="k">세션</span></button>
    <button class="pick" data-key="tab"><span class="t">/permissions, Auto mode 탭</span><span class="k">v2.1.246+</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-approve">
    <p class="hint">방법을 누르면 어디에 적는지와 효과가 나옵니다.</p>
    <div data-for="env"><p class="eff">사내 Git, 도메인, 버킷을 "내부"로 알립니다.</p><p class="rec"><b>어디에</b>사용자 또는 managed settings. 가장 먼저 쓸 방법입니다.</p></div>
    <div data-for="allow"><p class="eff">soft_deny의 예외를 문장으로 추가합니다. 예: 스테이징 배포</p><p class="rec"><b>어디에</b>사용자 또는 managed settings</p></div>
    <div data-for="perm"><p class="eff">Bash(npm test)처럼 분류기 전에 즉시 승인합니다.</p><p class="rec"><b>어디에</b>모든 스코프</p></div>
    <div data-for="talk"><p class="eff">정확한 행동을 지시하면 soft_deny를 넘깁니다.</p><p class="rec"><b>범위</b>해당 턴에만 적용</p></div>
    <div data-for="retry"><p class="eff">막힌 동작을 승인해 재시도합니다.</p><p class="rec"><b>범위</b>그 세션</p></div>
    <div data-for="tab"><p class="eff">파일을 직접 열지 않고 항목을 편집합니다.</p><p class="rec"><b>어디에</b>~/.claude/settings.json (v2.1.246+)</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-approve'); });
:::

:::notes
{timing: 0.5min}
[요약]
• 확인 창이 반복되면 autoMode.environment부터 고침 (사내 Git, 도메인, 버킷을 내부로 알림)
• autoMode.allow: soft_deny 예외를 문장으로, permissions.allow: 좁게 즉시 승인
• 대화에서 명시는 해당 턴만, /permissions Recently blocked에서 막힌 동작을 승인해 재시도
• /permissions Auto mode 탭으로 파일 없이 편집 (v2.1.246+)

auto mode를 쓰다 보면 같은 확인 창이 반복될 때가 있습니다. 그때 무엇을 고칠지 고르는 표입니다.
{cue: demo}
가장 먼저 쓸 것은 autoMode.environment입니다. 사내 Git, 사내 도메인, 버킷을 내부라고 알려 주면 분류기가 그 안의 동작을 반출로 보지 않습니다.
그래도 막히는 정상 작업은 autoMode.allow에 예외를 문장으로 추가하고, 테스트처럼 확실한 명령은 permissions.allow에 좁게 넣습니다.
대화에서 정확히 지시하면 그 턴에 한해 soft_deny를 넘기고, /permissions의 Recently blocked에서 막힌 동작을 승인해 다시 시도할 수도 있습니다.
:::

---
<!-- Slide 14: Bank example autoMode (PDF p16) -->
@type: content
@fit: off

## 규칙은 신입에게 설명하듯 쓴다
금융사 예시, autoMode 설정 (항목은 정규식이 아니라 문장)

:::html
<div class="fsi c3-codepick c3-wide">
  <div class="code">
    <span class="path">~/.claude/settings.json 또는 managed-settings.json (예시: ACME Bank)</span>
    <pre id="c3-pre-auto"></pre>
  </div>
  <div class="pts" data-pick="c3-auto-cfg">
    <p class="hint">위 항목을 누르면 아래 코드의 해당 줄이 켜집니다.</p>
    <button class="pick" data-key="perm"><span class="t">deny, ask가 먼저</span><span class="d">push, PR 생성은 사람 확인, secrets는 거부</span></button>
    <button class="pick" data-key="env"><span class="t">신뢰 범위와 민감 위치</span><span class="d">"$defaults"를 빼면 그 목록의 기본 규칙이 전부 사라짐</span></button>
    <button class="pick" data-key="deny"><span class="t">soft_deny, hard_deny</span><span class="d">마이그레이션은 막되 풀림, 외부 API 전송은 무조건 차단</span></button>
    <button class="pick" data-key="check"><span class="t">꼭 지킬 것</span><span class="d">프로젝트 설정에서는 읽지 않음, claude auto-mode config와 critique로 확인</span></button>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  window.__c3codepick(F, 'c3-auto-cfg', 'c3-pre-auto', [
    '{',
    '  "permissions": {',
    '    "ask":  ["Bash(git push *)", "Bash(gh pr create *)"],',
    '    "deny": ["Read(./secrets/**)"]',
    '  },',
    '  "autoMode": {',
    '    "environment": [',
    '      "$defaults",',
    '      "Organization: ACME Bank. Primary use: software development",',
    '      "Source control: git.corp.example/acme and all repos under it",',
    '      "Trusted internal domains: *.corp.example",',
    '      "Sensitive data locations & audiences: s3://acme-customer-pii holds customer PII, never leaves the bank",',
    '      "Sensitive remote targets: namespaces prod-*, hosts *.prod.corp.example"',
    '    ],',
    '    "soft_deny": ["$defaults", "Never run DB migrations outside the migration pipeline"],',
    '    "hard_deny": ["$defaults", "Never send repository contents to third-party APIs"]',
    '  }',
    '}'
  ], { perm:[2,3,4,5], env:[7,8,9,10,11,12,13,14], deny:[15,16], check:[6,8,15,16] });
});
:::

:::notes
{timing: 0.5min}
[요약]
• autoMode 항목은 정규식이 아니라 신입에게 설명하듯 쓰는 문장
• environment에 조직, 소스 저장소, 신뢰 도메인, 민감 데이터 위치, 민감 원격 대상
• "$defaults"를 빼면 그 목록의 기본 규칙이 전부 사라짐
• autoMode는 프로젝트 .claude/settings.json에서 읽지 않음 (저장소 주입 방지)
• claude auto-mode config로 적용 결과, claude auto-mode critique로 규칙 리뷰

금융사 예시 설정입니다. 가장 중요한 특징은 항목이 정규식이 아니라 문장이라는 점입니다. 신입 직원에게 설명하듯 씁니다.
{cue: demo}
위 항목을 하나씩 누르면 아래 코드의 해당 줄이 켜집니다. push와 PR 생성은 ask로, secrets 폴더는 deny로 둡니다.
environment에는 조직, 소스 저장소, 신뢰 도메인, 그리고 고객 PII가 있는 버킷과 운영 대상을 적습니다. 여기서 꼭 지킬 것은 "$defaults"를 남기는 것입니다. 빼면 그 목록의 기본 규칙이 전부 사라집니다.
또 autoMode는 프로젝트 settings 파일에서는 읽지 않습니다. 저장소가 규칙을 몰래 바꾸는 것을 막기 위해서입니다. 적용 결과는 claude auto-mode config로, 규칙 리뷰는 critique로 확인합니다.

[약어]
• PII: Personally Identifiable Information, 개인 식별 정보
:::

---
<!-- Slide 15: Classifier model selection (PDF p17) -->
@type: content
@fit: off

## 분류기 모델은 위에서부터 먼저 맞는 것
판정은 별도 모델 호출, 어떤 모델이 쓰이는지 따라가 보기

:::html
<div class="fsi c3-ladder" id="c3-ladder">
  <div class="rung"><span class="n">1</span><span class="w">CLAUDE_CODE_AUTO_MODE_MODEL에 전체 모델 ID</span><span class="r"><b>지정한 모델</b>, v2.1.302+, 추론 프로필 ID. Sonnet 5.5, Opus 5.5, Opus 5는 무시</span></div>
  <div class="rung"><span class="n">2</span><span class="w">Anthropic이 설정한 분류기 모델</span><span class="r"><b>그 모델</b>, 계정별</span></div>
  <div class="rung"><span class="n">3</span><span class="w">ANTHROPIC_DEFAULT_SONNET_MODEL 설정</span><span class="r"><b>그 값</b>, 단 Sonnet 5.5, Opus 5.5면 Sonnet 5. 이 랩: 기본 분류기 모델 (--debug-file, /status로 확인)</span></div>
  <div class="rung"><span class="n">4</span><span class="w">그 밖</span><span class="r"><b>Sonnet 5</b>, 기본값</span></div>
  <div class="ctl">
    <button class="btn btn-primary" data-cycle>다음 경우 보기</button>
    <span class="case" id="c3-ladder-case"></span>
  </div>
  <p class="cap">폴백: 지정 모델이 무시, 제외되면 기본 분류기. 실패: 공급자가 못 주면 각 동작 거부. Bedrock: Sonnet 5 미활성이면 세션 모델로 폴백.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var host = document.querySelector('.slide-deck #c3-ladder') || document.getElementById('c3-ladder');
  var rungs = Array.prototype.slice.call(host.querySelectorAll('.rung'));
  var cases = [
    { hit: 0, t: '예: 환경 변수에 전체 모델 ID(추론 프로필 ID)를 지정한 경우, 1번에서 결정. 단 Sonnet 5.5, Opus 5.5, Opus 5는 무시됩니다' },
    { hit: 2, t: '예: ANTHROPIC_DEFAULT_SONNET_MODEL을 설정한 경우, 3번에서 결정. 이 랩의 실제 분류기 모델은 <b>--debug-file</b>과 <b>/status</b>로 확인' },
    { hit: 3, t: '예: 아무것도 설정하지 않은 경우, 4번 <b>Sonnet 5</b> 기본값' }
  ];
  host.classList.add('run');
  F.cycle('#c3-ladder', cases.length, function (i) {
    var c = cases[i];
    rungs.forEach(function (r, j) { r.classList.toggle('hit', j === c.hit); r.classList.toggle('pass', j < c.hit); });
    document.getElementById('c3-ladder-case').innerHTML = c.t;
  });
});
:::

:::notes
{timing: 0.5min}
[요약]
• 분류기 판정은 별도 모델 호출, 위에서부터 먼저 맞는 조건의 모델을 씀
• 1 CLAUDE_CODE_AUTO_MODE_MODEL 전체 ID (v2.1.302+, 추론 프로필 ID), Sonnet 5.5, Opus 5.5, Opus 5는 무시
• 3 ANTHROPIC_DEFAULT_SONNET_MODEL 값, 단 Sonnet 5.5, Opus 5.5면 Sonnet 5
• 이 랩의 분류기 모델은 --debug-file과 /status로 확인
• 폴백: 무시, 제외되면 기본 분류기. 실패: 각 동작 거부. Bedrock: Sonnet 5 미활성이면 세션 모델

분류기는 세션 모델과 별개의 모델 호출입니다. 어떤 모델이 쓰이는지는 위에서부터 먼저 맞는 조건으로 정해집니다.
{cue: demo}
버튼으로 경우를 바꿔 보겠습니다. 환경 변수에 전체 모델 ID를 지정하면 1번에서 결정되는데, Sonnet 5.5, Opus 5.5, Opus 5를 지정하면 무시됩니다. ANTHROPIC_DEFAULT_SONNET_MODEL을 설정했다면 3번이고, 이 랩에서 실제로 어떤 모델이 쓰이는지는 --debug-file과 /status로 확인합니다. 아무것도 없으면 기본값 Sonnet 5입니다.
Bedrock에서 Sonnet 5가 활성화되지 않았다면 세션 모델로 폴백됩니다. 그래서 짐작하지 말고 확인하는 것이 중요합니다.
:::

---
<!-- Slide 16: Classifier cost and latency (PDF p18) -->
@type: content
@fit: off

## 분류기 호출도 토큰이다
Bedrock에서의 분류기 비용과 지연, 드는 것과 아끼는 것

:::html
<div class="fsi c3-two">
  <div class="col warn">
    <h4>드는 것</h4>
    <div class="it">판정마다 대화 일부 + 실행할 동작을 전송</div>
    <div class="it">셸, 네트워크 명령마다 왕복 지연</div>
    <div class="it">classifyAllShell: true면 모든 셸 명령이 판정 대상</div>
    <div class="it">분류기 모델이 크면 비용도 큼</div>
  </div>
  <div class="col">
    <h4>아끼는 것</h4>
    <div class="it">읽기, 작업 폴더 편집은 분류기 생략</div>
    <div class="it">사람이 기다리는 시간이 사라짐</div>
    <div class="it">승인 피로로 인한 실수 감소</div>
    <div class="it">작은 분류기 모델로 비용 조절</div>
  </div>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• Bedrock에서는 분류기 호출도 토큰 사용량
• 판정마다 대화 일부와 동작을 전송, 셸과 네트워크 명령마다 왕복 지연
• 읽기와 작업 폴더 편집은 분류기 생략, 작은 분류기 모델로 비용 조절

한 가지 짚을 점은, Bedrock에서는 분류기 호출도 토큰 사용량이라는 것입니다.
판정마다 대화 일부와 실행할 동작을 보내고, 셸이나 네트워크 명령마다 왕복 지연이 생깁니다. classifyAllShell을 켜면 모든 셸 명령이 판정 대상이 됩니다.
반대로 읽기와 작업 폴더 편집은 분류기를 건너뛰고, 사람이 기다리는 시간과 승인 피로로 인한 실수가 줄어듭니다. 비용은 작은 분류기 모델로 조절합니다. 이 비용 이야기는 Ch6에서 이어집니다.
:::

---
<!-- Slide 17: Boundary design (PDF p19) -->
@type: content
@fit: off

## 단단한 경계일수록 앞쪽 장치에
어디까지 허용할까, 경계 설계 여섯 단계

:::html
<div class="fsi c3-keys c3-bound">
  <div class="list" data-pick="c3-bound">
    <button class="pick" data-key="1"><span class="lv">1</span><span class="t">절대 안 됨 (누구도 못 풂)</span></button>
    <button class="pick" data-key="2"><span class="lv">2</span><span class="t">사람이 반드시 확인</span></button>
    <button class="pick" data-key="3"><span class="lv">3</span><span class="t">분류기가 무조건 막음</span></button>
    <button class="pick" data-key="4"><span class="lv">4</span><span class="t">막되 명시 의도로 풀림</span></button>
    <button class="pick" data-key="5"><span class="lv">5</span><span class="t">신뢰 범위 안은 통과</span></button>
    <button class="pick" data-key="6"><span class="lv">6</span><span class="t">이번 세션만</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-bound">
    <p class="hint">경계를 누르면 장치와 금융권 예가 나옵니다. 위로 갈수록 단단합니다.</p>
    <div data-for="1"><p class="eff"><code>managed permissions.deny</code></p><p class="rec"><b>금융권 예</b>고객 원장 경로 읽기, 운영 DB 접속 도구</p></div>
    <div data-for="2"><p class="eff"><code>permissions.ask</code></p><p class="rec"><b>금융권 예</b>git push, PR 생성, 배포 스크립트</p></div>
    <div data-for="3"><p class="eff"><code>autoMode.hard_deny</code></p><p class="rec"><b>금융권 예</b>저장소 내용을 외부 API로 전송</p></div>
    <div data-for="4"><p class="eff"><code>autoMode.soft_deny</code></p><p class="rec"><b>금융권 예</b>마이그레이션, 대량 삭제</p></div>
    <div data-for="5"><p class="eff"><code>autoMode.environment</code>, <code>allow</code></p><p class="rec"><b>금융권 예</b>사내 Git, 사내 도메인, 스테이징</p></div>
    <div data-for="6"><p class="eff">대화로 선언</p><p class="rec"><b>금융권 예</b>"검토 전까지 push 금지". 압축되면 사라질 수 있습니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-bound'); });
:::

:::notes
{timing: 0.25min}
[요약]
• 단단한 경계일수록 앞쪽 장치에 둠
• 절대 안 됨은 managed deny, 사람 확인은 ask, 무조건 차단은 hard_deny
• 막되 풀림은 soft_deny, 신뢰 범위는 environment와 allow
• 대화로 한 선언은 그 세션만, 압축되면 사라질 수 있음

경계를 설계할 때의 원칙은 하나입니다. 단단한 경계일수록 앞쪽 장치에 둡니다.
{cue: demo}
위에서부터 보면, 누구도 풀 수 없어야 하는 고객 원장 읽기나 운영 DB 도구는 managed deny. 사람이 반드시 봐야 하는 push와 배포는 ask. 저장소 내용을 외부 API로 보내는 것은 hard_deny로 분류기가 무조건 막고, 마이그레이션과 대량 삭제는 soft_deny로 막되 명시하면 풉니다.
마지막, 대화로 "검토 전까지 push 금지"라고 선언하는 것은 그 세션에만 유효하고, 대화가 압축되면 사라질 수 있습니다. 중요한 경계를 대화에 맡기면 안 되는 이유입니다.
:::

---
<!-- Slide 18: Org locks for auto mode (PDF p20) -->
@type: content
@fit: off

## 조직은 auto mode도 잠근다
managed settings로 auto mode를 다루는 키

:::html
<div class="fsi c3-keys">
  <div class="list" data-pick="c3-autolock">
    <button class="pick" data-key="a"><span class="t">permissions.disableAutoMode: "disable"</span></button>
    <button class="pick" data-key="b"><span class="t">autoMode (managed)</span></button>
    <button class="pick" data-key="c"><span class="t">autoMode.classifyAllShell: true</span></button>
    <button class="pick" data-key="d"><span class="t">useAutoModeDuringPlan: false</span></button>
    <button class="pick" data-key="e"><span class="t">permissions.disableBypassPermissionsMode</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-autolock">
    <p class="hint">키를 누르면 효과가 나옵니다.</p>
    <div data-for="a"><p class="eff">Shift+Tab 순환에서 auto를 제거합니다.</p><p class="rec"><b>참고</b>--permission-mode auto로 실행해도 Manual로 시작합니다.</p></div>
    <div data-for="b"><p class="eff">조직의 신뢰 범위와 규칙을 배포합니다.</p><p class="rec"><b>참고</b>개발자는 항목 추가만 할 수 있고 삭제는 못 합니다.</p></div>
    <div data-for="c"><p class="eff">좁은 Bash allow도 정지하고, 모든 셸 명령을 분류기로 보냅니다.</p></div>
    <div data-for="d"><p class="eff">plan 모드에서는 분류기 대신 확인 창을 띄웁니다.</p></div>
    <div data-for="e"><p class="eff">bypassPermissions를 금지합니다.</p><p class="rec"><b>참고</b>Ch2에서 배포했습니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-autolock'); });
:::

:::notes
{timing: 0.25min}
[요약]
• disableAutoMode: "disable"로 auto 제거, --permission-mode auto도 Manual로 시작
• managed autoMode로 신뢰 범위 배포, 개발자는 추가만 가능
• classifyAllShell: true는 모든 셸 명령을 분류기로, useAutoModeDuringPlan: false는 plan에서 확인 창

조직은 auto mode 자체도 정책으로 다룹니다.
{cue: demo}
auto를 아직 허용하지 않는 조직이라면 disableAutoMode로 순환에서 빼 버립니다. 허용한다면 managed autoMode로 신뢰 범위를 배포하는데, 개발자는 항목을 추가만 하고 지울 수는 없습니다.
더 엄격하게 하려면 classifyAllShell로 모든 셸 명령을 분류기에 보내고, plan 모드에서는 확인 창을 띄우게 할 수도 있습니다.
:::

---
<!-- Slide 19: Operating auto mode (PDF p21) -->
@type: content
@fit: off

## auto mode가 스스로 멈추는 때
운영할 때 알아둘 것과 남기는 기록

:::html
<div class="fsi c3-ops">
  <div class="fsi-grid-4" data-pick="c3-ops">
    <button class="pick" data-key="cir"><span class="k">CIRCUIT</span><span class="t">연속 차단 시 복귀</span></button>
    <button class="pick" data-key="sub"><span class="k">SUBAGENT</span><span class="t">Subagent</span></button>
    <button class="pick" data-key="aud"><span class="k">AUDIT</span><span class="t">기록</span></button>
    <button class="pick" data-key="bed"><span class="k">BEDROCK</span><span class="t">/auto-mode-setup</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-ops">
    <p class="hint">카드를 누르면 내용이 나옵니다.</p>
    <div data-for="cir"><h4>연속 차단 시 복귀</h4><p>3회 연속 또는 총 20회 차단되면 확인 창으로 돌아갑니다. 이 값은 조정할 수 없습니다.</p></div>
    <div data-for="sub"><h4>Subagent</h4><p>시작 전, 실행 중, 종료 후에 검사합니다. frontmatter의 permissionMode는 무시됩니다.</p></div>
    <div data-for="aud"><h4>기록</h4><p>PermissionDenied 훅으로 입력을 수집하고, /permissions의 Recently blocked에서 볼 수 있습니다.</p></div>
    <div data-for="bed"><h4>/auto-mode-setup</h4><p>구독 플랜과 feature flag가 필요합니다. Bedrock은 environment를 직접 작성합니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-ops'); });
:::

:::notes
{timing: 0.25min}
[요약]
• 3회 연속 또는 총 20회 차단되면 확인 창으로 복귀 (조정 불가)
• Subagent는 시작 전, 실행 중, 종료 후 검사, frontmatter permissionMode 무시
• PermissionDenied 훅과 /permissions Recently blocked로 기록
• /auto-mode-setup은 구독 플랜 필요, Bedrock은 environment를 직접 작성

운영하실 때 알아 두실 네 가지입니다.
{cue: demo}
연속으로 3번, 또는 합쳐서 20번 차단되면 auto mode는 스스로 확인 창으로 돌아갑니다. Subagent는 시작 전, 실행 중, 종료 후에 검사하고, Subagent 정의의 permissionMode는 무시됩니다.
거부 기록은 PermissionDenied 훅으로 모을 수 있습니다. 그리고 Bedrock 환경에서는 /auto-mode-setup을 쓸 수 없어서 environment를 직접 작성해야 합니다. 앞에서 본 금융사 예시가 그 출발점입니다.
:::

---
<!-- Slide 20: Quick check 2 (PDF p22) -->
@type: content
@fit: off

## git push만은 꼭 묻게 하려면?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c3-qc-2">
  <p class="q">auto mode에서 git push만은 항상 사람에게 묻게 하려면?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>CLAUDE.md에 "push 전에 물어봐" 적기</button>
    <button class="opt right"><b>B</b>permissions.ask에 Bash(git push *) 추가</button>
    <button class="opt"><b>C</b>autoMode.allow에 push 규칙 추가</button>
  </div>
  <p class="ans">정답 B. ask는 분류기보다 먼저 평가됩니다. git -C dir push 같은 변형은 PreToolUse 훅으로 잡습니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c3-qc-2'); });
:::

:::notes
{timing: 0.25min}
{cue: poll}
[요약]
• 정답 B, permissions.ask에 Bash(git push *)
• ask는 분류기보다 먼저 평가, 변형(git -C dir push)은 PreToolUse 훅으로

퀴즈입니다. auto mode에서 git push만은 항상 사람에게 묻게 하려면 어떻게 할까요?
{cue: pause}
정답은 B입니다. ask는 분류기보다 먼저 평가되니 분류기가 대신 승인할 수 없습니다. CLAUDE.md에 적는 것은 지침일 뿐 강제가 아닙니다. 그리고 git -C 디렉터리 push 같은 변형은 패턴으로 다 잡기 어려워서 PreToolUse 훅으로 보완합니다.
:::

---
<!-- Slide 21: Part 03 divider (PDF p23) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section c3-sec">
  <span class="num">CHAPTER 03 / PART 03</span>
  <div class="name">DLP 5층</div>
  <p class="what">나가는 길을 여러 단계로 좁힌다</p>
  <ol>
    <li><b>01</b>권한 규칙</li>
    <li><b>02</b>샌드박스</li>
    <li><b>03</b>훅</li>
    <li><b>04</b>Bedrock Guardrails</li>
    <li><b>05</b>반출 채널</li>
  </ol>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• Part 3은 DLP 5층, 나가는 길을 여러 단계로 좁힘
• 권한 규칙, 샌드박스, 훅, Bedrock Guardrails, 반출 채널

세 번째 Part, 이 챕터의 중심인 DLP 5층입니다. 데이터가 나가는 길을 다섯 단계로 좁혀 가는 방법을 보겠습니다.
:::

---
<!-- Slide 22: Honest answer (PDF p24) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">HONEST ANSWER</span>
  <div class="big">Claude Code에는<br><em>네이티브 DLP</em> 기능이 없습니다</div>
  <p class="lead">다섯 개의 층을 조합해 데이터가 나가는 길을 좁힙니다.</p>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• Claude Code에는 네이티브 DLP 기능이 없음
• 다섯 개의 층을 조합해 나가는 길을 좁힘

{cue: pause}
먼저 솔직한 답부터 드리겠습니다. Claude Code에는 DLP라는 이름의 네이티브 기능이 없습니다.
대신 지금까지 본 권한 규칙을 포함해 다섯 개의 층을 조합해서, 데이터가 나갈 수 있는 길을 하나씩 좁힙니다. 다음 장에서 그 다섯 층을 차례로 보겠습니다.
:::

---
<!-- Slide 23: DLP 5 layers (PDF p25, p26, p30, p31) -->
@type: content
@fit: off

## 각 층은 앞 층이 놓친 것을 잡는다
DLP 5층과 층마다의 설정

:::html
<div id="c3-sv-dlp"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var L = [
    {id:'l1',x:20,y:30,w:640,h:72,t:'1 권한 규칙',s:'permissions.deny',c:'accent'},
    {id:'l2',x:50,y:116,w:640,h:72,t:'2 샌드박스',s:'sandbox.network',c:'accent'},
    {id:'l3',x:80,y:202,w:640,h:72,t:'3 훅',s:'PreToolUse',c:'accent'},
    {id:'l4',x:110,y:288,w:640,h:72,t:'4 Bedrock Guardrails',s:'X-Amzn-Bedrock-*',c:'info'},
    {id:'l5',x:140,y:374,w:640,h:72,t:'5 반출 채널',s:'managed allowlist',c:'accent'}];
  function B(y, t, s) { return {id:'b',x:860,y:y,w:300,h:80,t:t,s:s,c:'danger'}; }
  var down = [{f:'l1',t:'l2',c:'muted',o:0},{f:'l2',t:'l3',c:'muted',o:1},{f:'l3',t:'l4',c:'muted',o:2},{f:'l4',t:'l5',c:'muted',o:3}];
  function st(i, b, extra) { var ids = ['l1','l2','l3','l4','l5']; return { nodes: L.concat([b]), hot: [ids[i], 'b'], edges: [{f:ids[i],t:'b',c:'danger',side:'h',l:'차단',o:0}].concat(extra || []) }; }
  var s1 = st(0, B(26, '민감 파일 읽기', '위험 명령 차단'));
  var s2 = st(1, B(112, '허용 목록 밖 도메인', 'Bash의 curl 빈틈'));
  var s3 = st(2, B(198, '민감 패턴', 'exit 2로 차단'));
  var s4 = st(3, B(284, 'PII, 민감정보', '모델로 가기 전 필터'));
  var s5 = st(4, B(370, '웹, MCP, 플러그인, mod', '다른 통로'));
  F.stepviz('#c3-sv-dlp', [
    {kicker:'OVERVIEW', title:'다섯 층이 차례로 좁힙니다',
     body:'한 층으로 다 막을 수는 없습니다. <b>각 층은 앞 층이 놓친 것</b>을 잡습니다. 1, 2, 3, 5층은 PC에서, 4층 Guardrails는 <b>AWS 쪽</b>에서 동작합니다.',
     facts:['1 권한 규칙: 민감 파일, 위험 명령','2 샌드박스: Bash의 파일, 네트워크 격리','3 훅: 프롬프트, 도구 인자 패턴 검사 예제','4 Guardrails: 모델로 가는 PII(개인 식별 정보) 필터','5 반출 채널: 웹, MCP, 플러그인, mod'],
     zones:[], nodes:L, edges:down, stagger:0.5, loop:true,
     snip:{hd:'다섯 층과 대표 설정',path:'',lines:['1 권한 규칙       permissions.deny','2 샌드박스        sandbox.network','3 훅              PreToolUse','4 Guardrails      X-Amzn-Bedrock-*','5 반출 채널       managed allowlist'],hl:[1,2,3,4,5],note:'아래 화살표로 한 층씩 보겠습니다.'}},
    {kicker:'LAYER 1', title:'권한 규칙: 읽기와 명령을 막습니다',
     body:'민감 파일 읽기와 위험 명령을 차단합니다. 하지만 <b>Bash 우회에 약합니다</b>. 파이프나 서브셸로 같은 일을 하면 패턴이 놓칩니다.',
     facts:['민감 파일 읽기, 위험 명령 차단','Bash 우회에 약함','그래서 2층 샌드박스가 필요'],
     zones:[], nodes:s1.nodes, hot:s1.hot, edges:s1.edges,
     snip:{hd:'Part 1에서 본 규칙',path:'permissions.deny',lines:['"deny": [','  "Read(./secrets/**)",','  "Bash(curl *)",','  "WebFetch(domain:pastebin.com)"',']'],hl:[2,3,4],note:'"Bash(curl *)"는 다른 명령 모양으로 <b>쉽게 우회</b>됩니다.'}},
    {kicker:'LAYER 2', title:'샌드박스: curl 빈틈을 OS가 막습니다',
     body:'Claude가 실행하는 <b>Bash 명령</b>의 파일과 네트워크를 <b>OS 수준에서 격리</b>합니다. allowManagedDomainsOnly가 있으면 목록 밖 도메인으로는 연결 자체가 안 됩니다.',
     facts:['Claude가 실행하는 Bash에 적용','allowManagedDomainsOnly: 목록 밖 도메인 연결 불가','failIfUnavailable, 비격리 재시도 금지로 우회 차단','mod가 띄운 프로세스는 샌드박스 밖 (Ch5)'],
     zones:[], nodes:s2.nodes, hot:s2.hot, edges:s2.edges,
     snip:{hd:'managed-settings.json (sandbox)',path:'예시 도메인',lines:['{','  "sandbox": {','    "enabled": true,','    "failIfUnavailable": true,','    "allowUnsandboxedCommands": false,','    "network": {','      "allowManagedDomainsOnly": true,','      "allowedDomains": [','        "api.github.example.com",','        "nexus.corp.example.com"','      ]','    }','  }','}'],hl:[4,5,7,8],note:'권한 규칙이 못 막는 우회도 <b>나가는 연결 자체</b>를 막아서 잡습니다.'}},
    {kicker:'LAYER 3', title:'훅: 내용을 보고 막습니다',
     body:'프롬프트와 도구 인자의 <b>내용을 패턴으로 검사</b>하는 예제입니다. 걸리면 <b>exit 2</b>로 차단합니다. 다음 장에서 스크립트를 자세히 봅니다.',
     facts:['UserPromptSubmit: .prompt 검사, 차단 사유는 사용자에게','PreToolUse: .tool_input 검사, 사유(stderr)는 Claude에게','exit 2만 차단'],
     zones:[], nodes:s3.nodes, hot:s3.hot, edges:s3.edges,
     snip:{hd:'등록 위치',path:'managed-settings.json (hooks), 요약',lines:['"UserPromptSubmit": [ dlp-guard.sh ]','"PreToolUse":       [ dlp-guard.sh ]','','# 스크립트: /opt/dlp/dlp-guard.sh'],hl:[1,2],note:'훅은 <b>내용</b>을 봅니다. 권한 규칙과 샌드박스가 못 보는 부분입니다.'}},
    {kicker:'LAYER 4', title:'Guardrails: AWS 쪽에서 거릅니다',
     body:'모델로 가는 내용의 <b>PII(개인 식별 정보)와 민감정보</b>를 Bedrock Guardrails가 걸러냅니다. Bedrock을 쓸 때 <b>AWS 계정 쪽</b>에서 거는 층입니다.',
     facts:['콘솔에서 Guardrail 생성 후 버전 발행, 민감정보 필터로 PII 마스킹, 차단','cross-region profile이면 Guardrail에도 Cross-Region inference 활성화','호출 역할에 bedrock:ApplyGuardrail 권한 필요','조직 강제: IAM 조건 bedrock:GuardrailIdentifier'],
     zones:[{x:100,y:280,w:1070,h:90,l:'AWS 쪽',tone:'info'}], nodes:s4.nodes, hot:s4.hot, edges:s4.edges,
     snip:{hd:'managed-settings.json (env)',path:'예시 Guardrail ID',lines:['{','  "env": {','    "ANTHROPIC_CUSTOM_HEADERS":','      "X-Amzn-Bedrock-GuardrailIdentifier: gr-abc123\\nX-Amzn-Bedrock-GuardrailVersion: 1"','  }','}'],hl:[3,4],note:'<b>모델로 가는 내용</b>은 AWS 쪽에서 한 번 더 거릅니다.'}},
    {kicker:'LAYER 5', title:'반출 채널: 다른 통로를 닫습니다',
     body:'웹, MCP, 플러그인, mod처럼 <b>데이터가 나갈 수 있는 다른 통로</b>를 허용 목록으로 닫습니다.',
     facts:['웹: Bedrock은 내장 WebSearch 없음, WebFetch는 deny 또는 domain: 규칙, 검색 MCP도 허용 목록','WebFetch 사전 검사가 호스트명을 Anthropic으로 보냄, skipWebFetchPreflight로 끔','MCP: allowedMcpServers, allowManagedMcpServersOnly','플러그인, mod: 마켓플레이스 허용 목록, 사이드로드 금지, 사용자 mod 차단'],
     zones:[], nodes:s5.nodes, hot:s5.hot, edges:s5.edges,
     snip:{hd:'통로별 장치',path:'managed allowlist',lines:['# 웹','WebFetch: deny 또는 domain: 규칙','skipWebFetchPreflight  # 사전 검사 끔','# MCP','allowedMcpServers','allowManagedMcpServersOnly','# 플러그인, mod','마켓플레이스 허용 목록, 사이드로드 금지','사용자 mod 차단 (Part 4, Ch5)'],hl:[2,3,5,6,8,9],note:'MCP 서버 하나, 플러그인 하나가 <b>새 통로 하나</b>입니다.'}}
  ], {legend:[['accent','PC 쪽 층'],['info','AWS 쪽 층'],['danger','그 층이 막는 것'],['muted','앞 층이 놓친 것']]});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 각 층은 앞 층이 놓친 것을 잡음, 4층 Guardrails만 AWS 계정 쪽
• 1 권한 규칙: 민감 파일, 위험 명령 차단, Bash 우회에 약함
• 2 샌드박스: Bash를 OS 수준에서 격리, allowManagedDomainsOnly, failIfUnavailable, 비격리 재시도 금지
• 3 훅: 프롬프트, 도구 인자 패턴 검사 예제, exit 2로 차단
• 4 Guardrails: ANTHROPIC_CUSTOM_HEADERS로 지정, bedrock:ApplyGuardrail 권한, IAM 조건으로 조직 강제
• 5 반출 채널: 웹, MCP, 플러그인, mod를 허용 목록으로, WebFetch 사전 검사는 skipWebFetchPreflight

{cue: demo}
DLP 5층을 한 층씩 보겠습니다. 위에서 아래로 내려갈수록 앞 층이 놓친 것을 잡는 구조입니다.
1층 권한 규칙은 민감 파일 읽기와 위험 명령을 막지만, Bash로 모양을 바꾸면 쉽게 우회됩니다.
그래서 2층 샌드박스가 있습니다. Claude가 실행하는 Bash를 OS 수준에서 격리하고, allowManagedDomainsOnly를 켜면 목록 밖 도메인으로는 연결 자체가 안 됩니다. failIfUnavailable과 비격리 재시도 금지로 샌드박스를 우회하는 길도 막습니다. 단, mod가 띄운 프로세스는 샌드박스 밖이라는 점은 Ch5에서 다시 봅니다.
3층 훅은 내용을 봅니다. 프롬프트와 도구 인자에서 주민번호나 카드번호 같은 패턴을 찾아 exit 2로 막는 예제입니다.
4층 Bedrock Guardrails는 유일하게 AWS 계정 쪽에서 동작합니다. 사용자 정의 헤더로 Guardrail을 지정하면 모델로 가는 내용의 PII를 거릅니다. 호출 역할에는 bedrock:ApplyGuardrail 권한이 필요하고, 조직이 강제하려면 IAM 조건 bedrock:GuardrailIdentifier를 씁니다.
5층은 웹, MCP, 플러그인, mod처럼 다른 통로를 허용 목록으로 닫는 것입니다. 하나 알아 두실 점은 WebFetch의 사전 검사가 호스트명을 Anthropic으로 보낸다는 것인데, skipWebFetchPreflight로 끌 수 있습니다.

[약어]
• PII: Personally Identifiable Information, 개인 식별 정보
• MCP: Model Context Protocol
:::

---
<!-- Slide 24: DLP hook script and fail-open (PDF p27, p29) -->
@type: content
@fit: off

## exit 2만 차단이다
3층 DLP 훅 예제와 fail-open, 그리고 수정본

:::html
<div id="c3-sv-hook"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var IN = {id:'in',x:20,y:190,w:230,h:90,t:'입력',s:'프롬프트 또는 도구 인자',c:'accent'};
  var HK = {id:'hk',x:310,y:190,w:250,h:90,t:'dlp-guard.sh',s:'UserPromptSubmit, PreToolUse',c:'warning'};
  var O0 = {id:'o0',x:640,y:50,w:250,h:84,t:'exit 0',s:'통과',c:'success'};
  var O2 = {id:'o2',x:640,y:193,w:250,h:84,t:'exit 2',s:'차단',c:'danger'};
  var OX = {id:'ox',x:640,y:336,w:250,h:84,t:'검사 실패',s:'예: jq 실패, exit 127',c:'muted'};
  var CC = {id:'cc',x:950,y:190,w:210,h:90,t:'다음 동작',s:'사유는 사용자 또는 Claude',c:'ink'};
  var N = [IN,HK,O0,O2,OX,CC];
  var script = ['#!/bin/bash','INPUT=$(cat)','TEXT=$(echo "$INPUT" | jq -r \'.prompt // (.tool_input | tostring)\')','# 주민등록번호, 카드번호, AWS 액세스 키 (탐지 예시)','PAT=\'[0-9]{6}-[1-4][0-9]{6}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}|AKIA[0-9A-Z]{16}\'','if echo "$TEXT" | grep -Eq "$PAT"; then','  echo "DLP: 민감정보 패턴이 감지되어 차단했습니다" >&2','  exit 2   # 차단 (사유: UserPromptSubmit은 사용자, PreToolUse는 Claude)','fi','exit 0'];
  var fixed = ['#!/bin/bash','INPUT=$(cat)','TEXT=$(echo "$INPUT" | jq -r \'.prompt // (.tool_input | tostring)\') \\','  || { echo "DLP: 입력 해석 실패 - 차단" >&2; exit 2; }','PAT=\'[0-9]{6}-[1-4][0-9]{6}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}|AKIA[0-9A-Z]{16}\'','echo "$TEXT" | grep -Eq "$PAT"; RC=$?','[ "$RC" -eq 1 ] && exit 0   # 1 불일치, 통과','echo "DLP: 차단(grep $RC: 0 일치, 2+ 실행 오류)" >&2; exit 2'];
  F.stepviz('#c3-sv-hook', [
    {kicker:'CASE 1', title:'민감 패턴이 없으면 통과합니다',
     body:'패턴이 없으면 <b>exit 0</b>으로 통과합니다.<br>검사 대상은 <b>.prompt</b>(UserPromptSubmit) 또는 <b>.tool_input</b>(PreToolUse)입니다.',
     facts:['UserPromptSubmit은 .prompt 검사','PreToolUse는 .tool_input 검사','탐지 예시일 뿐, 운영 룰은 사내 DLP 기준'],
     zones:[], nodes:N, hot:['in','hk','o0','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'o0',c:'success',o:1},{f:'o0',t:'cc',c:'success',l:'진행',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'예제 (5층 중 3층)',lines:script,hl:[2,3,10],note:'훅은 표준 입력으로 JSON을 받습니다.'}},
    {kicker:'CASE 2', title:'패턴이 보이면 exit 2로 막습니다',
     body:'예: 테스트용 가짜 주민번호 <b>900101-1234567</b>이 들어오면 grep이 걸리고 <b>exit 2</b>로 차단합니다. 차단 사유는 UserPromptSubmit이면 <b>사용자에게</b>, PreToolUse면 stderr가 <b>Claude에게</b> 갑니다.',
     facts:['exit 2만 차단','UserPromptSubmit: 사유는 사용자에게','PreToolUse: 사유(stderr)는 Claude에게'],
     zones:[], nodes:N, hot:['in','hk','o2','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'o2',c:'danger',o:1},{f:'o2',t:'cc',c:'danger',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'예제 (5층 중 3층)',lines:script,hl:[5,6,7,8],note:'주민번호, 카드번호, AWS 액세스 키 패턴은 <b>탐지 예시</b>입니다.'}},
    {kicker:'CASE 3', title:'이 상태는 jq 실패 시 통과합니다',
     body:'이 예제 그대로는 <b>jq가 실패하면 검사 없이 통과</b>합니다. 또 훅이 exit 2가 아닌 0이 아닌 코드(예: exit 127)로 끝나면 비차단 오류라 <b>그대로 진행</b>됩니다. 검사가 실패했는데 통과하는 것, fail-open입니다.',
     facts:['exit 2만 차단','exit 127 같은 그 밖의 종료는 진행','검사 실패가 통과로 이어짐 (fail-open)'],
     zones:[], nodes:N, hot:['in','hk','ox','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'ox',c:'muted',l:'jq 실패',o:1},{f:'ox',t:'cc',c:'warning',l:'그대로 진행',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'예제, jq 줄에 실패 처리가 없음',lines:script,hl:[3],note:'바로 다음 퀴즈의 상황입니다. 랩 TASK 02에서 직접 확인합니다.'}},
    {kicker:'CASE 4', title:'수정본은 오류 경로도 막습니다',
     body:'수정본은 jq 해석이 실패하면 <b>exit 2</b>로 막고, grep 결과가 <b>1(불일치)일 때만</b> 통과시킵니다. 0(일치)과 2 이상(실행 오류)은 모두 차단합니다. 이것이 <b>fail-closed</b>입니다.',
     facts:['jq 해석 실패: exit 2로 차단','grep 1(불일치)만 통과','0 일치, 2+ 실행 오류는 차단'],
     zones:[], nodes:N, hot:['in','hk','o2','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'o2',c:'danger',o:1},{f:'o2',t:'cc',c:'danger',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'수정본 (fail-closed)',lines:fixed,hl:[3,4,6,7,8],note:'다음 장에서 이 수정본을 <b>정책으로 강제</b>합니다.'}}
  ], {legend:[['accent','입력'],['success','통과'],['danger','차단'],['muted','검사 실패']]});
});
:::

:::notes
{timing: 1.75min}
[요약]
• DLP 훅 예제는 UserPromptSubmit의 .prompt, PreToolUse의 .tool_input을 패턴으로 검사
• exit 2만 차단, 사유는 UserPromptSubmit이면 사용자에게, PreToolUse면 stderr가 Claude에게
• 예제 그대로는 jq 실패 시 통과, exit 127 같은 그 밖의 종료도 진행 (fail-open)
• 수정본: jq 해석 실패는 exit 2, grep 1(불일치)만 통과, 0 일치와 2+ 실행 오류는 차단 (fail-closed)
• 패턴은 탐지 예시, 운영 룰은 사내 DLP 기준

{cue: demo}
3층 훅을 스크립트로 보겠습니다.
첫 번째 경우, 민감 패턴이 없으면 exit 0으로 통과합니다. 훅은 UserPromptSubmit에서는 프롬프트를, PreToolUse에서는 도구 인자를 검사합니다.
두 번째, 테스트용 가짜 주민번호가 들어오면 grep이 걸리고 exit 2로 막습니다. 이때 차단 사유는 프롬프트 단계라면 사용자에게, 도구 실행 전 단계라면 stderr 메시지가 Claude에게 갑니다.
{cue: pause}
세 번째가 핵심입니다. 이 예제 그대로는 jq가 실패하면 검사 없이 통과합니다. 또 훅이 exit 2가 아닌 다른 코드로 끝나면 비차단 오류라 그대로 진행됩니다. fail-open입니다.
그래서 네 번째 수정본은 jq 해석 실패를 exit 2로 막고, grep이 1, 즉 불일치일 때만 통과시킵니다. 일치든 실행 오류든 나머지는 전부 차단합니다. 랩에서 이 두 상태를 직접 확인합니다.
:::

---
<!-- Slide 25: Quick check 3 (PDF p28) -->
@type: content
@fit: off

## jq 없이 exit 127이면?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c3-qc-3">
  <p class="q">DLP 훅이 jq 미설치로 exit 127로 끝나면 어떻게 될까요?</p>
  <div class="opts">
    <button class="opt"><b>A</b>차단된다</button>
    <button class="opt right"><b>B</b>통과된다</button>
    <button class="opt"><b>C</b>세션이 종료된다</button>
    <button class="opt"><b>D</b>자동 재시도</button>
  </div>
  <p class="ans">정답 B. exit 2만 차단입니다. 그 외 0이 아닌 종료는 비차단 오류로 처리되어 그대로 진행됩니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c3-qc-3'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, 통과
• exit 2만 차단, 그 외 0이 아닌 종료는 비차단 오류로 진행

방금 본 내용을 퀴즈로 확인하겠습니다. DLP 훅이 jq 미설치로 exit 127로 끝나면 어떻게 될까요?
{cue: pause}
정답은 B, 통과입니다. 많은 분이 A를 고르시는데요, 훅은 exit 2만 차단으로 봅니다. 그래서 오류 경로에도 exit 2를 꼭 넣어야 합니다.
:::

---
<!-- Slide 26: Enforce hooks by policy (PDF p29) -->
@type: content
@fit: off

## 훅은 정책으로 강제한다
사용자가 끄지 못하게, 고장 나도 막히게

:::html
<div class="fsi c3-codepick c3-wide">
  <div class="code">
    <span class="path">managed-settings.json (hooks)</span>
    <pre id="c3-pre-hooks"></pre>
  </div>
  <div class="pts" data-pick="c3-hookpol">
    <p class="hint">위 배포 포인트를 누르면 아래 코드의 해당 줄이 켜집니다.</p>
    <button class="pick" data-key="only"><span class="t">managed 훅만 실행</span><span class="d">allowManagedHooksOnly: true</span></button>
    <button class="pick" data-key="path"><span class="t">스크립트도 관리자만 쓸 수 있는 경로에</span><span class="d">/opt/dlp/dlp-guard.sh</span></button>
    <button class="pick" data-key="fail"><span class="t">onFailure: block</span><span class="d">스크립트 없음, 시작 실패, 타임아웃도 차단 (v2.1.295+)</span></button>
    <button class="pick" data-key="final"><span class="t">managed PreToolUse 차단은 최종 결정</span><span class="d">mod가 호출을 바꿔도 managed 훅이 다시 검사</span></button>
    <button class="pick" data-key="check"><span class="t">/hooks로 출처 확인</span><span class="d">어떤 훅이 어디서 왔는지 확인</span></button>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  window.__c3codepick(F, 'c3-hookpol', 'c3-pre-hooks', [
    '{',
    '  "allowManagedHooksOnly": true,',
    '  "hooks": {',
    '    "UserPromptSubmit": [{ "hooks": [{ "type": "command",',
    '      "command": "/opt/dlp/dlp-guard.sh", "onFailure": "block" }] }],',
    '    "PreToolUse": [{ "matcher": "Bash|Write|Edit|WebFetch",',
    '      "hooks": [{ "type": "command",',
    '      "command": "/opt/dlp/dlp-guard.sh", "onFailure": "block" }] }]',
    '  }',
    '}'
  ], { only:[2], path:[5,8], fail:[5,8], final:[6,7,8], check:[3,4,6] });
});
:::

:::notes
{timing: 1min}
[요약]
• allowManagedHooksOnly: true로 managed 훅만 실행
• UserPromptSubmit과 PreToolUse(matcher Bash|Write|Edit|WebFetch)에 dlp-guard.sh 수정본 등록
• 스크립트도 관리자만 쓸 수 있는 경로에 배치
• onFailure: block이면 스크립트 없음, 시작 실패, 타임아웃도 차단 (v2.1.295+)
• managed PreToolUse 차단은 최종 결정, mod가 호출을 바꿔도 managed 훅이 다시 검사
• /hooks로 출처 확인

훅은 만들기만 해서는 안 되고, 사용자가 끄지 못하게, 그리고 고장 나도 막히게 정책으로 강제해야 합니다.
{cue: demo}
위 배포 포인트를 누르면 아래 코드의 해당 줄이 켜집니다. allowManagedHooksOnly로 managed 훅만 돌게 하고, 프롬프트 제출과 Bash, Write, Edit, WebFetch 실행 전에 같은 스크립트를 겁니다.
스크립트 파일 자체도 관리자만 쓸 수 있는 경로에 둬야 합니다. 파일을 고칠 수 있으면 정책이 의미가 없으니까요. 그리고 onFailure를 block으로 두면 스크립트가 없거나, 시작에 실패하거나, 타임아웃이 나도 차단합니다. v2.1.295 이상입니다.
managed PreToolUse의 차단은 최종 결정이고, mod가 호출을 바꿔도 다시 검사합니다. 실제로 어떤 훅이 어디서 왔는지는 /hooks로 확인합니다.
:::

---
<!-- Slide 27: Part 04 divider (PDF p32) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 03 / PART 04</span>
  <div class="name">확장 통제와 감사</div>
  <p class="what">무엇이 설치되고, 무엇이 남는가</p>
  <ol>
    <li><b>01</b>확장 통제 키</li>
    <li><b>02</b>남는 기록</li>
    <li><b>03</b>감사 질문과 근거</li>
  </ol>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• Part 4는 확장 통제와 감사
• 무엇이 설치되고, 무엇이 기록으로 남는가

마지막 Part는 확장 통제와 감사입니다. 무엇이 설치될 수 있는지, 그리고 사고나 감사 때 무엇을 근거로 답할 수 있는지 보겠습니다.
:::

---
<!-- Slide 28: Extension control keys (PDF p33) -->
@type: content
@fit: off

## 확장은 허용 목록으로 들인다
플러그인, MCP, mod를 managed settings로 통제하는 키

:::html
<div class="fsi c3-keys">
  <div class="list" data-pick="c3-ext">
    <button class="pick" data-key="a"><span class="t">strictKnownMarketplaces</span></button>
    <button class="pick" data-key="b"><span class="t">blockedMarketplaces</span></button>
    <button class="pick" data-key="c"><span class="t">enabledPlugins: false</span></button>
    <button class="pick" data-key="d"><span class="t">disableSideloadFlags</span></button>
    <button class="pick" data-key="e"><span class="t">strictPluginOnlyCustomization</span></button>
    <button class="pick" data-key="f"><span class="t">pluginConfigs → allowManagedModsOnly</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-ext">
    <p class="hint">키를 누르면 효과와 함께 쓸 것이 나옵니다.</p>
    <div data-for="a"><p class="eff">허용한 마켓플레이스만 씁니다.</p><p class="rec"><b>함께 쓸 것</b>extraKnownMarketplaces</p></div>
    <div data-for="b"><p class="eff">특정 소스를 차단합니다. 허용 목록보다 먼저 적용됩니다.</p></div>
    <div data-for="c"><p class="eff">특정 플러그인을 차단하고 숨깁니다.</p></div>
    <div data-for="d"><p class="eff">--plugin-dir, --mcp-config 같은 사이드로드 플래그를 거부합니다.</p><p class="rec"><b>함께 쓸 것</b>허용 목록</p></div>
    <div data-for="e"><p class="eff">플러그인 밖의 스킬, Subagent, 훅, MCP를 차단합니다.</p><p class="rec"><b>함께 쓸 것</b>사내 마켓플레이스</p></div>
    <div data-for="f"><p class="eff">내장 보안 플러그인(cc-plugin-sec-default@builtin) 옵션으로 사용자가 설치한 mod를 차단합니다.</p><p class="rec"><b>함께 쓸 것</b>Ch5</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-ext'); });
:::

:::notes
{timing: 0.75min}
[요약]
• strictKnownMarketplaces와 extraKnownMarketplaces로 허용한 마켓플레이스만
• blockedMarketplaces는 허용 목록보다 먼저, enabledPlugins: false로 개별 차단
• disableSideloadFlags로 --plugin-dir, --mcp-config 같은 사이드로드 거부
• strictPluginOnlyCustomization으로 플러그인 밖 확장 차단, pluginConfigs 안의 allowManagedModsOnly로 사용자 mod 차단

5층에서 본 반출 채널 중 확장 쪽을 키로 정리합니다.
{cue: demo}
기본은 허용 목록입니다. strictKnownMarketplaces로 허용한 마켓플레이스만 쓰게 하고, 사내 마켓플레이스는 extraKnownMarketplaces로 추가합니다. 특정 소스는 blockedMarketplaces로 막는데, 이게 허용 목록보다 먼저 적용됩니다.
disableSideloadFlags는 명령줄 플래그로 몰래 플러그인이나 MCP를 붙이는 길을 막고, strictPluginOnlyCustomization은 플러그인 밖의 스킬, Subagent, 훅, MCP를 막습니다. 사용자 mod는 pluginConfigs 안의 allowManagedModsOnly로 막는데, mod는 Ch5에서 자세히 봅니다.
:::

---
<!-- Slide 29: What remains as records (PDF p34) -->
@type: content
@fit: off

## 감사에 답할 근거는 네 곳에 남는다
무엇이 기록으로 남는가, 그리고 주의할 것

:::html
<div class="fsi c3-two">
  <div class="col">
    <h4>남는 것</h4>
    <div class="it">PC: 세션 <span class="rp-detail" tabindex="0" data-tip="JSON Lines. 한 줄에 JSON 객체 하나씩 적는 텍스트 형식">JSONL</span><small>cleanupPeriodDays로 보존 기간</small></div>
    <div class="it">AWS: CloudTrail의 Bedrock 호출 이력</div>
    <div class="it">AWS: Bedrock model invocation logging<small>선택, 프롬프트 원문 포함</small></div>
    <div class="it"><span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span>: 사용자별 토큰, 비용, 도구<small>Ch6</small></div>
  </div>
  <div class="col warn">
    <h4>주의할 것</h4>
    <div class="it">invocation logging은 원문이 저장되므로 저장소, 보존 정책 필요</div>
    <div class="it">Anthropic으로 가는 텔레메트리는 Bedrock에서 기본 꺼짐<small>단, WebFetch 사전 검사는 호스트명을 api.anthropic.com으로 보냄 (skipWebFetchPreflight로 끔)</small></div>
    <div class="it"><span class="rp-detail" tabindex="0" data-tip="Zero Data Retention. 요청과 응답 데이터를 보존하지 않는 약정">ZDR</span>은 AWS 계약 조건에 따름</div>
    <div class="it">세션 로그도 고객 데이터를 담을 수 있음</div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 남는 것: PC 세션 JSONL, CloudTrail Bedrock 호출 이력, 선택적 model invocation logging, OTel
• invocation logging은 프롬프트 원문이 저장되므로 저장소와 보존 정책 필요
• Anthropic 텔레메트리는 Bedrock에서 기본 꺼짐, 단 WebFetch 사전 검사는 호스트명을 api.anthropic.com으로 보냄 (skipWebFetchPreflight로 끔)
• ZDR은 AWS 계약 조건
• 세션 로그도 고객 데이터를 담을 수 있음

감사에서 근거가 되는 기록은 네 곳에 남습니다.
PC에는 세션 JSONL이 남고, AWS에는 CloudTrail의 Bedrock 호출 이력이 남습니다. 선택으로 Bedrock model invocation logging을 켜면 프롬프트 원문까지 남고, OTel로 사용자별 토큰과 비용, 도구 사용을 모읍니다.
{cue: pause}
주의할 점은, invocation logging은 원문이 저장되니 그 저장소 자체가 민감 데이터가 된다는 것입니다. 세션 로그도 마찬가지로 고객 데이터를 담을 수 있습니다. 그리고 Anthropic 텔레메트리는 Bedrock에서 기본으로 꺼져 있지만, WebFetch의 사전 검사는 호스트명을 api.anthropic.com으로 보냅니다. 끄려면 skipWebFetchPreflight를 씁니다.
:::

---
<!-- Slide 30: Audit questions (PDF p35) -->
@type: content
@fit: off

## 감사 질문마다 답할 기록이 있다
자주 받는 감사 질문과 근거가 되는 기록

:::html
<div class="fsi c3-keys c3-audit">
  <div class="list" data-pick="c3-audit">
    <button class="pick" data-key="who"><span class="t">누가 언제 썼나</span><span class="k">Ch2, Ch6</span></button>
    <button class="pick" data-key="model"><span class="t">어떤 모델을 썼나</span><span class="k">Ch2</span></button>
    <button class="pick" data-key="ran"><span class="t">무엇을 실행했나</span><span class="k">Ch3, Ch6</span></button>
    <button class="pick" data-key="blocked"><span class="t">무엇을 막았나</span><span class="k">Ch3</span></button>
    <button class="pick" data-key="policy"><span class="t">정책은 언제 바뀌었나</span><span class="k">Ch2</span></button>
    <button class="pick" data-key="leak"><span class="t">고객 데이터가 나갔나</span><span class="k">Ch3</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-audit">
    <p class="hint">질문을 누르면 근거가 되는 기록이 나옵니다.</p>
    <div data-for="who"><p class="ev">CloudTrail의 Bedrock 호출, 게이트웨이 사용자(<span class="rp-detail" tabindex="0" data-tip="OpenID Connect. IdP 로그인으로 사용자를 확인하는 인증 표준">OIDC</span>)</p></div>
    <div data-for="model"><p class="ev">managed settings의 모델 고정, inference profile</p></div>
    <div data-for="ran"><p class="ev">OTel 이벤트(tool_decision, tool_result), 세션 JSONL</p></div>
    <div data-for="blocked"><p class="ev">DLP 훅 차단 메시지, auto mode 거부 기록(/permissions)</p></div>
    <div data-for="policy"><p class="ev">managed settings 배포 이력(<span class="rp-detail" tabindex="0" data-tip="Mobile Device Management. 회사 단말에 설정과 파일을 배포하는 관리 도구">MDM</span>, git)</p></div>
    <div data-for="leak"><p class="ev">권한 규칙, 샌드박스, DLP 훅, Guardrails의 차단 기록</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-audit'); });
:::

:::notes
{timing: 0.75min}
[요약]
• 누가 언제: CloudTrail Bedrock 호출, 게이트웨이 사용자(OIDC)
• 어떤 모델: managed settings 모델 고정, inference profile
• 무엇을 실행: OTel tool_decision, tool_result와 세션 JSONL
• 무엇을 막았나: DLP 훅 차단 메시지, auto mode 거부 기록
• 정책 변경: managed settings 배포 이력, 데이터 유출: 각 층의 차단 기록

감사에서 자주 받는 질문 여섯 개를 어떤 기록으로 답하는지 한 장에 정리했습니다.
{cue: demo}
누가 언제 썼냐는 질문에는 CloudTrail과 게이트웨이 사용자 기록으로, 어떤 모델을 썼냐는 Ch2의 모델 고정으로 답합니다. 무엇을 실행했냐는 OTel 이벤트와 세션 JSONL입니다.
무엇을 막았냐는 오늘 만든 DLP 훅의 차단 메시지와 auto mode 거부 기록, 그리고 가장 어려운 질문인 고객 데이터가 나갔냐는 권한 규칙, 샌드박스, DLP 훅, Guardrails 각각의 차단 기록을 합쳐서 답합니다.

[약어]
• OIDC: OpenID Connect, 사용자 인증 표준
• MDM: Mobile Device Management, 단말 관리 도구
:::

---
<!-- Slide 31: Lab TASK 00 to 02 (PDF p36) -->
@type: content
@fit: off

## 15분, 훅을 만들고 뚫어 본다
LAB, TASK 00부터 02, DLP 훅 만들고 fail-open 확인

:::html
<div class="fsi fsi-lab">
  <ol class="steps">
    <li><b>TASK 01</b><span>dlp-guard.sh 작성, 실행 권한 부여</span></li>
    <li><b>TASK 01</b><span>managed settings에 UserPromptSubmit, PreToolUse 등록</span></li>
    <li><b>TASK 01</b><span>가짜 주민번호(900101-1234567)로 차단 확인</span></li>
    <li><b>TASK 02</b><span>jq를 깨뜨려 고장 난 훅이 통과되는지 확인</span><em>fail-open</em></li>
    <li><b>TASK 02</b><span>오류 경로에 exit 2를 넣어 fail-closed로 수정</span><em>fail-closed</em></li>
    <li><b>TASK 07</b><span>전체 원복 (필수, Ch5와 Capstone 전에)</span><em>필수</em></li>
  </ol>
  <p class="where">테스트 데이터만 사용합니다. Hands-on Lab 포털에서 Chapter 3을 열고 TASK 00(사전 준비 2분)부터 시작합니다.</p>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• TASK 00 사전 준비 2분, TASK 01: DLP 훅 작성, managed settings 등록, 가짜 주민번호로 차단 확인
• TASK 02: jq를 깨뜨려 fail-open 확인, 오류 경로에 exit 2를 넣어 fail-closed로 수정
• TASK 07 전체 원복은 필수, Ch5와 Capstone 전에
• 테스트 데이터만 사용

{cue: demo}
실습 첫 15분입니다. 오늘 본 훅을 직접 만들고, 일부러 뚫어 본 뒤 다시 막습니다.
TASK 00 사전 준비 2분 뒤, TASK 01에서 스크립트를 작성해 managed settings에 등록하고 가짜 주민번호로 차단되는지 확인합니다. TASK 02에서는 jq를 깨뜨려 고장 난 훅이 통과되는 fail-open을 보고, 오류 경로에 exit 2를 넣어 fail-closed로 고칩니다.
마지막 TASK 07 전체 원복은 꼭 해 주세요. 이 설정이 남아 있으면 Ch5와 Capstone에서 예상치 못하게 막힙니다. 그리고 실제 개인정보는 절대 쓰지 마시고 테스트 데이터만 써 주세요.
:::

---
<!-- Slide 32: Lab TASK 03 (PDF p37) -->
@type: content
@fit: off

## 15분, auto mode로 경계를 긋는다
LAB, TASK 03, 승인 줄이고 경계 긋기, 끝나면 TASK 07 원복

:::html
<div class="fsi fsi-lab">
  <ol class="steps">
    <li><b>TASK 03</b><span>--debug-file로 분류기 모델을 확인하고 auto로 시작</span></li>
    <li><b>TASK 03</b><span>안전한 작업은 묻지 않고 진행, curl | bash는 내용부터 확인하는 것 보기</span></li>
    <li><b>TASK 03</b><span>permissions.ask로 git push 사람 확인 넣기</span></li>
    <li><b>TASK 03</b><span>autoMode.environment, hard_deny에 고객 데이터 위치를 적고 critique로 검토</span></li>
    <li><b>TASK 03</b><span>managed disableAutoMode로 조직 잠금, 그리고 원복</span></li>
  </ol>
  <p class="where">Hands-on Lab 포털에서 Chapter 3 TASK 03을 엽니다. 끝나면 TASK 07 원복(2분)을 진행합니다. TASK 04부터 06은 선택입니다.</p>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• TASK 03 15분: auto mode로 승인을 줄이고 경계 긋기
• --debug-file로 분류기 모델 확인 후 auto 시작, ask로 push 확인, environment와 hard_deny 작성 후 critique
• managed disableAutoMode로 잠금 후 원복, 끝나면 TASK 07 원복 2분
• TASK 04부터 06은 선택

실습 두 번째 15분은 auto mode입니다.
--debug-file로 실제 분류기 모델을 확인하고 auto로 시작한 뒤, 안전한 작업은 그냥 진행되고 curl과 bash 조합은 내용부터 확인하는 것을 봅니다. 그다음 push에 ask를 넣고, 고객 데이터 위치를 environment와 hard_deny에 적어 critique로 검토합니다. 마지막에 조직 잠금을 걸어 보고 원복합니다.
끝나면 TASK 07로 전체 원복을 꼭 해 주세요. TASK 04부터 06은 시간이 되는 분들을 위한 선택입니다.
:::

---
<!-- Slide 33: Deep dive divider (PDF p38) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section c3-sec">
  <span class="num">CHAPTER 03 / DEEP DIVE</span>
  <div class="name">더 알아보기</div>
  <p class="what">자주 받는 질문과 세부 설정</p>
  <ol>
    <li><b>01</b>권한 규칙 문법</li>
    <li><b>02</b>훅이 끼어드는 지점</li>
    <li><b>03</b>훅의 JSON 결정</li>
    <li><b>04</b>OS별 훅, 샌드박스 차이</li>
    <li><b>05</b>MCP 서버 통제</li>
    <li><b>06</b>감사 기록은 어디에</li>
  </ol>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• 더 알아보기: 규칙 문법, 훅 이벤트, 훅 JSON 결정, OS 차이, MCP 통제, 감사 기록
• 시간이 남거나 질문이 나올 때 사용

여기부터는 더 알아보기입니다. 시간이 남거나 관련 질문이 나오면 펼쳐 보겠습니다.
:::

---
<!-- Slide 34: Rule syntax (PDF p39) -->
@type: content
@fit: off

## 지정자로 범위를 좁힌다
권한 규칙 문법, 도구(지정자) 형태

:::html
<div class="fsi c3-keys">
  <div class="list" data-pick="c3-syntax">
    <button class="pick" data-key="a"><span class="t">Bash(npm run test *)</span></button>
    <button class="pick" data-key="b"><span class="t">Read(./secrets/**)</span></button>
    <button class="pick" data-key="c"><span class="t">Edit(~/.ssh/**)</span></button>
    <button class="pick" data-key="d"><span class="t">WebFetch(domain:corp.example)</span></button>
    <button class="pick" data-key="e"><span class="t">mcp__github__create_issue</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-syntax">
    <p class="hint">규칙을 누르면 의미와 주의할 점이 나옵니다.</p>
    <div data-for="a"><p class="eff">접두사가 같은 명령</p><p class="rec"><b>주의</b>셸 우회(파이프, 서브셸)에 약합니다.</p></div>
    <div data-for="b"><p class="eff">gitignore 스타일 경로</p><p class="rec"><b>주의</b>상대 경로 기준을 확인합니다.</p></div>
    <div data-for="c"><p class="eff">홈 경로 편집</p><p class="rec"><b>주의</b>deny는 모든 스코프보다 우선합니다.</p></div>
    <div data-for="d"><p class="eff">도메인 단위</p><p class="rec"><b>주의</b>허용 목록으로 쓰는 것이 안전합니다.</p></div>
    <div data-for="e"><p class="eff">MCP 도구 단위</p><p class="rec"><b>주의</b>서버 전체는 mcp__github로 씁니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-syntax'); });
:::

:::notes
{timing: 0.5min}
[요약]
• Bash(npm run test *)는 접두사가 같은 명령, 셸 우회에 약함
• Read(./secrets/**)는 gitignore 스타일 경로, Edit(~/.ssh/**)는 홈 경로
• WebFetch(domain:)은 도메인 단위, 허용 목록이 안전
• mcp__github__create_issue는 도구 단위, 서버 전체는 mcp__github

권한 규칙 문법을 예시 다섯 개로 정리했습니다.
{cue: demo}
Bash 규칙은 접두사 일치라 셸 우회에 약하고, Read와 Edit는 gitignore 스타일 경로라 상대 경로 기준을 꼭 확인하셔야 합니다. WebFetch는 도메인 단위로 쓰고, MCP는 도구 하나 단위 또는 서버 전체 단위로 씁니다.
:::

---
<!-- Slide 35: Hook events (PDF p40) -->
@type: content
@fit: off

## 훅은 루프의 여섯 지점에 끼어든다
훅 이벤트, 시점, DLP 용도

:::html
<div id="c3-sv-events"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var SS = {id:'ss',x:20,y:80,w:240,h:84,t:'SessionStart',s:'세션 시작',c:'info'};
  var UP = {id:'up',x:310,y:80,w:260,h:84,t:'UserPromptSubmit',s:'프롬프트 전송 전',c:'danger'};
  var PRE = {id:'pre',x:620,y:80,w:240,h:84,t:'PreToolUse',s:'도구 실행 전',c:'danger'};
  var TL = {id:'tl',x:910,y:80,w:250,h:84,t:'도구 실행',s:'Bash, Edit, WebFetch',c:'ink'};
  var POST = {id:'post',x:910,y:320,w:250,h:84,t:'PostToolUse',s:'도구 실행 후',c:'warning'};
  var ST = {id:'st',x:600,y:320,w:260,h:84,t:'Stop, SubagentStop',s:'응답 종료',c:'warning'};
  var PC = {id:'pc',x:300,y:320,w:250,h:84,t:'PreCompact',s:'압축 전',c:'success'};
  var N = [SS,UP,PRE,TL,POST,ST,PC];
  var E = [{f:'ss',t:'up',c:'muted',o:0},{f:'up',t:'pre',c:'muted',o:1},{f:'pre',t:'tl',c:'muted',o:2},{f:'tl',t:'post',c:'muted',o:3},{f:'post',t:'st',c:'muted',o:4},{f:'st',t:'pc',c:'muted',dash:true}];
  var tbl = ['UserPromptSubmit','  입력의 민감정보 차단','PreToolUse','  명령, 파일 쓰기, 웹 요청 차단','PostToolUse','  결과 검사, 기록','SessionStart','  사내 규정 컨텍스트 주입','Stop, SubagentStop','  산출물 점검, 알림','PreCompact','  요약 전 기록 보존'];
  F.stepviz('#c3-sv-events', [
    {kicker:'OVERVIEW', title:'한 바퀴에 끼어드는 지점들',
     body:'훅은 에이전트 루프의 정해진 지점에 끼어듭니다. DLP에서 <b>막는 자리</b>는 UserPromptSubmit과 PreToolUse, <b>보는 자리</b>는 그 뒤의 이벤트입니다.',
     facts:['막기: UserPromptSubmit, PreToolUse','검사와 기록: PostToolUse, Stop','맥락과 보존: SessionStart, PreCompact'],
     zones:[], nodes:N, edges:E, stagger:0.5,
     snip:{hd:'이벤트와 DLP 용도',path:'',lines:tbl,hl:[1,3,5,7,9,11],note:'아래 화살표로 묶음별로 봅니다.'}},
    {kicker:'BLOCK', title:'입력과 실행 전: 막는 자리',
     body:'<b>UserPromptSubmit</b>은 프롬프트가 모델로 가기 전, <b>PreToolUse</b>는 도구가 실행되기 전입니다. 여기서 exit 2나 deny 결정을 내리면 실행되지 않습니다.',
     facts:['입력의 민감정보 차단','명령, 파일 쓰기, 웹 요청 차단','DLP 훅을 거는 두 지점'],
     zones:[], nodes:N, hot:['up','pre','tl'], edges:[{f:'up',t:'pre',c:'danger',o:0},{f:'pre',t:'tl',c:'danger',l:'통과해야 실행',o:1}],
     snip:{hd:'이벤트와 DLP 용도',path:'',lines:tbl,hl:[1,2,3,4],note:'Part 3의 dlp-guard.sh가 이 두 지점에 걸립니다.'}},
    {kicker:'OBSERVE', title:'실행 후와 종료: 보는 자리',
     body:'<b>PostToolUse</b>는 도구 결과를 검사하고 기록합니다. <b>Stop, SubagentStop</b>은 응답이 끝날 때 산출물을 점검하고 알림을 보냅니다.',
     facts:['결과 검사, 기록','산출물 점검, 알림','이미 실행된 뒤라 막기보다 기록'],
     zones:[], nodes:N, hot:['tl','post','st'], edges:[{f:'tl',t:'post',c:'warning',o:0},{f:'post',t:'st',c:'warning',o:1}],
     snip:{hd:'이벤트와 DLP 용도',path:'',lines:tbl,hl:[5,6,9,10],note:'실행 후 훅은 <b>되돌리지 못합니다</b>. 막을 일은 앞에서.'}},
    {kicker:'CONTEXT', title:'시작과 압축: 맥락과 보존',
     body:'<b>SessionStart</b>는 세션 시작에 사내 규정 같은 컨텍스트를 주입하고, <b>PreCompact</b>는 대화를 요약하기 전에 기록을 보존합니다.',
     facts:['사내 규정 컨텍스트 주입','요약 전 기록 보존','압축되면 대화 속 선언이 사라질 수 있음'],
     zones:[], nodes:N, hot:['ss','pc'], edges:[{f:'ss',t:'up',c:'info',o:0},{f:'st',t:'pc',c:'success',o:1}],
     snip:{hd:'이벤트와 DLP 용도',path:'',lines:tbl,hl:[7,8,11,12],note:'Part 2에서 본 "대화로 한 선언"이 압축에 약한 이유와 연결됩니다.'}}
  ], {legend:[['danger','막는 자리'],['warning','보는 자리'],['info','세션 시작'],['success','압축 전']]});
});
:::

:::notes
{timing: 0.5min}
[요약]
• UserPromptSubmit(프롬프트 전송 전), PreToolUse(도구 실행 전)는 막는 자리
• PostToolUse(실행 후), Stop과 SubagentStop(응답 종료)은 검사와 기록
• SessionStart는 사내 규정 컨텍스트 주입, PreCompact는 압축 전 기록 보존

{cue: demo}
훅이 루프의 어느 지점에 끼어드는지 묶음으로 보겠습니다.
막는 자리는 두 곳, 프롬프트가 가기 전과 도구가 실행되기 전입니다. 오늘 만든 DLP 훅이 바로 여기에 걸립니다.
실행 후와 응답 종료 시점의 훅은 이미 일어난 일을 검사하고 기록합니다. 되돌리지는 못합니다.
세션 시작에는 사내 규정을 컨텍스트로 넣을 수 있고, 압축 전에는 기록을 보존할 수 있습니다.
:::

---
<!-- Slide 36: Hook JSON decision (PDF p41) -->
@type: content
@fit: off

## exit 2보다 세밀하게 말하기
훅의 JSON 결정, hookSpecificOutput

:::html
<div class="fsi c3-codepick">
  <div class="code">
    <span class="path">hook stdout</span>
    <pre id="c3-pre-json"></pre>
  </div>
  <div class="pts" data-pick="c3-json">
    <p class="hint">선택지를 누르면 왼쪽에서 해당 줄이 켜집니다.</p>
    <button class="pick" data-key="deny"><span class="t">deny</span><span class="d">차단하고 이유를 Claude에게 전달</span></button>
    <button class="pick" data-key="ask"><span class="t">ask</span><span class="d">permissionDecision: "ask", 사용자에게 확인 요청</span></button>
    <button class="pick" data-key="allow"><span class="t">allow</span><span class="d">permissionDecision: "allow", 확인 없이 진행</span></button>
    <button class="pick" data-key="upd"><span class="t">updatedInput</span><span class="d">hookSpecificOutput 안에서 명령 자체를 바꿈 (Ch6 필터)</span></button>
    <button class="pick" data-key="simple"><span class="t">단순 차단</span><span class="d">JSON 없이 exit 2 + stderr</span></button>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  window.__c3codepick(F, 'c3-json', 'c3-pre-json', [
    '{',
    '  "hookSpecificOutput": {',
    '    "hookEventName": "PreToolUse",',
    '    "permissionDecision": "deny",',
    '    "permissionDecisionReason": "고객 원장 경로는 읽을 수 없습니다"',
    '  }',
    '}'
  ], { deny:[4,5], ask:[4], allow:[4], upd:[2], simple:[] });
});
:::

:::notes
{timing: 0.5min}
[요약]
• 훅은 stdout JSON(hookSpecificOutput)으로 exit 2보다 세밀하게 결정
• permissionDecision: deny는 차단과 이유 전달, ask는 사용자 확인, allow는 진행
• updatedInput으로 명령 자체를 바꿀 수 있음 (Ch6 필터)
• 단순 차단은 exit 2와 stderr

exit 2는 차단만 할 수 있습니다. 더 세밀하게 말하고 싶으면 훅이 JSON을 출력합니다.
{cue: demo}
permissionDecision을 deny로 하면 이유와 함께 차단하고, ask로 하면 사용자에게 묻고, allow로 하면 진행합니다. updatedInput으로 명령 자체를 바꿀 수도 있는데, 이건 Ch6에서 출력 필터로 씁니다.
:::

---
<!-- Slide 37: OS differences (PDF p42) -->
@type: content
@fit: off

## 같은 정책, OS마다 다른 준비물
DLP 훅과 샌드박스의 OS 차이

:::html
<div class="fsi c3-os" id="c3-os">
  <div class="heads" data-pick="c3-os">
    <span class="blank"></span>
    <button class="pick" data-key="mac"><span class="t">macOS</span></button>
    <button class="pick" data-key="lin"><span class="t">Linux, WSL2 (랩)</span></button>
    <button class="pick" data-key="win"><span class="t">Windows</span></button>
  </div>
  <div class="grid">
    <span class="rh">훅 스크립트</span><div class="cell" data-os="mac">bash, zsh</div><div class="cell" data-os="lin">bash</div><div class="cell" data-os="win">Git Bash 또는 powershell -File</div>
    <span class="rh">jq 같은 의존성</span><div class="cell" data-os="mac">brew로 배포</div><div class="cell" data-os="lin">dnf, apt로 배포</div><div class="cell" data-os="win">별도 배포 필요</div>
    <span class="rh">의존성 누락 시</span><div class="cell risk" data-os="mac">fail-open 위험</div><div class="cell risk" data-os="lin">fail-open 위험</div><div class="cell risk" data-os="win">fail-open 위험이 가장 큼</div>
    <span class="rh">샌드박스</span><div class="cell" data-os="mac">Seatbelt 내장</div><div class="cell" data-os="lin">bubblewrap + socat 설치</div><div class="cell" data-os="win">WSL2 안에서만</div>
    <span class="rh">스크립트 배치</span><div class="cell" data-os="mac">/Library/ 아래 root 소유</div><div class="cell" data-os="lin">/opt, /etc 아래 root 소유</div><div class="cell" data-os="win">Program Files 아래 관리자 소유</div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var host = document.querySelector('.slide-deck #c3-os') || document.getElementById('c3-os');
  var cells = Array.prototype.slice.call(host.querySelectorAll('.cell'));
  F.pick('c3-os', { onShow: function (key) {
    host.classList.toggle('sel', !!key);
    cells.forEach(function (c) { c.classList.toggle('on', c.dataset.os === key); });
  }});
});
:::

:::notes
{timing: 0.5min}
[요약]
• 훅 스크립트: macOS bash, zsh, Linux bash, Windows Git Bash 또는 powershell
• 의존성 누락 시 모든 OS가 fail-open 위험, Windows가 가장 큼
• 샌드박스: macOS Seatbelt 내장, Linux bubblewrap + socat, Windows는 WSL2 안에서만
• 스크립트는 OS별 관리자 소유 경로에 배치

같은 정책이라도 OS마다 준비물이 다릅니다.
{cue: demo}
OS를 눌러 보시면, 의존성 누락 시 fail-open 위험은 모든 OS에 있고, 특히 jq 같은 도구를 별도로 배포해야 하는 Windows가 가장 큽니다. 샌드박스는 macOS는 Seatbelt가 내장, Linux는 bubblewrap과 socat 설치가 필요하고, Windows는 WSL2 안에서만 됩니다. 랩은 Linux 환경입니다.
:::

---
<!-- Slide 38: MCP server control (PDF p43) -->
@type: content
@fit: off

## MCP 서버 하나가 통로 하나
새 반출 채널을 정책으로 닫는다

:::html
<div class="fsi c3-codepick">
  <div class="code">
    <span class="path">managed-settings.json</span>
    <pre id="c3-pre-mcp"></pre>
  </div>
  <div class="pts" data-pick="c3-mcp">
    <p class="hint">포인트를 누르면 왼쪽에서 해당 줄이 켜집니다.</p>
    <button class="pick" data-key="only"><span class="t">managed 목록만 인정</span><span class="d">allowManagedMcpServersOnly</span></button>
    <button class="pick" data-key="dest"><span class="t">목적지를 고정</span><span class="d">serverUrl, serverCommand</span></button>
    <button class="pick" data-key="deny"><span class="t">거부 목록이 허용보다 우선</span><span class="d">deniedMcpServers</span></button>
    <button class="pick" data-key="plugin"><span class="t">플러그인에 든 MCP도 같은 정책</span><span class="d">설치 경로와 상관없이 적용</span></button>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  window.__c3codepick(F, 'c3-mcp', 'c3-pre-mcp', [
    '{',
    '  "allowManagedMcpServersOnly": true,',
    '  "allowedMcpServers": [',
    '    { "serverUrl": "https://mcp.corp.example.com/*" },',
    '    { "serverCommand": ["python", "/opt/mcp/jira.py"] }',
    '  ],',
    '  "deniedMcpServers": [',
    '    { "serverName": "filesystem" }',
    '  ]',
    '}'
  ], { only:[2], dest:[3,4,5,6], deny:[7,8,9], plugin:[3,7] });
});
:::

:::notes
{timing: 0.5min}
[요약]
• MCP 서버 하나는 외부로 나가는 통로 하나
• allowManagedMcpServersOnly로 managed 목록만 인정, 목적지는 serverUrl, serverCommand로 고정
• deniedMcpServers가 허용보다 우선, 플러그인에 든 MCP도 같은 정책

MCP 서버는 하나하나가 외부로 나가는 새 통로입니다.
{cue: demo}
allowManagedMcpServersOnly를 켜면 managed에 적은 목록만 인정합니다. 허용 목록의 목적지는 이름이 아니라 serverUrl이나 serverCommand로 고정합니다. deniedMcpServers에 있으면 허용 목록에 있어도 거부되고, 플러그인에 들어 있는 MCP 서버도 같은 정책을 받기 때문에 플러그인으로 우회할 수 없습니다.
:::

---
<!-- Slide 39: Audit record locations (PDF p44) -->
@type: content
@fit: off

## 사고가 나면 무엇을 볼 수 있나
감사 기록은 어디에, 내용과 관리 포인트

:::html
<div class="fsi c3-keys c3-audit">
  <div class="list" data-pick="c3-rec">
    <button class="pick" data-key="jsonl"><span class="t">세션 JSONL</span><span class="k">로컬</span></button>
    <button class="pick" data-key="otel"><span class="t">OTel 이벤트</span><span class="k">수집기</span></button>
    <button class="pick" data-key="ct"><span class="t">CloudTrail</span><span class="k">AWS</span></button>
    <button class="pick" data-key="inv"><span class="t">Bedrock 호출 로깅</span><span class="k">AWS</span></button>
    <button class="pick" data-key="gw"><span class="t">게이트웨이</span><span class="k">Ch2, Ch6</span></button>
  </div>
  <div class="panel" data-pick-panel="c3-rec">
    <p class="hint">기록을 누르면 내용과 관리 포인트가 나옵니다.</p>
    <div data-for="jsonl"><p class="ev">대화와 도구 결과 전체 (로컬)</p><p class="ch">관리: 보존 기간, PC 반출 통제</p></div>
    <div data-for="otel"><p class="ev">tool_decision, tool_result, api_request</p><p class="ch">관리: 프롬프트 본문 삭제 후 수집</p></div>
    <div data-for="ct"><p class="ev">누가 언제 Bedrock을 호출했나</p><p class="ch">관리: 조직 트레일로 중앙화</p></div>
    <div data-for="inv"><p class="ev">프롬프트, 응답 본문 (S3, CloudWatch)</p><p class="ch">관리: 켜면 그 자체가 민감 데이터</p></div>
    <div data-for="gw"><p class="ev">사용자별 지출, 감사</p><p class="ch">관리: OIDC sub 기준, 개인정보 보존 기간</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c3-rec'); });
:::

:::notes
{timing: 0.5min}
[요약]
• 세션 JSONL: 대화와 도구 결과 전체, 보존 기간과 PC 반출 통제
• OTel: tool_decision, tool_result, api_request, 프롬프트 본문 삭제 후 수집
• CloudTrail: 누가 언제 호출했나, 조직 트레일로 중앙화
• Bedrock 호출 로깅: 본문 저장, 켜면 그 자체가 민감 데이터
• 게이트웨이: 사용자별 지출과 감사, OIDC sub 기준

사고가 났을 때 볼 수 있는 기록과 관리 포인트입니다.
{cue: demo}
세션 JSONL은 가장 자세하지만 PC에 있으니 보존 기간과 반출 통제가 필요하고, OTel은 프롬프트 본문을 지운 뒤 수집하길 권합니다. CloudTrail은 조직 트레일로 모으고, Bedrock 호출 로깅은 켜는 순간 그 저장소가 민감 데이터가 된다는 점을 기억해 주세요.
:::

---
<!-- Slide 40: Design rule (PDF p45) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">DESIGN RULE</span>
  <div class="big">DLP는 탐지율보다<br><em>남은 우회 경로의 수</em>로</div>
  <p class="lead">막은 것보다 열려 있는 길을 목록으로 관리하세요.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• DLP는 탐지율보다 남은 우회 경로의 수로 평가
• 막은 것보다 열려 있는 길을 목록으로 관리

{cue: pause}
더 알아보기를 마무리하는 설계 원칙입니다. DLP는 몇 퍼센트를 탐지했느냐보다, 아직 열려 있는 우회 경로가 몇 개냐로 평가합니다.
막은 것을 자랑하기보다 열려 있는 길을 목록으로 관리하는 것, 그게 오늘 본 다섯 층을 운영하는 방법입니다.
:::

---
<!-- Slide 41: Recap (PDF p46) -->
@type: content
@fit: off

## 가드레일 한 장 요약
Chapter 3 Key Takeaways

:::html
<div class="fsi c3-recap">
  <div class="fsi-grid-4">
    <div class="rc"><b>01</b><span>권한은 합쳐서 deny 먼저, 잠금 키는 managed로 배포</span></div>
    <div class="rc"><b>02</b><span>네이티브 DLP는 없다, 5층을 조합한다</span></div>
    <div class="rc"><b>03</b><span>샌드박스는 Bash의 curl 빈틈을 막는다</span></div>
    <div class="rc"><b>04</b><span>훅은 exit 2만 차단, 오류 경로도 exit 2로</span></div>
    <div class="rc"><b>05</b><span>Guardrails는 Bedrock 사용 시 AWS 계정 쪽에서 거는 층</span></div>
    <div class="rc"><b>06</b><span>확장은 허용 목록 + 사이드로드 금지 + mod 차단</span></div>
    <div class="rc"><b>07</b><span>auto mode: deny, ask가 먼저, 신뢰 범위는 environment, 분류기 모델은 확인</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.25min}
[요약]
• 권한은 합쳐서 deny 먼저, 잠금 키는 managed로 배포
• 네이티브 DLP는 없고 5층을 조합, 샌드박스는 curl 빈틈, 훅은 exit 2만 차단
• Guardrails는 Bedrock 사용 시 AWS 계정 쪽 층, 확장은 허용 목록과 사이드로드 금지, mod 차단
• auto mode는 deny와 ask가 먼저, 신뢰 범위는 environment, 분류기 모델은 확인

Chapter 3을 일곱 줄로 정리하겠습니다.
{cue: pause}
권한 규칙은 합쳐서 deny가 먼저이고, 강제력은 managed로 배포하는 잠금 키에서 나옵니다. 네이티브 DLP는 없으니 다섯 층을 조합합니다. 샌드박스는 Bash의 curl 빈틈을 막고, 훅은 exit 2만 차단하니 오류 경로도 exit 2로 닫습니다.
Guardrails는 Bedrock을 쓸 때 AWS 계정 쪽에서 거는 층이고, 확장은 허용 목록과 사이드로드 금지, mod 차단으로 들입니다.
auto mode에서는 deny와 ask가 먼저이고, 신뢰 범위는 environment에 적고, 분류기 모델은 --debug-file과 /status로 확인해 주세요.
:::

---
<!-- Slide 42: Thank you (PDF p47) -->
@type: thankyou
@toc: toc.html
@next: 04-ch4-subagents.html
@next-label: Chapter 4
@message: 다음은 Chapter 4. Subagents와 병렬 에이전트입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 받습니다.

:::notes
{timing: 0.25min}
[요약]
• 다음은 Chapter 4, Subagents와 병렬 에이전트
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 다음은 Chapter 4, Subagents와 병렬 에이전트입니다.
랩을 진행하시면서 궁금한 점은 Slack 채널에 언제든 남겨 주세요. 그리고 TASK 07 원복, 꼭 부탁드립니다.
:::
