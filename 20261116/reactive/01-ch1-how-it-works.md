---
remarp: true
block: ch1-how-it-works
---
<!-- Slide 1: Cover (PDF p1) -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 1. 작동 원리
## 에이전트 루프부터 이틀 동안 배울 내용까지 (v2.1.319, 2026-11-08 리허설 검증)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
if (!window.__fsiLoaded) {
  window.__fsiLoaded = true;
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/fsi.css'; document.head.appendChild(l);
  var s = document.createElement('script'); s.src = 'assets/stepviz.js'; document.head.appendChild(s);
}
:::

:::notes
{timing: 0.5min}
[요약]
• Claude Code Deep Dive Workshop, FSI Edition의 첫 챕터
• 2026년 11월, Claude Code v2.1.319 (2026-11-08 리허설 검증), Amazon Bedrock 기준
• 공식 문서 code.claude.com/docs 내용을 반영

안녕하세요, 이틀 동안 함께할 Claude Code Deep Dive Workshop의 첫 챕터를 시작하겠습니다.
이 챕터는 30분 동안 Claude Code가 어떻게 움직이는지 전체 그림을 맞추는 시간입니다.
이번 자료는 정적인 장표 대신 단계별로 움직이는 그림으로 준비했습니다. 화면 오른쪽 아래 버튼이나 키보드 아래 화살표로 단계를 넘기겠습니다.

{cue: transition}
먼저 오늘 30분의 순서를 보겠습니다.
:::

---
<!-- Slide 2: Agenda (PDF p2) -->
@type: content
@fit: off

## 강의 30분, 실습 30분
네 개의 Part와 Lab, 작동 원리에서 이틀간의 학습 지도까지

:::html
<div class="fsi fsi-agenda">
  <div class="fsi-grid-4">
    <div class="pick"><span class="k">PART 01 / 7분</span><span class="t">에이전트 루프</span><span class="d">모델과 도구가 함께 일하는 방식</span></div>
    <div class="pick"><span class="k">PART 02 / 8분</span><span class="t">컨텍스트와 세션</span><span class="d">무엇이 들어가고 어디에 남나</span></div>
    <div class="pick"><span class="k">PART 03 / 9분</span><span class="t">권한과 데이터 경로</span><span class="d">Bedrock에서 데이터가 가는 길</span></div>
    <div class="pick"><span class="k">PART 04 / 6분</span><span class="t">이틀 동안 배울 것</span><span class="d">관리와 활용, 두 갈래</span></div>
  </div>
  <div class="fsi-grid-2">
    <div class="pick lab"><span class="k">LAB / 30분, Ch2 강의 뒤 11:20</span><span class="t">Preflight + 에이전트 루프 관찰</span><span class="d">실습 환경을 점검하고, 오늘 본 루프를 직접 확인</span></div>
    <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">CLAUDE.md 계층, 추론 리전과 데이터 위치</span></div>
  </div>
</div>
:::


:::notes
{timing: 0.5min}
[요약]
• 강의는 네 Part, 7분 8분 9분 6분으로 총 30분
• 실습 30분은 Ch2 강의 뒤 11:20에 시작 (Preflight + 에이전트 루프 관찰)
• 더 알아보기는 시간이 남거나 질문이 나올 때 사용

오늘은 네 Part로 진행합니다.
첫째, 한 번의 요청이 처리되는 에이전트 루프를 보고, 둘째, 그 루프에 무엇이 실리고 어디에 남는지 봅니다.
셋째, 금융권에서 가장 많이 묻는 권한과 Bedrock 데이터 경로를 정리하고, 마지막으로 이틀 동안 어떤 순서로 배우는지 지도를 드리겠습니다.
Ch1 실습 30분은 바로 이어지지 않고, Ch2 강의가 끝난 뒤 11시 20분에 시작합니다. 뒤쪽의 더 알아보기는 시간이 남거나 질문이 나오면 펼쳐 보겠습니다.
:::

---
<!-- Slide 3: Pre-survey (PDF p3) -->
@type: content
@fit: off

## 10명 중 4명은 이제 막 시작했다
사전 설문 결과로 정한 이 챕터의 눈높이

:::html
<div class="fsi fsi-survey">
  <div class="sv-big">
    <span class="eyebrow">PRE-SURVEY</span>
    <div class="num"><span id="survey-num">40.6%</span></div>
    <p class="lead">참가 확정자 <b>138명 중 56명</b>이 Claude Code 활용 수준을 <b>입문, 초급</b>으로 답했습니다.</p>
    <p class="why">그래서 이 챕터에서 전체 구조를 먼저 맞추고, 랩 명령은 그대로 복사해 따라 할 수 있게 만들었습니다.</p>
  </div>
  <div class="bars" id="survey-bars">
    <div class="bar lo" data-v="18"><span class="lb">입문</span><span class="tr"><i></i></span><span class="v">18명</span></div>
    <div class="bar lo" data-v="38"><span class="lb">초급</span><span class="tr"><i></i></span><span class="v">38명</span></div>
    <div class="bar" data-v="64"><span class="lb">중급</span><span class="tr"><i></i></span><span class="v">64명</span></div>
    <div class="bar" data-v="15"><span class="lb">고급</span><span class="tr"><i></i></span><span class="v">15명</span></div>
    <div class="bar" data-v="3"><span class="lb">미기재</span><span class="tr"><i></i></span><span class="v">3명</span></div>
    <p class="cap">막대 길이는 응답 인원, 주황 막대가 입문과 초급(합계 56명)</p>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var bars = Array.prototype.slice.call(document.querySelectorAll('#survey-bars .bar'));
  function grow(on) { bars.forEach(function (b, i) { var w = on ? (b.dataset.v / 64 * 100) : 0; setTimeout(function () { b.querySelector('i').style.width = w + '%'; }, on ? 120 * i : 0); }); }
  F.countUp('#survey-num', 40.6, { decimals: 1, suffix: '%' });
  var host = document.getElementById('survey-bars');
  F.onEnter(host, function () { grow(false); setTimeout(function () { grow(true); }, 60); });
  grow(true);
});
:::

:::notes
{timing: 1min}
[요약]
• 참가 확정자 138명 중 56명(40.6%)이 입문 또는 초급
• 중급 64명, 고급 15명, 미기재 3명
• 그래서 구조부터 맞추고, 랩 명령은 그대로 복사해 따라 하도록 설계

{cue: pause}
사전 설문 결과부터 공유드리겠습니다. 참가 확정자 138명 가운데 56명, 40.6%가 Claude Code를 입문이나 초급 수준으로 쓰고 있다고 답하셨습니다.
중급이 64명으로 가장 많지만, 열 분 중 네 분은 이제 막 시작하신 셈입니다.
그래서 이 챕터는 전체 구조를 먼저 맞추는 데 집중하고, 랩은 명령을 그대로 복사해 따라 하실 수 있게 만들었습니다. 이미 익숙하신 분들은 이 챕터를 이후 관리 기능의 지도로 봐 주시면 됩니다.

[출처]
• 이번 워크숍 사전 설문, 참가 확정자 138명 기준
:::

---
<!-- Slide 4: Model + Tools (PDF p4) -->
@type: content
@fit: off

## 모델 + 도구 = 에이전트
모델은 생각하고, Claude Code는 그 생각을 파일과 터미널에 연결

:::html
<div class="fsi fsi-eq">
  <div class="eq">
    <div class="term"><span class="k">MODEL</span><span class="t">모델</span><span class="d">무엇을 할지 생각하고 다음 도구를 고릅니다</span></div>
    <div class="op">+</div>
    <div class="term"><span class="k">TOOLS</span><span class="t">도구</span><span class="d">파일을 읽고 고치고, 명령을 실행합니다</span></div>
    <div class="op">=</div>
    <div class="term agent"><span class="k">AGENT</span><span class="t">에이전트</span><span class="d">결과를 확인하고 다시 판단합니다</span></div>
  </div>
  <p class="harness">도구, 권한, 컨텍스트를 다루는 이 실행 틀이 <b>하네스</b>(harness)입니다. Claude Code가 바로 하네스입니다.</p>
  <p class="src">출처: code.claude.com/docs/ko/how-claude-code-works</p>
</div>
:::


:::notes
{timing: 0.5min}
[요약]
• 모델은 생각하고 도구를 고르며, 도구가 실제 파일과 터미널을 다룸
• 도구, 권한, 컨텍스트를 다루는 실행 틀이 하네스이고, Claude Code가 하네스
• 이 구조를 알면 통제 지점(도구 호출)이 보임

{cue: pause}
가장 짧게 정의하면 Claude Code는 모델에 도구를 이어 붙인 에이전트입니다. 왼쪽부터 보겠습니다.
모델은 무엇을 할지 생각하고 다음에 쓸 도구를 고릅니다. 도구는 실제로 파일을 읽고 고치고 명령을 실행합니다. 그리고 결과를 다시 모델이 보고 판단합니다.
도구와 권한, 컨텍스트를 다루는 이 실행 틀을 하네스라고 합니다. 이 관점이 중요한 이유는, 회사가 통제를 걸 수 있는 곳이 바로 모델이 도구를 부르는 지점이기 때문입니다.

{cue: transition}
그럼 이 하네스에 무엇이 붙어 있는지 한 장으로 보겠습니다.

[출처]
• code.claude.com/docs/ko/how-claude-code-works
:::

---
<!-- Slide 5: Overall architecture (PDF p5) -->
@type: content
@fit: off

## 가운데 루프에 여덟 가지가 붙는다
클릭하면 역할과 다루는 챕터를 보여 주는 Claude Code 전체 구조

:::html
<div class="fsi fsi-split wide-left fsi-hub">
  <div class="hub" data-pick="hub">
    <button class="pick" data-key="input"><span class="k">INPUT / Ch1</span><span class="t">입력과 세션</span></button>
    <button class="pick" data-key="context"><span class="k">CONTEXT / Ch1, Ch6</span><span class="t">컨텍스트</span></button>
    <button class="pick" data-key="policy"><span class="k">POLICY / Ch2, Ch3</span><span class="t">조직 정책</span></button>
    <button class="pick" data-key="subagents"><span class="k">SUBAGENTS / Ch4</span><span class="t">역할별 에이전트</span></button>
    <div class="core"><span class="k">AGENT LOOP</span><span class="t">에이전트 루프</span><span class="d">수집, 수행, 검증을 반복</span></div>
    <button class="pick" data-key="tools"><span class="k">TOOLS / Ch1, Ch6</span><span class="t">도구 실행</span></button>
    <button class="pick" data-key="hooks"><span class="k">HOOKS / Ch3, Ch6</span><span class="t">검사와 기록</span></button>
    <button class="pick" data-key="extend"><span class="k">EXTEND / Ch5</span><span class="t">플러그인, MCP, mod</span></button>
    <button class="pick" data-key="output"><span class="k">OUTPUT / Ch1, Ch3</span><span class="t">결과</span></button>
  </div>
  <div class="panel" data-pick-panel="hub">
    <p class="hint">여덟 칸 중 하나를 누르거나 아래 화살표를 누르면, 그 영역이 하는 일과 다루는 챕터가 여기에 나옵니다.</p>
    <div data-for="input"><h4>입력과 세션</h4><p>CLI, IDE, <span class="rp-detail" tabindex="0" data-tip="Continuous Integration. 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인">CI</span> 어디서든 같은 루프가 돕니다. 세션은 이어 갈 수 있고, 권한 모드가 확인 방식을 정합니다.</p><p><span class="tag">Ch1</span>오늘 Part 2와 Part 3</p></div>
    <div data-for="context"><h4>컨텍스트</h4><p>CLAUDE.md, 자동 메모리, 스킬, 대화 압축. 모델에 매번 함께 보내는 내용이라 곧 비용입니다.</p><p><span class="tag">Ch1</span><span class="tag">Ch6</span>무엇이 실리는지, 어떻게 줄이는지</p></div>
    <div data-for="policy"><h4>조직 정책</h4><p>managed settings와 권한 규칙, 모델 고정, 지출 한도. 사용자가 바꿀 수 없는 설정으로 배포합니다.</p><p><span class="tag">Ch2</span><span class="tag">Ch3</span>배포 경로와 가드레일</p></div>
    <div data-for="subagents"><h4>역할별 에이전트</h4><p>Subagent는 각자 따로 쓰는 컨텍스트와 도구 권한을 가지고, 병렬로 실행할 수 있습니다.</p><p><span class="tag">Ch4</span>역할 정의와 디스패치</p></div>
    <div data-for="tools"><h4>도구 실행</h4><p>파일, 검색, Bash, WebFetch. 반복해서 보내는 앞부분은 프롬프트 캐시로 비용을 줄입니다.</p><p><span class="tag">Ch1</span><span class="tag">Ch6</span>도구 종류와 캐시</p></div>
    <div data-for="hooks"><h4>검사와 기록</h4><p>도구 실행 전후에 끼어드는 검사(<span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span>), 그리고 <span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span>과 세션 로그로 남기는 기록입니다.</p><p><span class="tag">Ch3</span><span class="tag">Ch6</span>막는 훅과 보는 계측</p></div>
    <div data-for="extend"><h4>플러그인, MCP, mod</h4><p>팀 도구를 묶어 배포하고(플러그인), 외부 시스템을 연결하고(<span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 사내 시스템을 Claude Code 도구로 붙이는 표준">MCP</span>), 화면과 동작을 바꿉니다(mod).</p><p><span class="tag">Ch5</span>팀의 플랫폼으로 확장</p></div>
    <div data-for="output"><h4>결과</h4><p>바뀐 코드와 확인한 출력, 그리고 남는 기록(세션 <span class="rp-detail" tabindex="0" data-tip="JSON Lines. 한 줄에 JSON 객체 하나씩 적는 텍스트 형식">JSONL</span>, CloudTrail)입니다.</p><p><span class="tag">Ch1</span><span class="tag">Ch3</span>무엇이 어디에 남는가</p></div>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('hub'); });
