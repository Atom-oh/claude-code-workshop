---
remarp: true
block: ch6-tokens-cost
---
<!-- Slide 1: Cover (PDF p1) -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 6. 토큰과 비용
## 덜 쓰고, 보고, 막기 (Claude Code v2.1.319, 2026-11-08 리허설 검증)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=[].some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch6.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 6 토큰과 비용, 부제는 덜 쓰고, 보고, 막기
• Claude Code v2.1.319(2026-11-08 리허설 검증)와 Amazon Bedrock 기준, 공식 문서 반영
• Day 2에 두 번에 나눠 진행 (12:40 Part 1, 16:50 Part 2)

마지막 챕터, 토큰과 비용입니다. 부제가 이 챕터의 전부입니다. 덜 쓰고, 보고, 막기.
이 챕터는 오늘 두 번에 나눠 진행합니다. 점심 직후 12시 40분에 개인이 덜 쓰는 법을, 오후 4시 50분에 조직이 보고 막는 법을 다룹니다.
이번에도 단계별 그림과 클릭해서 여는 패널로 준비했습니다.
:::

---
<!-- Slide 2: Agenda (PDF p2) -->
@type: content
@fit: off

## 두 번의 세션, 60분과 50분
컨텍스트 엔지니어링, 계측, 조직 통제의 순서

:::html
<div class="c6 c6-agenda fsi">
  <div class="fsi-grid-2">
    <div class="pick"><span class="k">PART 01 / 60분</span><span class="t">컨텍스트 엔지니어링</span><span class="d">여덟 가지 원리, 랩 TASK 01부터 04까지</span><span class="when">12:40 시작</span></div>
    <div class="pick"><span class="k">PART 02 / 50분</span><span class="t">조직의 비용 통제</span><span class="d"><span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span>, 게이트웨이 지출 한도, 랩 TASK 05부터 07까지</span><span class="when">16:50 시작</span></div>
  </div>
  <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">Part별로 자주 묻는 세부 내용, Part 2 랩 뒤에 모아 둡니다</span></div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1 컨텍스트 엔지니어링, 12:40부터 60분, 랩 TASK 01에서 04
• Part 2 조직의 비용 통제, 16:50부터 50분, 랩 TASK 05에서 07
• 시간 배분: Part 1은 강의와 데모 약 21분 + 랩 38분, Part 2는 강의와 데모 약 21.5분 + 랩 28분
• 더 알아보기는 Part 2 랩 뒤에 Part별로 모아 둠, 시간이 남을 때만

순서를 먼저 보겠습니다. Part 1은 컨텍스트 엔지니어링입니다. 같은 일을 더 적은 토큰으로 하는 여덟 가지 원리와 랩 TASK 01부터 04까지, 60분입니다.
Part 2는 오후 4시 50분, 조직의 비용 통제입니다. OTel 계측과 게이트웨이 지출 한도, 랩 TASK 05부터 07까지 50분입니다.
두 세션 모두 강의는 20분 남짓으로 짧게 하고 나머지는 랩입니다. Part 1 랩은 TASK 01부터 04까지 38분, Part 2 랩은 TASK 05가 6분, TASK 06과 07이 22분입니다. 더 알아보기는 Part 2 랩 뒤에 Part별로 모아 두었습니다.
:::

---
<!-- Slide 3: Part 01 divider (PDF p3, p4) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section c6-sec">
  <span class="num">CHAPTER 06 / PART 01 / 12:40</span>
  <div class="name">컨텍스트 엔지니어링</div>
  <p class="what">같은 일을 더 적은 토큰으로</p>
  <ol>
    <li><b>01</b>먼저 본다</li>
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
• Part 1은 같은 일을 더 적은 토큰으로
• 보기, 지침 줄이기, 구조 정보와 필터와 지연 로드, 캐시와 압축, 모델과 사고량 순서

Part 1, 컨텍스트 엔지니어링입니다. 목표는 같은 일을 더 적은 토큰으로 하는 것입니다.
먼저 무엇이 자리를 차지하는지 보고, 항상 실리는 지침을 줄이고, 구조 정보와 출력 필터와 도구 지연 로드를 본 뒤, 캐시와 압축, 마지막으로 모델과 사고량을 정리합니다.
:::

---
<!-- Slide 4: Baseline (PDF p5) -->
@type: content
@fit: off

## 하루 13달러가 출발점이다
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
    <div class="fact"><b>우리 팀의 기준선은 직접 측정</b><span>파일럿에서 Part 2의 계측으로 잽니다</span></div>
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
비용 이야기의 출발점입니다. 공식 문서에 따르면 엔터프라이즈 배포에서 개발자 한 명이 활성일 하루에 쓰는 평균은 13달러, 월로는 150에서 250달러입니다. 그리고 90%는 하루 30달러를 넘지 않습니다.
다만 이건 남의 평균입니다. 우리 팀의 기준선은 파일럿에서 Part 2의 계측으로 직접 재셔야 합니다.

[출처]
• code.claude.com/docs/en/costs
:::

---
<!-- Slide 5: Principle 1 (PDF p6) -->
@type: content
@fit: off

## 원리 1, 먼저 본다
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
      <button class="pick" data-key="cache"><span class="k">/usage</span><span class="t">세션 비용과 캐시 적중률</span></button>
      <button class="pick" data-key="miss"><span class="k">miss</span><span class="t">캐시 미스에는 추정 원인이 표시됨</span></button>
      <button class="pick" data-key="cost"><span class="k">금액</span><span class="t">금액은 추정치, 정산은 AWS 청구서</span></button>
    </div>
    <div class="panel" data-pick-panel="c6-usage">
      <p class="hint">읽는 법을 누르면 설명이 나오고, /usage 항목은 왼쪽 출력에서 해당 줄이 강조됩니다.</p>
      <div data-for="context"><p>/context는 시스템 프롬프트, CLAUDE.md, 도구 정의, 대화가 각각 얼마나 차지하는지 보여 줍니다. 무엇을 줄일지 고르는 첫 화면입니다.</p></div>
      <div data-for="cache"><p>이 예시는 14번의 요청 중 입력 토큰의 91%를 캐시에서 읽었습니다. 캐시 적중률이 높을수록 같은 대화가 싸집니다.</p></div>
      <div data-for="miss"><p>캐시 미스가 나면 /usage가 추정 원인을 함께 보여 줍니다. 원리 6에서 무엇이 캐시를 깨는지 봅니다.</p></div>
      <div data-for="cost"><p>Total cost는 추정치입니다. 실제 정산은 AWS 청구서이고, Part 2에서 계약 단가로 맞추는 법을 봅니다.</p></div>
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
• /context는 항목별 컨텍스트 점유, /usage는 세션 비용과 캐시 적중률
• 캐시 미스에는 추정 원인이 표시되고, 금액은 추정치이며 정산은 AWS 청구서

{cue: demo}
첫 번째 원리는 먼저 보는 것입니다. 왼쪽은 /usage 예시 출력입니다. 오른쪽 읽는 법을 누르면 설명이 나오고, /usage 항목은 해당 줄이 강조됩니다.
/context는 항목별로 컨텍스트를 얼마나 차지하는지 보여 주고, /usage는 세션 비용과 캐시 적중률을 보여 줍니다. 이 예시는 입력 토큰의 91%가 캐시에서 왔습니다.
캐시 미스가 나면 추정 원인이 표시되고, 금액은 어디까지나 추정치입니다. 정산은 AWS 청구서로 합니다.

[출처]
• 원본 Ch6 강의자료 p6 /usage 출력 예시
:::

---
<!-- Slide 6: Eight principles (PDF p7) -->
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

이번 Part의 지도입니다. 여덟 가지 원리가 있고, 각 원리를 공식 기능으로 설명합니다. 커뮤니티 도구는 원리를 보여 주는 사례로만 씁니다.
{cue: demo}
아래 화살표로 하나씩 열겠습니다. 먼저 보기, 지침 짧게, 구조 정보, 큰 출력 막기, 도구 지연 로드, 캐시 지키기, 압축 시점 정하기, 모델과 사고량입니다.
커뮤니티 사례가 붙은 것은 Ponytail, Graphify, Headroom, REA 네 가지인데, 효과 수치는 제작자 자체 보고라는 점을 기억해 주세요.

[약어]
• TTL: Time To Live, 캐시가 유지되는 시간
:::

---
<!-- Slide 7: Principle 2 (PDF p8) -->
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
     snip:{hd:'CLAUDE.md에 두지 않을 것',path:'항상 실리는 파일',lines:['# 남길 것: 빌드 명령, 핵심 규칙','# 두지 않을 것','PR 리뷰 절차','DB 마이그레이션 절차'],hl:[3,4],note:'작업별 절차는 <b>스킬로 이동</b>합니다.'}},
    {kicker:'STEP 2', title:'스킬은 평소에 설명만 실립니다',
     body:'스킬은 평소에 <b>이름과 설명만</b> 컨텍스트에 있습니다. 절차가 아무리 길어도 쓰지 않는 동안에는 짧습니다.',
     facts:['평소: 설명만','본문은 아직 없음','설명을 짧고 구체적으로'],
     zones:Z, nodes:N(), hot:['md','sk','rq'],
     edges:[{f:'md',t:'rq',c:'accent',side:'h',o:0},{f:'sk',t:'rq',c:'info',side:'h',l:'설명만',o:1}], loop:true,
     snip:{hd:'스킬 (요청 시)',path:'평소 컨텍스트',lines:['# 항상: 이름과 설명','pr-review: PR 리뷰 절차','db-migration: 마이그레이션 절차','# 본문은 호출될 때'],hl:[2,3],note:'예시 스킬 이름입니다.'}},
    {kicker:'STEP 3', title:'호출될 때 본문이 들어옵니다',
     body:'그 작업이 필요해 스킬이 호출되면 그때 <b>본문이 로드</b>됩니다. 작업별 절차는 이렇게 필요할 때만 비용이 됩니다.',
     facts:['호출될 때 본문 로드','작업별 절차는 스킬로 이동','필요한 요청에만 비용'],
     zones:Z, nodes:N(), hot:['bd','rq'],
     edges:[{f:'bd',t:'rq',c:'info',side:'h',l:'필요할 때',o:0}], loop:true,
     snip:{hd:'스킬 호출',path:'예시 흐름',lines:['> 이 PR 리뷰해 줘','','# pr-review 스킬 본문 로드','# 리뷰 절차대로 진행'],hl:[1,3],note:'CLAUDE.md에 두면 모든 요청이 이 절차를 싣고 다닙니다.'}},
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
두 번째 원리, 항상 실리는 지침은 짧게입니다. 단계별로 보겠습니다.
첫째, CLAUDE.md는 매 요청에 실립니다. 그래서 PR 리뷰나 DB 마이그레이션 같은 절차는 여기에 두지 않습니다.
둘째, 스킬은 평소에 설명만 실리고, 셋째, 호출될 때 비로소 본문이 들어옵니다. 작업별 절차를 스킬로 옮기면 필요한 요청에서만 비용이 됩니다.
넷째, 꼭 필요한 짧은 규칙은 SessionStart 훅으로 주입할 수 있습니다. 커뮤니티의 Ponytail이 이 방식인데, 효과 수치는 제작자 자체 보고라는 점은 감안해 주세요.

