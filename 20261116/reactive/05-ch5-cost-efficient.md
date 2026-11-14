---
remarp: true
block: ch5-cost-efficient
---
<!-- Slide 1: Cover -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 5. 비용 효율적으로 쓰기
## 같은 일을 더 적은 토큰으로 (Claude Code v2.1.319, 2026-11-08 리허설 검증)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=[].some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch6.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 5 비용 효율적으로 쓰기, 같은 일을 더 적은 토큰으로
• Claude Code v2.1.319(2026-11-08 리허설 검증)와 Amazon Bedrock 기준
• 강의와 데모, 이어서 랩 TASK 01부터 04

이번 시간은 Chapter 5, 비용 효율적으로 쓰기입니다. 개인이 같은 일을 더 적은 토큰으로 하는 법을 볼 거예요.
조직이 비용을 보고 막는 법은 Chapter 6에서 이어져요.

{cue: transition}
순서 보기 전에, 사전 설문 결과부터 잠깐 볼게요.
:::
---
<!-- Slide 2: Survey -->
@type: content
@fit: off

## 기대 주제 FinOps, 그리고 비용 질문
사전 설문 결과로 정한 이 챕터의 목표

:::html
<div class="fsi fsi-survey c6-survey">
  <div class="sv-big">
    <span class="eyebrow">PRE-SURVEY</span>
    <div class="num"><span id="c6-survey-num">26명</span></div>
    <p class="lead">참가 확정자 <b>142명 중 26명</b>이 FinOps(모델 라우팅, 토큰 메터링, OTel 대시보드)를 기대 주제로 골랐습니다.</p>
    <p class="why">자유 의견에도 토큰 사용 최적화, 사내 토큰 배분, Bedrock 사용 비용을 묻는 질문이 있었습니다. 이 챕터는 개인이 같은 일을 더 적은 토큰으로 하는 법입니다.</p>
  </div>
  <div class="share" id="c6-survey-share">
    <div class="lb"><span>FinOps를 고른 사람</span><b>26 / 142명</b></div>
    <div class="tr"><i></i></div>
    <p class="rank">복수 선택 문항, 조직의 비용 통제는 Chapter 6에서</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var bar = document.querySelector('.slide-deck #c6-survey-share .tr i') || document.querySelector('#c6-survey-share .tr i');
  function grow(on) { bar.style.width = on ? (26 / 142 * 100).toFixed(1) + '%' : '0'; }
  F.countUp('#c6-survey-num', 26, { suffix: '명' });
  F.onEnter(bar, function () { grow(false); setTimeout(function () { grow(true); }, 60); });
  grow(true);
});
:::

:::notes
{timing: 1min}
[요약]
• 참가 확정자 142명 중 26명이 FinOps(모델 라우팅, 토큰 메터링, OTel 대시보드)를 기대 주제로 선택
• 자유 의견: 토큰 사용 최적화, 사내 토큰 배분, Bedrock 사용 비용
• 이 챕터는 개인의 토큰 절약, 조직의 비용 통제는 Chapter 6

사전 설문에서 142분 중 26분이 FinOps, 그러니까 모델 라우팅이나 토큰 메터링을 기대 주제로 골라 주셨어요.
자유 의견에도 토큰을 아끼는 방법, 사내에서 토큰을 어떻게 나눠 줄지, Bedrock으로 쓰면 비용이 얼마나 드는지 같은 질문이 있었고요.
그래서 이 챕터에서는 한 사람이 같은 일을 더 적은 토큰으로 하는 법을 보고, 조직이 비용을 보고 막는 법은 Chapter 6에서 이어 갑니다.

[출처]
• 이번 워크숍 사전 설문, 참가 확정자 142명 기준 (2026-11-14 집계)

{cue: transition}
그럼 이 목표에 맞춰 짠 순서부터 볼게요.
:::
---
<!-- Slide 3: Agenda -->
@type: content
@fit: off

## 강의와 데모, 그리고 랩
여덟 가지 원리, 그리고 랩 TASK 01부터 04까지

:::html
<div class="c6 c6-agenda fsi">
  <div class="fsi-grid-2">
    <div class="pick"><span class="k">CHAPTER 05</span><span class="t">컨텍스트 엔지니어링</span><span class="d">먼저 보기, 지침 줄이기, 출력 필터, 캐시와 압축, 모델과 사고량</span><span class="when">강의와 데모</span></div>
    <div class="pick lab"><span class="k">LAB / Ch5 Lab</span><span class="t">TASK 01부터 04</span><span class="d">기준선 재기, 출력 필터 훅, CLAUDE.md 다이어트, 압축 시점</span><span class="when">강의 뒤 바로</span></div>
  </div>
  <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">자주 묻는 세부 내용은 마지막에 모아 둡니다</span></div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 강의와 데모를 짧게 하고, 이어서 랩
• 여덟 가지 원리와 랩 TASK 01부터 04
• 조직의 비용 통제는 Chapter 6

먼저 순서부터 볼게요. 같은 일을 더 적은 토큰으로 하는 여덟 가지 원리를 보고, 랩 TASK 01부터 04까지 직접 해 봅니다.
강의와 데모는 짧게 하고, 나머지는 랩이에요. 조직이 비용을 보고 막는 법은 Chapter 6에서 이어집니다.
:::
---
<!-- Slide 4: Part 01 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section c6-sec">
  <span class="num">CHAPTER 05</span>
  <div class="name">컨텍스트 엔지니어링</div>
  <p class="what">같은 일을 더 적은 토큰으로</p>
  <ol>
    <li><b>01</b>측정 먼저</li>
    <li><b>02</b>항상 실리는 지침 줄이기</li>
    <li><b>03</b>구조 정보, 출력 필터, 도구 지연 로드</li>
    <li><b>04</b>캐시와 압축(compaction)</li>
    <li><b>05</b>모델과 사고량</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 5는 같은 일을 더 적은 토큰으로
• 보기, 지침 줄이기, 구조 정보와 필터와 지연 로드, 캐시와 압축, 모델과 사고량 순서

컨텍스트 엔지니어링인데요. 목표는 같은 일을 더 적은 토큰으로 하는 거예요.
먼저 무엇이 자리를 차지하는지 보고, 항상 실리는 지침을 줄인 뒤 구조 정보, 출력 필터, 도구 지연 로드를 봅니다. 이어서 캐시와 압축, 마지막으로 모델과 사고량을 정리할게요.
:::
---
<!-- Slide 5: Baseline -->
@type: content
@fit: off

## 출발점은 하루 13달러
엔터프라이즈 배포의 개발자 1인당 평균 비용

:::html
<div class="c6-base">
  <div>
    <span class="eyebrow">BASELINE</span>
    <div class="num">$<span id="c6-base-num">13</span></div>
    <p class="unit">활성일 하루, 개발자 1인당 평균</p>
  </div>
  <div class="facts">
    <div class="fact"><b>월 $150에서 $250</b><span>엔터프라이즈 배포에서 개발자 1인당 평균</span></div>
    <div class="fact"><b>90%는 활성일 $30 미만</b><span>대부분의 사용자는 하루 30달러를 넘지 않습니다</span></div>
    <div class="fact"><b>우리 팀의 기준선은 직접 측정</b><span>파일럿에서 Ch6의 계측으로 잽니다</span></div>
    <p class="src">출처: code.claude.com/docs/en/costs</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.countUp('#c6-base-num', 13, { decimals: 0, suffix: '' }); });
:::

:::notes
{timing: 0.5min}
[요약]
• 공식 문서 기준 활성일 하루 개발자 1인당 평균 $13
• 월 $150에서 $250, 90%는 활성일 $30 미만
• 우리 팀 기준선은 파일럿에서 직접 측정

{cue: pause}
비용 얘기는 여기서 시작해 보겠습니다. 공식 문서에 따르면 엔터프라이즈 배포에서 개발자 한 명이 활성일 하루에 쓰는 평균은 13달러예요. 월로는 150에서 250달러고요. 그리고 90%는 하루 30달러를 넘지 않습니다.
다만 이건 남의 평균이에요. 우리 팀의 기준선은 파일럿에서 Ch6의 계측으로 직접 재셔야 합니다.

[출처]
• code.claude.com/docs/en/costs
:::
---
<!-- Slide 6: Principle 1 -->
@type: content
@fit: off

## 원리 1, 측정 먼저
/context와 /usage로 무엇이 자리를 차지하는지

:::html
<div class="c6-usage fsi">
  <div class="left">
    <p class="c6-code-hd">/usage, Session (예시 출력)</p>
    <pre class="c6-code" id="c6-usage-pre"><span class="ln" data-l="cost">Total cost:            $0.55</span><span class="ln" data-l="dur">Total duration (API):  6m 20s</span><span class="ln" data-l="model">Usage by model:</span><span class="ln" data-l="model">  claude-sonnet-5-5:  1.2k input, 5.3k output,</span><span class="ln" data-l="model">                      940.0k cache read, 50.0k cache write</span><span class="ln" data-l="cache">Prompt cache (main):   14 requests, 91% of input tokens</span><span class="ln" data-l="cache miss">                       from cache, 2 misses, warm (1h TTL)</span></pre>
  </div>
  <div class="fsi-stack">
    <div class="fsi-stack" data-pick="c6-usage">
      <button class="pick" data-key="context"><span class="k">/context</span><span class="t">항목별 컨텍스트 점유</span></button>
      <button class="pick" data-key="cost"><span class="k">/usage 금액</span><span class="t">금액은 추정치, 정산은 AWS 청구서</span></button>
      <button class="pick" data-key="cache"><span class="k">캐시</span><span class="t">캐시 적중률</span></button>
      <button class="pick" data-key="miss"><span class="k">miss</span><span class="t">캐시 미스에는 추정 원인이 표시됨</span></button>
    </div>
    <div class="panel" data-pick-panel="c6-usage">
      <p class="hint">읽는 법을 누르면 설명이 나오고, /usage 항목은 왼쪽 출력에서 해당 줄이 강조됩니다.</p>
      <div data-for="context"><p>/context는 시스템 프롬프트, CLAUDE.md, 도구 정의, 대화가 각각 얼마나 차지하는지 보여 줍니다. 무엇을 줄일지 고르는 첫 화면입니다.</p></div>
      <div data-for="cache"><p>이 예시는 14번의 요청 중 입력 토큰의 91%를 캐시에서 읽었습니다. 캐시 적중률이 높을수록 같은 대화가 싸집니다.</p></div>
      <div data-for="miss"><p>캐시 미스가 나면 /usage가 추정 원인을 함께 보여 줍니다. 원리 6에서 무엇이 캐시를 깨는지 봅니다.</p></div>
      <div data-for="cost"><p>Total cost는 추정치입니다. 실제 정산은 AWS 청구서이고, Ch6에서 계약 단가로 맞추는 법을 봅니다.</p></div>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var lines = Array.prototype.slice.call(document.querySelectorAll('#c6-usage-pre .ln'));
  F.pick('c6-usage', { onShow: function (key) {
    lines.forEach(function (l) { l.classList.toggle('on', !!key && (' ' + l.dataset.l + ' ').indexOf(' ' + key + ' ') >= 0); });
  }});
});
:::