:::

:::notes
{timing: 1min}
[요약]
• 가운데 에이전트 루프에 여덟 영역이 붙어 있음
• 영역마다 다루는 챕터가 정해져 있어 이틀 과정의 지도 역할
• 클릭이나 아래 화살표로 하나씩 열어 설명

이 한 장이 이틀 과정의 지도입니다. 가운데에 에이전트 루프가 있고, 주변 여덟 칸이 그 루프에 붙는 것들입니다.
{cue: demo}
아래 화살표로 하나씩 열어 보겠습니다. 입력과 세션, 컨텍스트, 조직 정책, 역할별 에이전트, 도구 실행, 검사와 기록, 확장, 결과 순서입니다.
칸마다 오른쪽에 담당 챕터가 나오는데요, 예를 들어 조직 정책은 Ch2와 Ch3, 확장은 Ch5에서 다룹니다.
오늘 Ch1은 이 중 루프와 입력, 컨텍스트, 결과를 깊게 보고, 나머지는 어디서 나오는지만 짚고 넘어가겠습니다.

[약어]
• DLP: Data Loss Prevention, 민감 정보 유출 방지
• OTel: OpenTelemetry, 사용량과 이벤트를 수집하는 표준
• MCP: Model Context Protocol, 외부 시스템을 도구로 붙이는 표준
:::

---
<!-- Slide 6: Part 01 divider (PDF p6-7) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 01 / PART 01</span>
  <div class="name">에이전트 루프</div>
  <p class="what">한 번의 요청이 처리되는 방식</p>
  <ol>
    <li><b>01</b>세 단계 루프</li>
    <li><b>02</b>도구 다섯 종류</li>
    <li><b>03</b>퀵 체크: Bedrock에 없는 도구</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1은 한 번의 요청이 처리되는 방식
• 세 단계 루프, 도구 다섯 종류, 퀵 체크(Bedrock에 없는 도구) 순서

첫 번째 Part, 에이전트 루프입니다.
사용자가 한 줄을 입력했을 때 Claude Code 안에서 무슨 일이 몇 번이나 일어나는지, 그리고 그때 쓰는 도구가 무엇인지 보겠습니다.
마지막에는 Bedrock 경로에서만 빠지는 도구를 퀴즈로 확인하겠습니다.
:::

---
<!-- Slide 7: Agent loop (PDF p8) -->
@type: content
@fit: off

## 수집, 수행, 검증을 필요한 만큼
에이전트 루프 세 단계와 사용자 개입

:::html
<div id="sv-loop"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var G = {id:'g',x:70,y:150,w:260,h:90,t:'컨텍스트 수집',s:'읽기, 검색, git 상태',c:'info'};
  var A = {id:'a',x:460,y:150,w:260,h:90,t:'작업 수행',s:'파일 편집, 명령 실행',c:'accent'};
  var V = {id:'v',x:850,y:150,w:260,h:90,t:'결과 검증',s:'테스트, 출력 확인',c:'success'};
  function at(n, y) { var o = {}; for (var k in n) o[k] = n[k]; o.y = y; return o; }
  F.stepviz('#sv-loop', [
    {kicker:'STEP 1', title:'세 단계를 필요한 만큼 반복합니다',
     body:'한 번의 요청은 <b>수집, 수행, 검증</b>을 돌며 처리됩니다. 단계마다 어떤 도구를 쓸지는 <b>모델이 고릅니다</b>. 정해진 스크립트가 아닙니다.',
     facts:['<b>수집</b> 파일 읽기, 검색, git 상태 확인','<b>수행</b> 파일 편집, 명령 실행','<b>검증</b> 테스트 실행, 출력 확인, 다음 행동 결정'],
     zones:[{x:20,y:40,w:1140,h:410,l:'AGENT LOOP'}],
     nodes:[G,A,V],
     edges:[{f:'g',t:'a',c:'info',l:'무엇을 바꿀지',o:0},{f:'a',t:'v',c:'accent',l:'실행 결과',o:1},{f:'v',t:'g',c:'success',side:'b',curve:150,l:'다음 행동 결정',o:2}],
     loop:true, stagger:1.1,
     snip:{hd:'한 번의 요청이 도는 모습',path:'예시 흐름 (도구 호출만 표시)',lines:['> 로그인 실패 버그를 고쳐 줘','','# 1 컨텍스트 수집','Read(src/auth/login.ts)','Grep("refreshToken")','# 2 작업 수행','Edit(src/auth/login.ts)','# 3 결과 검증','Bash(npm test)'],hl:[1,4,5,7,9],note:'사용자는 한 줄을 입력했지만, 안에서는 <b>도구 호출이 여러 번</b> 일어납니다.'}},
    {kicker:'STEP 2', title:'질문은 수집만으로 끝납니다',
     body:'"이 함수는 무슨 일을 하나요?" 같은 질문은 읽고 찾는 것으로 충분합니다. <b>편집도 실행도 없이</b> 답합니다.',
     facts:['읽기 전용 질문: 수집 한 단계','파일은 바뀌지 않음','처음 보는 저장소 탐색에 적합'],
     zones:[{x:20,y:40,w:1140,h:410,l:'AGENT LOOP'}],
     nodes:[{id:'u',x:70,y:90,w:260,h:90,t:'사용자 질문',s:'이 함수는 무슨 일을?',c:'warning'},at(G,90),{id:'r',x:850,y:90,w:260,h:90,t:'답변',s:'코드 근거와 함께',c:'success'},at(A,310),at(V,310)],
     hot:['u','g','r'],
     edges:[{f:'u',t:'g',c:'warning',o:0},{f:'g',t:'r',c:'info',l:'읽은 내용',o:1}],
     snip:{hd:'질문 한 번',path:'예시 흐름',lines:['> validateSession은 무슨 일을 하나요?','','Read(src/auth/session.ts)','Grep("validateSession")','','# 편집과 실행 없이 답변'],hl:[1,3,4],note:'수행과 검증 단계는 <b>건너뜁니다</b>.'}},
    {kicker:'STEP 3', title:'버그 수정은 여러 바퀴 돕니다',
     body:'테스트가 실패하면 실패 원인을 다시 읽고 고칩니다. <b>검증이 통과할 때까지</b> 루프가 반복됩니다.',
     facts:['검증 실패가 다음 수집의 입력','바퀴 수는 모델이 판단','반복할수록 컨텍스트가 커짐 (Part 2)'],
     zones:[{x:20,y:40,w:1140,h:410,l:'AGENT LOOP'}],
     nodes:[G,A,V],
     edges:[{f:'g',t:'a',c:'info',o:0},{f:'a',t:'v',c:'accent',o:1},{f:'v',t:'g',c:'danger',side:'b',curve:150,l:'테스트 실패, 다시',o:2}],
     loop:true, stagger:0.8,
     snip:{hd:'두 바퀴 도는 버그 수정',path:'예시 흐름',lines:['Edit(src/auth/login.ts)','Bash(npm test)        # 1 failed','','# 실패 원인을 다시 수집','Read(test/login.spec.ts)','Edit(src/auth/login.ts)','Bash(npm test)        # all passed'],hl:[2,5,6,7],note:'바퀴가 늘수록 대화와 도구 결과가 쌓입니다. 이것이 Part 2의 컨텍스트 이야기로 이어집니다.'}},
    {kicker:'STEP 4', title:'Esc로 언제든 끼어듭니다',
     body:'작업 도중 <b>Esc</b>를 누르면 멈추고 새 지시를 줄 수 있습니다. 루프는 새 지시를 컨텍스트에 넣고 다시 돕니다.',
     facts:['Esc: 지금 동작을 멈추고 방향 전환','Esc 두 번: 이전 시점으로 되감기','되감기의 한계는 Part 2에서'],
     zones:[{x:20,y:40,w:1140,h:410,l:'AGENT LOOP'}],
     nodes:[{id:'u',x:460,y:60,w:260,h:84,t:'사용자',s:'Esc, 새 지시',c:'warning'},at(G,250),at(A,250),at(V,250)],
     edges:[{f:'u',t:'a',c:'danger',l:'Esc',o:0},{f:'a',t:'g',c:'warning',l:'새 지시 반영',o:1},{f:'g',t:'a',c:'info',curve:0,pkt:false,dash:true},{f:'a',t:'v',c:'accent',o:2}],
     snip:{hd:'작업 도중 방향 바꾸기',path:'예시 흐름',lines:['Edit(test/login.spec.ts)','','# Esc','> 잠깐, 테스트 파일은 건드리지 말고 구현만 고쳐 줘','','Read(src/auth/login.ts)','Edit(src/auth/login.ts)'],hl:[3,4,6,7],note:'사람이 언제든 핸들을 잡을 수 있다는 점이 <b>스크립트 자동화와 다른 점</b>입니다.'}}
  ], {legend:[['info','수집'],['accent','수행'],['success','검증'],['warning','사용자']]});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 한 번의 요청은 수집, 수행, 검증을 필요한 만큼 반복
• 질문은 수집만으로 끝나고, 버그 수정은 여러 바퀴를 돎
• 단계마다 도구는 모델이 고르고, 사용자는 Esc로 언제든 끼어듦

{cue: demo}
에이전트 루프를 단계별로 보겠습니다. 화면의 점이 한 바퀴 도는 것이 한 번의 반복입니다.
첫 단계, 기본 모양은 컨텍스트 수집, 작업 수행, 결과 검증의 세 단계입니다. 오른쪽 예시처럼 사용자는 한 줄을 썼지만 안에서는 Read, Grep, Edit, Bash가 차례로 불립니다.
두 번째, 질문이라면 읽고 찾는 수집 단계만으로 답이 끝납니다. 파일은 바뀌지 않습니다.
세 번째, 버그 수정은 다릅니다. 테스트가 실패하면 실패 원인을 다시 읽고 고치고, 통과할 때까지 몇 바퀴든 돕니다.
네 번째, 사람은 언제든 Esc로 끼어들 수 있습니다. 이 점이 정해진 스크립트 자동화와 다른 점입니다.
{cue: question}
여러분 팀에서는 어떤 작업이 몇 바퀴짜리일지 한번 떠올려 보시면 좋겠습니다.

{cue: transition}
이 루프에서 실제로 손발이 되는 도구를 보겠습니다.
:::

---
<!-- Slide 8: Five kinds of tools (PDF p9) -->
@type: content
@fit: off

## 기본 도구는 다섯 종류다
주목할 내장 도구 2개와 도구를 더하는 방법 2개