[약어]
• YAGNI: You Aren't Gonna Need It, 지금 필요 없는 것은 만들지 말라는 원칙
:::

---
<!-- Slide 8: Principle 3 (PDF p9) -->
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

세 번째 원리는 탐색 대신 구조 정보입니다. Claude가 grep을 여러 번 돌리고 파일을 여러 개 읽는 대신, 구조 정보를 한 번에 얻게 하는 것입니다.
공식 기능은 두 가지입니다. code intelligence 플러그인은 언어 서버로 정의로 이동하고, 편집 후 타입 오류를 자동으로 알려 줘서 불필요한 파일 읽기를 줄입니다. 그리고 아키텍처와 디렉터리, 명명 규칙을 담은 코드베이스 개요 스킬입니다.
커뮤니티 사례인 Graphify는 코드를 지식 그래프로 만들어 주는데, 작은 저장소에서는 효과가 거의 없습니다.

[약어]
• AST: Abstract Syntax Tree
• MCP: Model Context Protocol
:::

---
<!-- Slide 9: Principle 4, output filter 훅 (PDF p10) -->
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
네 번째 원리, 큰 출력은 들어오기 전에입니다. 공식 문서 예제를 단계별로 보겠습니다.
첫째, 훅이 없으면 테스트 로그 전체가 컨텍스트에 들어옵니다. 수만 토큰입니다.
둘째, PreToolUse 훅이 실행 전에 명령을 받아 테스트 명령인지 확인합니다.
셋째, 출력은 임시 로그 파일에 저장하고 실패 줄 앞뒤만 남기되, 원래 종료 코드는 그대로 돌려줍니다. 그래서 실패한 테스트가 성공처럼 보이지 않습니다.
넷째, 결과적으로 실패 줄 몇 개, 수백 토큰만 들어옵니다.
다섯째, 줄이기 어려운 장황한 작업은 Subagent로 격리합니다. 커뮤니티의 Headroom은 프록시로 압축하는데, 모든 프롬프트가 그 프록시를 지나간다는 점을 금융권에서는 꼭 따져 보셔야 합니다.

{cue: transition}
바로 데모로 전후를 비교해 보겠습니다.

[출처]
• code.claude.com/docs, 출력 필터 훅 공식 예제 (원본 Ch6 강의자료 p10)
:::

---
<!-- Slide 10: Demo, output filter (PDF p11) -->
@type: content
@fit: off

## 훅 하나로 컨텍스트가 줄어든다
DEMO 7분, 출력 필터 훅 적용 전후 비교

:::html
<div class="fsi fsi-lab c6-lab">
  <div class="head"><span class="tag">DEMO / 7분</span></div>
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

데모입니다. 실패 테스트가 섞인 저장소에서 "npm test 돌려서 실패 원인 찾아줘"라고 요청하고, /context와 /usage를 기록하겠습니다.
그다음 filter-test-output.sh를 등록하고 /clear로 새로 시작해 같은 요청을 반복합니다. 두 번의 컨텍스트 크기와 비용을 나란히 비교해 보겠습니다.
참가자 여러분은 Lab 포털에 있는 같은 스크립트로 따라 해 보실 수 있습니다.
:::

---
<!-- Slide 11: Principle 5 (PDF p12) -->
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

다섯 번째 원리, 도구는 필요할 때만입니다. MCP 서버는 연결만 해도 공짜가 아닙니다.
다행히 기본값이 지연 로드입니다. 도구 이름과 서버 지침만 싣고, 실제로 쓸 때 스키마를 tool search로 불러옵니다. v2.1.304부터는 게이트웨이 뒤에서도 기본으로 켜져 있습니다.
그리고 /mcp로 안 쓰는 서버를 끄고, gh나 aws처럼 CLI로 되는 일은 CLI를 우선합니다. CLI는 도구 목록을 미리 싣지 않기 때문입니다.
REA라는 도구는 MCP 도구가 170여 개라서 왜 지연 로드가 기본값인지 잘 보여 줍니다.
:::

---
<!-- Slide 12: Quick check 1 (PDF p13) -->
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

퀴즈입니다. 한 시간 넘게 자리를 비웠다가 돌아와서 보내는 첫 메시지는 어떻게 될까요?
{cue: pause}
정답은 B입니다. 기본 캐시 수명은 5분이라, 돌아온 첫 메시지는 캐시 미스로 전체 컨텍스트를 다시 처리합니다. 세션이 길수록 이 한 번이 비쌉니다.
:::

---
<!-- Slide 13: Principle 6 (PDF p14) -->
@type: content
@fit: off

## 원리 6, 캐시를 깨지 않는다
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

여섯 번째 원리, 캐시를 깨지 않는다입니다. 많이 헷갈리시는 게 /clear와 /compact입니다.
/clear는 새 세션입니다. 비용 0에서 시작하고, 관련 없는 작업으로 넘어갈 때 씁니다. 나중에 돌아오고 싶으면 /rename해 두고 /resume으로 돌아오면 됩니다.
반면 /compact는 대화 전체를 읽어서 요약하는 것이라 그 자체가 큰 요청입니다. 이어서 작업해야 할 때만 쓰고, 무엇을 남길지 지시하세요.
아래 숫자도 기억해 주세요. 기본 캐시 수명은 5분이고, 1시간 옵션은 더 비쌉니다.
:::

---
<!-- Slide 14: Principle 7, compaction methods (PDF p15) -->
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

일곱 번째 원리, 압축은 내가 정한 때에입니다. 대화가 차면 Claude Code는 오래된 기록을 요약하는데, 그 방식이 다섯 가지입니다.
{cue: demo}
하나씩 열어 보겠습니다. 자동 압축은 auto-compact window에 닿을 때 일어나고, 1M 모델 기본값은 약 967K입니다. /compact는 내가 원할 때 지시와 함께 하고, /rewind로는 특정 메시지부터, 또는 특정 메시지까지 골라 부분 요약할 수 있습니다.
Idle compaction은 1시간 TTL 세션을 오래 비웠을 때 캐시 만료 직전에 일어납니다. Bedrock에서는 1시간 캐시를 켜야 조건이 맞는데, 잠시 뒤에 보겠습니다. /clear는 압축이 아니라 새 출발입니다.
:::

---
<!-- Slide 15: auto-compact window (PDF p16) -->
@type: content
@fit: off

## 다 차기 전에 미리 압축한다
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

자동 압축 시점은 바꿀 수 있습니다. 다 차기 전에 미리 압축하면 압축 전까지 요청마다 보내는 입력이 작아집니다.
왼쪽 명령을 보시면, /autocompact로 지금 값과 출처를 확인하고, /autocompact 400k로 400K에서 압축하게 하고, auto로 되돌립니다. 이번 세션만은 실행 플래그로, 조직 기본값은 managed settings로 정합니다.
{cue: demo}
아래 막대는 설명용 그림입니다. 슬라이더를 움직이면 압축이 시작되는 지점이 옮겨 갑니다.
오른쪽 우선순위는 환경 변수가 최우선이고, 그다음 실행 플래그, 그다음 settings인데 managed가 사용자의 /autocompact를 덮습니다.
:::

---
<!-- Slide 16: Trade-off (PDF p17) -->
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
그럼 창을 줄이면 항상 쌀까요? 아닙니다. Claude Code도 기본값 auto를 권합니다.
줄어드는 것은 압축 전까지의 요청당 입력과 캐시가 식은 뒤 다시 읽는 양입니다. 1M 모델로 긴 세션을 하면 효과가 큽니다.
대신 압축이 잦아집니다. 압축 한 번이 대화 전체를 읽는 요청이고, 직후에는 캐시를 다시 쌓아야 하며, 요약 과정에서 초반 제약이나 정확한 오류 메시지가 빠질 수 있습니다.
그래서 순서는 이렇습니다. 먼저 작업 단위 끝에 캐시가 따뜻할 때 직접 /compact, 그다음 긴 세션을 하는 팀만 창을 400K에서 500K로, 그리고 Part 2의 OTel token.usage로 전후를 비교합니다.
:::

---
<!-- Slide 17: What survives compaction (PDF p18) -->
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
압축하면 무엇이 남을까요? 버튼을 누르거나 아래 화살표로 압축을 실행해 보겠습니다.
시스템 프롬프트와 출력 스타일은 그대로입니다. 루트 CLAUDE.md와 auto memory, plan 모드의 계획은 디스크에서 다시 주입됩니다. 최근에 읽거나 고친 파일은 최대 5개를 다시 읽고, 사용한 스킬 본문도 한도 안에서 다시 들어옵니다.
주의할 것은 노란색입니다. paths 규칙과 하위 폴더 CLAUDE.md는 요약되어 사라졌다가 해당 파일을 다시 읽을 때 돌아옵니다.
그래서 압축 뒤에도 꼭 지켜야 하는 규칙은 SessionStart 훅의 compact matcher로 다시 넣습니다. 이건 조금 뒤 조직 설계에서 다시 나옵니다.

[출처]
• code.claude.com/docs, What survives compaction (원본 Ch6 강의자료 p18)
:::

---
<!-- Slide 18: Cost of compaction, warm vs cold (PDF p19) -->
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
/compact도 대화 전체를 읽는 요청이라는 점을 그림으로 보겠습니다.
첫째, 캐시가 따뜻할 때는 요약 요청이 앞부분을 캐시에서 읽습니다. 비용은 컨텍스트 크기의 일부입니다.
둘째, TTL이 지나면 캐시가 없으니 전체 기록을 비캐시 입력으로 다시 처리합니다. 오래된 세션을 재개하자마자 /compact를 치는 게 가장 비쌉니다. Bedrock 기본 TTL은 5분입니다.
셋째, 그래서 추천은 떠나기 전에 정리하는 것입니다. 이어서 할 일이면 /compact, 관련 없는 일이면 /clear입니다.
:::

---
<!-- Slide 19: Cache TTL by connection (PDF p20, p14) -->
@type: content
@fit: off

## 같은 기능도 접속 방식마다 다르다
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