:::notes
{timing: 0.5min}
[요약]
• 원리 1: 줄이기 전에 먼저 본다
• /context는 항목별 컨텍스트 점유, /usage는 위에서부터 금액, 캐시 적중률, 캐시 미스
• 금액은 추정치이며 정산은 AWS 청구서, 캐시 미스에는 추정 원인이 표시됨

{cue: demo}
첫 번째 원리는 줄이기 전에 먼저 보는 거예요. 왼쪽은 /usage 예시 출력입니다. 오른쪽 읽는 법을 하나씩 볼게요. /usage 항목은 왼쪽에서 해당 줄이 강조돼요.↓
/context는 항목별로 컨텍스트를 얼마나 차지하는지 보여 줍니다.↓ /usage는 출력 위에서부터 읽으면 돼요. 맨 위 금액은 어디까지나 추정치고, 정산은 AWS 청구서로 합니다.↓
그 아래 캐시 적중률을 보시면, 이 예시는 입력 토큰의 91%가 캐시에서 왔어요.↓ 마지막 줄의 캐시 미스에는 추정 원인도 같이 표시됩니다.

[출처]
• 원본 Ch6 강의자료 p6 /usage 출력 예시
:::
---
<!-- Slide 7: Eight principles -->
@type: content
@fit: off

## 같은 일을 더 적게, 여덟 가지 원리
본론은 공식 기능, 커뮤니티 도구는 사례로만

:::html
<div class="c6-eight fsi">
  <div class="grid" data-pick="c6-eight">
    <button class="pick" data-key="p1"><span class="k">원리 1</span><span class="t">먼저 본다</span></button>
    <button class="pick" data-key="p2"><span class="k">원리 2</span><span class="t">항상 실리는 지침은 짧게</span></button>
    <button class="pick" data-key="p3"><span class="k">원리 3</span><span class="t">탐색 대신 구조 정보</span></button>
    <button class="pick" data-key="p4"><span class="k">원리 4</span><span class="t">큰 출력은 들어오기 전에</span></button>
    <button class="pick" data-key="p5"><span class="k">원리 5</span><span class="t">도구는 필요할 때만</span></button>
    <button class="pick" data-key="p6"><span class="k">원리 6</span><span class="t">캐시를 깨지 않는다</span></button>
    <button class="pick" data-key="p7"><span class="k">원리 7</span><span class="t">압축은 내가 정한 때에</span></button>
    <button class="pick" data-key="p8"><span class="k">원리 8</span><span class="t">작업에 맞는 모델, 사고량</span></button>
  </div>
  <div class="panel" data-pick-panel="c6-eight">
    <p class="hint">원리를 누르면 그 원리를 받치는 공식 기능과 커뮤니티 사례가 나옵니다.</p>
    <div data-for="p1"><h4>먼저 본다</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">/context, /usage, 스피너 토큰 수</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">없음</span></div></div>
    <div data-for="p2"><h4>항상 실리는 지침은 짧게</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">CLAUDE.md 200줄, 스킬, SessionStart 훅</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">Ponytail</span></div></div>
    <div data-for="p3"><h4>탐색 대신 구조 정보</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">code intelligence 플러그인, 개요 스킬</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">Graphify</span></div></div>
    <div data-for="p4"><h4>큰 출력은 들어오기 전에</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">PreToolUse 필터 훅, Subagent 격리</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">Headroom</span></div></div>
    <div data-for="p5"><h4>도구는 필요할 때만</h4><div class="row"><span class="lb">공식 기능</span><span class="vl"><span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 외부 시스템을 도구로 붙이는 표준">MCP</span> 지연 로드, 서버 끄기, CLI 우선</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">REA</span></div></div>
    <div data-for="p6"><h4>캐시를 깨지 않는다</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">prompt caching, <span class="rp-detail" tabindex="0" data-tip="Time To Live. 캐시가 유지되는 시간">TTL</span>, /clear와 /compact의 차이</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">없음</span></div></div>
    <div data-for="p7"><h4>압축은 내가 정한 때에</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">/compact 지시, autoCompactWindow, idle compaction</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">없음</span></div></div>
    <div data-for="p8"><h4>작업에 맞는 모델, 사고량</h4><div class="row"><span class="lb">공식 기능</span><span class="vl">/model, /effort, Subagent model</span></div><div class="row"><span class="lb">커뮤니티</span><span class="vl">없음</span></div></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c6-eight'); });
:::

:::notes
{timing: 0.5min}
[요약]
• 여덟 가지 원리, 본론은 공식 기능이고 커뮤니티 도구는 사례로만
• 원리마다 받치는 공식 기능이 있음 (예: 원리 4는 PreToolUse 필터 훅)
• 커뮤니티 사례: Ponytail, Graphify, Headroom, REA

이번 Part에서 볼 내용입니다. 여덟 가지 원리를 하나씩 공식 기능으로 설명하고, 커뮤니티 도구는 원리를 보여 주는 사례로만 쓸 거예요.
{cue: demo}
하나씩 볼게요.↓
첫째는 먼저 보기예요.↓ 둘째, 항상 실리는 지침은 짧게 둡니다.↓ 셋째, 탐색 대신 구조 정보를 씁니다.↓ 넷째, 큰 출력은 들어오기 전에 막습니다.↓ 다섯째, 도구는 필요할 때만 불러와요.↓ 여섯째, 캐시를 깨지 않습니다.↓ 일곱째, 압축 시점은 내가 정합니다.↓ 여덟째, 작업에 맞는 모델과 사고량을 고릅니다.
커뮤니티 사례가 붙은 건 Ponytail, Graphify, Headroom, REA, 이렇게 네 가지예요. 효과 수치는 제작자 자체 보고라는 점은 기억해 주세요.

[약어]
• TTL: Time To Live, 캐시가 유지되는 시간
:::
---
<!-- Slide 8: Principle 2 -->
@type: content
@fit: off

## 원리 2, 항상 실리는 지침은 짧게
매 요청에 실리는 것과 필요할 때 오는 것

:::html
<div id="c6-sv-always"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var MD = {id:'md',x:50,y:60,w:440,h:80,t:'CLAUDE.md',s:'세션 시작마다 로드, 매 요청에 포함',c:'accent'};
  var SK = {id:'sk',x:50,y:160,w:440,h:80,t:'스킬 목록',s:'평소에는 설명만 실림',c:'info'};
  var BD = {id:'bd',x:50,y:260,w:440,h:80,t:'스킬 본문',s:'호출될 때 로드',c:'info'};
  var SS = {id:'ss',x:50,y:360,w:440,h:80,t:'SessionStart 훅',s:'짧은 규칙만 주입',c:'warning'};
  var RQ = {id:'rq',x:780,y:190,w:340,h:110,t:'요청 컨텍스트',s:'모델에 보내는 내용',c:'ink'};
  var Z = [{x:20,y:30,w:500,h:430,l:'지침이 들어오는 곳'},{x:740,y:30,w:420,h:430,l:'매 요청'}];
  function N() { return [MD, SK, BD, SS, RQ]; }
  F.stepviz('#c6-sv-always', [
    {kicker:'STEP 1', title:'CLAUDE.md는 매 요청에 실립니다',
     body:'CLAUDE.md는 세션 시작마다 로드되고 <b>매 요청에 포함</b>됩니다. 목표는 <b>200줄 이하, 필수만</b>입니다.',
     facts:['세션 시작마다 로드','매 요청에 포함','목표: 200줄 이하, 필수만'],
     zones:Z, nodes:N(), hot:['md','rq'],
     edges:[{f:'md',t:'rq',c:'accent',side:'h',l:'매번',o:0}], loop:true,
     snip:{hd:'CLAUDE.md에 두지 않을 것',path:'항상 실리는 파일',lines:['# 남길 것: 데이터 범위, 핵심 규칙','# 두지 않을 것','노후 연금 격차 산출 절차','# 가끔 쓰는 작업별 절차'],hl:[3],note:'작업별 절차는 <b>스킬로 이동</b>합니다.'}},
    {kicker:'STEP 2', title:'스킬은 평소에 설명만 실립니다',
     body:'스킬은 평소에 <b>이름과 설명만</b> 컨텍스트에 있습니다. 절차가 아무리 길어도 쓰지 않는 동안에는 짧습니다.',
     facts:['평소: 설명만','본문은 아직 없음','설명을 짧고 구체적으로'],
     zones:Z, nodes:N(), hot:['md','sk','rq'],
     edges:[{f:'md',t:'rq',c:'accent',side:'h',o:0},{f:'sk',t:'rq',c:'info',side:'h',l:'설명만',o:1}], loop:true,
     snip:{hd:'스킬 (요청 시)',path:'평소 컨텍스트',lines:['# 항상: 이름과 설명','retirement-gap: 노후 연금 격차를','  정해진 절차로 계산','# 본문은 호출될 때'],hl:[2,3],note:'랩 <b>TASK 03</b>에서 CLAUDE.md의 절차를 이 스킬로 옮깁니다.'}},
    {kicker:'STEP 3', title:'호출될 때 본문이 들어옵니다',
     body:'그 작업이 필요해 스킬이 호출되면 그때 <b>본문이 로드</b>됩니다. 작업별 절차는 이렇게 필요할 때만 비용이 됩니다.',
     facts:['호출될 때 본문 로드','작업별 절차는 스킬로 이동','필요한 요청에만 비용'],
     zones:Z, nodes:N(), hot:['bd','rq'],
     edges:[{f:'bd',t:'rq',c:'info',side:'h',l:'필요할 때',o:0}], loop:true,
     snip:{hd:'스킬 호출',path:'예시 흐름',lines:['> 세그먼트 (a)의 노후 연금 격차를 계산해 줘','','# retirement-gap 스킬 본문 로드','# 절차대로 격차 표를 만듦'],hl:[1,3],note:'CLAUDE.md에 두면 모든 요청이 이 절차를 싣고 다닙니다.'}},
    {kicker:'STEP 4', title:'SessionStart 훅으로 짧은 규칙만',
     body:'꼭 항상 알아야 하는 짧은 규칙은 <b>SessionStart 훅</b>으로 세션 시작에 주입할 수 있습니다.',
     facts:['세션 시작에 짧은 규칙 주입','길게 쓰면 CLAUDE.md와 같은 비용','커뮤니티 사례: Ponytail (비공식)'],
     zones:Z, nodes:N(), hot:['ss','rq'],
     edges:[{f:'ss',t:'rq',c:'warning',side:'h',l:'세션 시작',o:0}],
     snip:{hd:'커뮤니티 사례, 비공식',path:'효과 수치는 제작자 자체 보고',lines:['Ponytail','# SessionStart 훅으로','# 약 100줄의 YAGNI(지금 필요 없는 것은 만들지 않기) 규칙을','# 주입하는 플러그인','# 제작자 자체 보고 수치로 비용 약 10% 감소'],hl:[1],note:'사례는 원리를 보여 주는 용도입니다. 도입 판단은 Part 1 끝의 세 가지 질문으로 합니다.'}}
  ], {legend:[['accent','항상 실림'],['info','요청 시'],['warning','세션 시작 훅']]});
});
:::

:::notes
{timing: 1min}
[요약]
• CLAUDE.md는 세션 시작마다 로드되고 매 요청에 포함, 200줄 이하로 필수만
• 스킬은 평소 설명만, 호출될 때 본문 로드, 작업별 절차는 스킬로
• SessionStart 훅으로 짧은 규칙만 주입
• 커뮤니티 사례 Ponytail: 약 100줄 YAGNI 규칙, 제작자 자체 보고 수치로 비용 약 10% 감소

