---
remarp: true
block: ch6-org-cost
---
<!-- Slide 1: Cover -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 6. 조직의 비용 보고 통제하기
## 쓴 만큼 보고, 넘치면 막는다 (Claude Code v2.1.319, 2026-11-08 리허설 검증)
Oh, Junseok
Sr. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=[].some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch6.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 6 조직의 비용 보고 통제하기, 쓴 만큼 보고 넘치면 막는다
• Claude Code v2.1.319(2026-11-08 리허설 검증)와 Amazon Bedrock 기준
• 16:50부터 강의와 데모, 이어서 랩 TASK 01부터 03 (선택 TASK 04)

마지막 챕터, 조직의 비용 보고 통제하기입니다.
표지 다음 장에서 순서를 보고 바로 시작하겠습니다.
:::
---
<!-- Slide 2: Agenda -->
@type: content
@fit: off

## 강의와 데모 20분, 랩 28분
계측, 계약 단가, 게이트웨이 지출 한도의 순서

:::html
<div class="c6 c6-agenda fsi">
  <div class="fsi-grid-2">
    <div class="pick"><span class="k">CHAPTER 06 / 50분</span><span class="t">조직의 비용 통제</span><span class="d"><span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span> 대시보드, modelPricing, 게이트웨이 지출 한도</span><span class="when">16:50 시작</span></div>
    <div class="pick lab"><span class="k">LAB / Ch6 Lab</span><span class="t">TASK 01부터 03, 선택 TASK 04</span><span class="d">텔레메트리 경로, 그룹별 모델 정책, 지출 한도, 계약 단가</span><span class="when">강의 뒤 바로</span></div>
  </div>
  <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">자주 묻는 세부 내용은 마지막에 모아 둡니다</span></div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 16:50부터 50분, 강의와 데모 약 21.5분 + 랩 28분
• OTel 계측, modelPricing, 게이트웨이 지출 한도
• 랩 TASK 01 6분, TASK 02와 03 22분, 선택 TASK 04

순서입니다. Bedrock에서 비용을 어떻게 보는지, OTel 대시보드, 계약 단가와 AWS 쪽 도구, 그리고 Claude Apps Gateway의 그룹 정책과 지출 한도입니다.
강의와 데모는 20분 남짓이고, 랩은 TASK 01이 6분, TASK 02와 03이 22분입니다. 선택 TASK 04는 시간이 남을 때 해 봅니다.
:::
---
<!-- Slide 3: Part 02 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 06 / 16:50</span>
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
• Chapter 6은 조직의 비용 통제, 쓴 만큼 보고 넘치면 막는다
• Bedrock 비용 보기, OTel 대시보드, modelPricing과 AWS 도구, Claude Apps Gateway 실습

다시 모였습니다. Chapter 6, 조직의 비용 통제입니다. 점심 직후 Chapter 5가 개인이 덜 쓰는 법이었다면, 지금은 조직이 쓴 만큼 보고 넘치면 막는 법입니다.
Bedrock에서 비용을 어떻게 보는지, OTel 대시보드, 계약 단가와 AWS 쪽 도구, 그리고 마지막으로 Claude Apps Gateway를 직접 실습합니다.
:::
---
<!-- Slide 4: Cost by setup -->
@type: content
@fit: off

## Bedrock의 눈, 콘솔과 자체 계측뿐
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
<!-- Slide 5: Bedrock reality -->
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
<!-- Slide 6: OTel by policy -->
@type: content
@fit: off

## 정책으로 켜는 OTel
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
     snip:{hd:'TASK 01에서 확인',path:'랩 환경',lines:['# settings.json의 OTEL_* 환경 변수','# otelcol, fanout 타이머 active','# scrub_logs: 프롬프트 본문 삭제 규칙','# exporters: CloudWatch + 중앙 대시보드'],hl:[],note:'프롬프트 본문을 <b>내보내기 전에 지우는</b> 규칙이 금융권 운영의 기본입니다.'}}
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
마지막은 이번 랩 환경입니다. otelcol이 받아서 내보내기 전에 프롬프트 본문을 지우고, CloudWatch와 중앙 대시보드 두 곳으로 보냅니다. 이건 TASK 01에서 직접 확인하십니다.

[약어]
• OTLP: OpenTelemetry Protocol
:::
---
<!-- Slide 7: Demo dashboard -->
@type: content
@fit: off

## 이틀간 우리가 쓴 토큰
DEMO 10분, 강사 대시보드 (URL은 현장 안내)