같은 기능이라도 어떻게 접속하느냐에 따라 동작이 다릅니다. 많이 오해하시는 부분이라 시뮬레이터로 준비했습니다.
{cue: demo}
아래 화살표로 위에서부터 하나씩 열겠습니다. 구독은 1시간입니다. Bedrock 기본은 5분이라, 자리 비운 시간을 30분으로 두면 돌아온 첫 요청은 캐시 미스입니다. 슬라이더를 5분 아래로 내리면 따뜻하게 바뀝니다.
ENABLE_PROMPT_CACHING_1H를 켜거나 promptCacheTtl을 1h로 주면 1시간까지 버티지만, 모델별 지원을 확인하셔야 하고 비용이 더 듭니다. 이때 idle compaction은 대화형 세션, autoCompactEnabled, 20만 토큰 이상, 약 1시간 유휴라는 조건이 맞으면 동작합니다.
Claude Apps Gateway를 경유하면 기본 5분이고, 정책으로 1시간을 옵트인할 수 있는데 서빙하는 모든 업스트림 모델이 지원해야 합니다. 5분 캐시라면 떠나기 전 /compact가 답입니다.

[출처]
• 원본 Ch6 강의자료 p14, p20
:::

---
<!-- Slide 20: Org defaults for compaction (PDF p21) -->
@type: content
@fit: off

## 압축 설계를 조직 기본값으로
managed settings로 창 크기, 캐시 수명, 압축 후 규칙을 고정

:::html
<div id="c6-sv-org"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var MS = {id:'ms',x:50,y:190,w:300,h:100,t:'managed-settings.json',s:'조직이 배포, 사용자가 못 바꿈',c:'danger'};
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
지금까지의 원리를 조직 기본값으로 묶어 보겠습니다. 한 파일, managed settings입니다.
첫째, 창 크기. 일찍 압축하면 요청당 입력이 작아집니다. 참고로 Haiku 5.5는 100K를 넘는 프롬프트의 단가가 더 높습니다.
둘째, 캐시 수명 1시간은 자리 비움이 잦은 팀에만 씁니다.
셋째, 압축 뒤에는 SessionStart 훅의 compact matcher로 DLP 규칙을 다시 넣습니다. Ch3에서 만든 규칙이 압축 때문에 빠지지 않게 하는 장치입니다.
넷째, PreCompact 훅은 압축 직전에 실행되어 exit 2로 압축을 막거나 감사용으로 원문을 남깁니다.

[약어]
• DLP: Data Loss Prevention
:::

---
<!-- Slide 21: Lab TASK 04 (PDF p22) -->
@type: content
@fit: off

## 압축을 내가 정한 때에, 15분
LAB, Chapter 6 TASK 04

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
  <p class="where">Part 1 랩: TASK 01 기준선 5분, 02 출력 필터 훅 10분, 03 CLAUDE.md와 모델 8분, 04 압축 15분. Hands-on Lab 포털에서 Chapter 6을 엽니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB 15분, Chapter 6 TASK 04
• Part 1 랩 전체는 TASK 01 기준선 5분, 02 출력 필터 훅 10분, 03 CLAUDE.md와 모델 8분, 04 압축 15분, 합계 38분
• 압축 전 기록, 지시와 함께 /compact, Compact instructions, SessionStart compact 훅, /autocompact 400k 조정과 복귀, /config 확인

{cue: demo}
Part 1 랩은 이 세션 안에서 모두 38분입니다. TASK 01 기준선 5분, 02 출력 필터 훅 10분, 03 CLAUDE.md와 모델 8분, 그리고 지금 보는 TASK 04 압축이 15분입니다. Hands-on Lab 포털에서 Chapter 6을 열어 주세요.
압축 전 기록을 남기고, 지시와 함께 /compact를 해 보고, CLAUDE.md에 압축 지침을 넣고, SessionStart compact 훅으로 사내 규정이 다시 들어오는지 확인합니다. 마지막으로 /autocompact를 400k로 바꿨다가 auto로 되돌리고, /config에서 Bedrock TTL을 확인합니다.
:::

---
<!-- Slide 22: Principle 8 (PDF p23) -->
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

마지막 여덟 번째 원리, 작업에 맞는 모델과 사고량입니다. 사고 토큰은 출력 단가로 청구된다는 점이 핵심입니다.
대부분의 코딩은 Sonnet으로 충분하고, 복잡한 설계만 Opus를 씁니다. 단순한 작업은 /effort를 낮추세요. 다만 5.5 세대와 Fable은 thinking을 끌 수는 없습니다.
그리고 단순한 Subagent에는 model: haiku처럼 작은 모델을 지정합니다. Ch4에서 본 내용과 이어집니다.
:::

---
<!-- Slide 23: Three questions for community tools (PDF p24) -->
@type: content
@fit: off

## 커뮤니티 도구 앞의 세 가지 질문
도입 전 5분 검토

:::html
<div class="c6">
  <div class="c6-cards">
    <div class="c6-card"><span class="k">QUESTION 1</span><span class="t">어느 원리를 쓰는가</span><span class="d">여덟 가지 원리 중 무엇이고, 어느 확장 지점(훅, 스킬, MCP, 프록시)에 붙는가</span></div>
    <div class="c6-card"><span class="k">QUESTION 2</span><span class="t">공식 기능으로 되는가</span><span class="d">CLAUDE.md, 스킬, 필터 훅, code intelligence로 같은 효과를 낼 수 있는가</span></div>
    <div class="c6-card warn"><span class="k">QUESTION 3</span><span class="t">데이터는 어디로 가는가</span><span class="d">로컬 처리인지, 제3자로 가는지. 도입한다면 사내 마켓플레이스에 고정 버전으로 (Ch3, Ch5)</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 어느 원리를 쓰고 어느 확장 지점(훅, 스킬, MCP, 프록시)에 붙는가
• 공식 기능(CLAUDE.md, 스킬, 필터 훅, code intelligence)으로 같은 효과가 나는가
• 데이터는 로컬인가 제3자인가, 도입한다면 사내 마켓플레이스에 고정 버전으로

커뮤니티 도구가 계속 나올 텐데, 도입 전에 5분만 이 세 가지를 물어 보세요.
첫째, 여덟 가지 원리 중 어느 것을 쓰고 어디에 붙는가. 둘째, 공식 기능으로 같은 효과를 낼 수 있는가. 대부분은 됩니다.
셋째가 금융권에서 가장 중요합니다. 데이터가 로컬에서 처리되는지 제3자로 가는지입니다. 도입한다면 Ch3과 Ch5에서 본 것처럼 사내 마켓플레이스에 고정 버전으로 올립니다.
:::

---
<!-- Slide 24: Part 1 recap (PDF p49 items 01 to 03) -->
@type: content
@fit: off

## Part 1, 덜 쓰는 세 가지
Part 1 정리, 16:50 Part 2로 이어짐

:::html
<div class="c6-recap">
  <div class="grid">
    <div class="rc"><b>01</b><span>먼저 본다: /context, /usage, 캐시 적중률<br>캐시를 지키고, 압축 시점과 effort는 내가 정한다</span></div>
    <div class="rc"><b>02</b><span>항상 실리는 지침은 짧게, 큰 출력은 들어오기 전에</span></div>
    <div class="rc"><b>03</b><span>커뮤니티 도구는 원리로 읽고 공식 기능으로 대체 가능한지 본다</span></div>
  </div>
  <p class="next">Part 2는 16:50, 조직이 보고 막는 법입니다. 그 전 Capstone 시간에도 /usage를 한 번씩 확인해 보세요.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 먼저 본다: /context, /usage, 캐시 적중률, 캐시를 지키고 압축 시점과 effort는 내가 정한다
• 항상 실리는 지침은 짧게, 큰 출력은 들어오기 전에
• 커뮤니티 도구는 원리로 읽고 공식 기능으로 대체 가능한지
• Part 2는 16:50

Part 1을 세 줄로 정리합니다. 먼저 보고, 캐시를 지키면서 압축 시점과 effort는 내가 정하고, 항상 실리는 지침은 짧게 하고 큰 출력은 들어오기 전에 막고, 커뮤니티 도구는 원리로 읽어 공식 기능으로 대체할 수 있는지 봅니다.
Part 2는 오후 4시 50분에 이어집니다. 그 사이 Capstone을 하시면서 /usage를 한 번씩 확인해 보시면, 오후에 대시보드에서 여러분의 숫자를 다시 만나게 됩니다.
:::

---
<!-- Slide 25: Part 02 divider (PDF p25) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 06 / PART 02 / 16:50</span>
  <div class="name">조직의 비용 통제</div>
  <p class="what">쓴 만큼 보고, 넘치면 막는다</p>
  <ol>
    <li><b>01</b>Bedrock에서 비용을 보는 법</li>
    <li><b>02</b>OTel 대시보드</li>
    <li><b>03</b>modelPricing과 AWS 쪽 도구</li>
    <li><b>04</b>Claude Apps Gateway (참가자 실습)</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2는 조직의 비용 통제, 쓴 만큼 보고 넘치면 막는다
• Bedrock 비용 보기, OTel 대시보드, modelPricing과 AWS 도구, Claude Apps Gateway 실습

다시 모였습니다. Chapter 6 Part 2, 조직의 비용 통제입니다. 점심 직후 Part 1이 개인이 덜 쓰는 법이었다면, 지금은 조직이 쓴 만큼 보고 넘치면 막는 법입니다.
Bedrock에서 비용을 어떻게 보는지, OTel 대시보드, 계약 단가와 AWS 쪽 도구, 그리고 마지막으로 Claude Apps Gateway를 직접 실습합니다.
:::

---
<!-- Slide 26: Cost by setup (PDF p26) -->
@type: content
@fit: off

## Bedrock은 직접 설치한 계측이 전부다
셋업별 비용 관리 방법