:::html
<div class="fsi fsi-split fsi-tools">
  <div class="fsi-stack" data-pick="tools">
    <button class="pick" data-key="file"><span class="k">FILE</span><span class="t">파일 작업</span><span class="d">읽기, 편집, 생성, 이름 변경</span></button>
    <button class="pick" data-key="search"><span class="k">SEARCH</span><span class="t">검색</span><span class="d">패턴으로 파일 찾기, 정규식 내용 검색</span></button>
    <button class="pick" data-key="exec"><span class="k">EXEC</span><span class="t">실행</span><span class="d">셸 명령, 서버, 테스트, git</span></button>
    <button class="pick" data-key="web"><span class="k">WEB</span><span class="t">웹</span><span class="d">WebFetch, WebSearch (Bedrock은 WebSearch 없음)</span></button>
    <button class="pick" data-key="code"><span class="k">CODE</span><span class="t">코드 인텔리전스</span><span class="d">타입 오류, 정의로 이동 (플러그인)</span></button>
  </div>
  <div class="panel" data-pick-panel="tools">
    <p class="hint">왼쪽 도구를 누르면 무엇을 하는지, 무엇을 조심해야 하는지 보여 줍니다.</p>
    <div data-for="file"><h4>파일 작업</h4><p>Read, Write, Edit 같은 도구로 파일을 읽고 고칩니다. Claude가 한 파일 편집은 체크포인트로 되돌릴 수 있습니다.</p><p><span class="tag info">Part 2</span>체크포인트가 되돌리는 범위</p></div>
    <div data-for="search"><h4>검색</h4><p>Glob으로 파일 이름 패턴을, Grep으로 내용을 찾습니다. 수집 단계에서 가장 많이 쓰이는 도구입니다.</p><p><span class="tag ok">읽기 전용</span>파일을 바꾸지 않음</p></div>
    <div data-for="exec"><h4>실행: Bash</h4><p><b>가장 강력하고 가장 위험한 도구</b>입니다. 테스트와 빌드는 물론, 배포나 git push처럼 되돌릴 수 없는 일도 할 수 있습니다.</p><p><span class="tag no">통제 대상</span>권한 규칙과 훅으로 미리 막음 (Ch3)</p></div>
    <div data-for="web"><h4>웹: WebFetch와 WebSearch</h4><p>WebFetch는 Bedrock에서 URL을 읽는 내장 도구입니다. WebSearch는 Anthropic 내장 웹 검색이라 <b>Bedrock 경로에는 없습니다</b>.</p><p><span class="tag cond">Bedrock</span>검색이 필요하면 WebFetch에 URL 지정, 또는 MCP</p></div>
    <div data-for="code"><h4>코드 인텔리전스</h4><p>타입 오류를 보거나 정의로 이동하는 기능은 플러그인으로 더합니다.</p><p><span class="tag info">Ch5</span>도구를 더하는 MCP, 도구를 묶어 배포하는 플러그인</p></div>
    <div class="more4">
      <div><b>Bash</b><span>가장 강력하고 가장 위험</span></div>
      <div><b>WebFetch</b><span>Bedrock에서 URL 읽기 (내장)</span></div>
      <div><b>MCP</b><span>도구를 더하는 표준</span></div>
      <div><b>플러그인</b><span>도구를 묶어 배포</span></div>
    </div>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('tools'); });
:::

:::notes
{timing: 2min}
[요약]
• 다섯 종류: 파일, 검색, 실행, 웹, 코드 인텔리전스
• Bash가 가장 강력하고 가장 위험, 통제의 중심 (Ch3)
• Bedrock에는 WebSearch가 없고 WebFetch는 있음
• 도구는 MCP로 더하고 플러그인으로 묶어 배포 (Ch5)

도구가 Claude Code를 에이전트로 만듭니다. 내장 도구는 크게 다섯 종류입니다.
{cue: demo}
하나씩 눌러 보겠습니다. 파일 작업과 검색은 수집과 수행 단계의 기본입니다. 실행, 즉 Bash는 테스트와 빌드를 돌리는 가장 강력한 도구이면서, 배포나 push처럼 되돌릴 수 없는 일도 할 수 있는 가장 위험한 도구입니다. 그래서 Ch3의 통제는 대부분 Bash를 향합니다.
웹은 Bedrock 경로에서 차이가 있습니다. WebFetch는 되지만 WebSearch는 없습니다. 바로 다음 퀴즈에서 확인하겠습니다.
코드 인텔리전스는 플러그인으로 더하고, 회사 도구는 MCP로 붙여 플러그인으로 묶어 배포합니다. 이건 Ch5입니다.

[약어]
• MCP: Model Context Protocol, 외부 시스템을 도구로 붙이는 표준
:::

---
<!-- Slide 9: Quick check 1 (PDF p10) -->
@type: content
@fit: off

## Bedrock에서 못 쓰는 도구는?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="qc-1">
  <p class="q">Amazon Bedrock 경로에서 Claude가 쓸 수 없는 도구는?</p>
  <div class="opts">
    <button class="opt"><b>A</b>Bash</button>
    <button class="opt"><b>B</b>WebFetch</button>
    <button class="opt right"><b>C</b>WebSearch</button>
    <button class="opt"><b>D</b>Read</button>
  </div>
  <p class="ans">정답 C. Bedrock에서는 WebFetch에 특정 URL을 지정해 웹을 읽습니다. (feature-availability 문서)</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#qc-1'); });
:::

:::notes
{timing: 1min}
{cue: poll}
[요약]
• 정답 C, WebSearch
• Bedrock 대안: WebFetch에 특정 URL 지정, 검색은 MCP
• 아래 화살표나 보기 클릭으로 정답 공개

퀴즈입니다. 손을 들어 답해 주세요. Amazon Bedrock 경로에서 Claude가 쓸 수 없는 도구는 무엇일까요? A Bash, B WebFetch, C WebSearch, D Read입니다.
{cue: pause}
잠시 기다렸다가 아래 화살표로 정답을 열겠습니다.
정답은 C, WebSearch입니다. Anthropic의 내장 웹 검색이라 Bedrock 경로에는 빠져 있습니다. 대신 WebFetch에 특정 URL을 지정해 읽거나, 사내 검색을 MCP로 붙이면 됩니다.

[출처]
• code.claude.com/docs feature-availability
:::

---
<!-- Slide 10: Part 02 divider (PDF p11) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 01 / PART 02</span>
  <div class="name">컨텍스트와 세션</div>
  <p class="what">무엇이 들어가고 어디에 남는가</p>
  <ol>
    <li><b>01</b>컨텍스트에 실리는 것</li>
    <li><b>02</b>세션은 로컬 파일</li>
    <li><b>03</b>체크포인트의 한계</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2는 컨텍스트에 무엇이 실리고 세션이 어디에 남는지
• 컨텍스트, 세션 파일, 체크포인트 순서

두 번째 Part입니다. 방금 본 루프가 돌 때마다 모델에 무엇이 함께 실려 가는지, 그리고 그 대화가 어디에 남는지 보겠습니다.
금융권에서는 이 부분이 곧 데이터 통제의 출발점입니다.
:::

---
<!-- Slide 11: Context window (PDF p12, p28) -->
@type: content
@fit: off

## 컨텍스트에는 다섯 가지가 실린다
항상 실리는 것과 필요할 때 오는 것, 그리고 줄이는 방법

:::html
<div class="fsi fsi-split fsi-ctx">
  <div class="win">
    <div class="win-hd"><span>CONTEXT WINDOW</span><span class="muted">블록 크기는 설명용 예시</span></div>
    <div class="stack" id="ctx-stack">
      <div class="seg" data-seg="sys"><span>시스템 프롬프트와 도구 정의</span></div>
      <div class="seg" data-seg="md"><span>CLAUDE.md</span></div>
      <div class="seg" data-seg="mem"><span>자동 메모리</span></div>
      <div class="seg" data-seg="skill"><span>스킬, MCP 목록</span></div>
      <div class="seg conv" data-seg="conv"><span>대화와 도구 결과</span></div>
      <div class="free"><span>남은 공간</span></div>
    </div>
  </div>
  <div class="fsi-stack">
    <div class="fsi-stack items" data-pick="ctx">
      <button class="pick" data-key="sys"><span class="k">1 / always</span><span class="t">시스템 프롬프트</span></button>
      <button class="pick" data-key="md"><span class="k">2 / always</span><span class="t">CLAUDE.md</span></button>
      <button class="pick" data-key="mem"><span class="k">3 / session start</span><span class="t">자동 메모리</span></button>
      <button class="pick" data-key="skill"><span class="k">4 / on demand</span><span class="t">스킬, MCP</span></button>
      <button class="pick" data-key="conv"><span class="k">5 / /context로 확인</span><span class="t">대화와 도구 결과</span></button>
    </div>
    <div class="panel" data-pick-panel="ctx">
      <p class="hint">항목을 누르면 왼쪽 창에서 자리를 표시하고, 줄이는 방법을 보여 줍니다.</p>
      <div data-for="sys"><p>Claude Code의 기본 지침과 도구 정의(내장 도구 + MCP 서버 스키마). 기본 지침은 사용자가 줄일 수 없고, <b>줄이는 법</b>은 쓰지 않는 MCP 서버 끄기입니다.</p></div>
      <div data-for="md"><p>프로젝트, 사용자 지침으로 <b>매 요청에 실립니다</b>. <b>줄이는 법</b>: 200줄 이하, 절차는 스킬로.</p></div>
      <div data-for="mem"><p>MEMORY.md의 <b>첫 200줄 또는 25KB</b>를 세션 시작에 싣습니다.</p></div>
      <div data-for="skill"><p>이름과 설명만 항상 실리고, 본문과 정의는 <b>필요할 때</b> 불러옵니다. <b>줄이는 법</b>: 설명을 짧고 구체적으로.</p></div>
      <div data-for="conv"><p><b>가장 빨리 커지는 부분</b>이자 자동 압축 대상입니다. <b>줄이는 법</b>: 큰 출력은 훅으로 거르기, /clear.</p></div>
    </div>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var stack = document.getElementById('ctx-stack');
  var segs = Array.prototype.slice.call(stack.querySelectorAll('.seg'));
  F.pick('ctx', { onShow: function (key) {
    stack.classList.toggle('has-pick', !!key);
    segs.forEach(function (s) { s.classList.toggle('on', s.dataset.seg === key); });
    stack.classList.toggle('grown', key === 'conv');
  }});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 시스템 프롬프트, CLAUDE.md는 항상, 자동 메모리는 세션 시작에, 스킬과 MCP는 필요할 때
• 대화와 도구 결과가 가장 빨리 커지고 자동 압축 대상
• /context로 지금 무엇이 자리를 차지하는지 확인
• 항목마다 줄이는 방법이 다름 (Ch6에서 실습)

컨텍스트는 모델에 매번 함께 보내는 내용입니다. 많을수록 비용이 커지고, 회사 입장에서는 밖으로 나가는 데이터의 범위이기도 합니다.
{cue: demo}
아래 화살표로 다섯 항목을 차례로 짚겠습니다. 시스템 프롬프트와 도구 정의, 그리고 CLAUDE.md는 항상 실립니다. 자동 메모리는 MEMORY.md의 첫 200줄이나 25KB까지 세션 시작에 실립니다. 스킬과 MCP는 이름과 설명만 항상 있고 본문은 필요할 때 옵니다.
마지막, 대화와 도구 결과를 누르면 왼쪽 블록이 커집니다. 실제로 가장 빨리 커지는 부분이고, 그래서 자동 압축 대상입니다.
블록 크기는 설명용 예시이고, 실제 비율은 랩에서 /context로 직접 보시겠습니다.

[출처]
• code.claude.com/docs, 자동 메모리 로드 한도 200줄 또는 25KB
:::

---
<!-- Slide 12: Session file and checkpoints (PDF p13, p14, p31) -->
@type: content
@fit: off

## 세션은 내 PC의 평문 파일이다
세션 파일, 세션 명령, 보존 기간, 체크포인트의 범위