{cue: demo}
두 번째 원리는 항상 실리는 지침을 짧게 두는 거예요. 차례로 보겠습니다.
첫 번째는 CLAUDE.md입니다. 매 요청에 실리거든요. 그래서 노후 연금 격차 산출처럼 가끔 쓰는 작업별 절차는 여기에 두지 않습니다.↓
두 번째로, 스킬은 평소에 설명만 실려요.↓ 그다음 세 번째, 호출될 때 비로소 본문이 들어옵니다. 작업별 절차를 스킬로 옮기면 필요한 요청에서만 비용이 드는 거죠. 랩 TASK 03에서 이 절차를 retirement-gap 스킬로 옮겨 볼 거예요.↓
네 번째는 꼭 필요한 짧은 규칙을 SessionStart 훅으로 주입하는 거예요. 커뮤니티의 Ponytail이 이 방식인데, 효과 수치는 제작자 자체 보고라는 점은 감안해 주세요.

[약어]
• YAGNI: You Aren't Gonna Need It, 지금 필요 없는 것은 만들지 말라는 원칙
:::
---
<!-- Slide 9: Principle 3 -->
@type: content
@fit: off

## 원리 3, 탐색 대신 구조 정보
grep과 파일 여러 개 읽기를 한 번의 질의로

:::html
<div class="c6">
  <div class="c6-cards">
    <div class="c6-card"><span class="k">OFFICIAL</span><span class="t">Code intelligence 플러그인</span><span class="d">언어 서버로 정의로 이동합니다.</span><span class="d">편집 후 타입 오류를 자동으로 보고해, 불필요한 파일 읽기가 줄어듭니다.</span></div>
    <div class="c6-card"><span class="k">OFFICIAL</span><span class="t">코드베이스 개요 스킬</span><span class="d">아키텍처, 디렉터리, 명명 규칙을 스킬로 둡니다.</span><span class="d">탐색에 쓰는 토큰을 줄입니다.</span></div>
    <div class="c6-card warn"><span class="k">COMMUNITY / 비공식</span><span class="t">Graphify</span><span class="d">코드를 로컬 <span class="rp-detail" tabindex="0" data-tip="Abstract Syntax Tree. 코드를 문법 구조로 나타낸 트리">AST</span>로 파싱해 지식 그래프로 만들고 스킬, <span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 외부 시스템을 도구로 붙이는 표준">MCP</span>로 제공합니다.</span><span class="d">작은 저장소에서는 효과가 거의 없습니다.</span></div>
  </div>
  <p class="c6-note"><span class="lbl">커뮤니티 사례</span>효과 수치는 제작자 자체 보고입니다. 같은 효과를 공식 기능으로 낼 수 있는지 먼저 봅니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 원리 3: 여러 번의 grep과 파일 읽기를 한 번의 질의로
• 공식: code intelligence 플러그인(정의로 이동, 편집 후 타입 오류 보고), 코드베이스 개요 스킬
• 커뮤니티 Graphify: 로컬 AST로 지식 그래프, 작은 저장소에서는 효과 거의 없음

세 번째 원리는 탐색 대신 구조 정보를 쓰는 거예요. Claude가 grep을 여러 번 돌리고 파일을 여러 개 읽는 대신, 구조 정보를 한 번에 얻게 하는 거죠.
공식 기능은 두 가지입니다. code intelligence 플러그인은 언어 서버로 정의로 이동하고, 편집 후 타입 오류를 자동으로 알려 줘요. 그러니까 불필요한 파일 읽기를 줄이는 거죠. 또 하나는 아키텍처, 디렉터리, 명명 규칙을 담은 코드베이스 개요 스킬이에요.
커뮤니티 사례인 Graphify는 코드를 지식 그래프로 만들어 줍니다. 다만 작은 저장소에서는 효과가 거의 없어요.

[약어]
• AST: Abstract Syntax Tree
• MCP: Model Context Protocol
:::
---
<!-- Slide 10: Principle 4, output filter 훅 -->
@type: content
@fit: off

## 원리 4, 큰 출력은 들어오기 전에
공식 예제 기반: 테스트 출력을 실패 줄만 남기기

:::html
<pre class="c6-src" id="c6-filter-src">#!/bin/bash
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')
pattern='^(npm test|pytest|go test)( [^;&amp;|&lt;&gt;`$#\\[:cntrl:]]*)?$'
if [[ "$cmd" =~ $pattern ]]; then
  filtered_cmd="log=\$(mktemp); $cmd &gt;\"\$log\" 2&gt;&amp;1; rc=\$?
grep -A 5 -E '(FAIL|ERROR|error:)' \"\$log\" | head -100; exit \$rc"
  echo "$input" | jq --arg filtered "$filtered_cmd" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse",
      updatedInput: (.tool_input + {command: $filtered})}}'
else
  echo "{}"
fi</pre>
<div id="c6-sv-filter"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var L = document.getElementById('c6-filter-src').textContent.split('\n');
  var P = '~/.claude/hooks/filter-test-output.sh';
  var CC = {id:'cc',x:50,y:70,w:290,h:90,t:'Claude Code',s:'Bash(npm test) 호출',c:'accent'};
  var HK = {id:'hk',x:445,y:70,w:290,h:90,t:'PreToolUse 훅',s:'matcher: Bash',c:'warning'};
  var SH = {id:'sh',x:840,y:70,w:290,h:90,t:'셸 실행',s:'테스트 명령',c:'accent'};
  var OUT = {id:'out',x:840,y:330,w:290,h:90,t:'명령 출력',s:'실패 줄만',c:'success'};
  var CX = {id:'cx',x:50,y:330,w:290,h:90,t:'컨텍스트',s:'모델이 읽는 내용',c:'info'};
  var SUB = {id:'sub',x:445,y:330,w:290,h:90,t:'Subagent',s:'장황한 작업 격리',c:'info'};
  var Z = [{x:20,y:30,w:1140,h:430,l:'한 번의 Bash 호출'}];
  function N() { return [CC, HK, SH, OUT, CX, SUB]; }
  F.stepviz('#c6-sv-filter', [
    {kicker:'STEP 1', title:'훅이 없으면 로그 전체가 들어옵니다',
     body:'테스트를 돌리면 통과한 줄까지 <b>수만 토큰의 로그</b>가 그대로 컨텍스트에 들어옵니다. 다음 요청부터 계속 실려 다닙니다.',
     facts:['출력 전체가 도구 결과로','다음 요청마다 다시 실림','대화와 도구 결과가 가장 빨리 커짐 (Ch1)'],
     zones:Z, nodes:N(), hot:['cc','sh','cx'],
     edges:[{f:'cc',t:'sh',c:'accent',side:'t',curve:40,o:0},{f:'sh',t:'cx',c:'danger',side:'h',curve:0,l:'수만 토큰 로그',o:1}],
     snip:{hd:'훅이 없을 때',path:'예시 흐름',lines:['Bash(npm test)','','# 통과한 줄까지 전부','# 도구 결과로 컨텍스트에 들어감'],hl:[1],note:'문제는 실행이 아니라 <b>결과가 들어오는 양</b>입니다.'}},
    {kicker:'STEP 2', title:'PreToolUse가 명령을 가로챕니다',
     body:'<b>PreToolUse</b> 훅은 도구가 실행되기 <b>전에</b> 호출 내용을 받습니다. 명령을 읽어 테스트 명령인지 확인합니다.',
     facts:['settings.json PreToolUse','matcher: Bash','테스트 명령만 골라냄'],
     zones:Z, nodes:N(), hot:['cc','hk'],
     edges:[{f:'cc',t:'hk',c:'warning',o:0}],
     snip:{hd:'공식 예제 기반',path:P,lines:L.slice(0,5).concat(['  # (STEP 3) 명령을 다시 씀']).concat(L.slice(10,13)),hl:[3,4,5,7,8,9],note:'허용하는 명령 모양을 정규식으로 좁혀 둡니다. 테스트 명령이 아니면 <code>{}</code>를 돌려 그대로 실행합니다.'}},
    {kicker:'STEP 3', title:'실패 줄만 남기도록 다시 씁니다',
     body:'훅이 명령을 다시 써서 출력은 <b>임시 로그 파일(mktemp)</b>에 저장하고, <b>실패 줄 앞뒤만</b> 최대 100줄 남깁니다. 원래 <b>종료 코드(rc)</b>를 그대로 돌려주고, 바뀐 명령은 <b>updatedInput</b>으로 반환합니다.',
     facts:['출력은 로그 파일로, 종료 코드 rc 유지','실패 줄 앞뒤만, 최대 100줄','updatedInput으로 반환'],
     zones:Z, nodes:N(), hot:['hk','sh'],
     edges:[{f:'hk',t:'sh',c:'warning',o:0}],
     snip:{hd:'공식 예제 기반',path:P,lines:L.slice(5,10),hl:[1,2,3,4,5],note:'종료 코드를 지켜야 Claude가 <b>테스트 실패를 실패로</b> 읽습니다.'}},
    {kicker:'STEP 4', title:'수백 토큰만 컨텍스트로 갑니다',
     body:'같은 테스트를 돌려도 컨텍스트에 들어오는 것은 <b>실패 줄 몇 개</b>입니다. 수만 토큰 로그가 <b>수백 토큰</b>이 됩니다.',
     facts:['수만 토큰 로그를 수백 토큰으로','실패 원인을 찾는 데 필요한 줄만','데모에서 /context로 전후 비교'],
     zones:Z, nodes:N(), hot:['sh','out','cx'],
     edges:[{f:'sh',t:'out',c:'success',o:0},{f:'out',t:'cx',c:'success',side:'b',curve:35,l:'수백 토큰',o:1}], loop:true, stagger:0.9,
     snip:{hd:'등록 (요약)',path:'settings.json PreToolUse',lines:['# hooks.PreToolUse','matcher: Bash','command: ~/.claude/hooks/filter-test-output.sh'],hl:[2,3],note:'데모와 랩에서 같은 스크립트를 씁니다.'}},
    {kicker:'STEP 5', title:'장황한 작업은 Subagent로 격리합니다',
     body:'출력을 줄이기 어려운 장황한 작업은 <b>Subagent</b>에 맡깁니다. Subagent가 읽고, 메인 컨텍스트에는 <b>요약만</b> 돌아옵니다.',
     facts:['Subagent가 긴 출력을 대신 읽음','메인에는 요약만','커뮤니티 Headroom: 프록시가 모든 프롬프트를 지나감, 주의'],
     zones:Z, nodes:N(), hot:['cc','sub','cx'],
     edges:[{f:'cc',t:'sub',c:'info',o:0},{f:'sub',t:'cx',c:'info',side:'h',l:'요약만',o:1}],
     snip:{hd:'커뮤니티 사례, 비공식',path:'효과 수치는 제작자 자체 보고',lines:['Headroom','# 요청 경로에 프록시를 두고','# 도구 출력과 로그를 압축','# 주의: 프록시가 모든 프롬프트를 지나감'],hl:[4],note:'금융권에서는 <b>프롬프트가 어디를 지나가는지</b>가 먼저입니다.'}}
  ], {legend:[['accent','Claude Code와 셸'],['warning','훅'],['danger','큰 출력'],['success','줄어든 출력'],['info','컨텍스트와 Subagent']]});
});
:::