:::html
<div class="c6-pickset fsi">
  <div class="fsi-stack" data-pick="c6-setup">
    <button class="pick" data-key="bedrock"><span class="k">이 워크숍</span><span class="t">Amazon Bedrock</span></button>
    <button class="pick" data-key="team"><span class="k">구독</span><span class="t">Claude Team, Enterprise</span></button>
    <button class="pick" data-key="console"><span class="k">API</span><span class="t">Claude Console</span></button>
  </div>
  <div class="panel" data-pick-panel="c6-setup">
    <div data-for="team"><h4>Claude Team, Enterprise</h4><div class="kv"><span class="lb">지출 보기</span><span class="vl">조직 Analytics</span></div><div class="kv"><span class="lb">지출 한도</span><span class="vl">관리 콘솔 지출 한도</span></div><div class="kv"><span class="lb">사용자별</span><span class="vl">CSV, Analytics API</span></div></div>
    <div data-for="console"><h4>Claude Console</h4><div class="kv"><span class="lb">지출 보기</span><span class="vl">Console Usage</span></div><div class="kv"><span class="lb">지출 한도</span><span class="vl">Workspace limit</span></div><div class="kv"><span class="lb">사용자별</span><span class="vl">Claude Code Analytics API</span></div></div>
    <div data-for="bedrock"><h4>Amazon Bedrock</h4><div class="kv"><span class="lb">지출 보기</span><span class="vl">AWS 청구 콘솔</span></div><div class="kv"><span class="lb">지출 한도</span><span class="vl">AWS 예산 도구</span></div><div class="kv"><span class="lb">사용자별</span><span class="vl">IAM principal, 태그(<span class="rp-detail" tabindex="0" data-tip="Cost and Usage Report 2.0. AWS 비용과 사용량 상세 보고서">CUR 2.0</span>), OTel, 게이트웨이</span></div><p>사용자별로 보려면 클라우드 콘솔만으로는 부족하고, 직접 설치한 계측이 필요합니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c6-setup', { start: 0 }); });
:::

:::notes
{timing: 1min}
[요약]
• Amazon Bedrock: AWS 청구 콘솔, AWS 예산 도구, 사용자별은 IAM principal과 태그(CUR 2.0), OTel, 게이트웨이
• Claude Team, Enterprise: 조직 Analytics, 관리 콘솔 지출 한도, CSV와 Analytics API
• Claude Console: Console Usage, Workspace limit, Claude Code Analytics API

셋업마다 비용을 보는 방법이 다릅니다. 이 워크숍은 첫 줄, Bedrock 셋업입니다.
Bedrock에서는 지출은 AWS 청구 콘솔로, 지출 한도는 AWS 예산 도구로 봅니다. 사용자별로는 IAM principal과 CUR 2.0 태그가 있지만, 사람 단위로 보려면 OTel과 게이트웨이처럼 직접 설치한 계측이 필요합니다.
{cue: demo}
아래 화살표로 비교해 보면, Claude Team이나 Enterprise는 조직 Analytics와 관리 콘솔 지출 한도가 있고, Console은 Workspace limit과 Analytics API가 있습니다. Bedrock에는 이런 화면이 없다는 게 다음 장의 메시지입니다.
:::

---
<!-- Slide 27: Bedrock reality (PDF p27) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">BEDROCK REALITY</span>
  <div class="big">Bedrock에는 <em>Analytics</em><br>대시보드가 없습니다</div>
  <p class="lead">계측을 설치해야 보이고, 설치하지 않은 사람은 잡히지 않습니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Bedrock에는 Analytics 대시보드가 없음
• 계측을 설치해야 보이고, 설치하지 않은 사람은 잡히지 않음

{cue: pause}
한 문장으로 정리하면 이겁니다. Bedrock에는 Analytics 대시보드가 없습니다.
계측을 설치해야 보이고, 설치하지 않은 사람은 잡히지 않습니다. 그래서 다음 장처럼 OTel을 정책으로, 모두에게 켭니다.
:::

---
<!-- Slide 28: OTel by policy (PDF p28, p38, p46) -->
@type: content
@fit: off

## OTel을 정책으로 켠다
managed settings env 한 블록이면 모두에게