:::html
<div id="sv-session"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var PCZ = {x:20,y:40,w:740,h:410,l:'개발자 PC'}, AWZ = {x:800,y:40,w:360,h:410,l:'내 AWS 계정'};
  F.stepviz('#sv-session', [
    {kicker:'STEP 1', title:'대화와 도구 결과가 PC에 남습니다',
     body:'세션은 <b>개발자 PC의 JSONL(한 줄에 JSON 하나) 파일</b>입니다. 대화뿐 아니라 <b>도구 출력까지 평문으로</b> 저장됩니다. Bedrock으로는 추론 요청만 갑니다.',
     facts:['한 세션 = 파일 하나','도구 결과까지 평문 저장','고객 데이터를 다루면 단말 보안과 함께 검토'],
     zones:[PCZ, AWZ],
     nodes:[{id:'cc',x:60,y:100,w:280,h:90,t:'Claude Code',s:'CLI 세션',c:'accent'},{id:'t',x:430,y:100,w:290,h:90,t:'도구 실행',s:'Read, Edit, Bash',c:'accent'},{id:'f',x:60,y:310,w:380,h:90,t:'<session-id>.jsonl',s:'대화, 도구 결과 (평문)',c:'info'},{id:'b',x:850,y:200,w:270,h:90,t:'Amazon Bedrock',s:'추론 요청만',c:'info'}],
     edges:[{f:'cc',t:'t',c:'accent',l:'도구 호출',o:0},{f:'cc',t:'f',c:'info',l:'기록',o:1},{f:'t',t:'f',c:'info',l:'출력도 기록',o:2},{f:'cc',t:'b',c:'info',dash:true,curve:-60}],
     snip:{hd:'세션 파일 위치',path:'session storage',lines:['~/.claude/projects/<project>/<session-id>.jsonl','','# 한 줄에 이벤트 하나, 평문','사용자 메시지','모델 응답','도구 호출과 그 결과'],hl:[1],note:'백업이나 동기화 도구가 이 폴더를 회사 밖으로 복사하지 않는지도 확인합니다.'}},
    {kicker:'STEP 2', title:'네 가지 명령으로 세션을 다룹니다',
     body:'<b>/context</b>로 자리를 확인하고, <b>/compact</b>로 줄이고, <b>/clear</b>로 새로 시작하고, <b>/resume</b>으로 이어 갑니다.',
     facts:['/clear는 새 세션이라 비용 0에서 시작','터미널에서 이어 가기: claude --continue','목록에서 골라 재개: claude --resume'],
     zones:[{x:20,y:40,w:1140,h:410,l:'SESSION'}],
     nodes:[{id:'s',x:460,y:200,w:260,h:90,t:'현재 세션',s:'컨텍스트 윈도우',c:'accent'},{id:'c1',x:60,y:80,w:320,h:84,t:'/context',s:'지금 무엇이 자리를 차지하나',c:'info'},{id:'c2',x:800,y:80,w:320,h:84,t:'/compact',s:'대화를 요약해 공간 확보',c:'info'},{id:'c3',x:60,y:330,w:320,h:84,t:'/clear',s:'새 세션 시작 (비용 0)',c:'info'},{id:'c4',x:800,y:330,w:320,h:84,t:'/resume',s:'이전 세션 이어서',c:'info'}],
     edges:[{f:'c1',t:'s',c:'info',o:0},{f:'c2',t:'s',c:'info',o:1},{f:'c3',t:'s',c:'info',o:2},{f:'c4',t:'s',c:'info',o:3}],
     snip:{hd:'세션 안에서',path:'Claude Code 프롬프트',lines:['/context   # 지금 무엇이 자리를 차지하는지','/compact   # 대화를 요약해 공간 확보','/clear     # 새 세션 시작 (비용 0)','/resume    # 이전 세션 이어서','','# 터미널에서','claude --continue   # 가장 최근 세션','claude --resume     # 목록에서 골라 재개'],hl:[1,2,3,4,7,8],note:'랩에서 /context를 직접 실행해 Part 2의 다섯 항목을 눈으로 확인합니다.'}},
    {kicker:'STEP 3', title:'보존 기간은 정책으로 정합니다',
     body:'세션 파일 보존 기간은 <b>cleanupPeriodDays</b>(기본 30일)입니다. 고객 데이터를 다루면 <b>정책으로 짧게</b> 정해 배포합니다.',
     facts:['기본 30일 보존','managed settings로 고정 배포 (Ch2)','PC 백업, 동기화 대상에서 제외 검토'],
     zones:[PCZ, AWZ],
     nodes:[{id:'f',x:60,y:200,w:300,h:90,t:'세션 JSONL',s:'평문 기록',c:'info'},{id:'k',x:430,y:80,w:300,h:90,t:'cleanupPeriodDays',s:'기본 30일',c:'info'},{id:'m',x:430,y:320,w:300,h:90,t:'managed settings',s:'사용자가 못 바꿈 (Ch2)',c:'accent'},{id:'bk',x:850,y:200,w:270,h:90,t:'백업, 동기화',s:'제외 대상인지 검토',c:'muted'}],
     edges:[{f:'k',t:'f',c:'info',l:'지난 파일 정리',o:1},{f:'m',t:'k',c:'accent',l:'값을 고정',o:0},{f:'f',t:'bk',c:'muted',dash:true}],
     snip:{hd:'보존 기간을 정책으로',path:'managed-settings.json (Ch2에서 배포), 7은 예시 값',lines:['{','  "cleanupPeriodDays": 7','}'],hl:[2],note:'값은 회사 보존 정책에 맞춥니다. 배포 방법은 Ch2에서 다룹니다.'}},
    {kicker:'STEP 4', title:'체크포인트는 Claude의 편집과 대화만 되돌립니다',
     body:'<b>Esc 두 번</b> 또는 <b>/rewind</b>로 복원 메뉴를 열고, 되돌릴 범위(<b>코드, 대화</b>)를 고릅니다. 되돌아가는 것은 <b>Claude가 한 파일 편집</b>입니다.',
     facts:['되돌릴 수 있음: Claude가 한 파일 편집','복원 메뉴에서 되돌릴 범위(코드, 대화) 선택','바깥 세상에 이미 나간 일은 그대로'],
     zones:[{x:20,y:40,w:560,h:410,l:'되돌릴 수 있음',tone:'success'},{x:610,y:40,w:550,h:410,l:'되돌릴 수 없음',tone:'danger'}],
     nodes:[{id:'r',x:320,y:200,w:230,h:90,t:'Esc 두 번',s:'/rewind',c:'success'},{id:'e1',x:50,y:110,w:230,h:84,t:'파일 편집',s:'Claude가 한 것',c:'success'},{id:'e2',x:50,y:300,w:230,h:84,t:'대화',s:'이전 시점으로',c:'success'},
            {id:'x1',x:880,y:70,w:250,h:62,t:'DB 변경',c:'danger'},{id:'x2',x:880,y:145,w:250,h:62,t:'외부 API 호출',c:'danger'},{id:'x3',x:880,y:220,w:250,h:62,t:'배포',c:'danger'},{id:'x4',x:880,y:295,w:250,h:62,t:'메시지, 메일 전송',c:'danger'},{id:'x5',x:880,y:370,w:250,h:62,t:'git push',c:'danger'}],
     hot:['r','e1','e2'],
     edges:[{f:'r',t:'e1',c:'success',o:0},{f:'r',t:'e2',c:'success',o:0}],
     snip:{hd:'세션 안에서 되감기',path:'Claude Code 프롬프트',lines:['Esc Esc    # 복원 메뉴','/rewind    # 같은 기능','','# 메뉴에서 되돌릴 범위 선택: 코드, 대화'],hl:[1,2,4],note:'체크포인트는 실수한 <b>편집</b>을 되돌리는 안전망이지, 모든 일을 되돌리는 장치가 아닙니다.'}},
    {kicker:'STEP 5', title:'되돌릴 수 없는 일은 미리 막습니다',
     body:'DB 변경, 외부 API 호출, 배포, 전송, git push는 체크포인트 밖입니다. 이런 일은 <b>권한 규칙과 훅으로 실행 전에</b> 막습니다.',
     facts:['사후 되돌리기가 아니라 사전 차단','권한 규칙: 허용, 확인, 거부','훅: 도구 실행 전 검사 (Ch3)'],
     zones:[{x:20,y:40,w:560,h:410,l:'되돌릴 수 있음',tone:'success'},{x:610,y:40,w:550,h:410,l:'되돌릴 수 없음',tone:'danger'}],
     nodes:[{id:'r',x:320,y:200,w:230,h:90,t:'Esc 두 번',s:'/rewind',c:'success'},{id:'e1',x:50,y:110,w:230,h:84,t:'파일 편집',s:'Claude가 한 것',c:'success'},{id:'e2',x:50,y:300,w:230,h:84,t:'대화',s:'이전 시점으로',c:'success'},
            {id:'gd',x:630,y:190,w:210,h:110,t:'권한 규칙',s:'훅 (Ch3)',c:'warning'},
            {id:'x1',x:880,y:70,w:250,h:62,t:'DB 변경',c:'danger'},{id:'x2',x:880,y:145,w:250,h:62,t:'외부 API 호출',c:'danger'},{id:'x3',x:880,y:220,w:250,h:62,t:'배포',c:'danger'},{id:'x4',x:880,y:295,w:250,h:62,t:'메시지, 메일 전송',c:'danger'},{id:'x5',x:880,y:370,w:250,h:62,t:'git push',c:'danger'}],
     hot:['gd','x1','x2','x3','x4','x5'],
     edges:[{f:'gd',t:'x1',c:'warning',o:0,side:'h'},{f:'gd',t:'x2',c:'warning',o:1,side:'h'},{f:'gd',t:'x3',c:'warning',o:2,side:'h'},{f:'gd',t:'x4',c:'warning',o:3,side:'h'},{f:'gd',t:'x5',c:'warning',o:4,side:'h'}],
     stagger:0.25,
     snip:{hd:'실행 전에 막는 자리',path:'Ch3에서 실습',lines:['# 체크포인트 밖의 일','git push, 배포, 메일 전송','DB 변경, 외부 API 호출','','# 실행 전에 거는 통제','permissions.deny     # 권한 규칙','PreToolUse 훅        # 도구 실행 전 검사'],hl:[6,7],note:'Ch3에서 DLP 훅으로 이 자리를 직접 막아 봅니다.'}}
  ], {legend:[['accent','Claude Code'],['info','파일, 명령, 추론'],['success','되돌릴 수 있음'],['danger','되돌릴 수 없음']]});
});
:::

:::notes
{timing: 2min}
[요약]
• 세션은 ~/.claude/projects 아래 JSONL, 도구 결과까지 평문
• /context, /compact, /clear, /resume과 claude --continue, --resume
• 보존 기간 cleanupPeriodDays 기본 30일, 정책으로 짧게 배포 (Ch2)
• 체크포인트(Esc 두 번, /rewind)는 Claude가 한 편집과 대화만 되돌림, 복원 메뉴에서 범위 선택
• DB 변경, 배포, git push 같은 일은 권한 규칙과 훅으로 사전 차단 (Ch3)

{cue: demo}
세션이 어디에 남는지 단계별로 보겠습니다.
첫째, 대화와 도구 결과는 개발자 PC의 JSONL 파일로 남습니다. 도구 출력까지 평문입니다. 금융권에서는 이 파일이 단말 보안과 백업 정책 범위에 들어가는지 확인이 필요합니다.
둘째, 세션은 네 가지 명령으로 다룹니다. 특히 /clear는 새 세션이라 비용 0에서 다시 시작합니다.
셋째, 보존 기간은 cleanupPeriodDays, 기본 30일입니다. 화면의 7은 예시 값이고, 회사 정책에 맞춰 Ch2에서 managed settings로 고정합니다.
넷째, 체크포인트입니다. Esc 두 번이나 /rewind로 복원 메뉴를 열고, 코드와 대화 중 무엇을 되돌릴지 고릅니다. 되돌릴 수 있는 건 Claude가 한 파일 편집과 대화입니다.
다섯째, DB 변경, 외부 API 호출, 배포, 메일, git push는 되돌릴 수 없습니다. 그래서 이런 일은 사후가 아니라 실행 전에, 권한 규칙과 훅으로 막습니다.

[약어]
• JSONL: JSON Lines, 한 줄에 JSON 객체 하나씩 적는 텍스트 형식
:::

---
<!-- Slide 13: CLAUDE.md 200 lines (PDF p15) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">CLAUDE.md</span>
  <div class="big"><em>200줄</em> 이하</div>
  <p class="lead">CLAUDE.md는 매 요청마다 실립니다. 작업별 지침은 스킬로 옮겨 필요할 때만 불러옵니다.</p>
  <p class="src">출처: code.claude.com/docs/en/costs, Move instructions from CLAUDE.md to skills</p>
</div>
:::

:::notes
{timing: 1min}
[요약]
• CLAUDE.md는 매 요청마다 실리므로 짧게, 200줄 이하
• 작업별 절차는 스킬로 옮겨 필요할 때만 로드
• Ch6에서 CLAUDE.md 다이어트를 실습

{cue: pause}
Part 2에서 하나만 기억하신다면 이 숫자입니다. CLAUDE.md는 200줄 이하.
방금 본 것처럼 CLAUDE.md는 매 요청마다 실립니다. 규칙을 많이 넣을수록 모든 요청이 비싸지고, 정작 중요한 지침이 묻힙니다.
배포 절차나 특정 작업 방법처럼 가끔 필요한 내용은 스킬로 옮겨 필요할 때만 불러오는 것이 공식 문서의 권고입니다. Ch6에서 직접 줄여 보겠습니다.

[출처]
• code.claude.com/docs/en/costs
:::

---
<!-- Slide 14: Part 03 divider (PDF p16) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 01 / PART 03</span>
  <div class="name">권한과 데이터 경로</div>
  <p class="what">Bedrock 위에서 데이터가 가는 길</p>
  <ol>
    <li><b>01</b>권한 모드</li>
    <li><b>02</b>데이터 경로</li>
    <li><b>03</b>Bedrock에서 되는 것과 안 되는 것</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 3은 권한 모드와 Bedrock 데이터 경로
• 금융권에서 가장 많이 받는 질문이 모인 Part

세 번째 Part입니다. 금융권 고객께서 가장 많이 물어보시는 두 가지, 무엇을 허락 없이 할 수 있는지와 데이터가 어디로 가는지를 정리하겠습니다.
:::

---
<!-- Slide 15: Permission modes (PDF p17, p30) -->
@type: content
@fit: off

## Shift+Tab 한 번에 확인 방식이 바뀐다
권한 모드 여섯 가지와 금융권 권고