:::notes
{timing: 1min}
[요약]
• 원리 4: 큰 출력은 컨텍스트에 들어오기 전에 줄인다
• 공식 예제 기반 filter-test-output.sh: PreToolUse 훅이 출력을 로그 파일에 저장하고 실패 줄만 남기며 종료 코드 rc를 유지
• 수만 토큰 로그가 수백 토큰으로, settings.json PreToolUse matcher Bash로 등록
• 장황한 작업은 Subagent로 격리, 커뮤니티 Headroom은 프록시가 모든 프롬프트를 지나가므로 주의

{cue: demo}
네 번째 원리는 큰 출력이 들어오기 전에 줄이는 거예요. 공식 문서 예제를 하나씩 볼게요.
첫 번째, 훅이 없으면 테스트 로그 전체가 컨텍스트에 들어와요. 수만 토큰입니다.↓
두 번째, PreToolUse 훅이 실행 전에 명령을 받아서 테스트 명령인지 확인합니다.↓
세 번째, 출력은 임시 로그 파일에 저장하고 실패 줄 앞뒤만 남기고, 원래 종료 코드는 그대로 돌려줘요. 그래서 실패한 테스트가 성공처럼 보이지 않습니다.↓
네 번째, 그러면 실패 줄 몇 개, 수백 토큰만 들어오는 거죠.↓
다섯 번째는 줄이기 어려운 장황한 작업을 Subagent로 격리하는 거예요. 커뮤니티의 Headroom은 프록시로 압축하는데요. 모든 프롬프트가 그 프록시를 지나가니까 금융권에서는 이 점을 꼭 따져 보셔야 합니다.

{cue: transition}
그럼 바로 데모로 전후를 비교하겠습니다.

[출처]
• code.claude.com/docs, 출력 필터 훅 공식 예제 (원본 Ch6 강의자료 p10)
:::
---
<!-- Slide 11: Demo, output filter -->
@type: content
@fit: off

## 훅 하나로 컨텍스트 절감
DEMO, 출력 필터 훅 적용 전후 비교

:::html
<div class="fsi fsi-lab c6-lab">
  <div class="head"><span class="tag">DEMO</span></div>
  <ol class="steps">
    <li><b>1</b><span>실패 테스트가 섞인 저장소에서 "npm test 돌려서 실패 원인 찾아줘"</span></li>
    <li><b>2</b><span>/context와 /usage 기록</span></li>
    <li><b>3</b><span>filter-test-output.sh 등록 후 /clear, 같은 요청 반복</span></li>
    <li><b>4</b><span>두 번의 컨텍스트 크기와 비용 비교</span></li>
  </ol>
  <p class="where">강사 데모입니다. 참가자는 Lab 포털의 같은 스크립트로 따라 해 볼 수 있습니다.</p>
</div>
:::

:::notes
{timing: 7min}
{cue: demo}
[요약]
• 실패 테스트가 섞인 저장소에서 같은 요청을 훅 전후로 두 번 실행
• /context와 /usage로 컨텍스트 크기와 비용을 비교
• 참가자는 Lab 포털의 같은 스크립트로 따라 할 수 있음

이제 데모로 가 볼게요. 실패 테스트가 섞인 저장소에서 "npm test 돌려서 실패 원인 찾아줘"라고 요청하고, /context와 /usage를 기록하겠습니다.
그다음 filter-test-output.sh를 등록하고 /clear로 새로 시작해서 같은 요청을 반복해요. 두 번의 컨텍스트 크기와 비용을 나란히 비교해 볼게요.
여러분도 Lab 포털에 있는 같은 스크립트로 따라 해 보실 수 있어요.
:::
---
<!-- Slide 12: Principle 5 -->
@type: content
@fit: off

## 원리 5, 도구는 필요할 때만
MCP 서버는 공짜가 아닙니다

:::html
<div class="c6">
  <div class="c6-cards">
    <div class="c6-card"><span class="k">DEFERRED</span><span class="t">도구 정의 지연 로드</span><span class="d">기본값은 도구 이름과 서버 지침만 싣고, 쓸 때 스키마를 tool search로 로드합니다.</span><span class="d">게이트웨이 뒤에서도 기본 켜짐 (v2.1.304+).</span></div>
    <div class="c6-card"><span class="k">TRIM</span><span class="t">안 쓰는 서버 끄기</span><span class="d">/mcp로 서버 목록을 확인합니다.</span><span class="d">쓰지 않는 서버는 비활성화합니다.</span></div>
    <div class="c6-card"><span class="k">CLI FIRST</span><span class="t">CLI 우선</span><span class="d">gh, aws 같은 CLI는 도구 목록을 미리 싣지 않습니다.</span></div>
  </div>
  <p class="c6-note"><span class="lbl">커뮤니티 사례 / 비공식</span><b>REA</b>(Reverse Engineer Anything)는 170여 개 <span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 외부 시스템을 도구로 붙이는 표준">MCP</span> 도구를 가진 역공학 도구입니다. 도구 목록이 거대해 지연 로드가 왜 기본값인지 보여 주는 사례입니다. 비신뢰 바이너리는 <span class="rp-detail" tabindex="0" data-tip="Virtual Machine. 격리된 가상 환경">VM</span>과 법무 검토를 거칩니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 원리 5: MCP 서버는 공짜가 아니므로 도구는 필요할 때만
• 지연 로드가 기본값: 도구 이름과 서버 지침만, 스키마는 쓸 때 tool search로, 게이트웨이 뒤에서도 기본 켜짐 (v2.1.304+)
• /mcp로 안 쓰는 서버 끄기, gh와 aws 같은 CLI 우선
• 커뮤니티 REA: 170여 개 도구, 비신뢰 바이너리는 VM과 법무 검토

다섯 번째 원리는 도구를 필요할 때만 쓰는 거예요. MCP 서버는 연결만 해도 공짜가 아니거든요.
다행히 지연 로드가 기본값이에요. 도구 이름과 서버 지침만 싣고, 실제로 쓸 때 스키마를 tool search로 불러옵니다. v2.1.304부터는 게이트웨이 뒤에서도 기본으로 켜져 있고요.
그리고 /mcp로 안 쓰는 서버를 끄세요. gh나 aws처럼 CLI로 되는 일은 CLI를 우선하고요. CLI는 도구 목록을 미리 싣지 않거든요.
REA라는 도구는 MCP 도구가 170여 개예요. 왜 지연 로드가 기본값인지 잘 보여 주죠.
:::
---
<!-- Slide 13: Quick check 1 -->
@type: content
@fit: off

## 한 시간 비운 뒤 첫 메시지는?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c6-qc-1">
  <p class="q">1시간 넘게 자리를 비운 뒤 보내는 첫 메시지는?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>캐시에서 읽어 저렴하다</button>
    <button class="opt right"><b>B</b>캐시 미스로 전체 컨텍스트를 다시 처리한다</button>
    <button class="opt"><b>C</b>자동으로 /clear 된다</button>
  </div>
  <p class="ans">정답 B. 기본 캐시 수명은 5분입니다. 긴 세션일수록 비용이 큽니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c6-qc-1'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, 캐시 미스로 전체 컨텍스트를 다시 처리
• 기본 캐시 수명은 5분, 긴 세션일수록 비용이 큼

여기서 퀴즈 하나 갈게요. 한 시간 넘게 자리를 비웠다가 돌아와서 보내는 첫 메시지는 어떻게 될까요?↓
{cue: pause}
정답은 B예요. 기본 캐시 수명이 5분이라, 돌아온 첫 메시지는 캐시 미스로 전체 컨텍스트를 다시 처리합니다. 세션이 길수록 이 한 번이 비싸지는 거죠.
:::
---
<!-- Slide 14: Principle 6 -->
@type: content
@fit: off

## 원리 6, 캐시 보존
/clear와 /compact는 비용이 다릅니다

:::html
<div class="c6">
  <div class="c6-two">
    <div class="c6-col good"><h4>/clear</h4><ul><li>새 세션 시작, 비용 0</li><li>관련 없는 작업으로 넘어갈 때</li><li>/rename 후 /resume으로 돌아오기</li></ul></div>
    <div class="c6-col bad"><h4>/compact</h4><ul><li>대화를 읽어 요약하는 것 자체가 큰 요청</li><li>이어서 작업해야 할 때만</li><li>보존할 것을 지시: /compact Focus on …</li><li>CLAUDE.md에 압축 지침을 둘 수 있음</li></ul></div>
  </div>
  <div class="c6-chips">
    <div class="c6-chip"><b>5분</b><span>기본 캐시 수명</span></div>
    <div class="c6-chip"><b>1시간</b><span>1시간 옵션, 더 비쌈</span></div>
    <div class="c6-chip"><b>미스 원인</b><span>/usage에 표시</span></div>
    <div class="c6-chip"><b>Bedrock</b><span>모델, 리전별 지원 확인</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• /clear는 새 세션, 비용 0, 관련 없는 작업으로 넘어갈 때 (/rename 후 /resume으로 복귀)
• /compact는 대화를 읽어 요약하는 큰 요청, 이어서 작업할 때만, 보존할 것을 지시
• 기본 캐시 수명 5분, 1시간 옵션은 더 비쌈, 미스 원인은 /usage, Bedrock은 모델과 리전별 지원 확인

여섯 번째 원리는 캐시를 깨지 않는 거예요. /clear와 /compact를 많이 헷갈리시는데요.
/clear는 새 세션입니다. 비용 0에서 시작하고, 관련 없는 작업으로 넘어갈 때 써요. 나중에 돌아오고 싶으시면 /rename해 두고 /resume으로 돌아오면 됩니다.
/compact는 대화 전체를 읽어서 요약하거든요. 그러니까 그 자체가 큰 요청입니다. 이어서 작업해야 할 때만 쓰시고, 무엇을 남길지도 지시해 주세요.
아래 숫자도 기억해 주세요. 기본 캐시 수명은 5분이고, 1시간 옵션은 더 비쌉니다.
:::
---
<!-- Slide 15: Principle 7, compaction methods -->
@type: content
@fit: off

## 원리 7, 압축은 내가 정한 때에
대화가 차면 Claude Code는 오래된 기록을 요약합니다