:::html
<div id="c6-sv-otel"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var MS = {id:'ms',x:50,y:60,w:320,h:90,t:'managed settings',s:'env 한 블록',c:'danger'};
  var CC = {id:'cc',x:50,y:300,w:320,h:90,t:'Claude Code',s:'지표와 로그 생성',c:'accent'};
  var COL = {id:'col',x:460,y:300,w:320,h:90,t:'OTel 수집기',s:'OTLP 엔드포인트',c:'warning'};
  var DB = {id:'db',x:860,y:150,w:280,h:90,t:'대시보드',s:'팀별 집계',c:'info'};
  var CW = {id:'cw',x:860,y:340,w:280,h:90,t:'CloudWatch',s:'랩 환경 이중 전송',c:'info'};
  var Z = [{x:20,y:20,w:1140,h:440,l:'텔레메트리 경로'}];
  var N = [MS, CC, COL, DB, CW];
  var env = ['"env": {','  "CLAUDE_CODE_ENABLE_TELEMETRY": "1",','  "OTEL_METRICS_EXPORTER": "otlp",','  "OTEL_LOGS_EXPORTER": "otlp",','  "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",','  "OTEL_EXPORTER_OTLP_ENDPOINT":','    "https://otel.corp.example.internal",','  "OTEL_RESOURCE_ATTRIBUTES":','    "department=platform,team.id=core"','}'];
  F.stepviz('#c6-sv-otel', [
    {kicker:'STEP 1', title:'정책으로 켜면 모두가 계측됩니다',
     body:'OTel(OpenTelemetry)은 켜야 생깁니다. <b>managed settings의 env 한 블록</b>으로 배포하면 사용자가 끌 수 없고, 빠지는 사람이 없습니다.',
     facts:['CLAUDE_CODE_ENABLE_TELEMETRY: 1','managed settings로 배포','설치하지 않은 사람이 없게'],
     zones:Z, nodes:N, hot:['ms','cc'],
     edges:[{f:'ms',t:'cc',c:'danger',l:'env 배포',o:0}],
     snip:{hd:'managed-settings.json (env)',path:'OTel을 정책으로 켜기',lines:env,hl:[2],note:'엔드포인트는 예시 주소입니다.'}},
    {kicker:'STEP 2', title:'OTLP로 조직 수집기에 보냅니다',
     body:'지표와 로그를 <b>OTLP(OpenTelemetry 전송 규격), http/protobuf</b>로 조직이 정한 수집기 엔드포인트에 보냅니다.',
     facts:['OTEL_METRICS_EXPORTER: otlp','OTEL_LOGS_EXPORTER: otlp','목적지는 조직 수집기'],
     zones:Z, nodes:N, hot:['cc','col'],
     edges:[{f:'cc',t:'col',c:'warning',l:'OTLP, http/protobuf',o:0}], loop:true,
     snip:{hd:'managed-settings.json (env)',path:'내보내기 설정',lines:env,hl:[3,4,5,6,7],note:'목적지가 회사 안이라는 점이 Bedrock 경로의 장점입니다.'}},
    {kicker:'STEP 3', title:'대표 지표',
     body:'수집기에서 대시보드로 가는 대표 지표는 <b>token.usage, cost.usage, session.count</b>와 코드 산출물 지표입니다.',
     facts:['claude_code.token.usage','claude_code.cost.usage','claude_code.session.count','lines_of_code, commit, PR'],
     zones:Z, nodes:N, hot:['col','db'],
     edges:[{f:'cc',t:'col',c:'warning',o:0},{f:'col',t:'db',c:'info',l:'지표',o:1}], loop:true,
     snip:{hd:'대표 지표',path:'OTel metrics',lines:['claude_code.token.usage','claude_code.cost.usage','claude_code.session.count','claude_code.lines_of_code.count','claude_code.commit.count','claude_code.pull_request.count'],hl:[1,2,3],note:'cost.usage는 추정 비용입니다. 정산은 AWS입니다.'}},
    {kicker:'STEP 4', title:'resource 속성으로 팀별 집계',
     body:'<b>OTEL_RESOURCE_ATTRIBUTES</b>에 부서와 팀을 넣으면 대시보드에서 <b>팀별로 집계</b>할 수 있습니다.',
     facts:['department=platform','team.id=core','팀마다 다른 값으로 배포'],
     zones:Z, nodes:N, hot:['ms','db'],
     edges:[{f:'col',t:'db',c:'info',l:'팀별',o:0}],
     snip:{hd:'managed-settings.json (env)',path:'팀 속성',lines:env,hl:[8,9],note:'값은 예시입니다. 팀별 managed settings로 다르게 배포합니다.'}},
    {kicker:'LAB', title:'랩 환경은 두 곳으로 보냅니다',
     body:'이번 랩 환경은 <b>otelcol</b>이 받아 내보내기 전에 <b>scrub_logs</b>로 프롬프트 본문을 지우고, <b>CloudWatch와 중앙 대시보드</b>로 이중 전송합니다.',
     facts:['otelcol, fanout 타이머 active','scrub_logs: 내보내기 전 프롬프트 본문 삭제','exporters: CloudWatch + 중앙 대시보드'],
     zones:Z, nodes:[MS, CC, {id:'col',x:460,y:300,w:320,h:90,t:'otelcol',s:'scrub_logs로 본문 삭제',c:'warning'}, {id:'db',x:860,y:150,w:280,h:90,t:'중앙 대시보드',s:'이틀간 사용량',c:'info'}, CW], hot:['cc','col','db','cw'],
     edges:[{f:'cc',t:'col',c:'warning',o:0},{f:'col',t:'db',c:'info',o:1},{f:'col',t:'cw',c:'info',o:1}], loop:true,
     snip:{hd:'TASK 05에서 확인',path:'랩 환경',lines:['# settings.json의 OTEL_* 환경 변수','# otelcol, fanout 타이머 active','# scrub_logs: 프롬프트 본문 삭제 규칙','# exporters: CloudWatch + 중앙 대시보드'],hl:[],note:'프롬프트 본문을 <b>내보내기 전에 지우는</b> 규칙이 금융권 운영의 기본입니다.'}}
  ], {legend:[['danger','관리자가 강제'],['accent','Claude Code'],['warning','수집기'],['info','보는 곳']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• managed settings env 한 블록으로 OTel을 모두에게 켬 (CLAUDE_CODE_ENABLE_TELEMETRY 1)
• OTLP http/protobuf로 조직 수집기 엔드포인트에 지표와 로그 전송
• 대표 지표: claude_code.token.usage, cost.usage, session.count, lines_of_code, commit, PR
• OTEL_RESOURCE_ATTRIBUTES로 팀별 집계
• 랩 환경: otelcol, scrub_logs로 프롬프트 본문 삭제, CloudWatch와 중앙 대시보드 이중 전송

{cue: demo}
그럼 OTel을 어떻게 켜는지 보겠습니다. 답은 managed settings의 env 한 블록입니다.
첫째, 정책으로 켜면 사용자가 끌 수 없고 빠지는 사람이 없습니다. 둘째, OTLP로 회사가 정한 수집기 엔드포인트에 보냅니다. 셋째, 대표 지표는 토큰 사용량, 추정 비용, 세션 수, 그리고 코드 줄 수와 커밋, PR입니다. 넷째, resource 속성에 부서와 팀을 넣어 팀별로 집계합니다.
마지막은 이번 랩 환경입니다. otelcol이 받아서 내보내기 전에 프롬프트 본문을 지우고, CloudWatch와 중앙 대시보드 두 곳으로 보냅니다. 이건 TASK 05에서 직접 확인하십니다.

[약어]
• OTLP: OpenTelemetry Protocol
:::

---
<!-- Slide 29: Demo dashboard (PDF p29) -->
@type: content
@fit: off

## 이틀간 우리가 쓴 토큰을 본다
DEMO 10분, 강사 대시보드 (URL은 현장 안내)

:::html
<div class="fsi fsi-lab c6-lab">
  <div class="head"><span class="tag">DEMO / 10분</span></div>
  <ol class="steps">
    <li><b>1</b><span>랩 환경은 Day 1부터 OTel 수집 중 (참가 안내문 고지)</span></li>
    <li><b>2</b><span>전체 토큰, 비용 추이, Capstone 구간 피크 확인</span></li>
    <li><b>3</b><span>모델별, 도구별 분포, 캐시 적중률</span></li>
    <li><b>4</b><span>내 참가자 ID로 내 사용량 찾기</span></li>
    <li><b>5</b><span>가장 비용이 컸던 패턴을 Part 1 원리로 해석</span></li>
  </ol>
  <p class="where">화면에는 참가자 ID만 표시합니다. 회사별 사용량은 노출하지 않습니다.</p>
</div>
:::

:::notes
{timing: 10min}
{cue: demo}
[요약]
• 강사 대시보드(URL은 현장 안내), 랩 환경은 Day 1부터 OTel 수집 중 (참가 안내문에 고지)
• 전체 추이와 Capstone 피크, 모델별과 도구별 분포, 캐시 적중률, 내 참가자 ID로 찾기
• 가장 비용이 컸던 패턴을 Part 1 원리로 해석
• 화면에는 참가자 ID만, 회사별 사용량은 노출하지 않음

데모입니다. 이 랩 환경은 참가 안내문에 고지한 대로 Day 1부터 OTel을 수집하고 있습니다. 이틀간 여러분이 쓴 토큰을 같이 보겠습니다.
전체 추이에서 Capstone 구간의 피크를 보고, 모델별과 도구별 분포, 캐시 적중률을 봅니다. 그리고 각자 참가자 ID로 본인 사용량을 찾아보세요.
마지막으로 가장 비용이 컸던 패턴을 Part 1의 원리로 해석해 보겠습니다. 화면에는 참가자 ID만 나오고, 회사별 사용량은 보여 드리지 않습니다.
:::

---
<!-- Slide 30: modelPricing (PDF p30) -->
@type: content
@fit: off

## 추정 비용을 청구서에 가깝게
계약 단가로 보여 주는 modelPricing

:::html
<div class="c6-price fsi">
  <div class="left">
    <p class="c6-code-hd">managed-settings.json</p>
    <pre class="c6-code"><span class="ln">{</span><span class="ln k">  "modelPricing": {</span><span class="ln k" id="c6-price-line">    "multiplier": 0.9</span><span class="ln">  }</span><span class="ln">}</span><span class="ln c"># /usage, Total cost … at your organization's configured rates</span></pre>
    <ul>
      <li>managed settings에서만 유효 (v2.1.242+)</li>
      <li>multiplier가 1보다 작으면 할인, 크면 할증</li>
      <li>모델별 단가는 overrides로</li>
      <li><b>표시만 바꿈, 청구는 그대로</b></li>
      <li>숫자는 계약 단가를 입력</li>
    </ul>
  </div>
  <div class="right">
    <div class="box">
      <div class="row"><span>목록가 기준 추정 (예시 세션)</span><b>$0.55</b></div>
      <input type="range" min="0.5" max="1.5" step="0.05" value="0.9" id="c6-price-in" aria-label="modelPricing multiplier">
      <div class="row"><span>multiplier</span><b id="c6-price-m">0.90</b></div>
      <div class="disp" id="c6-price-out">$0.50</div>
      <p class="cap">예시: 원리 1의 /usage 세션 $0.55에 배수를 곱한 표시 금액입니다.</p>
    </div>
    <p class="c6-note">실제 정산은 AWS 청구서입니다. modelPricing은 /usage와 대시보드의 숫자를 청구서에 가깝게 맞추는 표시 설정입니다.</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var inp = document.getElementById('c6-price-in');
  function draw() {
    var m = +inp.value;
    document.getElementById('c6-price-m').textContent = m.toFixed(2);
    document.getElementById('c6-price-out').textContent = '$' + (0.55 * m).toFixed(2);
    document.getElementById('c6-price-line').textContent = '    "multiplier": ' + (+m.toFixed(2));
  }
  inp.addEventListener('input', draw);
  inp.addEventListener('change', function () { inp.blur(); });
  F.onEnter(inp, function () { inp.value = 0.9; draw(); });
  draw();
});
:::

:::notes
{timing: 1min}
[요약]
• managed-settings.json modelPricing.multiplier로 계약 단가를 표시 (managed settings에서만, v2.1.242+)
• 1보다 작으면 할인, 크면 할증, 모델별 단가는 overrides
• 표시만 바꾸고 청구는 그대로, 숫자는 계약 단가로

/usage와 대시보드의 비용은 목록가 기준 추정치입니다. 계약 단가가 다르면 숫자가 청구서와 어긋나죠. 그래서 modelPricing이 있습니다.
{cue: demo}
슬라이더로 multiplier를 바꿔 보겠습니다. 원리 1에서 본 0.55달러 세션이 0.9를 곱하면 0.50달러로 표시됩니다. 1보다 작으면 할인, 크면 할증이고, 모델별로 다르면 overrides를 씁니다.
중요한 건 표시만 바뀐다는 점입니다. 청구는 그대로이고, 실제 정산은 AWS 청구서로 대사하셔야 합니다. managed settings에서만 유효합니다.
:::

---
<!-- Slide 31: AWS side tools (PDF p31) -->
@type: content
@fit: off

## AWS 쪽에서도 본다
Claude Code 계측과 별개로 계정에서 보이는 것, 둘을 대사

:::html
<div class="c6">
  <div class="c6-cards four">
    <div class="c6-card"><span class="k">01</span><span class="t">Application inference profile 태그</span><span class="d">Ch2의 modelOverrides로 팀별 경로를 만들고 Cost Explorer에서 봅니다.</span></div>
    <div class="c6-card"><span class="k">02</span><span class="t">AWS Budgets</span><span class="d">계정, 태그 단위 예산 알람</span></div>
    <div class="c6-card"><span class="k">03</span><span class="t">전용 AWS 계정</span><span class="d">Claude Code 비용을 계정 경계로 분리 (공식 권장)</span></div>
    <div class="c6-card"><span class="k">04</span><span class="t"><span class="rp-detail" tabindex="0" data-tip="Tokens Per Minute. 분당 처리할 수 있는 토큰 수 한도">TPM</span> 쿼터</span><span class="d">라이브 교육 같은 동시 사용 급증은 사전 증액</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Application inference profile 태그: Ch2 modelOverrides로 팀별 경로, Cost Explorer
• AWS Budgets: 계정과 태그 단위 예산 알람
• 전용 AWS 계정으로 비용 분리 (공식 권장)
• TPM 쿼터: 동시 사용 급증은 사전 증액
• Claude Code 계측과 AWS 쪽 숫자를 대사해야 정확

Claude Code 쪽 계측과 별개로, AWS 계정에서 볼 수 있는 것도 있습니다. 둘을 대사해야 정확합니다.
첫째, Ch2에서 본 modelOverrides로 팀별 application inference profile을 쓰면 태그로 Cost Explorer에서 나눠 볼 수 있습니다. 둘째, AWS Budgets로 계정과 태그 단위 예산 알람을 겁니다. 셋째, 공식 권장은 Claude Code 전용 AWS 계정으로 경계를 나누는 것입니다.
넷째, 이번 같은 라이브 교육처럼 동시 사용이 몰리면 TPM 쿼터를 미리 늘려 두셔야 합니다.

[약어]
• TPM: Tokens Per Minute
:::

---
<!-- Slide 32: Claude Apps Gateway (PDF p32, p33, p34) -->
@type: content
@fit: off

## Bedrock 앞단의 게이트웨이
Claude Apps Gateway, 공식 구성과 이번 랩 구성

:::html
<div class="c6-gwwrap">
<div id="c6-sv-gw"></div>
<div class="c6-icons" aria-label="이 구성에 쓰이는 AWS 서비스">
  <span><img src="common/aws-icons/services/Arch_Elastic-Load-Balancing_48.svg" alt="">ALB</span>
  <span><img src="common/aws-icons/services/Arch_AWS-Fargate_48.svg" alt="">ECS Fargate</span>
  <span><img src="common/aws-icons/services/Arch_Amazon-RDS_48.svg" alt="">RDS</span>
  <span><img src="common/aws-icons/services/Arch_Amazon-Bedrock_48.svg" alt="">Bedrock</span>
  <span><img src="common/aws-icons/services/Arch_Amazon-Route-53_48.svg" alt="">Route 53</span>
  <span><img src="common/aws-icons/services/Arch_Amazon-Cognito_48.svg" alt="">Cognito</span>
  <span><img src="common/aws-icons/services/Arch_Amazon-CloudFront_48.svg" alt="">CloudFront</span>
</div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var DEV = {id:'dev',x:40,y:200,w:230,h:96,t:'개발자',s:'/login, 디바이스 인증',c:'accent'};
  var ALB = {id:'alb',x:320,y:200,w:230,h:96,t:'Internal ALB',s:'IPv4 전용, idle 3600초',c:'info'};
  var GW = {id:'gw',x:600,y:200,w:260,h:96,t:'게이트웨이',s:'ECS Fargate, RDS PostgreSQL',c:'warning'};
  var BR = {id:'br',x:910,y:200,w:230,h:96,t:'Amazon Bedrock',s:'IAM 역할로 호출',c:'info'};
  var IDP = {id:'idp',x:600,y:50,w:260,h:84,t:'OIDC IdP',s:'SSO, 그룹',c:'success'};
  var OT = {id:'ot',x:600,y:360,w:260,h:84,t:'OTLP 중계',s:'텔레메트리',c:'muted'};
  var Z = [{x:20,y:20,w:1140,h:440,l:'사설망 (PRIVATE ONLY)',tone:'info'}];
  var N = [DEV, ALB, GW, BR, IDP, OT];
  F.stepviz('#c6-sv-gw', [
    {kicker:'OVERVIEW', title:'SSO, 그룹 정책, 지출 한도를 한곳에서',
     body:'Claude Apps Gateway는 Bedrock 앞단에 <b>직접 운영하는</b> 게이트웨이로, SSO(Single Sign-On) 로그인, IdP(사내 인증 시스템) 그룹별 모델과 정책, 사용자별 지출 한도, OTLP 중계를 맡습니다.',
     facts:['SSO 로그인','IdP 그룹별 모델과 정책','사용자별 지출 한도','OTLP 중계'],
     zones:Z, nodes:N, hot:['dev','gw','br','idp','ot'],
     edges:[{f:'dev',t:'gw',c:'accent',side:'b',curve:70,o:0},{f:'gw',t:'idp',c:'success',o:1},{f:'gw',t:'br',c:'info',o:2},{f:'gw',t:'ot',c:'muted',o:2}],
     snip:{hd:'claude 바이너리에 포함',path:'게이트웨이 실행',lines:['claude gateway --config gateway.yaml'],hl:[1],note:'별도 제품 설치가 아니라 <b>claude 바이너리의 하위 명령</b>입니다.'}},
    {kicker:'STEP 1', title:'개발자: /login으로 정책을 받습니다',
     body:'개발자는 <b>/login</b>으로 디바이스 인증을 하고, 소속 그룹에 맞는 정책을 받습니다.',
     facts:['/login, 디바이스 인증','그룹별 정책 수신','로그인 브라우저도 사설망 안에'],
     zones:Z, nodes:N, hot:['dev','alb','gw','idp'],
     edges:[{f:'dev',t:'alb',c:'accent',l:'/login',o:0},{f:'alb',t:'gw',c:'info',o:1},{f:'gw',t:'idp',c:'success',l:'OIDC',o:2}],
     snip:{hd:'개발자 쪽',path:'Claude Code',lines:['/login','# 디바이스 인증','# 그룹별 정책 수신'],hl:[1],note:'<b>/login은 게이트웨이 호스트가 사설 IP로만 resolve될 때만</b> 통과합니다.'}},
    {kicker:'STEP 2', title:'Internal ALB와 사설 존',
     body:'공식 AWS 예제는 <b>internal ALB</b>(Application Load Balancer, IPv4 전용, idle 3600초)와 <b>Route 53 사설 존</b>을 씁니다. 사설망 전용 구성입니다.',
     facts:['IPv4 전용','idle 3600초','Route 53 사설 존'],
     zones:Z, nodes:N, hot:['dev','alb'],
     edges:[{f:'dev',t:'alb',c:'accent',o:0}], loop:true,
     snip:{hd:'공식 AWS 예제',path:'사설망 전용, internal ALB, IPv4',lines:['# Internal ALB','IPv4 전용','idle timeout 3600초','# DNS','Route 53 사설 존'],hl:[2,3,5],note:'인터넷에 열지 않는 것이 전제입니다.'}},
    {kicker:'STEP 3', title:'게이트웨이: ECS Fargate와 RDS',
     body:'게이트웨이는 <b>ECS Fargate</b>에서 돌고, 상태는 <b>RDS PostgreSQL</b>에, 로그인은 <b>OIDC IdP</b>(OpenID Connect 표준으로 로그인하는 인증 시스템)에 맡깁니다.',
     facts:['ECS Fargate','RDS PostgreSQL','OIDC IdP'],
     zones:Z, nodes:N, hot:['gw','idp'],
     edges:[{f:'gw',t:'idp',c:'success',o:0}],
     snip:{hd:'공식 AWS 예제',path:'게이트웨이',lines:['ECS Fargate','RDS PostgreSQL','OIDC IdP'],hl:[1,2,3],note:'지출 기록과 사용자 정보가 이 DB에 쌓입니다. 뒤에서 개인정보 항목을 봅니다.'}},
    {kicker:'STEP 4', title:'Bedrock은 공유 자격증명 하나로',
     body:'게이트웨이가 <b>IAM 역할</b>로 Bedrock을 호출합니다. 개발자마다 AWS 자격증명을 나눠 줄 필요 없이 <b>공유 자격증명 하나</b>입니다.',
     facts:['IAM 역할로 호출','공유 자격증명 하나','개발자 PC에 AWS 키 없음'],
     zones:Z, nodes:N, hot:['gw','br'],
     edges:[{f:'gw',t:'br',c:'info',o:0}], loop:true,
     snip:{hd:'공식 AWS 예제',path:'Amazon Bedrock',lines:['# 게이트웨이의 IAM 역할로 호출','# 공유 자격증명 하나'],hl:[],note:'사용자 구분은 게이트웨이의 OIDC sub로 합니다.'}},
    {kicker:'LAB', title:'이번 랩 전용 구성: 계정마다 VPC 안에 한 대',
     body:'랩에서는 참가자 계정마다 VPC(AWS 안의 사설 네트워크) 안에 게이트웨이가 한 대 있습니다. 로그인 브라우저만 <b>CloudFront에서 ccb-endpoint nginx</b>로 노출하고, 게이트웨이는 VPC CIDR(그 네트워크의 IP 주소 범위)만 허용합니다. 운영 환경은 사설망 전용입니다.',
     facts:['ccb-endpoint(참가자 실습 PC): use_gateway(모드 전환 스크립트)로 managed settings에 forceLoginGatewayUrl','gateway.workshop.internal, 자체 서명 TLS(전송 암호화 인증서)','게이트웨이 EC2: Docker, PostgreSQL, Cognito OIDC (alice, bob)','Bedrock: 인스턴스 역할, us-east-1, global 추론 프로필의 5.5 모델'],
     zones:[{x:20,y:20,w:1140,h:440,l:'참가자 VPC',tone:'info'}],
     nodes:[{id:'dev',x:40,y:200,w:230,h:96,t:'ccb-endpoint',s:'use_gateway',c:'accent'},{id:'alb',x:320,y:200,w:230,h:96,t:'Route 53 사설 존',s:'gateway.workshop.internal',c:'info'},{id:'gw',x:600,y:200,w:260,h:96,t:'게이트웨이 EC2',s:'Docker, PostgreSQL',c:'warning'},{id:'br',x:910,y:200,w:230,h:96,t:'Amazon Bedrock',s:'인스턴스 역할',c:'info'},{id:'idp',x:600,y:50,w:260,h:84,t:'Cognito OIDC',s:'alice, bob',c:'success'}],
     edges:[{f:'dev',t:'alb',c:'accent',o:0},{f:'alb',t:'gw',c:'info',o:1},{f:'gw',t:'idp',c:'success',o:2},{f:'gw',t:'br',c:'info',o:2}], loop:true,
     snip:{hd:'랩 토폴로지',path:'TASK 06, 07',lines:['use_gateway','# managed settings에 forceLoginGatewayUrl','# gateway.workshop.internal (자체 서명 TLS, trust 확인)','use_bedrock_direct   # 실습 끝나면 원복'],hl:[1,4],note:'각자 계정의 게이트웨이로 실습합니다.'}}
  ], {legend:[['accent','개발자'],['info','네트워크와 Bedrock'],['warning','게이트웨이'],['success','IdP'],['muted','텔레메트리 중계']]});
});
:::