:::html
<div class="fsi fsi-perm" id="perm">
  <div class="term">
    <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="ttl">claude</span></div>
    <div class="body">
      <p class="line">&gt; 결제 모듈 테스트를 고쳐 줘</p>
      <p class="line act" id="perm-act"></p>
      <div class="status"><span class="mode" id="perm-mode"></span><span class="hint">shift+tab to cycle</span></div>
    </div>
    <button class="btn btn-primary cyc" data-cycle>Shift+Tab 누르기</button>
    <p class="cap">순환 순서: auto, default(화면 표기 manual), acceptEdits, plan. 터미널 문구는 설명용 예시</p>
  </div>
  <div class="modes" id="perm-modes">
    <div class="m" data-m="auto"><span class="n">auto</span><span class="b">분류기가 위험한 동작만 차단</span><span class="r">Bedrock 대화형 기본. deny, ask 경계와 managed 설정을 정한 뒤 허용 (Ch3)</span></div>
    <div class="m" data-m="default"><span class="n">default (manual)</span><span class="b">읽기만 자동, 편집과 명령은 확인</span><span class="r">처음 보는 저장소</span></div>
    <div class="m" data-m="acceptEdits"><span class="n">acceptEdits</span><span class="b">파일 편집과 mkdir, mv, cp 같은 파일 명령은 자동, 그 밖은 확인</span><span class="r">신뢰된 저장소</span></div>
    <div class="m" data-m="plan"><span class="n">plan</span><span class="b">계획 먼저 제안, 승인 전 소스 편집 보류</span><span class="r">레거시 분석, 리뷰</span></div>
    <div class="m off" data-m="dontAsk"><span class="n">dontAsk</span><span class="b">사전 승인 도구만, 나머지는 거부</span><span class="r"><span class="rp-detail" tabindex="0" data-tip="Continuous Integration. 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인">CI</span>, 헤드리스</span></div>
    <div class="m off danger" data-m="bypassPermissions"><span class="n">bypassPermissions</span><span class="b">모든 확인 생략</span><span class="r">격리된 컨테이너에서만, disableBypassPermissionsMode로 잠금 (Ch2)</span></div>
    <p class="cap">아래 두 모드는 Shift+Tab 순환에 없고, 설정이나 실행 옵션으로 정합니다.</p>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var order = ['auto', 'default', 'acceptEdits', 'plan'];
  var label = { auto: '⏵⏵ auto mode on', 'default': 'manual', acceptEdits: '⏵⏵ accept edits on', plan: '⏸ plan mode on' };
  var act = {
    auto: 'Read, Edit, Bash(npm test) 자동 진행\n위험한 동작만 분류기가 차단',
    'default': 'Read 자동\nEdit(src/pay/refund.ts) 허용할까요? [y/n]',
    acceptEdits: 'Edit 자동 적용\nBash(npm test) 실행할까요? [y/n]',
    plan: '수정 계획을 먼저 제안\n승인 전까지 소스 편집 보류'
  };
  var rows = Array.prototype.slice.call(document.querySelectorAll('#perm-modes .m'));
  F.cycle('#perm', order.length, function (i) {
    var m = order[i];
    document.getElementById('perm-mode').textContent = label[m];
    document.getElementById('perm-act').textContent = act[m];
    rows.forEach(function (r) { r.classList.toggle('on', r.dataset.m === m); });
  });
});
:::

:::notes
{timing: 2.5min}
[요약]
• Shift+Tab으로 auto, default(화면 표기 manual), acceptEdits, plan을 순환
• default는 처음 보는 저장소, acceptEdits는 신뢰된 저장소, plan은 분석과 리뷰
• auto는 Bedrock 대화형 기본, deny와 ask 경계, managed 설정을 정한 뒤 허용 (Ch3)
• dontAsk는 CI와 헤드리스, bypassPermissions는 조직이 잠금 (Ch2)

{cue: demo}
권한 모드는 Claude가 무엇을 묻지 않고 할 수 있는지를 정합니다. 왼쪽 터미널에서 Shift+Tab을 눌러 보겠습니다. 아래 화살표로도 넘어갑니다.
auto에서는 분류기가 위험한 동작만 막고 나머지는 진행합니다. Bedrock 대화형 세션은 이 모드로 시작하고, 그 경계를 어떻게 설계하는지는 Ch3에서 봅니다.
default로 바꾸면, 화면에는 manual로 표시되는데, 읽기만 자동이고 편집과 명령은 매번 묻습니다. 처음 보는 저장소에 권합니다. acceptEdits는 파일 편집과 mkdir, mv, cp 같은 파일 명령은 자동, 그 밖은 확인이라 신뢰된 저장소에 맞습니다. plan은 계획을 먼저 제안하고 승인 전까지 소스 편집을 보류해서 레거시 분석과 리뷰에 좋습니다.
오른쪽 아래 두 모드는 순환에 없습니다. dontAsk는 CI와 헤드리스용이고, 모든 확인을 생략하는 bypassPermissions는 조직이 disableBypassPermissionsMode로 잠그는 것을 권합니다.
:::

---
<!-- Slide 16: Bedrock data path (PDF p18, p32) -->
@type: content
@fit: off

## 실행은 PC, 추론은 내 계정의 Bedrock
Bedrock 경로의 데이터 흐름과 그 밖의 통신

:::html
<div id="sv-bedrock"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:520,h:410,l:'개발자 PC'},{x:640,y:40,w:520,h:410,l:'내 AWS 계정',tone:'info'}];
  var CC = {id:'cc',x:70,y:100,w:290,h:90,t:'Claude Code',s:'에이전트 루프',c:'accent'};
  var LO = {id:'lo',x:70,y:310,w:290,h:90,t:'로컬 실행',s:'파일 읽기, 편집, 명령',c:'accent'};
  var BR = {id:'br',x:760,y:100,w:320,h:90,t:'Amazon Bedrock',s:'추론 프로필',c:'info'};
  var CT = {id:'ct',x:760,y:310,w:320,h:90,t:'AWS CloudTrail',s:'API 호출 기록',c:'warning'};
  var envSnip = ['{','  "env": {','    "CLAUDE_CODE_USE_BEDROCK": "1",','    "AWS_REGION": "us-east-1"','  }','}','# 자격 증명은 IAM, 요청마다 SigV4 서명'];
  F.stepviz('#sv-bedrock', [
    {kicker:'OVERVIEW', title:'네 단계가 한 바퀴입니다',
     body:'파일을 읽고 고치고 명령을 돌리는 일은 <b>모두 PC에서</b> 일어납니다. AWS 계정으로 가는 것은 <b>추론 요청</b>뿐입니다.',
     facts:['1 로컬 실행','2 요청 전송: 프롬프트, 읽은 코드, 명령 출력 (SigV4 서명)','3 Bedrock 추론: 처리 리전은 추론 프로필 범위','4 응답과 도구 호출, 다시 1로'],
     zones:Z, nodes:[CC,LO,BR,CT],
     edges:[{f:'cc',t:'lo',c:'accent',o:0},{f:'cc',t:'br',c:'info',curve:-30,l:'요청',o:1},{f:'br',t:'ct',c:'warning',o:2},{f:'br',t:'cc',c:'info',curve:30,l:'응답',o:3}],
     loop:true, stagger:0.9,
     snip:{hd:'Bedrock 경로로 켜기',path:'설정 예시 (워크숍 환경은 ~/.claude/settings.json의 env에 미리 설정)',lines:envSnip,hl:[3,4],note:'Bedrock, Vertex, Foundry 경로에서는 Anthropic으로 가는 <b>오류 리포트와 텔레메트리가 기본으로 꺼져</b> 있습니다.'}},
    {kicker:'STEP 1', title:'로컬 실행: 코드는 PC를 떠나지 않습니다',
     body:'Read, Edit, Bash 같은 도구는 <b>개발자 PC에서</b> 실행됩니다. 저장소 전체가 AWS로 올라가는 것이 아닙니다.',
     facts:['파일 읽기와 편집은 PC','명령 실행도 PC','모델에 가는 것은 컨텍스트에 실린 내용'],
     zones:Z, nodes:[CC,LO,BR,CT], hot:['cc','lo'],
     edges:[{f:'cc',t:'lo',c:'accent',l:'Read, Edit, Bash',o:0},{f:'lo',t:'cc',c:'accent',curve:120,side:'v',l:'결과',o:1}],
     loop:true, stagger:0.9,
     snip:{hd:'PC에서 일어나는 일',path:'예시 흐름',lines:['Read(src/pay/refund.ts)','Edit(src/pay/refund.ts)','Bash(npm test)','','# 모두 로컬에서 실행'],hl:[1,2,3],note:'그래서 <b>무엇이 컨텍스트에 실리는가</b>가 곧 무엇이 나가는가입니다.'}},
    {kicker:'STEP 2', title:'요청 전송: IAM으로 서명합니다',
     body:'프롬프트와 <b>읽은 코드, 명령 출력</b>을 묶어 <b>IAM(AWS 권한 서비스) 자격 증명과 SigV4(AWS 요청 서명 방식)로 서명</b>한 뒤 내 계정의 Bedrock으로 보냅니다.',
     facts:['보내는 것: 프롬프트, 읽은 코드, 명령 출력','인증: IAM, SigV4 서명','네트워크: VPC 엔드포인트로도 통제'],
     zones:Z, nodes:[CC,LO,BR,CT], hot:['cc','br'],
     edges:[{f:'cc',t:'br',c:'info',l:'프롬프트, 코드, 출력',o:0}],
     loop:true,
     snip:{hd:'Bedrock 경로로 켜기',path:'설정 예시 (settings.json의 env)',lines:envSnip,hl:[7],note:'통제 수단은 익숙한 AWS 그대로입니다: <b>IAM, VPC 엔드포인트, CloudTrail</b>.'}},
    {kicker:'STEP 3', title:'Bedrock 추론: 내 계정에서 호출',
     body:'추론은 <b>내 AWS 계정</b>에서 호출되고, 처리 리전은 <b>추론 프로필 범위</b>를 따릅니다(이 랩: global). 호출은 <b>CloudTrail</b>에 남습니다.',
     facts:['호출은 내 계정에서','처리 리전은 추론 프로필 범위 (이 랩: global)','CloudTrail로 감사'],
     zones:Z, nodes:[CC,LO,BR,CT], hot:['br','ct'],
     edges:[{f:'br',t:'ct',c:'warning',l:'호출 기록',o:0}],
     loop:true,
     snip:{hd:'남는 기록',path:'AWS 계정 안',lines:['# 누가, 언제, 어떤 모델을 호출했나','CloudTrail  bedrock 호출 이벤트','','# 모델 고정은 Ch2','ANTHROPIC_DEFAULT_*_MODEL'],hl:[2,5],note:'모델 ID 접두사가 처리 위치를 정합니다. 뒤쪽 <b>더 알아보기</b>에서 다룹니다.'}},
    {kicker:'STEP 4', title:'응답과 도구 호출: 다시 PC에서',
     body:'모델의 응답에는 <b>다음에 부를 도구</b>가 들어 있습니다. PC가 그 도구를 실행하고, 결과를 담아 다시 요청합니다. <b>루프가 반복</b>됩니다.',
     facts:['응답 = 텍스트 또는 도구 호출','도구 실행은 다시 PC','이 지점에 권한과 훅이 걸림'],
     zones:Z, nodes:[CC,LO,BR,CT], hot:['cc','lo','br'],
     edges:[{f:'br',t:'cc',c:'info',l:'응답, 도구 호출',o:0},{f:'cc',t:'lo',c:'accent',o:1},{f:'lo',t:'cc',c:'accent',curve:120,side:'v',o:2},{f:'cc',t:'br',c:'info',curve:-60,o:3}],
     loop:true, stagger:0.8,
     snip:{hd:'한 바퀴',path:'예시 흐름',lines:['# Bedrock 응답','tool_use: Bash(npm test)','','# PC에서 실행','Bash(npm test)   # all passed','','# 결과를 담아 다음 요청'],hl:[2,5],note:'통제는 <b>도구 호출 지점</b>에 겁니다. Ch3의 출발점입니다.'}},
    {kicker:'MORE', title:'추론 말고 나가는 길은 넷',
     body:'추론 외의 통신도 목적지와 기본값을 알고 통제합니다. Anthropic 텔레메트리는 <b>기본 꺼짐</b>, OTel(OpenTelemetry)은 <b>설정해야 전송</b>되고 프롬프트 본문은 기본 미수집, 자동 업데이트는 <b>기본 켜짐</b>입니다.',
     facts:['오류 리포트, 텔레메트리: Bedrock 경로 기본 꺼짐','OpenTelemetry: 조직 수집기, 설정해야 전송, 프롬프트 본문은 기본 미수집','자동 업데이트: DISABLE_AUTOUPDATER, 사내 미러','WebFetch, MCP: 권한 규칙과 허용 목록 (Ch3)'],
     zones:[{x:20,y:40,w:440,h:410,l:'개발자 PC'},{x:540,y:40,w:620,h:410,l:'목적지'}],
     nodes:[CC,{id:'d1',x:600,y:80,w:520,h:60,t:'Amazon Bedrock (내 계정)',c:'info'},{id:'d2',x:600,y:154,w:520,h:60,t:'Anthropic: 오류 리포트, 텔레메트리',c:'muted'},{id:'d3',x:600,y:228,w:520,h:60,t:'조직 OTel 수집기 (설정해야 전송)',c:'warning'},{id:'d4',x:600,y:302,w:520,h:60,t:'배포 서버: 자동 업데이트 (기본 켜짐)',c:'accent'},{id:'d5',x:600,y:376,w:520,h:60,t:'WebFetch, MCP 대상 서버',c:'accent'}],
     hot:['cc','d1','d4','d5'],
     edges:[{f:'cc',t:'d1',c:'info',side:'h',o:0},{f:'cc',t:'d2',c:'muted',side:'h',dash:true},{f:'cc',t:'d3',c:'warning',side:'h',dash:true},{f:'cc',t:'d4',c:'accent',side:'h',o:1},{f:'cc',t:'d5',c:'accent',side:'h',o:2}],
     snip:{hd:'경로별 통제',path:'데이터가 나가는 길 (Bedrock 경로)',lines:['추론 요청    IAM, VPC 엔드포인트, CloudTrail','텔레메트리   Bedrock 경로 기본 꺼짐','OTel         설정해야 전송, 본문 기본 미수집','자동 업데이트 DISABLE_AUTOUPDATER, 사내 미러','WebFetch/MCP 권한 규칙, 허용 목록 (Ch3)'],hl:[1,4,5],note:'점선은 기본으로 꺼져 있는 경로입니다. 자동 업데이트는 <b>기본으로 켜져</b> 있어 DISABLE_AUTOUPDATER로 끄거나 사내 미러를 씁니다.'}}
  ], {legend:[['accent','PC에서 실행'],['info','추론 요청과 응답'],['warning','기록과 계측'],['muted','Bedrock 경로 기본 꺼짐']]});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 실행은 개발자 PC에서, 추론은 내 계정의 Bedrock에서 (처리 리전은 추론 프로필 범위, 이 랩은 global)