:::html
<div class="c6-pickset fsi">
  <div class="fsi-stack" data-pick="c6-ways">
    <button class="pick" data-key="auto"><span class="k">자동</span><span class="t">자동 압축</span></button>
    <button class="pick" data-key="manual"><span class="k">수동</span><span class="t">/compact [지시]</span></button>
    <button class="pick" data-key="rewind"><span class="k">부분</span><span class="t">/rewind 부분 요약</span></button>
    <button class="pick" data-key="idle"><span class="k">자리 비움</span><span class="t">Idle compaction</span></button>
    <button class="pick" data-key="clear"><span class="k">전환</span><span class="t">/clear</span></button>
  </div>
  <div class="panel" data-pick-panel="c6-ways">
    <p class="hint">방식을 누르면 언제 일어나고 무엇으로 바꾸는지 나옵니다.</p>
    <div data-for="auto"><h4>자동 압축</h4><div class="kv"><span class="lb">언제</span><span class="vl">auto-compact window에 닿을 때</span></div><div class="kv"><span class="lb">바꾸는 설정</span><span class="vl">1M 모델 기본 약 967K, /autocompact 400k, autoCompactWindow</span></div></div>
    <div data-for="manual"><h4>/compact [지시]</h4><div class="kv"><span class="lb">언제</span><span class="vl">내가 원할 때</span></div><div class="kv"><span class="lb">바꾸는 설정</span><span class="vl">/compact focus on …, CLAUDE.md의 # Compact instructions</span></div></div>
    <div data-for="rewind"><h4>/rewind 부분 요약</h4><div class="kv"><span class="lb">언제</span><span class="vl">특정 메시지부터, 또는 특정 메시지까지</span></div><div class="kv"><span class="lb">바꾸는 설정</span><span class="vl">Summarize from here, Summarize up to here</span></div></div>
    <div data-for="idle"><h4>Idle compaction</h4><div class="kv"><span class="lb">언제</span><span class="vl">1시간 <span class="rp-detail" tabindex="0" data-tip="Time To Live. 캐시가 유지되는 시간">TTL</span> 세션을 오래 비웠을 때, 캐시 만료 직전</span></div><div class="kv"><span class="lb">바꾸는 설정</span><span class="vl">v2.1.290+, idleCompaction: false로 끔</span></div></div>
    <div data-for="clear"><h4>/clear</h4><div class="kv"><span class="lb">언제</span><span class="vl">관련 없는 작업으로 전환</span></div><div class="kv"><span class="lb">결과</span><span class="vl">비용 0, 연속성 없음</span></div></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c6-ways'); });
:::

:::notes
{timing: 1min}
[요약]
• 자동 압축: auto-compact window에 닿을 때, 1M 모델 기본 약 967K, autoCompactWindow로 조정
• /compact [지시]: 내가 원할 때, CLAUDE.md # Compact instructions
• /rewind 부분 요약: Summarize from here, up to here
• Idle compaction: 1시간 TTL 세션을 오래 비웠을 때 (v2.1.290+, idleCompaction: false로 끔)
• /clear: 비용 0, 연속성 없음

일곱 번째 원리는 압축을 내가 정한 때에 하는 거예요. 대화가 차면 Claude Code가 오래된 기록을 요약하는데, 방식이 다섯 가지입니다.
{cue: demo}
하나씩 볼게요.↓ 자동 압축은 auto-compact window에 닿을 때 일어나고, 1M 모델 기본값은 약 967K예요.↓ /compact는 내가 원할 때 지시와 함께 합니다.↓ /rewind로는 특정 메시지부터, 또는 특정 메시지까지 골라서 부분 요약할 수 있고요.↓
Idle compaction은 1시간 TTL 세션을 오래 비웠을 때 캐시 만료 직전에 일어납니다. Bedrock에서는 1시간 캐시를 켜야 조건이 맞아요. 이건 잠시 뒤에 봅니다.↓ /clear는 압축하는 게 아니라 새로 시작하는 거예요.
:::
---
<!-- Slide 16: auto-compact window -->
@type: content
@fit: off

## 가득 차기 전 선제 압축
auto-compact window 조정과 설정 우선순위

:::html
<div class="c6-acw fsi">
  <div class="left">
    <p class="c6-code-hd">Claude Code 세션, Terminal</p>
    <pre class="c6-code"><span class="ln c"># 현재 값과 출처 확인</span><span class="ln k">/autocompact</span><span class="ln c"># 400K에서 압축 (모델별로 사용자 설정에 저장, v2.1.288+)</span><span class="ln k">/autocompact 400k</span><span class="ln c"># 모델 기본값으로 복귀</span><span class="ln k">/autocompact auto</span><span class="ln c"># 이번 세션만</span><span class="ln k">claude --autocompact 500k</span><span class="ln c"># 조직 기본값 (managed-settings.json)</span><span class="ln k">{ "autoCompactWindow": 400000 }</span></pre>
    <p class="c6-note">같은 파일에서는 modelSettings.&lt;model&gt; 값이 우선합니다.<br>범위는 100K에서 1M 또는 "auto", 실제 시점은 설정값과 모델 최대 컨텍스트 중 작은 쪽입니다.</p>
      </div>
  <div class="right">
    <div class="prio">
      <div><b>1</b>환경 변수 (최우선)<br><code>CLAUDE_CODE_AUTO_COMPACT_WINDOW</code></div>
      <div><b>2</b>--autocompact 실행 플래그</div>
      <div><b>3</b>settings: managed가 사용자 /autocompact를 덮음</div>
    </div>
    <div class="c6-gauge" id="c6-acw">
      <div class="hd"><span>1M 모델 대화 길이, 회색 선은 기본값 약 967K (예시)</span><span id="c6-acw-val">400K</span></div>
      <div class="bar"><i id="c6-acw-fill"></i><span class="mk" id="c6-acw-mk"></span><span class="mk auto" id="c6-acw-auto"></span></div>
      <input type="range" min="100" max="1000" step="50" value="400" id="c6-acw-in" aria-label="auto-compact window 크기">
      <p class="out" id="c6-acw-out"></p>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var inp = document.getElementById('c6-acw-in');
  function draw() {
    var v = +inp.value;
    document.getElementById('c6-acw-val').textContent = v >= 1000 ? '1M' : v + 'K';
    document.getElementById('c6-acw-fill').style.width = (v / 1000 * 100) + '%';
    document.getElementById('c6-acw-mk').style.left = (v / 1000 * 100) + '%';
    document.getElementById('c6-acw-auto').style.left = '96.7%';
    document.getElementById('c6-acw-out').textContent = '대화가 ' + (v >= 1000 ? '1M' : v + 'K') + '에 닿으면 자동 압축이 시작됩니다.';
  }
  inp.addEventListener('input', draw);
  inp.addEventListener('change', function () { inp.blur(); });
  F.onEnter(inp, function () { inp.value = 400; draw(); });
  draw();
});
:::

:::notes
{timing: 0.5min}
[요약]
• /autocompact로 현재 값과 출처 확인, /autocompact 400k로 조정 (모델별 사용자 설정, v2.1.288+), auto로 복귀
• 이번 세션만은 claude --autocompact 500k, 조직 기본값은 managed-settings.json autoCompactWindow
• 우선순위: 환경 변수 CLAUDE_CODE_AUTO_COMPACT_WINDOW, 실행 플래그, settings(managed가 사용자 /autocompact를 덮음)
• 같은 파일에서는 modelSettings.<model> 우선, 범위 100K에서 1M 또는 auto, 실제 시점은 설정값과 모델 최대 컨텍스트 중 작은 쪽

자동 압축 시점은 바꿀 수 있어요. 다 차기 전에 미리 압축하면, 압축 전까지 요청마다 보내는 입력이 작아집니다.
왼쪽 명령을 보시면, /autocompact로 지금 값과 출처를 확인해요. /autocompact 400k로 400K에서 압축하게 하고, auto로 되돌립니다. 이번 세션만은 실행 플래그로, 조직 기본값은 managed settings로 정해요.
{cue: demo}
아래 막대는 설명용 그림이에요. 슬라이더를 움직이면 압축이 시작되는 지점이 옮겨 갑니다.
오른쪽 우선순위는 환경 변수가 최우선이에요. 그다음 실행 플래그, 그다음 settings 순인데, managed가 사용자의 /autocompact를 덮습니다.
:::
---
<!-- Slide 17: Trade-off -->
@type: content
@fit: off

## 창을 줄이면 항상 쌀까?
Claude Code도 기본값 "auto"를 권하는 이유

:::html
<div class="c6">
  <div class="c6-two">
    <div class="c6-col good"><h4>줄어드는 것</h4><ul><li>압축 전까지 매 요청의 입력 토큰</li><li>캐시가 식은 뒤 다시 읽는 양</li><li>1M 모델의 긴 세션에서 효과가 큼</li></ul></div>
    <div class="c6-col bad"><h4>늘어나는 것, 잃는 것</h4><ul><li>압축 횟수: 한 번이 대화 전체를 읽는 요청</li><li>압축 직후 캐시 재구축</li><li>손실 요약: 초반 제약, 정확한 오류가 빠질 수 있음</li><li>기본값을 바꾸면 긴 세션 재개 시 사용량이 늘 수 있다는 공식 경고</li></ul></div>
  </div>
  <div class="c6-prio3">
    <div><b>1순위</b><span>작업 단위 끝에 캐시가 따뜻할 때 /compact</span></div>
    <div><b>2순위</b><span>긴 세션 팀만 창을 400K에서 500K로</span></div>
    <div><b>검증</b><span><span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span> token.usage로 전후 비교</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 줄어드는 것: 압축 전 요청당 입력, 캐시가 식은 뒤 다시 읽는 양, 1M 모델 긴 세션에서 효과
• 늘어나는 것: 압축 횟수(매번 대화 전체를 읽는 요청), 압축 직후 캐시 재구축, 손실 요약
• 기본값을 바꾸면 긴 세션 재개 시 사용량이 늘 수 있다는 공식 경고
• 1순위 작업 끝 /compact, 2순위 긴 세션 팀만 400K에서 500K, OTel token.usage로 검증

{cue: question}
그럼 창을 줄이면 항상 쌀까요? 그렇지는 않아요. Claude Code도 기본값 auto를 권합니다.
줄어드는 건 압축 전까지의 요청당 입력과 캐시가 식은 뒤 다시 읽는 양이에요. 1M 모델로 긴 세션을 하면 효과가 큽니다.
대신 압축이 잦아져요. 앞에서 말씀드린 것처럼 압축 한 번이 대화 전체를 읽는 요청이거든요. 직후에는 캐시도 다시 쌓아야 합니다. 요약하면서 초반 제약이나 정확한 오류 메시지가 빠질 수도 있고요.
그래서 순서는 이렇습니다. 1순위는 작업 단위 끝에 캐시가 따뜻할 때 직접 /compact를 하는 거고, 2순위로 긴 세션을 하는 팀만 창을 400K에서 500K 사이로 맞춥니다. 그리고 Ch6의 OTel token.usage로 전후를 비교하세요.
:::
---
<!-- Slide 18: What survives compaction -->
@type: content
@fit: off

## 압축 후에 무엇이 남나
공식 문서의 What survives compaction

:::html
<div class="c6-surv fsi" id="c6-surv">
  <div class="ctl"><button class="btn btn-primary" data-cycle>/compact 실행해 보기</button><span class="st" id="c6-surv-st">압축 전</span></div>
  <div class="rows">
    <div class="row keep"><span class="it">시스템 프롬프트, 출력 스타일</span><span class="res"><span class="tag ok">유지</span>그대로 적용</span></div>
    <div class="row re"><span class="it">루트 CLAUDE.md, auto memory, plan 모드의 계획</span><span class="res"><span class="tag info">재주입</span>디스크에서 다시 주입</span></div>
    <div class="row re"><span class="it">최근 읽거나 고친 파일</span><span class="res"><span class="tag info">재주입</span>최근 수정 순으로 최대 5개 다시 읽음 (5,000 토큰 넘으면 경로만)</span></div>
    <div class="row re"><span class="it">사용한 스킬 본문</span><span class="res"><span class="tag info">재주입</span>스킬당 5,000, 합계 25,000 토큰, 오래된 것부터 제외</span></div>
    <div class="row lost"><span class="it">paths: 규칙, 하위 폴더 CLAUDE.md</span><span class="res"><span class="tag cond">사라짐</span>요약되어 사라지고, 해당 파일을 다시 읽을 때 재로드</span></div>
    <div class="row re"><span class="it">SessionStart 훅 (matcher: compact)</span><span class="res"><span class="tag info">재실행</span>다시 실행되어 결과가 추가됨</span></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var el = document.getElementById('c6-surv');
  F.cycle('#c6-surv', 2, function (i) {
    el.classList.toggle('after', i === 1);
    document.getElementById('c6-surv-st').textContent = i === 1 ? '압축 후' : '압축 전';
  });
});
:::