:::notes
{timing: 2min}
[요약]
• Claude Apps Gateway: Bedrock 앞단에 직접 운영, SSO 로그인, IdP 그룹별 모델과 정책, 사용자별 지출 한도, OTLP 중계 (claude gateway --config gateway.yaml)
• 공식 AWS 예제: 사설망 전용, internal ALB(IPv4, idle 3600초), Route 53 사설 존, ECS Fargate, RDS PostgreSQL, OIDC IdP, IAM 역할로 Bedrock 호출
• /login은 게이트웨이 호스트가 사설 IP로만 resolve될 때만 통과, 로그인 브라우저도 사설망
• 랩 전용 구성(운영 환경은 사설망): 참가자 계정 VPC마다 게이트웨이 EC2, Cognito OIDC alice와 bob, us-east-1, global 추론 프로필의 5.5 모델
• ccb-endpoint는 참가자 실습 PC, use_gateway는 모드 전환 스크립트

{cue: demo}
이제 막는 쪽입니다. Claude Apps Gateway는 Bedrock 앞단에 직접 운영하는 게이트웨이이고, claude 바이너리에 들어 있습니다.
공식 AWS 예제 구성을 단계별로 보면, 개발자는 /login으로 디바이스 인증을 하고 그룹 정책을 받습니다. 중간에 internal ALB와 Route 53 사설 존이 있고, 게이트웨이는 ECS Fargate와 RDS PostgreSQL, OIDC IdP로 돌며, Bedrock은 IAM 역할 하나로 호출합니다.
가장 중요한 제약은 사설망 전용이라는 점입니다. /login은 게이트웨이 호스트가 사설 IP로만 resolve될 때만 통과하고, 로그인 브라우저도 사설망 안에 있어야 합니다.
마지막 단계는 이번 랩 구성입니다. 여러분 계정마다 VPC 안에 게이트웨이가 한 대씩 있고, alice와 bob 두 사용자로 실습합니다.

[약어]
• SSO: Single Sign-On
• IdP: Identity Provider
• OIDC: OpenID Connect
• ALB: Application Load Balancer
:::

---
<!-- Slide 33: Spend limits (PDF p35) -->
@type: content
@fit: off

## 사용자별 지출 한도를 실시간으로
지출 한도의 범위, 기간, 초과 시 동작