• 프롬프트, 읽은 코드, 명령 출력을 SigV4로 서명해 전송, 호출은 CloudTrail에 기록
• 응답의 도구 호출은 다시 PC에서 실행되고 루프가 반복
• Bedrock 경로는 Anthropic 오류 리포트와 텔레메트리가 기본 꺼짐
• OTel, 자동 업데이트, WebFetch와 MCP도 목적지별로 통제

{cue: demo}
금융권에서 가장 많이 받는 질문, 데이터가 어디로 가느냐를 그림으로 보겠습니다.
전체 그림부터 보면, 왼쪽이 개발자 PC, 오른쪽이 고객님의 AWS 계정입니다.
첫째, 로컬 실행. 파일 읽기, 편집, 명령 실행은 전부 PC에서 일어납니다. 저장소가 통째로 올라가지 않습니다.
둘째, 요청 전송. 프롬프트와 함께 읽은 코드와 명령 출력도 SigV4로 서명해 보냅니다. VPC 엔드포인트로 네트워크 경로도 통제할 수 있습니다.
셋째, 추론은 내 계정에서 호출되고 CloudTrail에 남습니다. 실제 처리 리전은 추론 프로필 범위를 따르고, 이 랩은 global 프로필입니다. 뒤쪽 더 알아보기에서 다시 보겠습니다.
넷째, 응답에 담긴 도구 호출을 PC가 실행하고 다시 요청합니다. 이 도구 호출 지점이 Ch3 통제의 자리입니다.
마지막으로 추론 외의 통신입니다. Anthropic으로 가는 오류 리포트와 텔레메트리는 Bedrock 경로에서 기본으로 꺼져 있고, OTel은 회사가 설정해야 전송되고 프롬프트 본문은 기본으로 수집하지 않습니다.

[약어]
• SigV4: AWS Signature Version 4, AWS API 요청 서명 방식
• IAM: Identity and Access Management
• OTel: OpenTelemetry
:::

---
<!-- Slide 17: Feature availability on Bedrock (PDF p19, p20) -->
@type: content
@fit: off

## 로컬에서 도는 기능은 전부 된다
Bedrock에서 되는 것, 안 되는 것, 조건부인 것

:::html
<div class="fsi fsi-avail">
  <div class="av-tabs" data-pick="avail">
    <button class="pick" data-key="ok"><span class="tag ok">가능</span>확장, 통제, 관측</button>
    <button class="pick" data-key="no"><span class="tag no">불가</span>서버, 구독 기능</button>
    <button class="pick" data-key="cond"><span class="tag cond">조건부</span>부분 지원</button>
    <button class="pick" data-key="tools"><span class="tag info">대안</span>빠지는 내장 도구</button>
  </div>
  <div class="panel" data-pick-panel="avail">
    <div data-for="ok">
      <div class="rows">
        <div class="row"><span class="c">확장</span><span class="f">Subagent, 훅, 스킬, 플러그인, mod, MCP, Workflows</span></div>
        <div class="row"><span class="c">통제, 관측</span><span class="f">파일, <span class="rp-detail" tabindex="0" data-tip="Mobile Device Management. 회사 단말에 설정과 파일을 배포하는 관리 도구">MDM</span> managed settings, 샌드박스, <span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span></span></div>
      </div>
      <p class="foot">CLI에서 로컬로 도는 기능은 모델 경로와 상관없이 동작합니다.</p>
    </div>
    <div data-for="no">
      <div class="rows">
        <div class="row"><span class="c">통제, 관측</span><span class="f">Server-managed settings, Analytics 대시보드<em>claude.ai 관리 콘솔에서 정책 배포와 사용량 보기</em></span></div>
        <div class="row"><span class="c">도구</span><span class="f">WebSearch, Fast mode, Advisor<em>Anthropic 서버가 처리하는 도구와 모드</em></span></div>
        <div class="row"><span class="c">구독 기능</span><span class="f">Cloud 세션, Routines(클라우드 예약 작업, /schedule), Remote Control, Code Review<em>claude.ai 구독 계정으로 Anthropic 클라우드에서 도는 기능</em></span></div>
      </div>
      <p class="foot">정책 콘솔과 Analytics는 파일 정책(Ch2)과 계측(Ch6)으로 채웁니다.</p>
    </div>
    <div data-for="cond">
      <div class="rows">
        <div class="row"><span class="c">부분</span><span class="f">Auto mode, 세션 간 메시지, <span class="rp-detail" tabindex="0" data-tip="Zero Data Retention. 요청과 응답 데이터를 보존하지 않는 약정">ZDR</span><em>모델 경로, 설정, 계약 조건에 따라 일부만 동작</em></span></div>
      </div>
      <p class="foot">조건에 따라 동작합니다. Auto mode의 경계 설계는 Ch3 Part 2에서 다룹니다.</p>
    </div>
    <div data-for="tools">
      <div class="rows">
        <div class="row"><span class="c">WebSearch</span><span class="f">Anthropic 내장 웹 검색<em>대안: WebFetch로 URL 읽기, 검색은 MCP</em></span></div>
        <div class="row"><span class="c">RemoteTrigger</span><span class="f">클라우드 예약 작업, /schedule<em>대안: /loop, <span class="rp-detail" tabindex="0" data-tip="Continuous Integration. 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인">CI</span> 파이프라인</em></span></div>
        <div class="row"><span class="c">PushNotification, SendUserFile</span><span class="f">Anthropic 인프라로 알림, 파일 전달<em>대안: 사내 메신저 연동 (훅, MCP)</em></span></div>
        <div class="row"><span class="c">Artifact, ShareOnboardingGuide</span><span class="f">claude.ai 게시, 공유 링크 생성<em>대안: 사내 저장소, 위키에 공유</em></span></div>
      </div>
      <p class="foot">SendFeedback(제품 피드백 초안 제출)과 EndConversation(모델이 세션 종료를 결정)도 빠집니다. Bash, Read, Write, Edit, Grep, Glob, WebFetch, Subagent, 스킬, 직접 설정한 MCP 도구는 그대로 씁니다. 실제 사용 여부는 권한과 설정에 따릅니다.</p>
    </div>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('avail', { start: 0 }); });
:::

:::notes
{timing: 2min}
[요약]
• CLI에서 로컬로 도는 기능은 Bedrock에서도 전부 동작
• 불가: Server-managed settings, Analytics, WebSearch, Fast mode, Advisor, 구독 기능
• 조건부: Auto mode, 세션 간 메시지, ZDR
• 빠지는 내장 도구는 WebFetch, MCP, 훅, CI 같은 대안으로 채움

Bedrock으로 쓰면 무엇이 안 되느냐는 질문도 많습니다. 원칙은 간단합니다. CLI에서 로컬로 도는 기능은 전부 됩니다.
{cue: demo}
가능 탭부터 보면, Subagent, 훅, 스킬, 플러그인, mod, MCP, Workflows 같은 확장과 파일이나 MDM으로 배포하는 managed settings, 샌드박스, OTel이 모두 됩니다.
불가 탭은 Anthropic 서버나 claude.ai 구독에 기대는 기능입니다. 정책 콘솔인 Server-managed settings와 Analytics 대시보드가 빠지는데, 이건 Ch2의 파일 정책과 Ch6의 계측으로 채웁니다.
조건부는 Auto mode, 세션 간 메시지, ZDR입니다.
마지막 대안 탭은 빠지는 내장 도구와 그 대안입니다. 핵심 도구인 Bash, Read, Edit, WebFetch는 그대로 씁니다.

[약어]
• MDM: Mobile Device Management, 단말에 설정을 배포하는 관리 도구
• ZDR: Zero Data Retention
:::

---
<!-- Slide 18: Remember (PDF p21) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">REMEMBER</span>
  <div class="big">코드는 <em>PC</em>에서 실행되고,<br>컨텍스트는 <em>Bedrock</em>으로</div>
  <p class="lead">읽은 코드와 명령 출력도 컨텍스트에 실립니다. 그것이 데이터 통제의 출발점입니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 코드는 PC에서 실행되고, 컨텍스트는 Bedrock으로 감
• 읽은 코드와 명령 출력도 컨텍스트에 실림
• 따라서 컨텍스트에 무엇이 실리는지가 데이터 통제의 출발점

{cue: pause}
Part 3을 한 문장으로 정리합니다. 코드는 PC에서 실행되고, 컨텍스트는 Bedrock으로 갑니다. 그리고 Claude가 읽은 코드와 명령 출력도 그 컨텍스트에 실립니다.
그래서 데이터 통제는 무엇이 컨텍스트에 실리는지에서 시작합니다. Part 2의 다섯 항목과 Part 3의 도구 호출 지점, 이 두 가지가 이후 관리 챕터의 출발점입니다.
:::

---
<!-- Slide 19: Two tracks (PDF p22, p23) -->
@type: content
@fit: off

## 관리와 활용, 두 갈래와 공통 기반
PART 04, 같은 기능을 관리자와 사용자 양쪽에서

:::html
<div class="fsi fsi-tracks">
  <div class="fsi-grid-3" data-pick="tracks">
    <button class="pick" data-key="admin"><span class="k">ADMIN</span><span class="t">정책으로 정하고 막기</span><span class="d">도구 호출 전후에 정책을 겁니다</span></button>
    <button class="pick" data-key="prod"><span class="k">PRODUCTIVITY</span><span class="t">기능을 더해 잘 쓰기</span><span class="d">컨텍스트와 도구를 더합니다</span></button>
    <button class="pick" data-key="common"><span class="k">COMMON</span><span class="t">쓴 만큼 보고 줄이기</span><span class="d">덜 쓰고, 보고, 막습니다</span></button>
  </div>
  <div class="panel" data-pick-panel="tracks">
    <p class="hint">갈래를 누르면 해당 챕터가 나옵니다.</p>
    <div data-for="admin"><div class="chs"><div class="ch"><b>Ch2</b>Bedrock 배포와 정책 전달</div><div class="ch"><b>Ch3</b>가드레일, <span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span></div></div></div>
    <div data-for="prod"><div class="chs"><div class="ch"><b>Ch4</b>Subagents</div><div class="ch"><b>Ch5</b>Plugins &amp; Mods</div></div></div>
    <div data-for="common"><div class="chs"><div class="ch"><b>Ch6</b>토큰과 비용</div><div class="ch"><b>Capstone</b>사용량으로 마무리</div></div></div>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('tracks'); });
:::

:::notes
{timing: 2min}
[요약]
• ADMIN: Ch2 Bedrock 배포와 정책 전달, Ch3 가드레일과 DLP
• PRODUCTIVITY: Ch4 Subagents, Ch5 Plugins & Mods
• COMMON: Ch6 토큰과 비용, Capstone은 사용량으로 마무리