:::notes
{timing: 0.5min}
[요약]
• 시스템 프롬프트와 출력 스타일은 그대로
• 루트 CLAUDE.md, auto memory, plan 계획은 디스크에서 재주입, 최근 파일 최대 5개, 스킬 본문 스킬당 5,000 합계 25,000 토큰
• paths: 규칙과 하위 폴더 CLAUDE.md는 요약되어 사라지고 파일을 다시 읽을 때 재로드
• SessionStart 훅(matcher: compact)은 다시 실행

{cue: demo}
그럼 압축하면 무엇이 남을까요? 압축을 한 번 실행해 볼게요.↓
시스템 프롬프트와 출력 스타일은 그대로예요. 루트 CLAUDE.md와 auto memory, plan 모드의 계획은 디스크에서 다시 주입됩니다. 최근에 읽거나 고친 파일은 최대 5개를 다시 읽고요. 사용한 스킬 본문도 한도 안에서 다시 들어옵니다.
여기서 노란색을 봐 주세요. paths 규칙과 하위 폴더 CLAUDE.md는 요약되어 사라졌다가, 해당 파일을 다시 읽을 때 돌아와요.
그래서 압축 뒤에도 꼭 지켜야 하는 규칙은 SessionStart 훅의 compact matcher로 다시 넣습니다. 이건 조금 뒤 조직 설계에서 다시 나올 거예요.

[출처]
• code.claude.com/docs, What survives compaction (원본 Ch6 강의자료 p18)
:::
---
<!-- Slide 19: Cost of compaction, warm vs cold -->
@type: content
@fit: off

## 자리 비우기 전에 /compact
/compact도 대화 전체를 읽는 요청, 캐시가 따뜻할 때와 식었을 때

:::html
<div id="c6-sv-compact"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var H = {id:'h',x:50,y:190,w:300,h:100,t:'대화 기록',s:'긴 접두부',c:'ink'};
  var C = {id:'c',x:450,y:60,w:300,h:90,t:'프롬프트 캐시',s:'접두부 저장',c:'success'};
  var Cc = {id:'c',x:450,y:60,w:300,h:90,t:'프롬프트 캐시',s:'TTL 지나 만료',c:'muted'};
  var S = {id:'s',x:450,y:330,w:300,h:90,t:'/compact 요청',s:'요약을 만드는 요청',c:'accent'};
  var R = {id:'r',x:850,y:190,w:280,h:100,t:'요약',s:'이어서 작업',c:'info'};
  var Z = [{x:20,y:30,w:1140,h:430,l:'/compact 한 번'}];
  F.stepviz('#c6-sv-compact', [
    {kicker:'STEP 1', title:'캐시가 따뜻할 때: 접두부를 캐시에서',
     body:'캐시가 살아 있으면 요약 요청이 <b>접두부를 캐시에서 읽습니다</b>. 비용은 컨텍스트 크기의 <b>일부</b>입니다.',
     facts:['요약 요청이 접두부를 캐시에서 읽음','비용은 컨텍스트 크기의 일부','작업 사이에 직접 /compact'],
     zones:Z, nodes:[H,C,S,R],
     edges:[{f:'h',t:'c',c:'success',l:'캐시됨',o:0},{f:'c',t:'s',c:'success',l:'캐시에서 읽음',o:1},{f:'s',t:'r',c:'info',o:2}],
     loop:true, stagger:0.9,
     snip:{hd:'작업 단위 끝, 캐시가 따뜻할 때',path:'Claude Code 프롬프트',lines:['/compact 테스트 실패 원인과 남은 할 일만 남겨줘'],hl:[1],note:'/rewind와 /recap은 캐시를 <b>그대로 둡니다</b>.'}},
    {kicker:'STEP 2', title:'TTL이 지난 뒤: 전체를 다시 처리',
     body:'캐시 유지 시간(TTL)이 지나 캐시가 만료되면 <b>전체 기록을 비캐시 입력으로</b> 다시 처리합니다. 오래된 세션을 재개한 직후의 /compact가 <b>가장 비쌉니다</b>.',
     facts:['전체 기록을 비캐시 입력으로 다시 처리','재개 직후의 /compact가 가장 비쌈','Bedrock 기본 TTL은 5분'],
     zones:Z, nodes:[H,Cc,S,R], hot:['h','s','r'],
     edges:[{f:'h',t:'c',c:'muted',dash:true},{f:'h',t:'s',c:'danger',l:'비캐시 입력, 전체',o:0},{f:'s',t:'r',c:'info',o:1}],
     loop:true, stagger:0.9,
     snip:{hd:'1시간 자리 비운 뒤',path:'Bedrock 기본 TTL 5분',lines:['/compact','','# 접두부가 캐시에 없음','# 전체 기록을 비캐시 입력으로 다시 처리'],hl:[1],note:'그래서 <b>자리 비우기 전에</b> /compact 또는 /clear입니다.'}},
    {kicker:'STEP 3', title:'떠나기 전에 정리합니다',
     body:'추천은 <b>Compact before you step away</b>입니다. 이어서 할 일이면 /compact, 관련 없는 일이면 /clear, 이미 캐시된 지점으로는 /rewind로 돌아갑니다.',
     facts:['자리 비우기 전에 /compact 또는 /clear','/usage는 expected rebuild로 따로 집계','/rewind: 이미 캐시된 지점으로 복귀'],
     zones:Z, nodes:[H,C,S,R],
     edges:[{f:'h',t:'c',c:'success',o:0},{f:'c',t:'s',c:'success',o:1},{f:'s',t:'r',c:'info',o:2}],
     snip:{hd:'추천',path:'Compact before you step away',lines:['/compact   # 이어서 할 일이면','/clear     # 관련 없는 일이면','/rewind    # 이미 캐시된 지점으로 복귀','/usage     # expected rebuild 따로 집계'],hl:[1,2],note:'회의나 점심 전에 습관처럼 한 줄.'}}
  ], {legend:[['success','캐시 적중'],['danger','비캐시 재처리'],['muted','만료된 캐시'],['accent','요약 요청']]});
});
:::

:::notes
{timing: 0.5min}
[요약]
• 캐시가 따뜻하면 요약 요청이 접두부를 캐시에서 읽어 비용은 컨텍스트 크기의 일부
• TTL이 지나면 전체 기록을 비캐시 입력으로 다시 처리, 재개 직후 /compact가 가장 비쌈
• Bedrock 기본 TTL 5분, 그래서 자리 비우기 전에 /compact 또는 /clear
• /usage는 expected rebuild로 따로 집계, /rewind와 /recap은 캐시를 그대로 둠

{cue: demo}
앞에서 /compact도 대화 전체를 읽는 요청이라고 말씀드렸죠. 그림으로 확인해 보죠.
첫 번째, 캐시가 따뜻할 때는 요약 요청이 앞부분을 캐시에서 읽어요. 비용은 컨텍스트 크기의 일부입니다.↓
두 번째, TTL이 지나면 캐시가 없으니까 전체 기록을 비캐시 입력으로 다시 처리해요. 그래서 오래된 세션을 재개하자마자 /compact를 치는 게 가장 비쌉니다. Bedrock 기본 TTL은 5분이고요.↓
세 번째, 그래서 떠나기 전에 정리하시길 권해드려요. 이어서 할 일이면 /compact, 관련 없는 일이면 /clear입니다.
:::
---
<!-- Slide 20: Cache TTL by connection -->
@type: content
@fit: off

## 같은 기능, 접속 방식별 차이
Bedrock에서 캐시 수명과 idle compaction

:::html
<div class="c6-ttl fsi">
  <div class="fsi-stack" data-pick="c6-ttl">
    <button class="pick" data-key="sub"><span class="k">구독</span><span class="t">Claude 구독 (플랜 사용량 안)</span></button>
    <button class="pick" data-key="br"><span class="k">기본</span><span class="t">API 키, Amazon Bedrock</span></button>
    <button class="pick" data-key="br1h"><span class="k">옵션</span><span class="t">Bedrock + 1시간 캐시 옵션</span></button>
    <button class="pick" data-key="gw"><span class="k">게이트웨이</span><span class="t">Claude Apps Gateway 경유</span></button>
  </div>
  <div class="sim">
    <div class="kv"><span class="lb">메인 대화 기본 <span class="rp-detail" tabindex="0" data-tip="Time To Live. 캐시가 유지되는 시간">TTL</span></span><span class="vl" id="c6-ttl-v">접속 방식을 고르세요</span></div>
    <div class="kv"><span class="lb">Idle compaction</span><span class="vl" id="c6-ttl-i"></span></div>
    <div class="kv"><span class="lb">자리 비운 시간</span><span class="vl"><span id="c6-ttl-m">30</span>분 (예시)</span></div>
    <input type="range" min="0" max="120" step="5" value="30" id="c6-ttl-in" aria-label="자리 비운 시간(분)">
    <div class="state" id="c6-ttl-s">왼쪽에서 접속 방식을 고르면 돌아왔을 때 캐시 상태를 보여 줍니다.</div>
    <p class="cap">1시간 옵션은 더 비쌉니다. 자리 비운 시간은 설명용 예시입니다.</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var D = {
    sub: { ttl: 60, v: '1시간', i: '동작' },
    br: { ttl: 5, v: '5분', i: '기본으로는 해당 없음' },
    br1h: { ttl: 60, v: '1시간 (ENABLE_PROMPT_CACHING_1H=1 또는 promptCacheTtl "1h", 모델별 지원 확인)', i: '조건 충족 시 동작: 대화형 세션, autoCompactEnabled, 20만 토큰 이상, 약 1시간 유휴' },
    gw: { ttl: 5, v: '5분, 정책으로 1시간 옵트인 (서빙하는 모든 업스트림 모델이 지원해야 함)', i: '1시간 옵트인 시 같은 조건' }
  };
  var cur = null, inp = document.getElementById('c6-ttl-in');
  function draw() {
    var m = +inp.value; document.getElementById('c6-ttl-m').textContent = m;
    var s = document.getElementById('c6-ttl-s'); s.className = 'state';
    if (!cur) {
      document.getElementById('c6-ttl-v').textContent = '접속 방식을 고르세요';
      document.getElementById('c6-ttl-i').textContent = '';
      s.textContent = '왼쪽에서 접속 방식을 고르면 돌아왔을 때 캐시 상태를 보여 줍니다.';
      return;
    }
    var d = D[cur];
    document.getElementById('c6-ttl-v').textContent = d.v;
    document.getElementById('c6-ttl-i').textContent = d.i;
    if (m <= d.ttl) { s.classList.add('warm'); s.textContent = '캐시가 따뜻합니다. 돌아온 첫 요청도 캐시에서 읽습니다.'; }
    else { s.classList.add('cold'); s.textContent = (cur === 'sub' || cur === 'br1h') ? '캐시가 만료됐습니다. idle compaction 조건이 맞았다면 만료 직전 요약본만, 아니면 전체 컨텍스트를 다시 처리합니다.' : '캐시가 만료됐습니다. 첫 요청은 전체 컨텍스트를 다시 처리합니다.'; }
  }
  inp.addEventListener('input', draw);
  inp.addEventListener('change', function () { inp.blur(); });
  F.pick('c6-ttl', { onShow: function (key) { cur = key; draw(); } });
});
:::