:::html
<div class="c6-spend fsi">
  <div class="meter" id="c6-spend">
    <div class="bar" id="c6-spend-bar"><i id="c6-spend-fill"></i><b class="mk" style-left="75"></b><b class="mk" style-left="95"></b><b class="mk" style-left="100"></b></div>
    <div class="ticks"><b class="tk" style-left="75">75%</b><b class="tk" style-left="95">95%</b><b class="tk up" style-left="100">100%</b></div>
    <input type="range" min="0" max="110" step="5" value="40" id="c6-spend-in" aria-label="한도 대비 사용액(%)">
    <div class="state" id="c6-spend-st"></div>
    <p class="cap">한도 대비 사용액은 설명용 예시입니다.</p>
  </div>
  <div class="rows">
    <div class="r"><span class="lb">범위</span><span class="vl">user (<span class="rp-detail" tabindex="0" data-tip="OIDC sub. IdP가 발급하는 사용자 고유 식별자">OIDC sub</span>), rbac_group, organization<em>그룹, 조직 한도는 1인당 기본값</em></span></div>
    <div class="r"><span class="lb">기간</span><span class="vl">daily, weekly, monthly (UTC 기준 리셋)<em>기간별로 각각 적용</em></span></div>
    <div class="r"><span class="lb">초과 시</span><span class="vl">429 billing_error + 리셋 시각<em>75%, 95%에서 사전 경고</em></span></div>
    <div class="r"><span class="lb">단가</span><span class="vl">pricing.overrides, 목록가, 미지 모델 $5/$25 순<em>추정치, 정산은 AWS</em></span></div>
    <div class="r"><span class="lb">설정</span><span class="vl">Admin API POST /v1/organizations/spend_limits<em>gateway.yaml이 아님</em></span></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var inp = document.getElementById('c6-spend-in'), bar = document.getElementById('c6-spend-bar');
  document.querySelectorAll('#c6-spend .mk, #c6-spend .tk').forEach(function (m) { m.style.left = (m.getAttribute('style-left') / 110 * 100) + '%'; });
  function draw() {
    var v = +inp.value, st = document.getElementById('c6-spend-st');
    document.getElementById('c6-spend-fill').style.width = (Math.min(v, 110) / 110 * 100) + '%';
    bar.classList.toggle('w75', v >= 75 && v < 100); bar.classList.toggle('w100', v >= 100);
    st.className = 'state' + (v >= 100 ? ' w100' : v >= 75 ? ' w75' : '');
    if (v >= 100) st.innerHTML = '한도 도달. 다음 요청은 <code>429 billing_error</code>와 리셋 시각을 받습니다.';
    else if (v >= 95) st.textContent = '95% 사전 경고. 곧 한도에 닿습니다.';
    else if (v >= 75) st.textContent = '75% 사전 경고.';
    else st.textContent = '한도 대비 ' + v + '%, 정상 사용 중입니다.';
  }
  inp.addEventListener('input', draw);
  F.onEnter(inp, function () { inp.value = 40; draw(); });
  var stops = [40, 75, 95, 100];
  function idx() { var v = +inp.value, k = 0; stops.forEach(function (s, i) { if (v >= s) k = i; }); return k; }
  F.bindKeys(inp, {
    down: function () { var i = idx(); if (+inp.value < stops[stops.length - 1]) { inp.value = stops[+inp.value < stops[i] ? i : Math.min(i + 1, stops.length - 1)]; draw(); return true; } return false; },
    up: function () { var i = idx(); if (+inp.value > stops[0]) { inp.value = stops[+inp.value > stops[i] ? i : Math.max(i - 1, 0)]; draw(); return true; } return false; }
  });
  inp.addEventListener('change', function () { inp.blur(); });
  draw();
});
:::

:::notes
{timing: 1min}
[요약]
• 범위: user(OIDC sub), rbac_group, organization, 그룹과 조직 한도는 1인당 기본값
• 기간: daily, weekly, monthly, UTC 기준 리셋
• 초과 시 429 billing_error와 리셋 시각, 75%와 95%에서 사전 경고
• 단가: pricing.overrides, 목록가, 미지 모델 $5/$25, 추정치이고 정산은 AWS
• 설정은 Admin API POST /v1/organizations/spend_limits, gateway.yaml이 아님

{cue: demo}
게이트웨이의 핵심 기능, 사용자별 지출 한도입니다. 왼쪽 막대를 아래 화살표로 40%, 75%, 95%, 100% 순서로 올려 보겠습니다.
75%와 95%에서 사전 경고가 나오고, 100%에 닿으면 다음 요청은 429 billing_error와 리셋 시각을 받습니다.
오른쪽 규칙을 보면, 범위는 사용자, 그룹, 조직이고, 그룹과 조직 한도는 공유 풀이 아니라 1인당 기본값입니다. 기간은 일, 주, 월이고 UTC 기준으로 리셋됩니다.
설정은 gateway.yaml이 아니라 Admin API로 합니다. 이 점을 많이 헷갈리십니다.
:::

---
<!-- Slide 34: Two decisions before operation (PDF p36) -->
@type: content
@fit: off

## 운영 전에 정할 두 가지
기본값이 금융권 기대와 다를 수 있습니다

:::html
<div class="c6 c6-ops fsi">
  <div class="c6-two">
    <div class="c6-col bad" id="c6-ops-fail">
      <h4>저장소 장애 시</h4>
      <div class="mode"><button class="btn btn-sm" data-cycle>설정 바꿔 보기</button><span class="cur" id="c6-ops-cur"></span></div>
      <div class="res" id="c6-ops-res"></div>
      <ul><li>기본은 fail-open: 요청 통과, 경고 로그</li><li>enforcement.fail_closed_on_error: true면 차단</li><li>추론 중단과 미계측 지출 중 선택</li></ul>
    </div>
    <div class="c6-col">
      <h4>개인정보</h4>
      <ul><li>principal_emails 테이블에 이메일, 이름, 그룹 저장</li><li>기본 90일 보존 (identity_retention_days)</li><li>퇴사, 열람 요청 시 해당 행 삭제</li><li>spend, audit은 OIDC sub만 참조</li></ul>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  F.cycle('#c6-ops-fail', 2, function (i) {
    document.getElementById('c6-ops-cur').textContent = i === 0 ? 'fail-open (기본값)' : 'fail_closed_on_error: true';
    document.getElementById('c6-ops-res').textContent = i === 0 ? '저장소 장애 중에도 요청은 통과하고 경고 로그만 남습니다. 그동안의 지출은 계측되지 않을 수 있습니다.' : '저장소 장애 중에는 요청을 차단합니다. 지출은 지켜지지만 추론이 멈춥니다.';
  });
});
:::

:::notes
{timing: 1min}
[요약]
• 저장소 장애 시 기본은 fail-open(요청 통과, 경고 로그), fail_closed_on_error: true면 차단, 추론 중단과 미계측 지출 중 선택
• principal_emails에 이메일, 이름, 그룹 저장, 기본 90일 보존(identity_retention_days)
• 퇴사나 열람 요청 시 행 삭제, spend와 audit은 OIDC sub만 참조

{cue: question}
운영 전에 꼭 정하셔야 할 두 가지입니다. 기본값이 금융권의 기대와 다를 수 있습니다.
첫째, 저장소에 장애가 나면 어떻게 할까요. 버튼으로 바꿔 보겠습니다. 기본은 fail-open, 요청을 통과시키고 경고만 남깁니다. fail_closed_on_error를 켜면 차단합니다. 추론이 멈추는 것과 계측되지 않는 지출, 둘 중 무엇을 감수할지의 선택입니다.
둘째, 개인정보입니다. 게이트웨이는 이메일과 이름, 그룹을 저장하고 기본 90일 보존합니다. 퇴사나 열람 요청 때 해당 행을 지우는 절차를 미리 정해 두세요.
:::

---
<!-- Slide 35: Quick check 2 (PDF p37) -->
@type: content
@fit: off

## 그룹 한도와 사용자 한도, 누가 이기나
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c6-qc-3">
  <p class="q">standard-users 그룹 한도가 $50/일인데 bob에게만 1센트 사용자 한도를 걸면?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>그룹 한도 $50이 우선한다</button>
    <button class="opt right"><b>B</b>사용자 한도가 우선해 다음 요청부터 429로 막힌다</button>
    <button class="opt"><b>C</b>진행 중인 응답까지 즉시 끊긴다</button>
  </div>
  <p class="ans">정답 B. 사용자 한도가 그룹 기본값보다 우선합니다. 진행 중인 응답은 끝까지 갑니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c6-qc-3'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, 사용자 한도가 그룹 기본값보다 우선해 다음 요청부터 429
• 진행 중인 응답은 끝까지 감

퀴즈입니다. standard-users 그룹 한도가 하루 50달러인데 bob에게만 1센트 사용자 한도를 걸면 어떻게 될까요?
{cue: pause}
정답은 B입니다. 사용자 한도가 그룹 기본값보다 우선해서 다음 요청부터 429로 막힙니다. 이미 진행 중인 응답은 끝까지 갑니다. 이걸 잠시 뒤 랩에서 직접 해 보십니다.
:::

---
<!-- Slide 36: Lab TASK 05 (PDF p38) -->
@type: content
@fit: off

## 텔레메트리는 어디로 가는가, 6분
LAB, Chapter 6 TASK 05

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>settings.json의 OTEL_* 환경 변수 읽기</span></li>
    <li><b>2</b><span>otelcol, fanout 타이머 active 확인</span></li>
    <li><b>3</b><span>scrub_logs: 내보내기 전 프롬프트 본문 삭제 규칙 찾기</span></li>
    <li><b>4</b><span>exporters에서 CloudWatch + 중앙 대시보드 이중 전송 확인</span></li>
  </ol>
  <p class="where">Hands-on Lab 포털에서 Chapter 6 TASK 05를 엽니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB 6분, Chapter 6 TASK 05
• OTEL_* 환경 변수, otelcol과 fanout 타이머, scrub_logs 규칙, CloudWatch와 중앙 대시보드 이중 전송 확인

{cue: demo}
첫 번째 랩은 6분입니다. Chapter 6 TASK 05를 열어 주세요.
settings.json의 OTEL 환경 변수를 읽고, otelcol과 fanout 타이머가 돌고 있는지 확인한 뒤, 프롬프트 본문을 지우는 scrub_logs 규칙과 두 곳으로 보내는 exporters를 찾아보세요. 아까 OTel 그림의 마지막 단계를 직접 확인하는 것입니다.
:::

---
<!-- Slide 37: Lab TASK 06 to 07 (PDF p39) -->
@type: content
@fit: off

## 모델 정책과 지출 한도, 22분
LAB, 게이트웨이 실습 Chapter 6 TASK 06부터 07까지

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>use_gateway, alice 로그인, /model에 Opus 포함, /usage Spend limit 확인</span></li>
    <li><b>2</b><span>bob으로 재로그인, Opus 없음, 질문 1개로 지출 기록</span></li>
    <li><b>3</b><span>Terminal 2: Admin API로 bob 조회, 사용자 한도 1센트</span></li>
    <li><b>4</b><span>bob 다음 요청이 지출 한도 메시지로 거절</span></li>
    <li><b>5</b><span>한도 DELETE, 그룹 한도 복원, use_bedrock_direct</span></li>
  </ol>
  <p class="where">각자 계정의 게이트웨이로 진행합니다. Hands-on Lab 포털, Chapter 6 TASK 06부터 07. 게이트웨이 장애 팀은 강사 화면을 봅니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB 22분, Chapter 6 TASK 06부터 07, 각자 계정의 게이트웨이
• alice와 bob으로 그룹별 모델 정책 비교, Admin API로 bob 한도 1센트, 거절 확인
• 끝나면 한도 DELETE, 그룹 한도 복원, use_bedrock_direct로 원복