마지막 Part, 이틀 동안 무엇을 배우는지입니다. 같은 기능을 관리자와 사용자 양쪽에서 보도록 두 갈래로 나눴습니다.
{cue: demo}
첫째, ADMIN 갈래는 정책으로 정하고 막는 쪽입니다. Ch2에서 Bedrock 배포와 정책 전달을, Ch3에서 가드레일과 DLP를 다룹니다.
둘째, PRODUCTIVITY 갈래는 기능을 더해 잘 쓰는 쪽입니다. Ch4 Subagents와 Ch5 Plugins와 Mods입니다.
셋째, COMMON은 양쪽 모두에게 필요한, 쓴 만큼 보고 줄이는 이야기입니다. Ch6 토큰과 비용, 그리고 Capstone은 사용량으로 마무리합니다.
:::

---
<!-- Slide 20: Glossary (PDF p24) -->
@type: content
@fit: off

## 처음 들어도 괜찮은 여덟 단어
이틀 동안 자주 나오는 말, 챕터마다 다시 설명

:::html
<div class="fsi fsi-split fsi-gloss">
  <div class="fsi-grid-2" data-pick="gloss">
    <button class="pick" data-key="ctx"><span class="t">컨텍스트</span><span class="k">Ch1, Ch6</span></button>
    <button class="pick" data-key="md"><span class="t">CLAUDE.md</span><span class="k">Ch1, Ch6</span></button>
    <button class="pick" data-key="ms"><span class="t">managed settings</span><span class="k">Ch2</span></button>
    <button class="pick" data-key="hooks"><span class="t">훅(hooks)</span><span class="k">Ch3</span></button>
    <button class="pick" data-key="auto"><span class="t">auto mode</span><span class="k">Ch3</span></button>
    <button class="pick" data-key="sub"><span class="t">Subagent</span><span class="k">Ch4</span></button>
    <button class="pick" data-key="plugin"><span class="t">플러그인, MCP</span><span class="k">Ch5</span></button>
    <button class="pick" data-key="mod"><span class="t">mod</span><span class="k">Ch5</span></button>
  </div>
  <div class="panel" data-pick-panel="gloss">
    <p class="hint">단어를 누르면 뜻이 나옵니다.</p>
    <div data-for="ctx"><h4>컨텍스트</h4><p>모델에 매번 함께 보내는 내용. 많을수록 비용이 커집니다.</p></div>
    <div data-for="md"><h4>CLAUDE.md</h4><p>프로젝트 규칙을 적어 두는 파일. 매 요청에 실립니다.</p></div>
    <div data-for="ms"><h4>managed settings</h4><p>관리자가 배포하고 사용자가 바꿀 수 없는 설정 파일.</p></div>
    <div data-for="hooks"><h4>훅(hooks)</h4><p>도구 실행 전후에 끼어드는 검사 스크립트.</p></div>
    <div data-for="auto"><h4>auto mode</h4><p>분류기가 위험한 동작만 막고 나머지는 묻지 않는 모드.</p></div>
    <div data-for="sub"><h4>Subagent</h4><p>역할과 도구 권한을 따로 가진 보조 에이전트.</p></div>
    <div data-for="plugin"><h4>플러그인, MCP</h4><p>플러그인은 팀 도구를 묶어 배포하는 단위, MCP는 외부 시스템을 도구로 붙이는 표준.</p></div>
    <div data-for="mod"><h4>mod</h4><p>Claude Code 화면과 동작을 바꾸는 작은 코드.</p></div>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('gloss'); });
:::

:::notes
{timing: 1.5min}
[요약]
• 이틀 동안 반복해서 나오는 여덟 단어
• 컨텍스트, CLAUDE.md, managed settings, 훅, auto mode, Subagent, 플러그인과 MCP, mod
• 지금 다 외울 필요 없고, 챕터마다 다시 설명

이틀 동안 자주 나오는 말 여덟 개입니다. 처음 들으셔도 괜찮습니다. 챕터마다 다시 설명드립니다.
{cue: demo}
몇 개만 짚으면, managed settings는 관리자가 배포하고 사용자가 바꿀 수 없는 설정 파일입니다. 훅은 도구 실행 전후에 끼어드는 검사 스크립트이고, mod는 Claude Code 화면과 동작을 바꾸는 작은 코드입니다.
나머지는 화면에서 눌러 보시면서, 오늘 랩과 이후 챕터에서 다시 만나시면 됩니다.
:::

---
<!-- Slide 21: Two-day flow (PDF p25) -->
@type: content
@fit: off

## Day 1은 조직으로, Day 2는 측정으로
이틀간의 흐름, 개인에서 조직으로 그리고 확장에서 측정으로

:::html
<div class="fsi fsi-flow">
  <div class="day">
    <div class="dl"><b>DAY 1</b>개인에서 조직으로</div>
    <div class="track">
      <div class="ev now"><span class="tm">10:10</span><span class="nm">Ch1 작동 원리, Lab</span><span class="me">지금 여기, Lab은 11:20</span></div>
      <div class="ev"><span class="tm">10:40</span><span class="nm">Ch2 Bedrock 배포, Lab</span></div>
      <div class="ev"><span class="tm">13:50</span><span class="nm">Ch3 가드레일, <span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span></span></div>
      <div class="ev"><span class="tm">14:50</span><span class="nm">Ch4 Subagents</span></div>
    </div>
  </div>
  <div class="day">
    <div class="dl"><b>DAY 2</b>확장에서 측정으로</div>
    <div class="track">
      <div class="ev"><span class="tm">10:10</span><span class="nm">Ch5 Plugins &amp; Mods</span></div>
      <div class="ev"><span class="tm">12:40</span><span class="nm">Ch6 P1 토큰</span></div>
      <div class="ev"><span class="tm">16:50</span><span class="nm">Ch6 P2 비용</span></div>
    </div>
  </div>
  <p class="cap">세부 시간은 현장 운영에 따라 바뀔 수 있습니다. 매일 오후에는 Capstone 라운드가 이어집니다.</p>
</div>
:::


:::notes
{timing: 1min}
[요약]
• Day 1: 10:10 Ch1 작동 원리와 Lab, 10:40 Ch2 Bedrock 배포와 Lab, 13:50 Ch3 가드레일과 DLP, 14:50 Ch4 Subagents
• Day 2: 10:10 Ch5 Plugins와 Mods, 12:40 Ch6 P1 토큰, 16:50 Ch6 P2 비용
• 매일 오후 Capstone 라운드

이틀의 흐름입니다. Day 1은 개인의 도구를 조직이 통제하는 단계까지, Day 2는 팀의 플랫폼으로 확장하고 비용을 측정하는 단계까지 갑니다.
{cue: demo}
왼쪽부터 보면, 오늘 지금 Ch1에 이어 Ch2 Bedrock 배포와 Lab, 오후에 Ch3 가드레일과 DLP, Ch4 Subagents가 이어집니다.
내일은 Ch5 Plugins와 Mods로 시작해 Ch6 토큰과 비용을 두 번에 나눠 진행합니다. 매일 오후에는 Capstone 라운드가 있습니다.

[출처]
• 원본 Ch1 강의자료 p25 일정 (eDM.html과 일치). 세부 시간은 현장 운영에 따라 변동 가능
:::

---
<!-- Slide 22: Lab (PDF p26) -->
@type: content
@fit: off

## 30분 동안 직접 확인할 다섯 가지
LAB, Preflight + 에이전트 루프 관찰 (11:20 시작)

:::html
<div class="fsi fsi-lab">
  <ol class="steps">
    <li><b>PREFLIGHT</b><span>Workshop Studio 접속, IDEUrl로 code-server 열기, 게이트웨이 응답 확인</span></li>
    <li><b>TASK 01</b><span>/status로 Bedrock과 us-east-1 확인, 수집, 수행, 검증 지켜보기</span><em>Part 1</em></li>
    <li><b>TASK 02</b><span>/context, CLAUDE.md, 세션 <span class="rp-detail" tabindex="0" data-tip="JSON Lines. 한 줄에 JSON 객체 하나씩 적는 텍스트 형식">JSONL</span> 파일 확인</span><em>Part 2</em></li>
    <li><b>TASK 03</b><span>/rewind로 되돌리기, Shift+Tab으로 plan 모드</span><em>Part 2, 3</em></li>
    <li><b>TASK 04</b><span>CloudTrail에서 Bedrock 호출 기록 확인</span><em>Part 3</em></li>
  </ol>
  <p class="where">Hands-on Lab 포털에서 Preflight, 그다음 Chapter 1 순서로 엽니다. 명령은 그대로 복사해 따라 하시면 됩니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Ch1 실습 30분은 Ch2 강의 뒤 11:20에 시작
• Preflight와 TASK 01부터 04까지, 오늘 본 Part 1에서 3을 직접 확인
• Hands-on Lab 포털, Preflight, Chapter 1 순서

{cue: demo}
실습은 Ch2 강의가 끝난 뒤 11시 20분에 30분 동안 진행합니다. 오늘 그림으로 본 것을 직접 확인하는 시간입니다.
먼저 Preflight로 Workshop Studio에 접속해 code-server를 열고 게이트웨이 응답을 확인합니다.
TASK 01은 /status로 Bedrock과 us-east-1을 확인하고 루프를 지켜보는 것, TASK 02는 /context와 CLAUDE.md, 세션 파일, TASK 03은 /rewind와 plan 모드, TASK 04는 CloudTrail에서 호출 기록을 확인하는 것입니다.
명령은 랩 문서에서 그대로 복사해 따라 하시면 됩니다.

[출처]
• 원본 Ch1 강의자료 p26
:::

---
<!-- Slide 23: Deep dive, CLAUDE.md layers (PDF p27, p29) -->
@type: content
@fit: off

## 누가 쓰고 누가 고칠 수 있나
더 알아보기, CLAUDE.md 네 계층과 OS별 위치