:::html
<div class="fsi fsi-lab c6-lab">
  <div class="head"><span class="tag">DEMO / 10분</span></div>
  <ol class="steps">
    <li><b>1</b><span>랩 환경은 Day 1부터 OTel 수집 중 (참가 안내문 고지)</span></li>
    <li><b>2</b><span>전체 토큰, 비용 추이, Capstone 구간 피크 확인</span></li>
    <li><b>3</b><span>모델별, 도구별 분포, 캐시 적중률</span></li>
    <li><b>4</b><span>내 참가자 ID로 내 사용량 찾기</span></li>
    <li><b>5</b><span>가장 비용이 컸던 패턴을 Ch5의 원리로 해석</span></li>
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
• 가장 비용이 컸던 패턴을 Ch5의 원리로 해석
• 화면에는 참가자 ID만, 회사별 사용량은 노출하지 않음

데모입니다. 이 랩 환경은 참가 안내문에 고지한 대로 Day 1부터 OTel을 수집하고 있습니다. 이틀간 여러분이 쓴 토큰을 같이 보겠습니다.
전체 추이에서 Capstone 구간의 피크를 보고, 모델별과 도구별 분포, 캐시 적중률을 봅니다. 그리고 각자 참가자 ID로 본인 사용량을 찾아보세요.
마지막으로 가장 비용이 컸던 패턴을 Chapter 5의 원리로 해석해 보겠습니다. 화면에는 참가자 ID만 나오고, 회사별 사용량은 보여 드리지 않습니다.
:::
---
<!-- Slide 8: modelPricing -->
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
<!-- Slide 9: AWS side tools -->
@type: content
@fit: off

## AWS 쪽에서 보는 비용
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
<!-- Slide 10: Claude Apps Gateway -->
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
     snip:{hd:'랩 토폴로지',path:'TASK 02, 03',lines:['use_gateway','# managed settings에 forceLoginGatewayUrl','# gateway.workshop.internal (자체 서명 TLS, trust 확인)','use_bedrock_direct   # 실습 끝나면 원복'],hl:[1,4],note:'각자 계정의 게이트웨이로 실습합니다.'}}
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
<!-- Slide 11: Spend limits -->
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
<!-- Slide 12: Two decisions before operation -->
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
<!-- Slide 13: Quick check 2 -->
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
<!-- Slide 14: Lab TASK 01 -->
@type: content
@fit: off

## 텔레메트리는 어디로 가는가, 6분
LAB, Chapter 6 TASK 01

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>settings.json의 OTEL_* 환경 변수 읽기</span></li>
    <li><b>2</b><span>otelcol, fanout 타이머 active 확인</span></li>
    <li><b>3</b><span>scrub_logs: 내보내기 전 프롬프트 본문 삭제 규칙 찾기</span></li>
    <li><b>4</b><span>exporters에서 CloudWatch + 중앙 대시보드 이중 전송 확인</span></li>
  </ol>
  <p class="where">Hands-on Lab 포털에서 Chapter 6 TASK 01을 엽니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB 6분, Chapter 6 TASK 01
• OTEL_* 환경 변수, otelcol과 fanout 타이머, scrub_logs 규칙, CloudWatch와 중앙 대시보드 이중 전송 확인

{cue: demo}
첫 번째 랩은 6분입니다. Chapter 6 TASK 01을 열어 주세요.
settings.json의 OTEL 환경 변수를 읽고, otelcol과 fanout 타이머가 돌고 있는지 확인한 뒤, 프롬프트 본문을 지우는 scrub_logs 규칙과 두 곳으로 보내는 exporters를 찾아보세요. 아까 OTel 그림의 마지막 단계를 직접 확인하는 것입니다.
:::
---
<!-- Slide 15: Lab TASK 02 to 03 -->
@type: content
@fit: off

## 모델 정책과 지출 한도, 22분
LAB, 게이트웨이 실습 Chapter 6 TASK 02부터 03까지

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>use_gateway, alice 로그인, /model에 Opus 포함, /usage Spend limit 확인</span></li>
    <li><b>2</b><span>bob으로 재로그인, Opus 없음, 질문 1개로 지출 기록</span></li>
    <li><b>3</b><span>Terminal 2: Admin API로 bob 조회, 사용자 한도 1센트</span></li>
    <li><b>4</b><span>bob 다음 요청이 지출 한도 메시지로 거절</span></li>
    <li><b>5</b><span>한도 DELETE, 그룹 한도 복원, use_bedrock_direct</span></li>
  </ol>
  <p class="where">각자 계정의 게이트웨이로 진행합니다. Hands-on Lab 포털, Chapter 6 TASK 02부터 03. 게이트웨이 장애 팀은 강사 화면을 봅니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB 22분, Chapter 6 TASK 02부터 03, 각자 계정의 게이트웨이