{cue: demo}
마지막 랩, 22분입니다. 각자 계정의 게이트웨이로 진행합니다.
alice로 로그인하면 /model에 Opus가 보이고, bob으로 다시 로그인하면 Opus가 없습니다. 그룹 정책입니다. 그다음 두 번째 터미널에서 Admin API로 bob에게 1센트 한도를 걸고, bob의 다음 요청이 거절되는 걸 보세요. 방금 퀴즈의 정답을 직접 확인하는 겁니다.
끝나면 꼭 한도를 지우고 use_bedrock_direct로 원복해 주세요. 게이트웨이에 문제가 있는 팀은 제 화면을 보시면 됩니다.
:::

---
<!-- Slide 38: Optional lab TASK 08 (PDF p40) -->
@type: content
@fit: off

## 내 계정에 비용 설정 적용, 10분
선택 LAB, Chapter 6 선택 TASK 08

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>managed settings에 modelPricing.multiplier 병합</span></li>
    <li><b>2</b><span>/usage에서 configured rates 표시 확인</span></li>
    <li><b>3</b><span>대시보드에서 적용 전후 내 사용량 비교</span></li>
    <li><b>4</b><span>백업으로 원복</span></li>
  </ol>
  <p class="where">각자 Bedrock 직결로 진행합니다. Hands-on Lab 포털, Chapter 6 선택 TASK 08.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 선택 LAB 10분, Chapter 6 선택 TASK 08, 각자 Bedrock 직결
• modelPricing.multiplier 병합, /usage configured rates 확인, 대시보드 전후 비교, 백업으로 원복

시간이 남는 분을 위한 선택 랩입니다. Bedrock 직결 상태에서 managed settings에 modelPricing을 넣고, /usage에 configured rates가 표시되는지, 대시보드에서는 어떻게 보이는지 비교해 보세요. 끝나면 백업으로 원복합니다.
:::

---
<!-- Slide 39: Part 1 deep dive (PDF p41, p42, p43, p44) -->
@type: content
@fit: off

## Part 1에서 자주 받는 질문
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

Part 1에서 자주 받는 질문입니다. 시간이 남거나 질문이 나오면 펼칩니다.
{cue: demo}
첫째, MCP 도구 정의 비용입니다. 서버를 많이 연결하면 스키마가 매 요청에 실리고, 도구가 많은 서버는 정의만으로 수천 토큰이 됩니다. 프로젝트마다 .mcp.json을 따로 두면 쓰지 않는 서버가 계속 붙어 있지 않습니다.
둘째, 세션 위생은 /clear, 지시가 있는 /compact, 그리고 자리 비운 뒤의 캐시입니다.
셋째, 모델 배분 예시로 로그 요약 Subagent에 haiku를 지정했습니다. 장황한 로그는 작은 모델이 읽고 메인에는 5줄만 돌아옵니다.
:::

---
<!-- Slide 40: Part 2 deep dive (PDF p45, p46, p47, p48) -->
@type: content
@fit: off

## Part 2에서 자주 받는 질문
더 알아보기, OTel 지표, 이상 징후, Admin API

:::html
<div class="c6-pickset c6-dd fsi">
  <div class="fsi-stack" data-pick="c6-dd2">
    <button class="pick" data-key="met"><span class="k">1</span><span class="t">OTel 지표 모음</span></button>
    <button class="pick" data-key="anom"><span class="k">2</span><span class="t">이상 징후 패턴</span></button>
    <button class="pick" data-key="api"><span class="k">3</span><span class="t">Admin API로 한도 운영</span></button>
  </div>
  <div class="panel" data-pick-panel="c6-dd2">
    <div data-for="met"><h4>대시보드의 숫자는 어디서 오나</h4>
      <div class="c6-tbl">
        <div class="tr h"><span>지표</span><span>속성</span><span>용도</span></div>
        <div class="tr"><span>token.usage</span><span>type: input, output, cacheRead, cacheCreation</span><span>캐시 효율, 모델별 사용량</span></div>
        <div class="tr"><span>cost.usage</span><span>model</span><span>추정 비용 (정산은 AWS)</span></div>
        <div class="tr"><span>session.count</span><span>user, team 속성</span><span>활성 사용자</span></div>
        <div class="tr"><span>lines_of_code.count</span><span>type: added, removed</span><span>생산성 지표</span></div>
        <div class="tr"><span>commit.count, pull_request.count</span><span>없음</span><span>산출물</span></div>
        <div class="tr"><span>active_time.total</span><span>없음</span><span>실제 사용 시간</span></div>
      </div><p>지표 이름 앞에는 모두 <code>claude_code.</code> 접두사가 붙습니다.</p></div>
    <div data-for="anom"><h4>숫자를 보고 무엇을 의심하나</h4>
      <div class="c6-tbl">
        <div class="tr h"><span>패턴</span><span>의심</span><span>처방</span></div>
        <div class="tr"><span>cacheRead 비율이 낮음</span><span>긴 휴식 후 재개, 접두부가 자주 바뀜</span><span>세션 위생, CLAUDE.md 안정화</span></div>
        <div class="tr"><span>input 토큰 급증</span><span>큰 로그, 파일을 통째로 읽음</span><span>출력 필터 훅, Subagent 격리</span></div>
        <div class="tr"><span>Opus 비중이 높음</span><span>기본 모델 미고정</span><span>ANTHROPIC_DEFAULT_*, availableModels</span></div>
        <div class="tr"><span>특정 사용자 급증</span><span>자동화 루프, 병렬 남용</span><span>게이트웨이 사용자 한도</span></div>
        <div class="tr"><span>분류기 호출 비중 큼</span><span>auto mode 분류기가 큰 모델로 폴백</span><span>CLAUDE_CODE_AUTO_MODE_MODEL 명시 (Ch3)</span></div>
      </div></div>
    <div data-for="api"><h4>그룹 기본값 + 예외 사용자</h4>
      <pre class="c6-code"><span class="ln c"># 그룹 기본값: standard-users 1인당 하루 $50</span><span class="ln k">curl -X POST "$GW/v1/organizations/spend_limits" \</span><span class="ln">  -H "x-api-key: $WRITE" \</span><span class="ln">  -H "Content-Type: application/json" \</span><span class="ln">  -d '{"scope":{"type":"rbac_group",</span><span class="ln">             "rbac_group_id":"standard-users"},</span><span class="ln">       "amount":"5000","period":"daily"}'</span><span class="ln c"># 현재 적용 한도와 사용액</span><span class="ln k">curl -G "$GW/v1/organizations/spend_limits/effective" \</span><span class="ln">  --data-urlencode 'period[]=daily' -H "x-api-key: $READ"</span></pre>
      <p>amount는 US 센트 문자열입니다. 그룹 한도는 공유 풀이 아닌 1인당 기본값이고, 사용자 한도가 그룹보다 우선합니다. write 키는 소수만, 비밀 저장소에 보관합니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c6-dd2', { start: 0 }); });
:::

:::notes
{timing: 0.5min}
[요약]
• OTel 지표: token.usage(type별), cost.usage, session.count, lines_of_code.count, commit과 PR, active_time.total
• 이상 징후: cacheRead 낮음, input 급증, Opus 비중, 특정 사용자 급증, 분류기 호출 비중과 각 처방
• Admin API: 그룹 기본값 POST, effective 조회, amount는 US 센트 문자열, 사용자 한도 우선, write 키는 소수만

Part 2에서 자주 받는 질문입니다. 시간이 남거나 질문이 나오면 펼칩니다.
{cue: demo}
첫째, 대시보드의 숫자는 이 지표들에서 옵니다. token.usage의 type 속성으로 캐시 효율을 보고, cost.usage는 추정 비용입니다.
둘째, 이상 징후입니다. 예를 들어 cacheRead 비율이 낮으면 긴 휴식 후 재개나 자주 바뀌는 접두부를 의심하고 세션 위생으로 처방합니다. Opus 비중이 높으면 기본 모델이 고정되지 않은 것이고, 분류기 호출 비중이 크면 Ch3의 auto mode 분류기 모델을 명시합니다.
셋째, Admin API로 그룹 기본값을 걸고 예외 사용자를 둡니다. amount는 US 센트 문자열이라 하루 50달러는 5000입니다.
:::

---
<!-- Slide 41: Recap (PDF p49) -->
@type: content
@fit: off

## 덜 쓰고, 보고, 막기
Chapter 6 Recap

:::html
<div class="c6-recap">
  <div class="grid">
    <div class="rc"><b>01</b><span>먼저 본다: /context, /usage, 캐시 적중률<br>캐시를 지키고, 압축 시점과 effort는 내가 정한다</span></div>
    <div class="rc"><b>02</b><span>항상 실리는 지침은 짧게, 큰 출력은 들어오기 전에</span></div>
    <div class="rc"><b>03</b><span>커뮤니티 도구는 원리로 읽고 공식 기능으로 대체 가능한지 본다</span></div>
    <div class="rc"><b>04</b><span>Bedrock은 Analytics가 없다. OTel을 정책으로</span></div>
    <div class="rc"><b>05</b><span>modelPricing으로 계약 단가 표시, 정산은 AWS와 대사</span></div>
    <div class="rc"><b>06</b><span>게이트웨이: SSO, 그룹 정책, 지출 한도, 사설망 전용</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 덜 쓰기: 먼저 보고, 캐시를 지키고 압축 시점과 effort는 내가 정하고, 지침은 짧게, 큰 출력은 들어오기 전에, 커뮤니티 도구는 원리로
• 보기: Bedrock은 Analytics가 없으니 OTel을 정책으로, modelPricing으로 계약 단가 표시
• 막기: 게이트웨이의 SSO, 그룹 정책, 지출 한도, 사설망 전용

Chapter 6을 부제 그대로 정리합니다. 덜 쓰고, 보고, 막기.
덜 쓰기는 Part 1의 세 가지, 먼저 보고 캐시와 압축 시점과 effort를 내가 정하고, 항상 실리는 것은 짧게, 큰 출력은 막고, 커뮤니티 도구는 원리로 읽는 것입니다.
보기는 OTel을 정책으로 켜고 modelPricing으로 청구서에 가깝게 맞추는 것, 막기는 게이트웨이의 그룹 정책과 지출 한도입니다. 이 여섯 가지로 이틀 과정의 마지막 챕터를 마칩니다.
:::

---
<!-- Slide 42: Thank you (PDF p50) -->
@type: thankyou
@toc: toc.html
@message: 다음은 Capstone 쇼케이스와 Closing입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에 언제든 편하게 남겨 주세요.

:::notes
{timing: 0.5min}
[요약]
• 다음은 Capstone 쇼케이스와 Closing
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 이것으로 여섯 개 챕터를 모두 마쳤습니다. 다음은 Capstone 쇼케이스와 Closing입니다.
질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에 언제든 편하게 남겨 주세요.
:::