:::notes
{timing: 1min}
[요약]
• Claude 구독(플랜 사용량 안): 메인 대화 기본 TTL 1시간, idle compaction 동작
• API 키와 Amazon Bedrock: 5분, idle compaction 기본으로는 해당 없음
• Bedrock + ENABLE_PROMPT_CACHING_1H=1(또는 promptCacheTtl "1h"): 1시간(모델별 지원 확인), idle compaction은 조건 충족 시 동작(대화형 세션, autoCompactEnabled, 20만 토큰 이상, 약 1시간 유휴)
• Claude Apps Gateway 경유: 5분, 정책으로 1시간 옵트인(서빙하는 모든 업스트림 모델이 지원해야 함), 옵트인 시 같은 조건

같은 기능이라도 어떻게 접속하느냐에 따라 동작이 달라요. 많이 오해하시는 부분이라 시뮬레이터로 준비했습니다.
{cue: demo}
위에서부터 하나씩 보겠습니다.↓ 구독은 1시간입니다.↓ Bedrock 기본은 5분이라, 자리 비운 시간을 30분으로 두면 돌아온 첫 요청은 캐시 미스예요. 자리 비운 시간이 5분 아래면 캐시가 따뜻한 그대로고요.↓
ENABLE_PROMPT_CACHING_1H를 켜거나 promptCacheTtl을 1h로 주면 1시간까지 버텨요. 다만 모델별 지원을 확인하셔야 하고 비용도 더 듭니다. 이때 idle compaction은 대화형 세션, autoCompactEnabled, 20만 토큰 이상, 약 1시간 유휴라는 조건이 맞으면 동작하고요.↓
Claude Apps Gateway를 경유하면 기본 5분이에요. 정책으로 1시간을 옵트인할 수 있는데, 서빙하는 모든 업스트림 모델이 지원해야 합니다. 5분 캐시라면 떠나기 전에 /compact를 하세요.

[출처]
• 원본 Ch6 강의자료 p14, p20
:::
---
<!-- Slide 21: Org defaults for compaction -->
@type: content
@fit: off

## 압축 설계를 조직 기본값으로
managed settings로 창 크기, 캐시 수명, 압축 후 규칙을 고정

:::html
<div id="c6-sv-org"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var MS = {id:'ms',x:50,y:190,w:300,h:100,t:'managed-settings.json',s:'조직이 배포하는 기본값',c:'danger'};
  var A = {id:'a',x:480,y:50,w:640,h:76,t:'autoCompactWindow: 400000',s:'100K에서 1M, 일찍 압축하면 요청당 입력이 작아짐',c:'info'};
  var B = {id:'b',x:480,y:146,w:640,h:76,t:'promptCacheTtl: "1h"',s:'자리 비움이 잦은 팀에만',c:'info'};
  var C = {id:'c',x:480,y:242,w:640,h:76,t:'SessionStart (matcher: compact)',s:'압축 뒤 DLP 규칙 재주입',c:'warning'};
  var D = {id:'d',x:480,y:338,w:640,h:76,t:'PreCompact 훅',s:'exit 2로 압축 차단, 감사용 보관',c:'warning'};
  var Z = [{x:20,y:20,w:1140,h:440,l:'조직 기본값'}];
  var N = [MS, A, B, C, D];
  function e(t, c, o) { return {f:'ms',t:t,c:c,side:'h',o:o}; }
  F.stepviz('#c6-sv-org', [
    {kicker:'OVERVIEW', title:'네 가지를 한 파일로 고정합니다',
     body:'창 크기, 캐시 수명, 압축 뒤 규칙 재주입, 압축 전 감사를 <b>managed settings 한 파일</b>로 배포합니다.',
     facts:['autoCompactWindow','promptCacheTtl','SessionStart compact, PreCompact'],
     zones:Z, nodes:N, edges:[e('a','info',0),e('b','info',1),e('c','warning',2),e('d','warning',3)], stagger:0.3,
     snip:{hd:'managed-settings.json',path:'전체 구조',lines:['{','  "autoCompactWindow": 400000,','  "promptCacheTtl": "1h",','  "hooks": {','    "SessionStart": [ ... ],','    "PreCompact": [ ... ]','  }','}'],hl:[2,3,5,6],note:'배포 경로는 Ch2의 managed settings와 같습니다.'}},
    {kicker:'STEP 1', title:'창 크기: 일찍 압축해 입력을 작게',
     body:'<b>autoCompactWindow</b>는 100K에서 1M 사이입니다. 일찍 압축하면 요청당 입력이 작아집니다.',
     facts:['범위 100K에서 1M','일찍 압축하면 요청당 입력이 작아짐','Haiku 5.5는 100K 넘는 프롬프트 단가가 더 높음'],
     zones:Z, nodes:N, hot:['ms','a'], edges:[e('a','info',0)],
     snip:{hd:'창 크기',path:'managed-settings.json',lines:['{','  "autoCompactWindow": 400000','}'],hl:[2],note:'원리 7의 장단점을 함께 보고 정합니다.'}},
    {kicker:'STEP 2', title:'캐시 수명: 1h는 필요한 팀에만',
     body:'<b>promptCacheTtl "1h"</b>는 자리 비움이 잦은 팀에만 씁니다. idle compaction은 <b>1시간 TTL에서만</b> 동작하므로, 5분이면 떠나기 전 /compact입니다.',
     facts:['1시간 옵션은 더 비쌈','자리 비움이 잦은 팀에만','idle compaction은 1시간 TTL에서만'],
     zones:Z, nodes:N, hot:['ms','b'], edges:[e('b','info',0)],
     snip:{hd:'캐시 수명',path:'managed-settings.json',lines:['{','  "promptCacheTtl": "1h"','}'],hl:[2],note:'모델별 지원은 앞 장의 표에서 확인합니다.'}},
    {kicker:'STEP 3', title:'압축 뒤에는 규칙을 다시 넣습니다',
     body:'압축하면 일부 규칙이 요약되어 사라질 수 있습니다. <b>SessionStart 훅의 matcher compact</b>로 DLP 규칙을 다시 주입합니다.',
     facts:['matcher: compact','압축 직후 다시 실행','DLP(민감 정보 유출 방지) 규칙 재주입'],
     zones:Z, nodes:N, hot:['ms','c'], edges:[e('c','warning',0)],
     snip:{hd:'압축 뒤 재주입',path:'managed-settings.json, hooks',lines:['"SessionStart": [','  { "matcher": "compact",','    "hooks": [{ "type": "command",','      "command": "cat /etc/claude-code/dlp-reminder.md" }] }',']'],hl:[2,4],note:'압축 후에 무엇이 남는지는 앞의 표와 연결됩니다.'}},
    {kicker:'STEP 4', title:'압축 전에 감사 기록을 남깁니다',
     body:'<b>PreCompact</b> 훅은 압축 직전에 실행됩니다. <b>exit 2</b>로 압축을 막을 수 있고, 감사용으로 대화를 보관합니다.',
     facts:['압축 직전 실행','exit 2로 압축 차단','감사용 보관'],
     zones:Z, nodes:N, hot:['ms','d'], edges:[e('d','warning',0)],
     snip:{hd:'압축 전 감사',path:'managed-settings.json, hooks',lines:['"PreCompact": [','  { "hooks": [{ "type": "command",','      "command": "/opt/audit/save-transcript.sh" }] }',']'],hl:[3],note:'요약되기 전의 원문을 회사 정책에 따라 보관합니다.'}}
  ], {legend:[['danger','관리자가 강제'],['info','비용 설정'],['warning','훅']]});
});
:::

:::notes
{timing: 0.5min}
[요약]
• managed-settings.json 한 파일로 autoCompactWindow, promptCacheTtl, SessionStart compact, PreCompact를 고정
• autoCompactWindow 100K에서 1M, 일찍 압축하면 요청당 입력이 작아짐, Haiku 5.5는 100K 넘는 프롬프트 단가가 더 높음
• promptCacheTtl 1h는 자리 비움이 잦은 팀에만, idle compaction은 1시간 TTL에서만, 5분이면 떠나기 전 /compact
• SessionStart matcher compact로 DLP 규칙 재주입, PreCompact는 exit 2로 압축 차단, 감사용 보관

{cue: demo}
지금까지 본 원리를 조직 기본값으로 묶어 볼게요. 한 파일, managed settings입니다.↓
첫 번째는 창 크기예요. 일찍 압축하면 요청당 입력이 작아집니다. 참고로 Haiku 5.5는 100K를 넘는 프롬프트의 단가가 더 높고요.↓
두 번째, 캐시 수명 1시간은 자리 비움이 잦은 팀에만 씁니다.↓
세 번째, 압축 뒤에는 SessionStart 훅의 compact matcher로 DLP 규칙을 다시 넣어요. Ch2에서 만든 규칙이 압축 때문에 빠지지 않게 하는 장치입니다.↓
네 번째는 PreCompact 훅이에요. 압축 직전에 실행돼서 exit 2로 압축을 막거나, 감사용으로 원문을 남깁니다.

[약어]
• DLP: Data Loss Prevention
:::
---
<!-- Slide 22: Lab TASK 04 -->
@type: content
@fit: off

## 압축을 내가 정한 때에
LAB, Chapter 5 TASK 04

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>/context, /usage로 압축 전 기록</span></li>
    <li><b>2</b><span>/compact 테스트 실패 원인과 남은 할 일만 남겨줘</span></li>
    <li><b>3</b><span>CLAUDE.md에 # Compact instructions 추가</span></li>
    <li><b>4</b><span>SessionStart compact 훅으로 사내 규정 재주입 확인</span></li>
    <li><b>5</b><span>/autocompact 400k로 창 조정, 저장 위치 확인, auto로 복귀</span></li>
    <li><b>6</b><span>/config에서 Idle compaction 항목과 Bedrock TTL 확인</span></li>
  </ol>
  <p class="where">Ch5 랩: TASK 01 기준선, 02 출력 필터 훅, 03 CLAUDE.md와 모델, 04 압축. Hands-on Lab 포털에서 Chapter 5를 엽니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB, Chapter 5 TASK 04
• Ch5 랩 전체는 TASK 01 기준선, 02 출력 필터 훅, 03 CLAUDE.md와 모델, 04 압축
• 압축 전 기록, 지시와 함께 /compact, Compact instructions, SessionStart compact 훅, /autocompact 400k 조정과 복귀, /config 확인