• alice와 bob으로 그룹별 모델 정책 비교, Admin API로 bob 한도 1센트, 거절 확인
• 끝나면 한도 DELETE, 그룹 한도 복원, use_bedrock_direct로 원복

{cue: demo}
마지막 랩, 22분입니다. 각자 계정의 게이트웨이로 진행합니다.
alice로 로그인하면 /model에 Opus가 보이고, bob으로 다시 로그인하면 Opus가 없습니다. 그룹 정책입니다. 그다음 두 번째 터미널에서 Admin API로 bob에게 1센트 한도를 걸고, bob의 다음 요청이 거절되는 걸 보세요. 방금 퀴즈의 정답을 직접 확인하는 겁니다.
끝나면 꼭 한도를 지우고 use_bedrock_direct로 원복해 주세요. 게이트웨이에 문제가 있는 팀은 제 화면을 보시면 됩니다.
:::
---
<!-- Slide 16: Optional lab TASK 04 -->
@type: content
@fit: off

## 내 계정에 비용 설정 적용, 10분
선택 LAB, Chapter 6 선택 TASK 04

:::html
<div class="fsi fsi-lab c6-lab">
  <ol class="steps">
    <li><b>1</b><span>managed settings에 modelPricing.multiplier 병합</span></li>
    <li><b>2</b><span>/usage에서 configured rates 표시 확인</span></li>
    <li><b>3</b><span>대시보드에서 적용 전후 내 사용량 비교</span></li>
    <li><b>4</b><span>백업으로 원복</span></li>
  </ol>
  <p class="where">각자 Bedrock 직결로 진행합니다. Hands-on Lab 포털, Chapter 6 선택 TASK 04.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 선택 LAB 10분, Chapter 6 선택 TASK 04, 각자 Bedrock 직결
• modelPricing.multiplier 병합, /usage configured rates 확인, 대시보드 전후 비교, 백업으로 원복

시간이 남는 분을 위한 선택 랩입니다. Bedrock 직결 상태에서 managed settings에 modelPricing을 넣고, /usage에 configured rates가 표시되는지, 대시보드에서는 어떻게 보이는지 비교해 보세요. 끝나면 백업으로 원복합니다.
:::
---
<!-- Slide 17: Deep dive FAQ -->
@type: content
@fit: off

## 자주 받는 질문
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
        <div class="tr"><span>분류기 호출 비중 큼</span><span>auto mode 분류기가 큰 모델로 폴백</span><span>CLAUDE_CODE_AUTO_MODE_MODEL 명시 (Ch2 Lab 2)</span></div>
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

자주 받는 질문입니다. 시간이 남거나 질문이 나오면 펼칩니다.
{cue: demo}
첫째, 대시보드의 숫자는 이 지표들에서 옵니다. token.usage의 type 속성으로 캐시 효율을 보고, cost.usage는 추정 비용입니다.
둘째, 이상 징후입니다. 예를 들어 cacheRead 비율이 낮으면 긴 휴식 후 재개나 자주 바뀌는 접두부를 의심하고 세션 위생으로 처방합니다. Opus 비중이 높으면 기본 모델이 고정되지 않은 것이고, 분류기 호출 비중이 크면 Ch2 Lab 2에서 본 auto mode 분류기 모델을 명시합니다.
셋째, Admin API로 그룹 기본값을 걸고 예외 사용자를 둡니다. amount는 US 센트 문자열이라 하루 50달러는 5000입니다.
:::
---
<!-- Slide 18: Key Takeaways -->
@type: content
@fit: off

## 보고, 막기
Chapter 6 Key Takeaways

:::html
<div class="c6-recap">
  <div class="grid">
    <div class="rc"><b>01</b><span>Bedrock은 Analytics가 없다. OTel을 정책으로 켠다</span></div>
    <div class="rc"><b>02</b><span>modelPricing으로 계약 단가 표시, 정산은 AWS와 대사</span></div>
    <div class="rc"><b>03</b><span>게이트웨이: SSO, 그룹 정책, 지출 한도, 사설망 전용</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 보기: Bedrock은 Analytics가 없으니 OTel을 정책으로
• modelPricing으로 계약 단가 표시, 정산은 AWS와 대사
• 막기: 게이트웨이의 SSO, 그룹 정책, 지출 한도, 사설망 전용

Chapter 6을 세 줄로 정리합니다.
{cue: pause}
보기는 OTel을 정책으로 켜고 modelPricing으로 청구서에 가깝게 맞추는 것, 막기는 게이트웨이의 그룹 정책과 지출 한도입니다.
Chapter 5의 덜 쓰기와 합치면, 덜 쓰고, 보고, 막기입니다. 이것으로 이틀 과정의 마지막 챕터를 마칩니다.
:::
---
<!-- Slide 19: Thank you -->
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