:::html
<div id="sv-claudemd"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var L = [
    {id:'org',x:40,y:76,w:600,h:80,t:'조직 (managed)',s:'전사 공통 지침, 사용자가 수정할 수 없음',c:'danger'},
    {id:'usr',x:40,y:170,w:600,h:80,t:'사용자',s:'개인 작업 습관',c:'accent'},
    {id:'prj',x:40,y:264,w:600,h:80,t:'프로젝트',s:'저장소에 커밋해 팀이 공유',c:'success'},
    {id:'sub',x:40,y:358,w:600,h:80,t:'하위 폴더',s:'그 폴더의 파일을 다룰 때 로드',c:'info'}];
  var CX = {id:'cx',x:840,y:200,w:300,h:110,t:'컨텍스트',s:'요청에 함께 실림',c:'ink'};
  var Z = [{x:20,y:20,w:640,h:440,l:'CLAUDE.md 계층'},{x:800,y:20,w:360,h:440,l:'모델에 보내는 것'}];
  function nodes() { return L.concat([CX]); }
  function edge(id, c, o, extra) { var e = {f:id,t:'cx',c:c,o:o,side:'h'}; for (var k in (extra||{})) e[k] = extra[k]; return e; }
  F.stepviz('#sv-claudemd', [
    {kicker:'OVERVIEW', title:'네 곳의 CLAUDE.md가 합쳐집니다',
     body:'CLAUDE.md는 <b>조직, 사용자, 프로젝트, 하위 폴더</b> 네 곳에 둘 수 있고, 모두 합쳐 컨텍스트에 실립니다. 계층마다 <b>쓰는 사람과 고칠 수 있는 사람</b>이 다릅니다.',
     facts:['조직: 관리자가 배포, 사용자가 못 고침','사용자, 프로젝트: 매 요청에 실림','하위 폴더: 필요할 때 로드 (모노레포)'],
     zones:Z, nodes:nodes(),
     edges:[edge('org','danger',0),edge('usr','accent',1),edge('prj','success',2),edge('sub','info',3,{dash:true})],
     stagger:0.35,
     snip:{hd:'한 저장소에서 실리는 CLAUDE.md',path:'예시',lines:['/etc/claude-code/CLAUDE.md      # 조직','~/.claude/CLAUDE.md             # 사용자','./CLAUDE.md                     # 프로젝트','./packages/pay/CLAUDE.md        # 하위 폴더'],hl:[1,2,3,4],note:'모두 더한 길이가 매 요청의 비용입니다. 그래서 각자 짧게.'}},
    {kicker:'LAYER 1', title:'조직: 전사 공통, 수정 불가',
     body:'관리자가 OS별 고정 경로에 배포합니다. 사용자는 <b>이 파일을 수정할 수 없습니다</b>. 보안 규칙, 코딩 표준 같은 전사 공통 지침을 둡니다.',
     facts:['MDM(단말 관리 도구)이나 배포 도구로 설치','사용자가 수정할 수 없음','managed settings와 같은 배포 경로 (Ch2)'],
     zones:Z, nodes:nodes(), hot:['org','cx'],
     edges:[edge('org','danger',0)],
     snip:{hd:'OS별 위치',path:'조직 (managed) CLAUDE.md',lines:['# macOS','/Library/Application Support/ClaudeCode/CLAUDE.md','','# Linux, WSL','/etc/claude-code/CLAUDE.md','','# Windows','C:\\Program Files\\ClaudeCode\\CLAUDE.md'],hl:[2,5,8],note:'관리자 권한이 있어야 쓰는 경로라서 <b>개인이 덮어쓸 수 없습니다</b>.'}},
    {kicker:'LAYER 2', title:'사용자: 나만의 작업 습관',
     body:'홈 디렉터리의 CLAUDE.md는 <b>모든 프로젝트에 공통</b>으로 실리는 개인 지침입니다. 응답 언어나 선호하는 도구 같은 습관을 둡니다.',
     facts:['나에게만 적용','모든 프로젝트에 공통','팀 규칙은 여기 말고 프로젝트에'],
     zones:Z, nodes:nodes(), hot:['usr','cx'],
     edges:[edge('usr','accent',0)],
     snip:{hd:'위치',path:'사용자 CLAUDE.md',lines:['# macOS, Linux','~/.claude/CLAUDE.md','','# Windows','%USERPROFILE%\\.claude\\CLAUDE.md'],hl:[2,5],note:'개인 파일이라 <b>팀과 공유되지 않습니다</b>.'}},
    {kicker:'LAYER 3', title:'프로젝트: 저장소에 커밋해 공유',
     body:'저장소 루트의 CLAUDE.md는 <b>Git에 커밋해 팀이 함께</b> 씁니다. 빌드 명령, 디렉터리 구조, 리뷰 규칙처럼 그 저장소에 필요한 내용을 둡니다.',
     facts:['팀이 PR로 함께 관리','저장소마다 다름','200줄 이하, 절차는 스킬로'],
     zones:Z, nodes:nodes(), hot:['prj','cx'],
     edges:[edge('prj','success',0)],
     snip:{hd:'위치',path:'프로젝트 CLAUDE.md',lines:['./CLAUDE.md','./.claude/CLAUDE.md','','# 둘 중 하나, Git에 커밋'],hl:[1,2],note:'이 워크숍 랩에서도 프로젝트 CLAUDE.md를 직접 만들어 봅니다.'}},
    {kicker:'LAYER 4', title:'하위 폴더: 그 폴더를 다룰 때만',
     body:'하위 폴더의 CLAUDE.md는 <b>그 폴더의 파일을 다룰 때 로드</b>됩니다. 모노레포에서 서비스별 규칙을 나누기 좋습니다.',
     facts:['필요할 때만 로드','모노레포에서 서비스별 규칙','상위 규칙에 더해짐'],
     zones:Z, nodes:nodes(), hot:['sub','cx'],
     edges:[edge('sub','info',0)],
     snip:{hd:'모노레포 예시',path:'하위 폴더 CLAUDE.md',lines:['repo/','  CLAUDE.md                # 공통','  packages/pay/CLAUDE.md   # 결제 서비스 규칙','  packages/web/CLAUDE.md   # 웹 규칙','','# packages/pay 파일을 다룰 때 pay 규칙이 실림'],hl:[3,6],note:'자주 쓰지 않는 규칙을 <b>항상 싣지 않는</b> 방법입니다.'}}
  ], {w:1180, h:480, legend:[['danger','조직 (수정 불가)'],['accent','사용자'],['success','프로젝트'],['info','하위 폴더']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• CLAUDE.md는 조직, 사용자, 프로젝트, 하위 폴더 네 계층
• 조직(managed)은 OS별 고정 경로, 사용자가 수정 불가
• 사용자는 개인 습관, 프로젝트는 Git으로 팀 공유
• 하위 폴더는 그 폴더를 다룰 때만 로드 (모노레포)

여기부터는 더 알아보기입니다. 시간이 남거나 질문이 나오면 펼칩니다.
{cue: demo}
CLAUDE.md는 네 곳에 둘 수 있고 모두 합쳐 실립니다. 계층마다 누가 쓰고 누가 고칠 수 있는지가 다릅니다.
조직 계층은 관리자가 OS별 고정 경로에 배포하고, 사용자는 고칠 수 없습니다. 전사 보안 규칙을 여기에 둡니다.
사용자 계층은 홈 디렉터리의 개인 지침, 프로젝트 계층은 저장소에 커밋해 팀이 함께 쓰는 지침입니다.
하위 폴더 계층은 그 폴더 파일을 다룰 때만 실리기 때문에, 모노레포에서 서비스별 규칙을 나누기 좋습니다.

[출처]
• 원본 Ch1 강의자료 p29, code.claude.com/docs memory 문서의 경로
:::

---
<!-- Slide 24: Deep dive, inference region (PDF p33) -->
@type: content
@fit: off

## 모델 ID 접두사가 처리 위치를 정한다
더 알아보기, 추론 리전과 데이터 위치

:::html
<div class="fsi fsi-region">
  <div class="fsi-stack" data-pick="region">
    <button class="pick" data-key="global"><span class="k">global. 프로필</span><span class="t">상용 리전 전체로 라우팅</span><span class="d">용량이 가장 넓고 장애에 강함, 이 워크숍 환경의 기본값</span></button>
    <button class="pick" data-key="geo"><span class="k">us. / eu. / apac. 지역 프로필</span><span class="t">지역 안에서만 라우팅</span><span class="d">국외 이전 검토가 필요한 업무의 기준</span></button>
    <button class="pick" data-key="single"><span class="k">단일 리전 모델 ID</span><span class="t">그 리전에서만 처리</span><span class="d">처리 위치를 한 곳으로 고정</span></button>
  </div>
  <div class="map" id="region-map">
    <div class="geo" data-g="us"><span class="gl">US</span><div class="rs"><i class="home"></i><i></i><i></i></div></div>
    <div class="geo" data-g="eu"><span class="gl">EU</span><div class="rs"><i></i><i></i><i></i></div></div>
    <div class="geo" data-g="apac"><span class="gl">APAC</span><div class="rs"><i></i><i></i><i></i></div></div>
    <p class="cap" id="region-cap">왼쪽에서 접두사를 고르면 추론이 일어날 수 있는 범위가 켜집니다. 점은 리전을 나타낸 설명용 그림입니다.</p>
    <p class="cfg"><span class="rp-detail" tabindex="0" data-tip="접두사로 처리 리전 범위를 정하는 Bedrock 모델 ID">추론 프로필</span>: 모델 ID 접두사가 데이터가 처리되는 곳을 정합니다.<br>모델 고정: <code>ANTHROPIC_DEFAULT_*_MODEL</code> (Ch2)</p>
  </div>
</div>
:::


:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var geos = Array.prototype.slice.call(document.querySelectorAll('#region-map .geo'));
  var home = document.querySelector('#region-map .home');
  var cap = document.getElementById('region-cap');
  var text = {
    global: 'AWS 상용 리전 어디로든 라우팅될 수 있습니다. 용량이 넓어 처리량과 가용성에 유리합니다.',
    geo: '같은 지역(예: us.) 안의 리전으로만 라우팅됩니다. 데이터 위치 요건이 있는 업무는 이쪽을 기준으로 검토합니다.',
    single: '단일 리전 모델 ID는 그 리전(예: us-east-1)에서만 처리됩니다.'
  };
  F.pick('region', { onShow: function (key) {
    geos.forEach(function (g) { g.classList.toggle('on', key === 'global' || (key === 'geo' && g.dataset.g === 'us')); });
    home.classList.toggle('on', key === 'single');
    if (key) cap.textContent = text[key];
  }});
});
:::

:::notes
{timing: 1min}
[요약]
• global. 프로필은 상용 리전 전체로 라우팅, 용량과 장애 대응에 유리, 이 워크숍의 기본값
• us. / eu. / apac. 접두사는 그 지역 안에서만 라우팅
• 단일 리전 모델 ID는 그 리전에서만 처리
• 국외 이전 검토가 필요한 업무는 지역 프로필이나 단일 리전 기준, ANTHROPIC_DEFAULT_*_MODEL로 고정 (Ch2)

추론이 어디서 일어나는지는 모델 ID 접두사가 정합니다.
{cue: demo}
global로 시작하는 프로필은 상용 리전 전체로 라우팅됩니다. 용량이 가장 넓고 장애에 강해서 이 워크숍 환경의 기본값입니다.
us, eu, apac 접두사는 그 지역 안에서만 라우팅되고, 단일 리전 모델 ID는 그 리전에서만 처리됩니다.
국외 이전 검토가 필요한 업무라면 지역 프로필이나 단일 리전 ID를 기준으로 보시고, Ch2에서 환경 변수로 모델을 고정하는 방법을 실습합니다.

[출처]
• 원본 Ch1 강의자료 p33, Amazon Bedrock cross-Region inference 문서
:::

---
<!-- Slide 25: Quick check 2 (PDF p34) -->
@type: content
@fit: off

## global 프로필의 추론은 어디서?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="qc-2">
  <p class="q"><code>global.anthropic.claude-sonnet-5-5</code>로 호출하면 추론은 어디서 일어날까요?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>항상 us-east-1</button>
    <button class="opt right"><b>B</b>AWS 상용 리전 중 어디로든 라우팅될 수 있다</button>
    <button class="opt"><b>C</b>호출한 PC와 가장 가까운 리전</button>
  </div>
  <p class="ans">정답 B. 데이터 위치 요건이 있으면 지역 프로필이나 단일 리전 ID를 씁니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#qc-2'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, 상용 리전 중 어디로든 라우팅될 수 있음
• 데이터 위치 요건이 있으면 지역 프로필이나 단일 리전 ID

방금 본 내용을 퀴즈로 확인하겠습니다. global 접두사가 붙은 Sonnet 모델 ID로 호출하면 추론은 어디서 일어날까요?
{cue: pause}
정답은 B입니다. AWS 상용 리전 중 어디로든 라우팅될 수 있습니다. 데이터 위치 요건이 있는 업무는 지역 프로필이나 단일 리전 ID를 쓰시면 됩니다.
:::

---
<!-- Slide 26: Recap (PDF p35) -->
@type: content
@fit: off

## 이후 챕터의 출발점 여섯 가지
Chapter 1 Key Takeaways

:::html
<div class="fsi fsi-recap">
  <div class="fsi-grid-3">
    <div class="rc"><b>01</b><span>Claude Code는 모델에 도구를 이어 붙인 에이전트</span></div>
    <div class="rc"><b>02</b><span>루프는 수집, 수행, 검증. 통제는 도구 호출 지점에</span></div>
    <div class="rc"><b>03</b><span>컨텍스트가 곧 토큰, CLAUDE.md는 200줄 이하</span></div>
    <div class="rc"><b>04</b><span>세션은 로컬 <span class="rp-detail" tabindex="0" data-tip="JSON Lines. 한 줄에 JSON 객체 하나씩 적는 텍스트 형식">JSONL</span>, 체크포인트는 파일 편집만 되돌림</span></div>
    <div class="rc"><b>05</b><span>Bedrock: 실행은 PC, 추론은 내 계정 (리전은 프로필 범위)</span></div>
    <div class="rc"><b>06</b><span>빠진 기능(정책 콘솔, Analytics)은 파일 정책과 계측으로</span></div>
  </div>
</div>
:::


:::notes
{timing: 1min}
[요약]
• 에이전트 = 모델 + 도구, 루프는 수집, 수행, 검증
• 통제는 도구 호출 지점, 컨텍스트가 곧 토큰
• 세션은 로컬 JSONL, 체크포인트는 편집만
• Bedrock: 실행은 PC, 추론은 내 계정, 빠진 기능은 파일 정책과 계측으로

Chapter 1을 여섯 줄로 정리하겠습니다.
{cue: pause}
Claude Code는 모델에 도구를 이어 붙인 에이전트이고, 루프는 수집, 수행, 검증을 돕니다. 그래서 통제는 도구 호출 지점에 겁니다.
컨텍스트가 곧 토큰이니 CLAUDE.md는 200줄 이하로. 세션은 로컬 JSONL로 남고 체크포인트는 파일 편집만 되돌립니다.
Bedrock에서는 실행은 PC, 추론은 내 계정에서 일어나고 처리 리전은 추론 프로필 범위를 따릅니다. 그리고 빠진 정책 콘솔과 Analytics는 파일 정책과 계측으로 채웁니다.
이 여섯 가지가 Ch2부터의 출발점입니다.
:::

---
<!-- Slide 27: Thank you (PDF p36) -->
@type: thankyou
@toc: toc.html
@next: 02-ch2-bedrock-policy.html
@next-label: Chapter 2
@message: 다음은 Chapter 2. Bedrock 배포와 정책 전달입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 받습니다.

:::notes
{timing: 0.5min}
[요약]
• 다음은 Chapter 2, Bedrock 배포와 정책 전달
• 질문은 Slack 워크숍 채널에서 언제든

감사합니다. 다음은 Chapter 2, Bedrock 배포와 정책 전달입니다.
궁금한 점은 지금 손을 드셔도 좋고, Slack 워크숍 채널에 남겨 주셔도 언제든 답해 드리겠습니다.
:::