{cue: demo}
Ch5 랩은 네 개 TASK예요. TASK 01 기준선, 02 출력 필터 훅, 03 CLAUDE.md와 모델, 그리고 지금 보는 TASK 04 압축입니다. Hands-on Lab 포털에서 Chapter 5를 열어 주세요.
압축 전 기록을 남기고, 지시와 함께 /compact를 해 보세요. CLAUDE.md에 압축 지침을 넣고, SessionStart compact 훅으로 사내 규정이 다시 들어오는지 확인합니다. 마지막으로 /autocompact를 400k로 바꿨다가 auto로 되돌리고, /config에서 Bedrock TTL을 확인하세요.
:::
---
<!-- Slide 23: Principle 8 -->
@type: content
@fit: off

## 원리 8, 작업에 맞는 모델과 사고량
사고 토큰은 출력 단가로 청구됩니다

:::html
<div class="c6">
  <div class="c6-cards">
    <div class="c6-card"><span class="k">MODEL</span><span class="t">/model</span><span class="d">대부분의 코딩은 Sonnet</span><span class="d">복잡한 설계만 Opus</span></div>
    <div class="c6-card"><span class="k">EFFORT</span><span class="t">/effort</span><span class="d">단순 작업은 effort를 낮춤</span><span class="d">5.5 세대와 Fable은 thinking을 끌 수 없음</span></div>
    <div class="c6-card"><span class="k">SUBAGENT</span><span class="t">model: haiku</span><span class="d">단순 Subagent는 작은 모델</span><span class="d">고정 예산 모델은 MAX_THINKING_TOKENS</span></div>
  </div>
  <p class="c6-note">사고(thinking) 토큰은 <b>출력 단가</b>로 청구됩니다. 모델과 사고량을 작업 크기에 맞추는 것이 마지막 원리입니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 사고 토큰은 출력 단가로 청구
• /model: 대부분의 코딩은 Sonnet, 복잡한 설계만 Opus
• /effort: 단순 작업은 낮춤, 5.5 세대와 Fable은 thinking을 끌 수 없음
• Subagent는 model: haiku, 고정 예산 모델은 MAX_THINKING_TOKENS

마지막 여덟 번째 원리는 작업에 맞는 모델과 사고량이에요. 사고 토큰은 출력 단가로 청구되거든요.
대부분의 코딩은 Sonnet으로 충분하고, 복잡한 설계만 Opus를 씁니다. 단순한 작업은 /effort를 낮추세요. 다만 5.5 세대와 Fable은 thinking을 끌 수는 없어요.
그리고 단순한 Subagent에는 model: haiku처럼 작은 모델을 지정합니다. Ch3에서 본 내용과 이어지는 거죠.
:::
---
<!-- Slide 24: Three questions for community tools -->
@type: content
@fit: off

## 커뮤니티 도구 앞의 세 가지 질문
도입 전 5분 검토

:::html
<div class="c6">
  <div class="c6-cards">
    <div class="c6-card"><span class="k">QUESTION 1</span><span class="t">어느 원리를 쓰는가</span><span class="d">여덟 가지 원리 중 무엇이고, 어느 확장 지점(훅, 스킬, MCP, 프록시)에 붙는가</span></div>
    <div class="c6-card"><span class="k">QUESTION 2</span><span class="t">공식 기능으로 되는가</span><span class="d">CLAUDE.md, 스킬, 필터 훅, code intelligence로 같은 효과를 낼 수 있는가</span></div>
    <div class="c6-card warn"><span class="k">QUESTION 3</span><span class="t">데이터는 어디로 가는가</span><span class="d">로컬 처리인지, 제3자로 가는지. 도입한다면 사내 마켓플레이스에 고정 버전으로 (Ch2, Ch4)</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 어느 원리를 쓰고 어느 확장 지점(훅, 스킬, MCP, 프록시)에 붙는가
• 공식 기능(CLAUDE.md, 스킬, 필터 훅, code intelligence)으로 같은 효과가 나는가
• 데이터는 로컬인가 제3자인가, 도입한다면 사내 마켓플레이스에 고정 버전으로

커뮤니티 도구가 계속 나올 텐데요. 도입 전에 5분만 이 세 가지를 물어 보세요.
첫 번째, 여덟 가지 원리 중 어느 것을 쓰고 어디에 붙는가. 두 번째, 공식 기능으로 같은 효과를 낼 수 있는가. 대부분은 돼요.
세 번째가 금융권에서는 가장 중요해요. 데이터가 로컬에서 처리되는지, 제3자로 가는지입니다. 도입한다면 Ch2와 Ch4에서 본 것처럼 사내 마켓플레이스에 고정 버전으로 올리세요.
:::
---
<!-- Slide 25: Key Takeaways -->
@type: content
@fit: off

## 덜 쓰는 세 가지
Chapter 5 Key Takeaways, Chapter 6으로 이어짐

:::html
<div class="c6-recap">
  <div class="grid">
    <div class="rc"><b>01</b><span>먼저 본다: /context, /usage, 캐시 적중률<br>캐시를 지키고, 압축 시점과 effort는 내가 정한다</span></div>
    <div class="rc"><b>02</b><span>항상 실리는 지침은 짧게, 큰 출력은 들어오기 전에</span></div>
    <div class="rc"><b>03</b><span>커뮤니티 도구는 원리로 읽고 공식 기능으로 대체 가능한지 본다</span></div>
  </div>
  <p class="next">Chapter 6은 조직이 보고 막는 법입니다. 그 전 Capstone 시간에도 /usage를 한 번씩 확인해 보세요.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 먼저 본다: /context, /usage, 캐시 적중률, 캐시를 지키고 압축 시점과 effort는 내가 정한다
• 항상 실리는 지침은 짧게, 큰 출력은 들어오기 전에
• 커뮤니티 도구는 원리로 읽고 공식 기능으로 대체 가능한지
• 다음 주제는 Chapter 6, 조직이 보고 막는 법

Chapter 5를 세 줄로 정리할게요. 먼저 보고, 캐시를 지키면서 압축 시점과 effort는 내가 정합니다. 항상 실리는 지침은 짧게 하고, 큰 출력은 들어오기 전에 막아요. 커뮤니티 도구는 원리로 읽고, 공식 기능으로 대체할 수 있는지 봅니다.
Chapter 6에서 조직의 비용 통제로 이어집니다. 그 사이 Capstone을 하시면서 /usage를 한 번씩 확인해 보세요. Chapter 6 대시보드에서 여러분의 숫자를 다시 만나게 될 거예요.
:::
---
<!-- Slide 26: Deep dive FAQ -->
@type: content
@fit: off

## 자주 받는 질문
더 알아보기, MCP 비용, 세션 위생, 모델 배분

:::html
<div class="c6-pickset c6-dd fsi">
  <div class="fsi-stack" data-pick="c6-dd1">
    <button class="pick" data-key="mcp"><span class="k">1</span><span class="t">MCP 도구 정의 비용</span></button>
    <button class="pick" data-key="hyg"><span class="k">2</span><span class="t">세션 위생</span></button>
    <button class="pick" data-key="alloc"><span class="k">3</span><span class="t">모델 배분 예시</span></button>
  </div>
  <div class="panel" data-pick-panel="c6-dd1">
    <div data-for="mcp"><h4>연결만 해도 컨텍스트를 씁니다</h4>
      <div class="c6-tbl">
        <div class="tr h"><span>상황</span><span>영향</span><span>대응</span></div>
        <div class="tr"><span>MCP 서버 다수 연결</span><span>도구 스키마가 매 요청에 실림</span><span>/mcp에서 쓰지 않는 서버 끄기</span></div>
        <div class="tr"><span>도구가 많은 서버</span><span>정의만으로 수천 토큰</span><span>도구 지연 로드 (필요 시 검색)</span></div>
        <div class="tr"><span>같은 기능 중복</span><span>선택 혼란, 재시도 증가</span><span>서버 하나로 정리</span></div>
        <div class="tr"><span>프로젝트별 차이</span><span>쓰지 않는 서버가 계속 연결됨</span><span>.mcp.json을 프로젝트 단위로</span></div>
      </div></div>
    <div data-for="hyg"><h4>같은 일을 더 적은 토큰으로</h4>
      <div class="kv"><span class="lb">/clear</span><span class="vl">작업이 바뀌면 새 컨텍스트. 이전 대화는 비용만 남깁니다.</span></div>
      <div class="kv"><span class="lb">/compact 지시</span><span class="vl">남길 것을 지정해 요약. 예: 결정 사항과 남은 할 일만</span></div>
      <div class="kv"><span class="lb">자리 비운 뒤</span><span class="vl">5분 넘으면 캐시 미스. 긴 휴식 후엔 /clear 고려</span></div></div>
    <div data-for="alloc"><h4>역할별로 모델을 고정</h4>
      <pre class="c6-code"><span class="ln c"># .claude/agents/log-summarizer.md</span><span class="ln">---</span><span class="ln k">name: log-summarizer</span><span class="ln">description: 긴 테스트, 빌드 로그를 실패 원인 중심으로 5줄 요약한다. 로그 분석 요청 시 사용.</span><span class="ln">tools: Read, Grep</span><span class="ln k">model: haiku</span><span class="ln">---</span><span class="ln">실패한 테스트 이름, 첫 오류 메시지, 의심 파일만 보고한다.</span></pre>
      <p>장황한 로그는 작은 모델이 읽고, 메인에는 5줄만 돌아옵니다. 메인 모델은 판단에 집중합니다. Bedrock 계정에 Haiku가 활성화되어 있는지 확인하세요.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c6-dd1', { start: 0 }); });
:::

:::notes
{timing: 0.5min}
[요약]
• MCP: 서버 다수 연결 시 스키마가 매 요청에, 도구 많으면 정의만 수천 토큰, 중복 정리, .mcp.json 프로젝트 단위
• 세션 위생: 작업이 바뀌면 /clear, /compact는 남길 것 지정, 5분 넘게 비우면 캐시 미스
• 모델 배분: log-summarizer Subagent에 model: haiku, 메인에는 5줄만, Bedrock에 Haiku 활성화 확인

자주 받는 질문들이에요. 시간이 남거나 질문이 나오면 펼쳐 볼게요.
{cue: demo}
첫 번째는 MCP 도구 정의 비용입니다. 서버를 많이 연결하면 스키마가 매 요청에 실려요. 도구가 많은 서버는 정의만으로 수천 토큰이 되고요. 프로젝트마다 .mcp.json을 따로 두면 쓰지 않는 서버가 계속 붙어 있지 않습니다.↓
두 번째는 세션 위생이에요. /clear, 지시가 있는 /compact, 그리고 자리 비운 뒤의 캐시를 챙기는 거죠.↓
세 번째는 모델 배분 예시입니다. 로그 요약 Subagent에 haiku를 지정했어요. 장황한 로그는 작은 모델이 읽고, 메인에는 5줄만 돌아옵니다.
:::
---
<!-- Slide 27: Thank you -->
@type: thankyou
@toc: toc.html
@next: 06-ch6-org-cost.html
@next-label: Chapter 6
@message: 다음은 Capstone Round 2이고, 이어서 Chapter 6. 조직의 비용 보고 통제하기입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 받습니다.

:::notes
{timing: 0.5min}
[요약]
• 다음은 Capstone Round 2, 이어서 Chapter 6
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 이어서 Capstone Round 2를 하고요. 그다음 Chapter 6, 조직의 비용 보고 통제하기로 다시 모입니다.
Capstone 하시면서 /usage를 한 번씩 확인해 보세요. Chapter 6 대시보드에서 여러분의 숫자를 다시 만나게 될 거예요.
:::
