---
remarp: true
block: ch2-bedrock-policy
---
<!-- Slide 1: Cover (PDF p1) -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Bedrock 배포와 정책 전달
## Chapter 2. 키를 나눠 주지 않고, 정책은 파일로 강제한다 (Claude Code v2.1.319, 2026-11-08 리허설 검증)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=Array.prototype.some.call(document.querySelectorAll('link[rel=stylesheet]'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.setAttribute('href',h);document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch2.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 2는 Bedrock 배포와 정책 전달
• 핵심 메시지: 키를 나눠 주지 않고, 정책은 파일로 강제
• 2026년 11월, Claude Code v2.1.319 (2026-11-08 리허설 검증), Amazon Bedrock 기준

Chapter 2, Bedrock 배포와 정책 전달을 시작하겠습니다.
이 챕터의 한 줄 메시지는 표지에 있는 그대로입니다. 개발자에게 키를 나눠 주지 않고, 회사 정책은 파일로 강제합니다.
강의는 40분이고, 실습 50분은 점심 후 13시에 진행합니다.
:::

---
<!-- Slide 2: Agenda (PDF p2) -->
@type: content
@fit: off

## 강의 40분, 실습 50분
네 개의 Part와 Lab, 연결에서 정책 강제까지

:::html
<div class="fsi fsi-agenda">
  <div class="fsi-grid-4">
    <div class="pick"><span class="k">PART 01 / 9분</span><span class="t">연결과 IAM</span><span class="d">/setup-bedrock, 리전, IAM 정책</span></div>
    <div class="pick"><span class="k">PART 02 / 8분</span><span class="t">자격증명</span><span class="d">SSO 프로필, 자동 갱신</span></div>
    <div class="pick"><span class="k">PART 03 / 10분</span><span class="t">모델 고정과 비용 태깅</span><span class="d">ANTHROPIC_DEFAULT_*, inference profile</span></div>
    <div class="pick"><span class="k">PART 04 / 13분</span><span class="t">정책 전달</span><span class="d">managed-settings.json, 우선순위, 검증</span></div>
  </div>
  <div class="fsi-grid-2">
    <div class="pick lab"><span class="k">LAB / 50분, 점심 후 13:00</span><span class="t">managed settings + 게이트웨이 그룹 정책</span><span class="d">정책을 배포하고, 우회가 안 되는지 직접 확인</span></div>
    <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">OS별 차이, 추론 프로필 선택, 쿼터, 게이트웨이 정책</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 강의 네 Part: 연결과 IAM 9분, 자격증명 8분, 모델 고정과 비용 태깅 10분, 정책 전달 13분
• 실습 50분은 점심 후 13:00
• 더 알아보기는 시간이 남거나 질문이 나올 때

오늘 Chapter 2는 네 Part로 진행합니다.
처음 연결과 IAM, 다음 자격증명, 그다음 모델 고정과 비용 태깅, 마지막으로 가장 긴 정책 전달입니다.
실습은 점심 뒤 13시에 50분 동안 managed settings와 게이트웨이 그룹 정책을 직접 배포해 보겠습니다.
:::

---
<!-- Slide 3: Why Bedrock (PDF p3, p4) -->
@type: content
@fit: off

## 금융권이 Bedrock을 고르는 이유
대신 claude.ai의 관리 콘솔, Analytics, 정책 서버가 없음

:::html
<div class="fsi c2-why">
  <div class="fsi-grid-2">
    <div class="rc"><b>01</b><span class="t">계정 경계 안의 추론</span><span class="d">처리 리전은 추론 프로필 범위를 따름 (global은 리전 밖 처리 가능)</span></div>
    <div class="rc"><b>02</b><span class="t">기존 통제의 재사용</span><span class="d"><span class="rp-detail" tabindex="0" data-tip="Identity and Access Management. AWS의 사용자와 권한 관리 서비스">IAM</span>, IAM Identity Center, CloudTrail, Organizations</span></div>
    <div class="rc"><b>03</b><span class="t">청구 일원화</span><span class="d">AWS 청구서와 Cost Explorer, Budgets로 관리</span></div>
    <div class="rc gap"><b>04</b><span class="t">빈자리는 직접 채움</span><span class="d">정책은 파일과 <span class="rp-detail" tabindex="0" data-tip="Mobile Device Management. 회사 단말에 설정과 파일을 배포하는 관리 도구">MDM</span>으로, 관측은 <span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span>(OpenTelemetry)로</span></div>
  </div>
  <p class="c2-lead">claude.ai의 관리 콘솔, Analytics, 정책 서버가 없는 자리를 무엇으로 채우는지, 그것이 이 챕터와 Ch6의 이야기입니다.</p>
</div>
:::

:::notes
{timing: 1.5min}
[요약]
• 계정 경계 안의 추론, 처리 리전은 추론 프로필 범위를 따름 (global은 리전 밖 처리 가능)
• IAM, Identity Center, CloudTrail, Organizations 같은 기존 통제 재사용
• AWS 청구서, Cost Explorer, Budgets로 청구 일원화
• 대신 관리 콘솔, Analytics, 정책 서버가 없어서 파일, MDM, OTel로 직접 채움

금융권 고객께서 Claude Code를 Bedrock으로 쓰시는 이유는 크게 세 가지입니다.
첫째, 추론이 내 AWS 계정 경계 안에서 일어납니다. 다만 처리 리전은 추론 프로필 범위를 따르고, global 프로필은 리전 밖에서 처리될 수 있습니다.
둘째, 이미 쓰고 계신 IAM, Identity Center, CloudTrail, Organizations를 그대로 씁니다. 셋째, 청구가 AWS 청구서 하나로 모입니다.
{cue: pause}
대신 잃는 것도 있습니다. claude.ai의 관리 콘솔, Analytics, 정책 서버가 없습니다. 그 빈자리를 정책은 파일과 MDM으로, 관측은 OTel로 채우는 것이 이 챕터와 Ch6의 내용입니다.

[약어]
• IAM: Identity and Access Management
• MDM: Mobile Device Management
• OTel: OpenTelemetry
:::

---
<!-- Slide 4: Part 01 divider (PDF p5) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 01</span>
  <div class="name">연결과 IAM</div>
  <p class="what">첫 세션까지의 최단 경로</p>
  <ol>
    <li><b>01</b>로그인 마법사</li>
    <li><b>02</b>수동 설정과 리전 결정 순서</li>
    <li><b>03</b>IAM 정책</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1은 첫 세션까지의 최단 경로
• 로그인 마법사, 수동 설정과 리전 결정 순서, IAM 정책

첫 번째 Part, 연결과 IAM입니다. Claude Code가 Bedrock을 처음 부르기까지 무엇이 필요한지 가장 짧은 경로로 보겠습니다.
개인 PC라면 마법사로, 대규모 배포라면 수동 설정으로 갑니다.
:::

---
<!-- Slide 5: /setup-bedrock wizard (PDF p6) -->
@type: content
@fit: off

## 개인 PC는 마법사 네 단계면 된다
/setup-bedrock 마법사, 대규모 배포는 수동 설정

:::html
<div id="c2-sv-setup"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var N = [
    {id:'p1',x:40,y:150,w:250,h:96,t:'플랫폼 선택',s:'3rd-party platform',c:'info'},
    {id:'p2',x:330,y:150,w:250,h:96,t:'인증 방식',s:'프로필, 키, 환경',c:'info'},
    {id:'p3',x:620,y:150,w:250,h:96,t:'리전, 모델',s:'호출 가능 모델 확인',c:'info'},
    {id:'p4',x:910,y:150,w:240,h:96,t:'저장',s:'user settings env',c:'success'}];
  var M = {id:'mn',x:330,y:340,w:540,h:84,t:'CI, 대량 배포는 수동 설정',s:'다음 슬라이드',c:'muted'};
  var Z = [{x:20,y:40,w:1140,h:410,l:'/SETUP-BEDROCK'}];
  var E = [{f:'p1',t:'p2',c:'info',o:0},{f:'p2',t:'p3',c:'info',o:1},{f:'p3',t:'p4',c:'success',o:2}];
  var cmds = ['/setup-bedrock   # 언제든 다시 실행','/status          # 적용된 리전 확인','/logout          # Bedrock에서는 없음'];
  F.stepviz('#c2-sv-setup', [
    {kicker:'OVERVIEW', title:'로그인 화면에서 네 단계',
     body:'로그인 화면에서 Amazon Bedrock을 고르면 <b>인증, 리전과 모델, 저장</b>까지 마법사가 이어 줍니다. 결과는 <b>user settings의 env 블록</b>에 남습니다.',
     facts:['개인 PC: 마법사','CI, 대량 배포: 수동 설정','언제든 /setup-bedrock으로 다시 실행'],
     zones:Z, nodes:N.concat([M]), hot:['p1','p2','p3','p4'], edges:E, loop:true, stagger:0.8,
     snip:{hd:'마법사와 함께 쓰는 명령',path:'Claude Code 프롬프트',lines:cmds,hl:[1,2,3],note:'Bedrock 경로에는 <b>/logout이 없습니다</b>. 자격증명은 AWS 쪽에서 관리하기 때문입니다.'}},
    {kicker:'STEP 1', title:'플랫폼을 고릅니다',
     body:'로그인 화면에서 <b>3rd-party platform</b>을 누르고 <b>Amazon Bedrock</b>을 선택합니다.',
     facts:['claude.ai 계정 로그인이 아님','Bedrock 경로로 들어가는 입구'],
     zones:Z, nodes:N.concat([M]), hot:['p1'], edges:[],
     snip:{hd:'로그인 화면',path:'예시 흐름',lines:['로그인 방식 선택','  3rd-party platform','    Amazon Bedrock'],hl:[2,3],note:'이후 단계는 고른 플랫폼에 맞춰 바뀝니다.'}},
    {kicker:'STEP 2', title:'인증 방식을 고릅니다',
     body:'<b>AWS 프로필, Bedrock API 키, 액세스 키, 환경 자격증명</b> 중에서 고릅니다. 무엇을 권하는지는 Part 2에서 봅니다.',
     facts:['네 가지 중 선택','금융권 권고: SSO 프로필 (Part 2)','장기 키는 비권장'],
     zones:Z, nodes:N.concat([M]), hot:['p2'], edges:[E[0]],
     snip:{hd:'고를 수 있는 인증 방식',path:'마법사 화면',lines:['AWS 프로필','Bedrock API 키','액세스 키','환경 자격증명'],hl:[1],note:'Part 2에서 다섯 가지 자격증명 방식과 권고를 비교합니다.'}},
    {kicker:'STEP 3', title:'리전과 모델을 확인하고 고정합니다',
     body:'<b>호출 가능한 모델을 확인</b>하고 고정합니다. 모델을 고정하지 않으면 생기는 일은 Part 3의 퀴즈에서 봅니다.',
     facts:['호출 가능한 모델 확인','모델 고정 (Part 3)','리전은 /status로 확인'],
     zones:Z, nodes:N.concat([M]), hot:['p3'], edges:[E[1]],
     snip:{hd:'확인 명령',path:'Claude Code 프롬프트',lines:['/status   # 적용된 리전 확인'],hl:[1],note:'리전이 어디서 정해졌는지는 다음 슬라이드의 <b>리전 결정 순서</b>를 봅니다.'}},
    {kicker:'STEP 4', title:'user settings의 env 블록에 저장합니다',
     body:'마법사는 결과를 <b>user settings의 env 블록</b>에 기록합니다. 개인 설정이라 회사 정책으로는 Part 4의 managed settings를 씁니다.',
     facts:['저장 위치: user settings env','개인 PC 기준','회사 배포는 managed settings (Part 4)'],
     zones:Z, nodes:N.concat([M]), hot:['p4','mn'], edges:[E[2],{f:'p4',t:'mn',c:'muted',dash:true}],
     snip:{hd:'저장 위치',path:'~/.claude/settings.json',lines:['{','  "env": {','    "CLAUDE_CODE_USE_BEDROCK": "1"','  }','}','','# 마법사가 고른 값이 env에 들어감 (예시)'],hl:[2,3],note:'CI와 대량 배포는 마법사 대신 <b>수동 설정</b>을 씁니다.'}}
  ], {legend:[['info','마법사 단계'],['success','저장'],['muted','다른 경로']]});
});
:::

:::notes
{timing: 2min}
[요약]
• /setup-bedrock: 플랫폼 선택, 인증 방식, 리전과 모델, 저장의 네 단계
• 결과는 user settings의 env 블록에 기록
• /setup-bedrock은 언제든 다시 실행, /status로 리전 확인, Bedrock에는 /logout 없음
• CI와 대량 배포는 수동 설정

{cue: demo}
개인 PC라면 마법사가 가장 빠릅니다. 단계별로 보겠습니다.
로그인 화면에서 3rd-party platform, Amazon Bedrock을 고르고, 인증 방식을 고릅니다. AWS 프로필, Bedrock API 키, 액세스 키, 환경 자격증명 네 가지입니다.
그다음 호출 가능한 모델을 확인해 고정하고, 결과를 user settings의 env 블록에 저장합니다.
마법사는 언제든 /setup-bedrock으로 다시 돌릴 수 있고, /status로 적용된 리전을 확인합니다. Bedrock 경로에는 /logout이 없다는 점도 기억해 주세요.
CI나 대량 배포는 마법사 대신 수동 설정을 씁니다. 바로 다음 슬라이드입니다.
:::

---
<!-- Slide 6: Manual setup and region order (PDF p7) -->
@type: content
@fit: off

## 환경변수 두 개면 연결된다
수동 설정과 리전 결정 순서

:::html
<div class="fsi fsi-split c2-region" id="c2-region">
  <div class="fsi-stack">
    <pre class="c2-code"><span class="c"># Bedrock 사용</span>
<span class="on">export CLAUDE_CODE_USE_BEDROCK=1</span>
<span class="c"># 프로필에 리전이 없을 때만 (서울 리전 예시)</span>
<span class="on">export AWS_REGION=ap-northeast-2</span>
<span class="c"># 사내 엔드포인트, 게이트웨이를 쓸 때</span>
<span class="c"># export ANTHROPIC_BEDROCK_BASE_URL=https://...</span></pre>
    <p class="c2-cap">~/.zshrc 또는 settings.json의 env에 둡니다.</p>
    <div class="c2-res"><span class="k">이번 세션의 리전</span><span class="v" id="c2-region-v">ap-northeast-2</span><span class="s" id="c2-region-s">1. AWS_REGION</span></div>
    <button class="btn btn-primary c2-cyc" data-cycle>다음 경우 보기</button>
  </div>
  <div class="fsi-stack c2-order" id="c2-region-rows">
    <p class="c2-cap">리전 결정 순서 (위가 먼저). 줄을 눌러 값을 넣고 빼 보세요. 값은 예시입니다.</p>
    <button class="c2-row" data-k="r1"><b>1</b><span class="n">AWS_REGION</span><span class="x">ap-northeast-2</span></button>
    <button class="c2-row" data-k="r2"><b>2</b><span class="n">AWS_DEFAULT_REGION</span><span class="x">us-west-2</span></button>
    <button class="c2-row" data-k="r3"><b>3</b><span class="n">활성 프로필의 region</span><span class="x">us-east-1</span></button>
    <div class="c2-row fixed" data-k="r4"><b>4</b><span class="n">기본값</span><span class="x">us-east-1</span></div>
    <p class="c2-cap">/status에서 리전이 어디서 왔는지 출처까지 확인합니다.</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var rows = Array.prototype.slice.call(document.querySelectorAll('#c2-region-rows .c2-row'));
  var on = { r1: false, r2: false, r3: false };
  var names = { r1: '1. AWS_REGION', r2: '2. AWS_DEFAULT_REGION', r3: '3. 활성 프로필의 region', r4: '4. 기본값' };
  function render() {
    var win = ['r1','r2','r3'].filter(function (k) { return on[k]; })[0] || 'r4';
    rows.forEach(function (r) {
      var k = r.dataset.k;
      r.classList.toggle('set', k === 'r4' || !!on[k]);
      r.classList.toggle('win', k === win);
    });
    var w = rows.filter(function (r) { return r.dataset.k === win; })[0];
    document.getElementById('c2-region-v').textContent = w.querySelector('.x').textContent;
    document.getElementById('c2-region-s').textContent = names[win];
  }
  rows.forEach(function (r) { if (r.dataset.k !== 'r4') r.addEventListener('click', function () { on[r.dataset.k] = !on[r.dataset.k]; render(); }); });
  var scen = [{ r1: true, r2: true, r3: true }, { r2: true, r3: true }, { r3: true }, {}];
  F.cycle('#c2-region', scen.length, function (i) { on = { r1: !!scen[i].r1, r2: !!scen[i].r2, r3: !!scen[i].r3 }; render(); });
});
:::

:::notes
{timing: 2min}
[요약]
• 수동 설정은 CLAUDE_CODE_USE_BEDROCK=1과 AWS_REGION 두 개
• AWS_REGION은 프로필에 리전이 없을 때만, 사내 엔드포인트는 ANTHROPIC_BEDROCK_BASE_URL
• 리전 결정 순서: AWS_REGION, AWS_DEFAULT_REGION, 활성 프로필의 region, 기본 us-east-1
• /status에서 출처까지 확인

수동 설정은 환경변수 두 개면 됩니다. CLAUDE_CODE_USE_BEDROCK=1, 그리고 프로필에 리전이 없을 때 AWS_REGION입니다. 사내 엔드포인트나 게이트웨이를 쓰면 ANTHROPIC_BEDROCK_BASE_URL을 추가합니다.
{cue: demo}
헷갈리는 건 리전이 어디서 정해지느냐입니다. 오른쪽 순서는 위가 먼저입니다. AWS_REGION, AWS_DEFAULT_REGION, 활성 프로필의 region, 그리고 마지막이 기본값 us-east-1입니다.
버튼이나 아래 화살표로 위에서부터 하나씩 빼 보겠습니다. 세 값이 다 있으면 1번 AWS_REGION이 이기고, AWS_REGION을 빼면 2번 AWS_DEFAULT_REGION, 그것도 빼면 3번 프로필의 region, 아무것도 없으면 4번 기본값 us-east-1입니다.
실제 환경에서는 /status에서 리전과 그 출처를 꼭 확인해 주세요.
:::

---
<!-- Slide 7: IAM policy (PDF p8) -->
@type: content
@fit: off

## IAM 권한은 호출, 조회, Marketplace
claude-code-bedrock-policy.json, 호출 2개 + 프로필 조회 2개 + Marketplace

:::html
<div class="fsi fsi-split wide-left c2-iam">
  <pre class="c2-code" id="c2-iam-code"><span data-l="1">{ "Statement": [</span>
<span data-l="2">  { "Effect": "Allow",</span>
<span data-l="3">    "Action": [</span>
<span data-l="4">      "bedrock:InvokeModel",</span>
<span data-l="5">      "bedrock:InvokeModelWithResponseStream",</span>
<span data-l="6">      "bedrock:GetInferenceProfile" ],</span>
<span data-l="7">    "Resource": [</span>
<span data-l="8">      "arn:aws:bedrock:*:*:inference-profile/*",</span>
<span data-l="9">      "arn:aws:bedrock:*:*:application-inference-profile/*",</span>
<span data-l="10">      "arn:aws:bedrock:*:*:foundation-model/*" ] },</span>
<span data-l="11">  { "Effect": "Allow",</span>
<span data-l="12">    "Action": "bedrock:ListInferenceProfiles",</span>
<span data-l="13">    "Resource": "*" } ] }</span>
<span data-l="14" class="c">// + aws-marketplace:ViewSubscriptions, Subscribe</span>
<span data-l="15" class="c">//   (Condition aws:CalledViaLast = bedrock.amazonaws.com)</span></pre>
  <div class="fsi-stack">
    <div class="fsi-stack" data-pick="c2-iam">
      <button class="pick" data-key="invoke"><span class="k">호출 2</span><span class="t">InvokeModel, 스트림</span></button>
      <button class="pick" data-key="profile"><span class="k">조회 2</span><span class="t">List, GetInferenceProfile</span></button>
      <button class="pick" data-key="res"><span class="k">Resource</span><span class="t">허용할 ARN으로 좁히기</span></button>
      <button class="pick" data-key="mkt"><span class="k">Marketplace</span><span class="t">구독 확인과 구독</span></button>
    </div>
    <div class="panel" data-pick-panel="c2-iam">
      <p class="hint">항목을 누르면 왼쪽 정책에서 해당 줄이 켜집니다.</p>
      <div data-for="invoke"><p>모델 호출 권한입니다. <b>예전 자료에는 이 두 개만</b> 적힌 경우가 많습니다.</p></div>
      <div data-for="profile"><p>inference profile 조회 권한입니다. GetInferenceProfile은 호출과 같은 Resource에, <b>ListInferenceProfiles는 별도 Statement에서 Resource "*"</b>로 둡니다. <b>GetInferenceProfile이 없으면 새 모델마다 한 번 추가 왕복</b>이 생깁니다.</p></div>
      <div data-for="res"><p>예시는 와일드카드입니다. 실제로는 <b>허용할 profile <span class="rp-detail" tabindex="0" data-tip="Amazon Resource Name. AWS 리소스를 가리키는 고유 식별자">ARN</span>으로 좁히고</b>, Claude Code 전용 AWS 계정을 권합니다.</p></div>
      <div data-for="mkt"><p>aws-marketplace:ViewSubscriptions, Subscribe를 Condition <code>aws:CalledViaLast = bedrock.amazonaws.com</code>으로 묶어 추가합니다.</p></div>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var lines = Array.prototype.slice.call(document.querySelectorAll('#c2-iam-code [data-l]'));
  var map = { invoke: [4,5], profile: [6,12,13], res: [7,8,9,10], mkt: [14,15] };
  F.pick('c2-iam', { onShow: function (key) {
    var hl = map[key] || [];
    lines.forEach(function (l) { l.classList.toggle('on', hl.indexOf(+l.dataset.l) >= 0); l.classList.toggle('dim', !!key && hl.indexOf(+l.dataset.l) < 0); });
  }});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 필요한 권한: 호출 2개(InvokeModel, InvokeModelWithResponseStream) + 프로필 조회 2개 + Marketplace
• GetInferenceProfile이 없으면 새 모델마다 한 번 추가 왕복, ListInferenceProfiles는 별도 Statement에 Resource "*"
• Resource는 허용할 profile ARN으로 좁히고, Claude Code 전용 AWS 계정 권장
• Marketplace 권한은 aws:CalledViaLast 조건으로 Bedrock 경유일 때만

{cue: demo}
IAM 정책입니다. 오른쪽 항목을 하나씩 눌러 보겠습니다.
첫째, 호출 권한 두 개, InvokeModel과 스트리밍 호출입니다. 예전 자료에는 이 두 개만 적힌 경우가 많은데요.
둘째, inference profile 조회 권한 두 개가 더 필요합니다. GetInferenceProfile은 호출과 같은 Resource에 두고, ListInferenceProfiles는 별도 Statement에서 Resource를 별표로 둡니다. GetInferenceProfile이 빠지면 새 모델마다 한 번씩 추가 왕복이 생깁니다.
셋째, Resource는 예시처럼 와일드카드로 두지 말고 허용할 profile ARN으로 좁혀 주세요. Claude Code 전용 AWS 계정을 두는 것도 권합니다.
마지막으로 Marketplace 구독 확인과 구독 권한을, Bedrock을 거쳐 호출될 때만 허용하는 조건과 함께 추가합니다.

[약어]
• ARN: Amazon Resource Name, AWS 리소스 식별자
:::

---
<!-- Slide 8: Air-gapped network (PDF p9) -->
@type: content
@fit: off

## 인터넷 없이 Bedrock만 열려 있다면
망분리 환경에서 먼저 확인할 여덟 가지

:::html
<div class="fsi fsi-split c2-air">
  <div class="fsi-grid-2 c2-picks" data-pick="c2-air">
    <button class="pick" data-key="ep"><span class="k">모델 호출</span><span class="t">VPC 엔드포인트</span></button>
    <button class="pick" data-key="sso"><span class="k">SSO 로그인</span><span class="t">Identity Center, STS</span></button>
    <button class="pick" data-key="proxy"><span class="k">사내 프록시</span><span class="t">HTTPS_PROXY</span></button>
    <button class="pick" data-key="ca"><span class="k">사내 인증서</span><span class="t">NODE_EXTRA_CA_CERTS</span></button>
    <button class="pick" data-key="off"><span class="k">외부 통신 끄기</span><span class="t">NONESSENTIAL_TRAFFIC</span></button>
    <button class="pick" data-key="upd"><span class="k">설치와 업데이트</span><span class="t">사내 배포</span></button>
    <button class="pick" data-key="plg"><span class="k">플러그인</span><span class="t">사내 git 마켓플레이스</span></button>
    <button class="pick" data-key="web"><span class="k">웹 접근</span><span class="t">WebFetch 제한</span></button>
  </div>
  <div class="panel" data-pick-panel="c2-air">
    <p class="hint">항목을 누르면 설정과 참고 사항이 나옵니다.</p>
    <div data-for="ep"><h4>Bedrock Runtime VPC 엔드포인트</h4><p>PrivateLink로 <b>인터넷 없이 계정 안에서 추론</b>합니다. <span class="rp-detail" tabindex="0" data-tip="Virtual Private Cloud. AWS 안에 만든 격리된 사설 네트워크">VPC</span> 엔드포인트는 이 사설 네트워크 안에서 AWS 서비스로 가는 입구입니다.</p></div>
    <div data-for="sso"><h4>IAM Identity Center 포털, OIDC, STS 엔드포인트</h4><p>SSO 로그인은 Identity Center 포털, <span class="rp-detail" tabindex="0" data-tip="OpenID Connect. 로그인 결과를 토큰으로 넘겨주는 표준 인증 방식">OIDC</span>, <span class="rp-detail" tabindex="0" data-tip="Security Token Service. 짧게 쓰는 임시 AWS 자격증명을 발급하는 서비스">STS</span> 엔드포인트에 닿아야 합니다. <b>aws sso login이 되는지 먼저 확인</b>합니다.</p></div>
    <div data-for="proxy"><h4>HTTPS_PROXY, NO_PROXY</h4><p>사내 프록시를 거쳐야 하는 경우에 설정합니다.</p></div>
    <div data-for="ca"><h4>NODE_EXTRA_CA_CERTS</h4><p>프록시가 <span class="rp-detail" tabindex="0" data-tip="Transport Layer Security. HTTPS 암호화 통신 규약">TLS</span>를 다시 서명할 때 사내 인증서를 지정합니다.</p></div>
    <div data-for="off"><h4>CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1</h4><p>자동 업데이트, 오류 리포트 등 외부 통신을 <b>한 번에</b> 끕니다.</p></div>
    <div data-for="upd"><h4>사내 배포 + DISABLE_AUTOUPDATER=1</h4><p>버전을 정해 단말에 배포합니다.</p></div>
    <div data-for="plg"><h4>사내 git 마켓플레이스, seed 디렉터리</h4><p>플러그인도 사내에서 받습니다. <span class="tag info">Ch5</span>에서 실습합니다.</p></div>
    <div data-for="web"><h4>WebFetch를 deny 또는 허용 도메인만</h4><p>Bedrock에는 WebSearch가 없습니다 (Ch1).</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c2-air', { start: 0 }); });
:::

:::notes
{timing: 2min}
[요약]
• 모델 호출: Bedrock Runtime VPC 엔드포인트(PrivateLink)
• 사내 프록시 HTTPS_PROXY, NO_PROXY, 사내 인증서 NODE_EXTRA_CA_CERTS
• 외부 통신 끄기 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1, 업데이트는 사내 배포와 DISABLE_AUTOUPDATER=1
• 플러그인은 사내 git 마켓플레이스(Ch5), WebFetch는 deny 또는 허용 도메인만

망분리 환경, 그러니까 인터넷 없이 Bedrock만 열린 환경에서 먼저 확인할 것들입니다.
{cue: demo}
모델 호출은 Bedrock Runtime VPC 엔드포인트, PrivateLink로 계정 안에서 끝납니다. 사내 프록시를 거친다면 HTTPS_PROXY와 NO_PROXY, 프록시가 TLS를 다시 서명한다면 NODE_EXTRA_CA_CERTS로 사내 인증서를 지정합니다.
자동 업데이트와 오류 리포트 같은 외부 통신은 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC 하나로 한 번에 끕니다. 설치와 업데이트는 버전을 정해 사내에서 배포하고, 플러그인은 사내 git 마켓플레이스로 받습니다.
웹 접근은 WebFetch를 막거나 허용 도메인만 엽니다.

[약어]
• TLS: Transport Layer Security
• VPC: Virtual Private Cloud
:::

---
<!-- Slide 9: Part 02 divider (PDF p10) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 02</span>
  <div class="name">자격증명</div>
  <p class="what">키를 배포하지 않는다는 원칙</p>
  <ol>
    <li><b>01</b>다섯 가지 방식</li>
    <li><b>02</b>SSO 자동 갱신</li>
    <li><b>03</b>권고안</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2는 키를 배포하지 않는다는 원칙
• 다섯 가지 방식, SSO 자동 갱신, 권고안

두 번째 Part, 자격증명입니다. 원칙은 하나, 개발자에게 장기 키를 나눠 주지 않는다는 것입니다.
다섯 가지 방식을 비교하고, 권장 방식인 SSO의 자동 갱신을 단계별로 보겠습니다.
:::

---
<!-- Slide 10: Five credential methods (PDF p11) -->
@type: content
@fit: off

## 다섯 가지 중 권장은 하나
Bedrock API 키만 AWS SDK 기본 체인을 거치지 않음

:::html
<div class="fsi c2-cred">
  <div class="c2-cred-rows" data-pick="c2-cred">
    <button class="pick" data-key="cli"><span class="t">AWS CLI 설정</span><code>aws configure</code><span class="tag no">비권장 (장기 키 디스크 저장)</span></button>
    <button class="pick" data-key="key"><span class="t">액세스 키 환경변수</span><code>AWS_ACCESS_KEY_ID 등</code><span class="tag no">비권장 (장기 키)</span></button>
    <button class="pick rec" data-key="sso"><span class="t">SSO 프로필</span><code>aws sso login + AWS_PROFILE</code><span class="tag ok">권장</span></button>
    <button class="pick" data-key="con"><span class="t">콘솔 자격증명</span><code>aws login</code><span class="tag cond">보조 수단</span></button>
    <button class="pick" data-key="api"><span class="t">Bedrock API 키</span><code>AWS_BEARER_TOKEN_BEDROCK</code><span class="tag no">비권장 (장기 키)</span></button>
  </div>
  <div class="panel" data-pick-panel="c2-cred">
    <p class="hint">방식을 누르면 금융권 권고의 이유가 나옵니다.</p>
    <div data-for="cli"><p><b>비권장</b>입니다. 장기 액세스 키를 디스크에 저장합니다.</p></div>
    <div data-for="key"><p>장기 키를 단말에 두는 방식이라 <b>비권장</b>입니다.</p></div>
    <div data-for="sso"><p><b>권장</b>입니다. <span class="rp-detail" tabindex="0" data-tip="Single Sign-On. 회사 계정 한 번 로그인으로 여러 서비스에 접근하는 방식">SSO</span> 로그인으로 짧은 수명의 자격증명을 받습니다.</p><p>만료되면 다음 슬라이드의 자동 갱신으로 이어 갑니다.</p></div>
    <div data-for="con"><p><b>보조 수단</b>입니다.</p></div>
    <div data-for="api"><p>Bedrock API 키도 장기 키라 <b>비권장</b>입니다. 다섯 가지 중 <b>이 방식만 AWS SDK 기본 체인을 거치지 않습니다</b>.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c2-cred', { start: 2 }); });
:::

:::notes
{timing: 1.5min}
[요약]
• Claude Code는 AWS SDK 기본 자격증명 체인을 그대로 따름
• 권장: SSO 프로필(aws sso login + AWS_PROFILE)
• 비권장: 액세스 키 환경변수, Bedrock API 키 (장기 키)
• AWS CLI 설정은 장기 액세스 키를 디스크에 저장해 비권장, 콘솔 자격증명은 보조 수단
• Bedrock API 키만 AWS SDK 기본 체인을 거치지 않음

자격증명 방식은 다섯 가지이고, 이 중 Bedrock API 키만 AWS SDK 기본 체인을 거치지 않습니다.
{cue: demo}
하나씩 보면, aws configure는 장기 액세스 키를 디스크에 저장하니 비권장, 액세스 키 환경변수와 Bedrock API 키도 장기 키라 비권장, aws login 콘솔 자격증명은 보조 수단입니다.
금융권 권장은 SSO 프로필 하나입니다. aws sso login으로 받은 짧은 수명의 자격증명을 AWS_PROFILE로 씁니다.

[약어]
• SSO: Single Sign-On
:::

---
<!-- Slide 11: SSO auto refresh (PDF p12, p32) -->
@type: content
@fit: off

## 만료되면 Claude Code가 대신 로그인한다
SSO 자동 갱신, awsAuthRefresh와 awsCredentialExport

:::html
<div id="c2-sv-sso"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:760,h:430,l:'개발자 PC'},{x:810,y:30,w:350,h:430,l:'AWS',tone:'info'}];
  var CC = {id:'cc',x:50,y:80,w:300,h:92,t:'Claude Code',s:'Bedrock 호출 전 확인',c:'accent'};
  var CA = {id:'ca',x:50,y:330,w:300,h:92,t:'메모리 캐시',s:'만료 5분 전까지',c:'info'};
  var RF = {id:'rf',x:440,y:80,w:310,h:92,t:'awsAuthRefresh',s:'만료됐을 때만 실행',c:'warning'};
  var AW = {id:'aw',x:440,y:330,w:310,h:92,t:'~/.aws 자격증명',s:'SSO 프로필',c:'info'};
  var ST = {id:'st',x:840,y:80,w:290,h:92,t:'GetCallerIdentity',s:'실제 만료 여부 확인',c:'info'};
  var IC = {id:'ic',x:840,y:330,w:290,h:92,t:'IAM Identity Center',s:'브라우저 SSO 로그인',c:'info'};
  var EX = {id:'ex',x:440,y:80,w:310,h:92,t:'awsCredentialExport',s:'세션 시작마다 실행',c:'warning'};
  var cfg = ['{','  "awsAuthRefresh": "aws sso login --profile myprofile",','  "env": {','    "AWS_PROFILE": "myprofile"','  }','}'];
  F.stepviz('#c2-sv-sso', [
    {kicker:'STEP 1', title:'세션 시작: SDK 체인으로 찾습니다',
     body:'Claude Code는 <b>AWS SDK 기본 체인</b>으로 자격증명을 찾고, <b>만료 5분 전까지 메모리에 캐시</b>합니다. 체인 해석에는 <b>60초 타임아웃</b>이 있습니다.',
     facts:['AWS SDK 기본 체인','만료 5분 전까지 메모리 캐시','체인 해석 60초 타임아웃'],
     zones:Z, nodes:[CC,CA,RF,AW,ST,IC], hot:['cc','aw','ca'],
     edges:[{f:'cc',t:'aw',c:'info',l:'체인 해석',o:0},{f:'aw',t:'ca',c:'info',l:'캐시',o:1},{f:'ca',t:'cc',c:'info',o:2}],
     loop:true, stagger:0.8,
     snip:{hd:'설정 한 장',path:'~/.claude/settings.json',lines:cfg,hl:[4],note:'AWS_PROFILE로 <b>SSO 프로필</b>을 가리킵니다.'}},
    {kicker:'STEP 2', title:'만료되면 로그인 명령을 대신 실행',
     body:'만료를 <b>GetCallerIdentity</b>로 확인하면 <b>awsAuthRefresh</b> 명령을 실행합니다. 브라우저 SSO 로그인이 끝나면 <b>세션이 그대로 이어집니다</b>.',
     facts:['awsAuthRefresh: 만료됐을 때만 실행','.aws를 갱신하는 명령을 넣음','키를 나눠 줄 필요가 없음'],
     zones:Z, nodes:[CC,CA,RF,AW,ST,IC], hot:['cc','rf','st','ic','aw'],
     edges:[{f:'cc',t:'st',c:'info',side:'h',curve:-70,l:'만료 확인',o:0},{f:'cc',t:'rf',c:'warning',l:'만료 시',o:1},{f:'rf',t:'ic',c:'warning',l:'브라우저 SSO',o:2},{f:'ic',t:'aw',c:'info',l:'갱신',o:3},{f:'aw',t:'cc',c:'info',o:4}],
     loop:true, stagger:0.6,
     snip:{hd:'설정 한 장',path:'~/.claude/settings.json',lines:cfg,hl:[2],note:'<b>aws sso login</b>을 Claude Code가 대신 실행합니다.'}},
    {kicker:'STEP 3', title:'교차 계정이면 awsCredentialExport',
     body:'<b>awsCredentialExport</b>는 세션 시작마다 실행되고, 자격증명을 <b>JSON으로 출력</b>하는 명령을 넣습니다. 교차 계정용입니다.',
     facts:['awsCredentialExport: 세션 시작마다 실행','JSON으로 자격증명 출력','awsAuthRefresh와 쓰임이 다름'],
     zones:Z, nodes:[CC,CA,EX,AW,ST,IC], hot:['cc','ex'],
     edges:[{f:'ex',t:'cc',c:'warning',l:'JSON 자격증명',o:0}],
     loop:true,
     snip:{hd:'두 설정의 차이',path:'settings.json 키',lines:['awsAuthRefresh       # 만료됐을 때만, .aws 갱신','awsCredentialExport  # 세션 시작마다, JSON 출력'],hl:[1,2],note:'같은 계정은 awsAuthRefresh, <b>교차 계정</b>은 awsCredentialExport입니다.'}},
    {kicker:'STEP 4', title:'막힐 때 보는 곳',
     body:'프록시와 TLS 검사 환경도 지원합니다. 로그인 탭이 <b>끝없이 열린다면 awsAuthRefresh를 제거</b>하고 원인을 봅니다.',
     facts:['HTTPS_PROXY: 프록시 경유 지원','TLS 검사 프록시: OS 인증서 저장소 사용','무한 로그인 탭: awsAuthRefresh 제거'],
     zones:Z, nodes:[CC,CA,{id:'rf',x:440,y:80,w:310,h:92,t:'awsAuthRefresh',s:'무한 로그인 탭이면 제거',c:'danger'},AW,ST,IC], hot:['rf','cc'],
     edges:[{f:'cc',t:'rf',c:'danger',l:'반복 실행',o:0},{f:'rf',t:'cc',c:'danger',curve:60,o:1}],
     loop:true, stagger:0.6,
     snip:{hd:'Identity Center와 함께',path:'~/.claude/settings.json 또는 managed (예시)',lines:['{','  "awsAuthRefresh": "aws sso login --profile corp-dev",','  "env": {','    "CLAUDE_CODE_USE_BEDROCK": "1",','    "AWS_PROFILE": "corp-dev",','    "AWS_REGION": "us-east-1"','  }','}'],hl:[2,5],note:'Identity Center <b>권한 세트로 Bedrock 최소 권한</b>을 줍니다.'}}
  ], {legend:[['accent','Claude Code'],['info','자격증명 흐름'],['warning','갱신 명령'],['danger','문제 상황']]});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 자격증명은 만료 5분 전까지 메모리 캐시, 체인 해석 60초 타임아웃
• awsAuthRefresh: 만료됐을 때만 실행, aws sso login 같은 .aws 갱신 명령
• awsCredentialExport: 세션 시작마다 실행, JSON 출력, 교차 계정용
• 프록시 경유, TLS 검사 프록시 지원, 무한 로그인 탭이면 awsAuthRefresh 제거

{cue: demo}
SSO를 쓰면 자격증명이 만료되는 게 문제인데요, Claude Code가 대신 로그인해 줍니다. 단계별로 보겠습니다.
첫째, 세션 시작에 SDK 체인으로 자격증명을 찾고 만료 5분 전까지 캐시합니다.
둘째, 만료되면 GetCallerIdentity로 확인하고 awsAuthRefresh에 넣은 aws sso login을 실행합니다. 브라우저에서 로그인하면 세션이 그대로 이어집니다.
셋째, 교차 계정이라면 awsCredentialExport를 씁니다. 세션 시작마다 실행되고 자격증명을 JSON으로 내놓습니다.
넷째, 로그인 탭이 계속 열린다면 awsAuthRefresh를 빼고 원인을 보시면 됩니다.

[약어]
• TLS: Transport Layer Security
:::

---
<!-- Slide 12: Principle (PDF p13) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">PRINCIPLE</span>
  <div class="big"><em>장기 키</em>는 배포하지 않습니다</div>
  <p class="lead">SSO 프로필 + awsAuthRefresh가 기본, 사용자별 추적은 Ch6에서 다룹니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 장기 키는 배포하지 않음
• SSO 프로필 + awsAuthRefresh가 기본
• 사용자별 추적은 Ch6

{cue: pause}
Part 2를 한 문장으로 정리하면, 장기 키는 배포하지 않습니다.
SSO 프로필과 awsAuthRefresh가 기본이고, 누가 얼마나 썼는지 사용자별로 추적하는 건 Ch6에서 다룹니다.
:::

---
<!-- Slide 13: Part 03 divider (PDF p14) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 03</span>
  <div class="name">모델 고정과 비용 태깅</div>
  <p class="what">언제 새 모델로 갈지는 우리가 정한다</p>
  <ol>
    <li><b>01</b>기본 모델의 함정</li>
    <li><b>02</b>ANTHROPIC_DEFAULT_*</li>
    <li><b>03</b>Application inference profile</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 3은 언제 새 모델로 갈지 회사가 정하는 방법
• 기본 모델의 함정, ANTHROPIC_DEFAULT_*, Application inference profile

세 번째 Part, 모델 고정과 비용 태깅입니다. 새 모델이 나왔을 때 언제 넘어갈지는 회사가 정해야 합니다.
먼저 퀴즈로 기본 모델의 함정부터 보겠습니다.
:::

---
<!-- Slide 14: Quick check 1 (PDF p15) -->
@type: content
@fit: off

## 고정하지 않으면 무엇이 도는가?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c2-qc-1">
  <p class="q">모델을 고정하지 않은 Bedrock 배포에서 기본 주 모델은?</p>
  <div class="opts">
    <button class="opt"><b>A</b>Sonnet 4.5</button>
    <button class="opt right"><b>B</b>Opus 5.5</button>
    <button class="opt"><b>C</b>Haiku 5.5</button>
    <button class="opt"><b>D</b>Sonnet 5.5</button>
  </div>
  <p class="ans">정답 B. 고정하지 않으면 Opus 단가로 청구됩니다. (amazon-bedrock 문서)</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c2-qc-1'); });
:::

:::notes
{timing: 1min}
{cue: poll}
[요약]
• 정답 B, Opus 5.5
• 고정하지 않으면 Opus 단가로 청구
• 그래서 여러 사용자에게 배포할 때는 반드시 고정

퀴즈입니다. 모델을 고정하지 않은 Bedrock 배포에서 기본 주 모델은 무엇일까요? 손을 들어 주세요.
{cue: pause}
정답은 B, Opus 5.5입니다. 고정하지 않으면 모든 사용자가 Opus 단가로 청구됩니다. 그래서 다음 슬라이드처럼 반드시 고정합니다.

[출처]
• code.claude.com/docs amazon-bedrock 문서
:::

---
<!-- Slide 15: Model version pinning (PDF p16) -->
@type: content
@fit: off

## 여러 사용자에게 배포하면 반드시 고정
ANTHROPIC_DEFAULT_*와 리전에 따른 prefix 규칙

:::html
<div class="fsi fsi-split wide-left c2-pin">
  <div class="fsi-stack">
    <pre class="c2-code"><span class="c"># managed settings env, 이 랩: us-east-1, global 프로필</span>
<span class="on">ANTHROPIC_DEFAULT_OPUS_MODEL=<i class="c2-pfx">global.</i>anthropic.claude-opus-5-5</span>
<span class="on">ANTHROPIC_DEFAULT_SONNET_MODEL=<i class="c2-pfx">global.</i>anthropic.claude-sonnet-5-5</span>
<span class="on">ANTHROPIC_DEFAULT_HAIKU_MODEL=<i class="c2-pfx">global.</i>anthropic.claude-haiku-5-5</span>

<span class="c"># 고정 대신 prefix만 바꾸기</span>
<span>ANTHROPIC_BEDROCK_REGION_PREFIX=global</span></pre>
    <p class="c2-cap">허용값: us, eu, apac, jp, au, global. 계정에 있는 profile ID로 채웁니다.</p>
  </div>
  <div class="fsi-stack">
    <p class="c2-cap">리전을 고르면 prefix가 바뀝니다.</p>
    <div class="fsi-grid-2" data-pick="c2-pfx">
      <button class="pick" data-key="us"><span class="k">us-*</span><span class="t">us.</span></button>
      <button class="pick" data-key="eu"><span class="k">eu-*</span><span class="t">eu.</span></button>
      <button class="pick" data-key="apac"><span class="k">ap-* (서울 포함)</span><span class="t">apac.</span></button>
      <button class="pick" data-key="global"><span class="k">그 외</span><span class="t">global.</span></button>
    </div>
    <div class="panel" data-pick-panel="c2-pfx">
      <p class="hint">이 랩은 us-east-1에서 global 프로필을 씁니다.<br>리전 그룹을 고르면 왼쪽 prefix가 바뀝니다.<br>바뀐 ID는 예시이며, 실제 값은 계정에 있는 profile ID로 확인합니다.</p>
      <div data-for="us"><p>us-로 시작하는 리전은 <b>us.</b> 프로필을 씁니다.</p></div>
      <div data-for="eu"><p>eu-로 시작하는 리전은 <b>eu.</b> 프로필을 씁니다.</p></div>
      <div data-for="apac"><p>서울(ap-northeast-2)을 포함한 ap- 리전은 <b>apac.</b> 프로필을 씁니다.</p></div>
      <div data-for="global"><p>그 밖의 리전은 <b>global.</b> 프로필을 씁니다.</p></div>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var p = Array.prototype.slice.call(document.querySelectorAll('.slide-deck .c2-pin .c2-pfx'));
  F.pick('c2-pfx', { onShow: function (key) { p.forEach(function (x) { x.textContent = (key || 'global') + '.'; x.classList.toggle('flash', !!key); }); } });
});
:::

:::notes
{timing: 2min}
[요약]
• 여러 사용자 배포는 ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL로 반드시 고정
• 고정 대신 ANTHROPIC_BEDROCK_REGION_PREFIX로 prefix만 바꾸는 방법도 있음
• prefix 규칙: us-*는 us., eu-*는 eu., ap-*(서울 포함)는 apac., 그 외는 global.
• 허용값 us, eu, apac, jp, au, global, 계정에 있는 profile ID로 채움

여러 사용자에게 배포할 때는 managed settings의 env에서 세 가지 모델을 반드시 고정합니다. ANTHROPIC_DEFAULT_OPUS, SONNET, HAIKU_MODEL입니다.
{cue: demo}
모델 ID 앞의 prefix는 리전에 따라 달라집니다. 오른쪽에서 골라 보면, us 리전은 us., eu 리전은 eu., 서울을 포함한 ap 리전은 apac., 그 밖은 global.입니다.
모델을 하나하나 고정하는 대신 ANTHROPIC_BEDROCK_REGION_PREFIX로 prefix만 바꾸는 방법도 있습니다. 어느 쪽이든 실제 값은 고객님 계정에 있는 profile ID로 채워 주세요.
:::

---
<!-- Slide 16: Team cost tagging (PDF p17, p30) -->
@type: content
@fit: off

## 팀별 비용은 프로필 ARN이 가른다
Application inference profile로 경로와 비용 경계를 고정

:::html
<div id="c2-sv-tag"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:1140,h:200,l:'AWS 계정'},{x:20,y:260,w:1140,h:200,l:'정책과 사용'}];
  var CLI = {id:'cli',x:50,y:90,w:330,h:96,t:'create-inference-profile',s:'--tags team, costcenter',c:'warning'};
  var AP = {id:'ap',x:440,y:90,w:320,h:96,t:'Application profile',s:'sonnet-team-a, 태그 포함',c:'info'};
  var BS = {id:'bs',x:820,y:90,w:310,h:96,t:'원본 프로필',s:'global...claude-sonnet-5-5',c:'muted'};
  var MS = {id:'ms',x:50,y:320,w:330,h:96,t:'managed-settings.json',s:'modelOverrides',c:'accent'};
  var MD = {id:'md',x:440,y:320,w:320,h:96,t:'/model 선택',s:'이 ARN으로 라우팅',c:'accent'};
  var CE = {id:'ce',x:820,y:320,w:310,h:96,t:'Cost Explorer',s:'팀별 비용',c:'success'};
  var ALL = [CLI,AP,BS,MS,MD,CE];
  F.stepviz('#c2-sv-tag', [
    {kicker:'STEP 1', title:'팀마다 프로필을 하나 만듭니다',
     body:'원본 프로필을 <b>copyFrom</b>으로 복사해 팀 이름과 <b>태그</b>를 단 Application inference profile을 만듭니다.',
     facts:['원본 프로필을 그대로 따름','태그: team, costcenter','팀마다 프로필 하나'],
     zones:Z, nodes:ALL, hot:['cli','ap','bs'],
     edges:[{f:'cli',t:'ap',c:'warning',o:0},{f:'bs',t:'ap',c:'muted',o:1}],
     snip:{hd:'프로필 만들기',path:'Terminal',lines:['aws bedrock \\','  create-inference-profile \\','  --inference-profile-name \\','    sonnet-team-a \\','  --model-source copyFrom=\\','arn:aws:bedrock:us-east-1:','<ACCOUNT>:inference-profile/','global.anthropic.claude-sonnet-5-5 \\','  --tags key=team,value=team-a \\','    key=costcenter,value=1234'],hl:[3,4,5,6,7,8,9,10],note:'ARN은 화면 폭 때문에 나눠 적었습니다. 실제로는 한 줄입니다. 만든 ARN을 다음 단계에서 managed settings에 연결합니다.'}},
    {kicker:'STEP 2', title:'ARN을 modelOverrides에 연결합니다',
     body:'<b>modelOverrides</b>로 모델 이름을 팀 프로필 ARN에 묶습니다. <b>/model 선택도 이 ARN으로 라우팅</b>되고, availableModels로 선택지를 제한합니다.',
     facts:['/model 선택도 ARN으로 라우팅','ARN으로 고정하면 새 버전 제안이 뜨지 않음'],
     zones:Z, nodes:ALL, hot:['ap','ms','md'],
     edges:[{f:'ap',t:'ms',c:'info',l:'ARN',o:0},{f:'ms',t:'md',c:'accent',o:1},{f:'md',t:'ap',c:'accent',l:'호출',o:2}],
     loop:true, stagger:0.8,
     snip:{hd:'팀 A의 정책',path:'managed-settings.json',lines:['"modelOverrides": {','  "claude-opus-5-5":','    "arn:aws:bedrock:us-east-1:','     <ACCOUNT>:','     application-inference-profile/','     <opus-id>",','  "claude-sonnet-5-5":','    "arn:aws:bedrock:us-east-1:','     <ACCOUNT>:','     application-inference-profile/','     <sonnet-id>"','},','"availableModels": ["opus", "sonnet"]'],hl:[1,13],note:'ARN은 실제로는 한 줄입니다. <b>managed settings로 배포</b>합니다.'}},
    {kicker:'STEP 3', title:'태그가 Cost Explorer에서 팀을 가릅니다',
     body:'프로필의 태그로 <b>Cost Explorer에서 팀별 비용</b>을 봅니다. 단, 태그는 <b>Billing에서 비용 할당 태그로 활성화</b>해야 보입니다.',
     facts:['Billing에서 비용 할당 태그 활성화','팀마다 프로필 하나 = 비용, 쿼터, 로그 경계','IAM에서 프로필 ARN 단위로 허용 가능'],
     zones:Z, nodes:ALL, hot:['ap','ce','md'],
     edges:[{f:'md',t:'ap',c:'accent',o:0},{f:'ap',t:'ce',c:'success',l:'태그별 집계',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'놓치기 쉬운 것',path:'Billing',lines:['# 태그는 만든다고 바로 보이지 않음','비용 할당 태그로 활성화','  team','  costcenter'],hl:[2,3,4],note:'활성화하지 않으면 Cost Explorer에서 <b>팀별로 나뉘지 않습니다</b>.'}}
  ], {legend:[['warning','만들기'],['info','프로필'],['accent','정책과 선택'],['success','비용 보기']]});
});
:::

:::notes
{timing: 3min}
[요약]
• 팀마다 Application inference profile을 하나 만들고 태그(team, costcenter)를 닮
• modelOverrides로 모델 이름을 팀 프로필 ARN에 묶어 managed settings로 배포
• /model 선택도 ARN으로 라우팅, ARN 고정은 업데이트 제안에서 제외, availableModels로 선택지 제한
• 태그는 Billing에서 비용 할당 태그로 활성화해야 Cost Explorer에 보임
• 팀마다 프로필 하나가 비용, 쿼터, 로그의 경계

{cue: demo}
팀별로 비용을 나누는 방법입니다. 세 단계로 보겠습니다.
첫째, 원본 프로필을 copyFrom으로 복사해 팀 A용 Application inference profile을 만들고 team, costcenter 태그를 답니다.
둘째, 그 ARN을 managed settings의 modelOverrides에 연결합니다. 사용자가 /model에서 고르는 모델도 이 ARN으로 라우팅되고, availableModels로 고를 수 있는 모델 자체를 제한합니다.
셋째, 태그로 Cost Explorer에서 팀별 비용을 봅니다. 여기서 자주 놓치시는 게, Billing에서 비용 할당 태그로 활성화해야 보인다는 점입니다.
팀마다 프로필 하나가 비용, 쿼터, 로그의 경계가 되고, IAM에서도 이 ARN 단위로 허용할 수 있습니다.

[약어]
• ARN: Amazon Resource Name
:::

---
<!-- Slide 17: Settings that change cost and speed (PDF p18) -->
@type: content
@fit: off

## 모델 말고도 청구서를 바꾸는 세 설정
서비스 티어, 1M 컨텍스트, 프롬프트 캐시

:::html
<div class="fsi c2-knobs">
  <div class="fsi-grid-3" data-pick="c2-knob">
    <button class="pick" data-key="tier"><span class="k">SERVICE TIER</span><span class="t">default, flex, priority</span><span class="d">비용과 지연을 맞바꿈</span></button>
    <button class="pick" data-key="ctx"><span class="k">CONTEXT</span><span class="t">1M 컨텍스트</span><span class="d">긴 컨텍스트 = 큰 요청</span></button>
    <button class="pick" data-key="cache"><span class="k">CACHE</span><span class="t">Prompt caching</span><span class="d">기본 5분 TTL</span></button>
  </div>
  <div class="panel" data-pick-panel="c2-knob">
    <p class="hint">설정을 누르면 키와 주의할 점이 나옵니다.</p>
    <div data-for="tier"><h4>ANTHROPIC_BEDROCK_SERVICE_TIER</h4><p>default, flex, priority 중에서 골라 <b>비용과 지연을 맞바꿉니다</b>. 모델과 리전마다 지원이 다릅니다.</p></div>
    <div data-for="ctx"><h4>[1m] 접미사</h4><p><b>[1m] 접미사는 4.6 모델만</b> 씁니다. <b>Sonnet 5+, Opus 4.7+는 기본 1M</b>입니다. 긴 컨텍스트는 곧 큰 요청입니다.</p></div>
    <div data-for="cache"><h4>Prompt caching</h4><p>기본 5분 <span class="rp-detail" tabindex="0" data-tip="Time To Live. 캐시가 유지되는 시간">TTL</span>입니다. <b>ENABLE_PROMPT_CACHING_1H는 더 비쌉니다</b>. 리전과 모델별 지원을 확인합니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c2-knob', { start: 0 }); });
:::

:::notes
{timing: 1.5min}
[요약]
• 서비스 티어: ANTHROPIC_BEDROCK_SERVICE_TIER로 default, flex, priority, 비용과 지연 맞바꿈
• 1M 컨텍스트: [1m] 접미사는 4.6 모델만, Sonnet 5+와 Opus 4.7+는 기본 1M, 긴 컨텍스트는 큰 요청
• 프롬프트 캐시: 기본 5분 TTL, ENABLE_PROMPT_CACHING_1H는 더 비쌈
• 모두 모델, 리전별 지원 확인

모델 말고도 청구서를 바꾸는 설정이 세 가지 있습니다.
{cue: demo}
서비스 티어는 default, flex, priority 중에 골라 비용과 지연을 맞바꿉니다. 1M 컨텍스트는 4.6 모델에서만 [1m] 접미사를 붙이고, Sonnet 5 이상과 Opus 4.7 이상은 기본이 1M입니다. 긴 요청이 곧 큰 비용이 됩니다.
프롬프트 캐시는 기본 5분 TTL이고, 1시간 캐시는 더 비쌉니다. 세 가지 모두 모델과 리전마다 지원이 다르니 확인하고 쓰셔야 합니다.

[약어]
• TTL: Time To Live
:::

---
<!-- Slide 18: Part 04 divider (PDF p19) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 04</span>
  <div class="name">정책 전달</div>
  <p class="what">사용자가 되돌릴 수 없는 정책</p>
  <ol>
    <li><b>01</b>Bedrock에서 쓸 수 있는 채널</li>
    <li><b>02</b>managed-settings.json</li>
    <li><b>03</b>적용 검증</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 4는 사용자가 되돌릴 수 없는 정책
• 채널, managed-settings.json, 적용 검증 순서

마지막 Part, 정책 전달입니다. 네 Part 중 가장 긴 Part이고, 오후 랩에서 그대로 배포해 볼 내용입니다.
핵심은 사용자가 되돌릴 수 없는 정책을 어떻게 단말에 내려보내느냐입니다.
:::

---
<!-- Slide 19: Policy delivery channels (PDF p20, p23, p33) -->
@type: content
@fit: off

## 콘솔 대신 파일과 MDM으로 닿는다
Bedrock에서 정책이 도달하는 길과 병합 규칙

:::html
<div id="c2-sv-deliver"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:440,h:430,l:'관리자'},{x:500,y:30,w:660,h:430,l:'개발자 PC'}];
  var SV = {id:'sv',x:50,y:80,w:380,h:90,t:'Server-managed settings',s:'claude.ai 콘솔',c:'muted'};
  var MD = {id:'md',x:50,y:210,w:380,h:90,t:'MDM',s:'macOS plist, Windows 레지스트리',c:'accent'};
  var DT = {id:'dt',x:50,y:340,w:380,h:90,t:'배포 도구로 파일 복사',s:'Ansible, SSM, 이미지 등',c:'accent'};
  var MS = {id:'ms',x:530,y:120,w:330,h:96,t:'managed-settings.json',s:'OS별 고정 경로',c:'danger'};
  var DD = {id:'dd',x:530,y:320,w:330,h:96,t:'managed-settings.d/',s:'*.json 조각, 이름순 병합',c:'danger'};
  var CC = {id:'cc',x:900,y:210,w:240,h:96,t:'Claude Code',s:'최종 설정',c:'ink'};
  var ALL = [SV,MD,DT,MS,DD,CC];
  F.stepviz('#c2-sv-deliver', [
    {kicker:'OVERVIEW', title:'세 갈래 중 두 갈래만 열려 있습니다',
     body:'claude.ai 콘솔의 <b>Server-managed settings는 Bedrock에서 쓸 수 없습니다</b>. 대신 <b>파일과 MDM</b>으로 정책을 내려보냅니다.',
     facts:['쓸 수 없음: 서버 관리 설정','쓸 수 있음: OS별 정책 파일','쓸 수 있음: MDM (plist, 레지스트리)'],
     zones:Z, nodes:ALL, hot:['md','dt','ms','dd','cc'],
     edges:[{f:'sv',t:'cc',c:'muted',dash:true,curve:-80},{f:'md',t:'cc',c:'accent',side:'h',curve:-30,o:0},{f:'dt',t:'ms',c:'accent',o:1},{f:'ms',t:'cc',c:'danger',o:2},{f:'dd',t:'cc',c:'danger',o:3}],
     loop:true, stagger:0.6,
     snip:{hd:'정책이 닿는 곳',path:'Bedrock 경로',lines:['# 쓸 수 없음','Server-managed settings (claude.ai 콘솔)','','# 쓸 수 있음','managed-settings.json (OS별 경로)','MDM: macOS plist, Windows 레지스트리'],hl:[5,6],note:'점선은 Bedrock 경로에서 쓸 수 없는 길입니다.'}},
    {kicker:'CLOSED', title:'서버 관리 설정은 왜 안 되나',
     body:'Server-managed settings는 <b>Team, Enterprise 조직</b>이 필요하고, <b>ANTHROPIC_BASE_URL이 비공식 호스트면 꺼집니다</b>.',
     facts:['claude.ai Team, Enterprise 조직 필요','ANTHROPIC_BASE_URL이 비공식 호스트면 꺼짐','그래서 Bedrock에서는 파일, MDM'],
     zones:Z, nodes:ALL, hot:['sv'],
     edges:[{f:'sv',t:'cc',c:'muted',dash:true,curve:-80}],
     snip:{hd:'쓸 수 없는 이유',path:'Server-managed settings',lines:['Team, Enterprise 조직이 필요','ANTHROPIC_BASE_URL이 비공식 호스트면 꺼짐'],hl:[1,2],note:'콘솔이 없는 자리를 <b>파일로 채웁니다</b>.'}},
    {kicker:'FILE', title:'OS마다 정해진 경로가 있습니다',
     body:'관리자 권한이 있어야 쓰는 <b>OS별 고정 경로</b>에 managed-settings.json을 둡니다. 이 랩은 Linux 경로를 씁니다.',
     facts:['macOS: Jamf, Intune 등 MDM','Linux, WSL: 이 랩의 경로','Windows: Intune, GPO'],
     zones:Z, nodes:ALL, hot:['dt','ms','cc'],
     edges:[{f:'dt',t:'ms',c:'accent',o:0},{f:'ms',t:'cc',c:'danger',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'OS별 정책 파일',path:'managed-settings.json',lines:['# macOS','/Library/Application Support/ClaudeCode/','# Linux, WSL (이 랩)','/etc/claude-code/','# Windows','C:\\Program Files\\ClaudeCode\\'],hl:[2,4,6],note:'파일 이름은 모두 <b>managed-settings.json</b>입니다.'}},
    {kicker:'MDM', title:'MDM은 OS 정책 그대로 씁니다',
     body:'macOS는 <b>plist</b>, Windows는 <b>레지스트리</b>로 MDM이 같은 정책을 내려보냅니다.',
     facts:['macOS: plist','Windows: 레지스트리','단말 관리 체계를 그대로 재사용'],
     zones:Z, nodes:ALL, hot:['md','cc'],
     edges:[{f:'md',t:'cc',c:'accent',side:'h',curve:-30,o:0}],
     loop:true,
     snip:{hd:'MDM 채널',path:'OS 정책',lines:['macOS    plist','Windows  레지스트리'],hl:[1,2],note:'배포 도구는 OS마다 다릅니다. 더 알아보기의 OS별 표를 봅니다.'}},
    {kicker:'DROP-IN', title:'팀별 조각은 옆 디렉터리에',
     body:'파일 옆 <b>managed-settings.d/</b>에 조각을 두면 <b>이름순으로 병합</b>됩니다. 하나의 파일을 여러 팀이 고치지 않아도 됩니다.',
     facts:['보안팀, 플랫폼팀이 각자 관리','*.json 조각, 이름순 병합','하나의 파일을 함께 고치지 않음'],
     zones:Z, nodes:ALL, hot:['dd','ms','cc'],
     edges:[{f:'dd',t:'ms',c:'danger',l:'병합',o:0},{f:'ms',t:'cc',c:'danger',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'조각 배치 (예시)',path:'/etc/claude-code/',lines:['managed-settings.json','managed-settings.d/','  10-security.json   # 보안팀','  20-platform.json   # 플랫폼팀'],hl:[2,3,4],note:'파일 이름은 예시이고, <b>이름순</b>으로 합쳐집니다.'}},
    {kicker:'ONE SOURCE', title:'기본은 한 소스만, merge로 합침',
     body:'managed 소스가 여럿이면 기본은 <b>서버, MDM, 파일 순으로 먼저 정책을 주는 소스 하나만</b> 적용합니다. <b>managedSourcesBehavior를 "merge"</b>로 두면 모두 합칩니다.',
     facts:['기본: 먼저 정책을 주는 소스 하나','순서: 서버, MDM, 파일','"merge": 모든 managed 소스 합침'],
     zones:Z, nodes:ALL, hot:['md','ms','cc'],
     edges:[{f:'md',t:'cc',c:'accent',side:'h',curve:-30,o:0},{f:'ms',t:'cc',c:'danger',dash:true}],
     snip:{hd:'병합 동작',path:'managed settings',lines:['# 기본: 한 소스만 (서버, MDM, 파일 순)','','"managedSourcesBehavior": "merge"','# 모든 managed 소스를 합침'],hl:[3],note:'팀별 조각은 managed-settings.d/ drop-in으로 나눕니다.'}}
  ], {legend:[['accent','배포 채널'],['danger','사용자가 못 바꾸는 파일'],['ink','적용 결과'],['muted','Bedrock에서 쓸 수 없음']]});
});
:::

:::notes
{timing: 3min}
[요약]
• Server-managed settings(claude.ai 콘솔)는 Team, Enterprise 조직 필요, ANTHROPIC_BASE_URL이 비공식 호스트면 꺼짐
• 파일: macOS /Library/Application Support/ClaudeCode/, Linux와 WSL /etc/claude-code/, Windows C:\Program Files\ClaudeCode\
• MDM: macOS plist, Windows 레지스트리
• managed-settings.d/ drop-in 조각은 이름순 병합
• managed 소스가 여럿이면 기본은 서버, MDM, 파일 순으로 하나만, managedSourcesBehavior "merge"로 모두 합침

{cue: demo}
정책이 단말에 닿는 길을 단계별로 보겠습니다.
claude.ai 콘솔의 서버 관리 설정은 Bedrock에서 쓸 수 없습니다. Team, Enterprise 조직이 필요하고, 비공식 호스트를 쓰면 꺼지기 때문입니다.
대신 OS마다 정해진 경로에 managed-settings.json을 두거나, MDM으로 plist와 레지스트리를 내려보냅니다.
여러 팀이 정책을 나눠 관리한다면 파일 옆 managed-settings.d 디렉터리에 조각을 두시면 이름순으로 합쳐집니다.
마지막으로 주의할 점, managed 소스가 여럿이면 기본은 하나만 적용됩니다. 모두 합치려면 managedSourcesBehavior를 merge로 둡니다.
:::

---
<!-- Slide 20: Settings precedence (PDF p21) -->
@type: content
@fit: off

## 같은 키가 충돌하면 위가 이긴다
설정 우선순위 다섯 층, 값을 넣어 보며 확인

:::html
<div class="fsi fsi-split wide-left c2-prec" id="c2-prec">
  <div class="fsi-stack c2-layers" id="c2-prec-rows">
    <button class="c2-row" data-k="managed"><b>1</b><span class="n">Managed</span><span class="w">파일, MDM. 사용자가 덮어쓸 수 없음</span><code>managed-settings.json</code><span class="x">sonnet</span></button>
    <button class="c2-row" data-k="cli"><b>2</b><span class="n">CLI 인자</span><span class="w">이번 세션에만 적용</span><code>--settings</code><span class="x">haiku</span></button>
    <button class="c2-row" data-k="local"><b>3</b><span class="n">Local</span><span class="w">개인, 커밋하지 않음</span><code>.claude/settings.local.json</code><span class="x">opus</span></button>
    <button class="c2-row" data-k="project"><b>4</b><span class="n">Project</span><span class="w">팀 공유, 저장소에 커밋</span><code>.claude/settings.json</code><span class="x">sonnet</span></button>
    <button class="c2-row" data-k="user"><b>5</b><span class="n">User</span><span class="w">내 PC의 모든 프로젝트</span><code>~/.claude/settings.json</code><span class="x">opus</span></button>
  </div>
  <div class="fsi-stack">
    <div class="c2-res big"><span class="k">이번 세션의 모델 (예시 키)</span><span class="v" id="c2-prec-v">sonnet</span><span class="s" id="c2-prec-s">1. Managed가 이김</span></div>
    <button class="btn btn-primary c2-cyc" data-cycle>다음 경우 보기</button>
    <p class="c2-cap">줄을 눌러 그 층에 값을 넣고 빼 보세요. 오른쪽 값은 설명용 예시입니다.</p>
    <p class="c2-cap" id="c2-prec-note"></p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var order = ['managed','cli','local','project','user'];
  var label = { managed:'1. Managed', cli:'2. CLI 인자', local:'3. Local', project:'4. Project', user:'5. User' };
  var rows = Array.prototype.slice.call(document.querySelectorAll('#c2-prec-rows .c2-row'));
  var on = {};
  var notes = ['다섯 층에 모두 값이 있으면 Managed가 이깁니다. 아래 어떤 층도 덮어쓰지 못합니다.','Managed가 없으면 이번 세션의 CLI 인자가 이깁니다.','CLI 인자도 없으면 개인의 Local이 이깁니다.','Local도 없으면 팀이 커밋한 Project가 이깁니다.','개인 설정만 남으면 User 값이 쓰입니다.'];
  var cur = 0;
  function render() {
    var win = order.filter(function (k) { return on[k]; })[0];
    rows.forEach(function (r) { r.classList.toggle('set', !!on[r.dataset.k]); r.classList.toggle('win', r.dataset.k === win); });
    var w = rows.filter(function (r) { return r.dataset.k === win; })[0];
    document.getElementById('c2-prec-v').textContent = w ? w.querySelector('.x').textContent : '기본값';
    document.getElementById('c2-prec-s').textContent = win ? label[win] + '가 이김' : '어느 층에도 값 없음';
  }
  rows.forEach(function (r) { r.addEventListener('click', function () { on[r.dataset.k] = !on[r.dataset.k]; document.getElementById('c2-prec-note').textContent = ''; render(); }); });
  var scen = [{ managed: 1, cli: 1, local: 1, project: 1, user: 1 }, { cli: 1, local: 1, project: 1, user: 1 }, { local: 1, project: 1, user: 1 }, { project: 1, user: 1 }, { user: 1 }];
  F.cycle('#c2-prec', scen.length, function (i) { cur = i; on = {}; for (var k in scen[i]) on[k] = true; document.getElementById('c2-prec-note').textContent = notes[i]; render(); });
});
:::

:::notes
{timing: 2min}
[요약]
• 다섯 층: Managed, CLI 인자, Local, Project, User
• 같은 키가 충돌하면 위가 이김
• Managed는 파일, MDM으로 배포되고 사용자가 덮어쓸 수 없음
• CLI 인자는 이번 세션에만, Local은 개인 미커밋, Project는 팀 공유, User는 내 PC 전체

{cue: demo}
설정은 다섯 층에서 올 수 있고, 같은 키가 충돌하면 위가 이깁니다. 다섯 층에 모두 값을 넣고 위에서부터 하나씩 빼 보겠습니다.
처음에는 1번 Managed가 이깁니다. 관리자가 Managed에 값을 두면 아래 어떤 층도 덮어쓰지 못하고, 이것이 사용자가 되돌릴 수 없는 정책의 원리입니다.
Managed를 빼면 2번 CLI 인자, 그것도 빼면 3번 Local, 그다음 4번 팀이 커밋한 Project, 마지막에 5번 User 값이 쓰입니다.
화면의 모델 값은 설명용 예시입니다.
:::

---
<!-- Slide 21: managed-settings.json example (PDF p22) -->
@type: content
@fit: off

## Lab에서 배포할 정책 한 장
managed-settings.json 예시, 줄마다 담은 뜻

:::html
<div class="fsi fsi-split wide-left c2-ms">
  <div class="fsi-stack">
    <p class="c2-cap">/etc/claude-code/managed-settings.json</p>
    <pre class="c2-code" id="c2-ms-code"><span data-l="1">{</span>
<span data-l="2">  "availableModels": ["sonnet", "haiku"],</span>
<span data-l="3">  "enforceAvailableModels": true,</span>
<span data-l="4">  "env": { "ANTHROPIC_MODEL": "sonnet" },</span>
<span data-l="5">  "cleanupPeriodDays": 14,</span>
<span data-l="6">  "permissions": {</span>
<span data-l="7">    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"],</span>
<span data-l="8">    "disableBypassPermissionsMode": "disable"</span>
<span data-l="9">  }</span>
<span data-l="10">}</span></pre>
  </div>
  <div class="fsi-stack">
    <div class="fsi-stack c2-ms-items" data-pick="c2-ms">
      <button class="pick" data-key="list"><span class="t">/model 선택지를 Sonnet, Haiku로 제한</span></button>
      <button class="pick" data-key="enf"><span class="t">--model opus처럼 목록 밖 지정도 대체</span></button>
      <button class="pick" data-key="def"><span class="t">기본 모델을 Sonnet으로 고정</span></button>
      <button class="pick" data-key="ret"><span class="t">로컬 세션 보존 14일</span></button>
      <button class="pick" data-key="deny"><span class="t">비밀 파일 읽기 금지</span></button>
      <button class="pick" data-key="byp"><span class="t">권한 우회 모드 잠금</span></button>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var lines = Array.prototype.slice.call(document.querySelectorAll('#c2-ms-code [data-l]'));
  var map = { list: [2], enf: [3], def: [4], ret: [5], deny: [6,7], byp: [8] };
  F.pick('c2-ms', { onShow: function (key) {
    var hl = map[key] || [];
    lines.forEach(function (l) { l.classList.toggle('on', hl.indexOf(+l.dataset.l) >= 0); l.classList.toggle('dim', !!key && hl.indexOf(+l.dataset.l) < 0); });
  }});
});
:::

:::notes
{timing: 2min}
[요약]
• availableModels로 /model 선택지를 Sonnet, Haiku로 제한
• enforceAvailableModels로 --model opus처럼 목록 밖 지정도 대체
• env의 ANTHROPIC_MODEL로 기본 모델 Sonnet 고정, cleanupPeriodDays 14로 로컬 세션 보존 14일
• permissions.deny로 .env, secrets 읽기 금지, disableBypassPermissionsMode로 우회 모드 잠금

오후 랩에서 그대로 배포할 정책 한 장입니다. 오른쪽 항목을 누르면 해당 줄이 켜집니다.
{cue: demo}
availableModels는 /model에서 고를 수 있는 모델을 Sonnet과 Haiku로 제한하고, enforceAvailableModels는 --model opus처럼 목록 밖을 지정해도 대체합니다.
env의 ANTHROPIC_MODEL로 기본 모델을 Sonnet으로 고정하고, cleanupPeriodDays 14로 로컬 세션을 14일만 남깁니다.
permissions.deny로 .env와 secrets 아래 파일 읽기를 막고, disableBypassPermissionsMode로 모든 확인을 건너뛰는 모드를 잠급니다.
:::

---
<!-- Slide 22: Quick check 2 (PDF p24) -->
@type: content
@fit: off

## JSON이 깨지면 어떻게 될까?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c2-qc-2">
  <p class="q">managed-settings.json에 JSON 문법 오류가 있으면?</p>
  <div class="opts">
    <button class="opt"><b>A</b>무시하고 실행</button>
    <button class="opt"><b>B</b>해당 키만 무시</button>
    <button class="opt right"><b>C</b>시작을 거부</button>
    <button class="opt"><b>D</b>기본값으로 실행</button>
  </div>
  <p class="ans">정답 C. 파싱 실패 시 파일 이름과 함께 오류를 내고 시작하지 않습니다. 개별 키 오류는 그 키만 무시합니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c2-qc-2'); });
:::

:::notes
{timing: 1min}
{cue: poll}
[요약]
• 정답 C, 시작을 거부
• 파싱 실패 시 파일 이름과 함께 오류
• 개별 키 오류는 그 키만 무시

퀴즈입니다. managed-settings.json에 JSON 문법 오류가 있으면 Claude Code는 어떻게 할까요?
{cue: pause}
정답은 C, 시작을 거부합니다. 파일 이름과 함께 오류를 내고 시작하지 않습니다. 반면 JSON은 맞는데 개별 키가 잘못됐다면 그 키만 무시합니다. 랩 TASK 04에서 직접 확인해 보겠습니다.
:::

---
<!-- Slide 23: Verification (PDF p25) -->
@type: content
@fit: off

## 배포했다고 끝이 아니다
적용 검증 4단계

:::html
<div class="fsi c2-verify">
  <div class="fsi-grid-4">
    <div class="rc"><b>1</b><span class="t">/status 확인</span><span class="d">Setting sources에 Enterprise managed settings가 보이는지</span></div>
    <div class="rc"><b>2</b><span class="t">덮어쓰기 실패 확인</span><span class="d">~/.claude/settings.json에서 같은 키를 바꿔도 적용되지 않는지</span></div>
    <div class="rc"><b>3</b><span class="t">모델 선택 확인</span><span class="d">/model에 허용한 모델만 보이는지</span></div>
    <div class="rc"><b>4</b><span class="t">차단 규칙 확인</span><span class="d">.env 읽기를 요청했을 때 거부되는지</span></div>
  </div>
</div>
:::

:::notes
{timing: 1.5min}
[요약]
• 1 /status의 Setting sources에 Enterprise managed settings
• 2 ~/.claude/settings.json에서 같은 키를 바꿔도 적용되지 않는지
• 3 /model에 허용한 모델만 보이는지
• 4 .env 읽기 요청이 거부되는지

정책은 배포했다고 끝이 아니라 적용됐는지 확인해야 합니다. 네 단계입니다.
{cue: demo}
첫째, /status의 Setting sources에 Enterprise managed settings가 보여야 합니다. 둘째, 개인 설정 파일에서 같은 키를 바꿔도 적용되지 않아야 합니다.
셋째, /model에 허용한 모델만 보여야 하고, 넷째, .env를 읽어 달라고 했을 때 거부돼야 합니다. 랩에서 이 네 가지를 그대로 해 봅니다.
:::

---
<!-- Slide 24: Cloud feature replacements (PDF p26) -->
@type: content
@fit: off

## 구독 기능이 없는 자리를 채우는 법
Bedrock에서 클라우드 기능 대체

:::html
<div class="fsi c2-repl">
  <div class="fsi-grid-3">
    <div class="rc"><b>CLOUD SESSION</b><span class="t">GitHub Actions, GitLab CI</span><span class="d"><span class="rp-detail" tabindex="0" data-tip="OpenID Connect. CI가 장기 키 없이 AWS 역할을 받는 인증 방식">OIDC</span>로 Bedrock 역할을 받아 PR 리뷰 자동화</span></div>
    <div class="rc"><b>SCHEDULE</b><span class="t">/loop</span><span class="d">Routines(클라우드 예약 작업, /schedule) 대신 세션 안 반복 실행</span></div>
    <div class="rc"><b>WEB</b><span class="t">WebFetch + 검색 MCP</span><span class="d">URL은 WebFetch로 읽고, 검색은 AgentCore Web Search 같은 <span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 외부 시스템을 Claude Code 도구로 붙이는 표준">MCP</span> 서버</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 클라우드 세션 대신 GitHub Actions, GitLab CI에서 OIDC로 Bedrock 역할을 받아 PR 리뷰 자동화
• Routines(클라우드 예약 작업, /schedule) 대신 세션 안 /loop
• 웹은 WebFetch로 URL 읽기, 검색은 AgentCore Web Search 같은 MCP 서버

Ch1에서 Bedrock에 없다고 말씀드린 구독 기능은 이렇게 채웁니다.
{cue: demo}
클라우드 세션 대신 GitHub Actions나 GitLab CI에서 OIDC로 Bedrock 역할을 받아 PR 리뷰를 자동화합니다. 예약 실행인 /schedule 대신 세션 안에서 /loop로 반복합니다.
웹은 URL은 WebFetch로 읽고, 검색은 AgentCore Web Search 같은 MCP 서버를 붙입니다.

[약어]
• OIDC: OpenID Connect
• MCP: Model Context Protocol
:::

---
<!-- Slide 25: Lab (PDF p27) -->
@type: content
@fit: off

## 50분 동안 정책을 배포하고 뚫어 본다
LAB, managed settings 배포와 게이트웨이 그룹 정책 (13:00 시작)

:::html
<div class="fsi fsi-lab c2-lab">
  <ol class="steps">
    <li><b>TASK 01</b><span>지금 연결 읽기: env, inference profile, 최소 IAM</span><em>Part 1, 3</em></li>
    <li><b>TASK 02</b><span>managed-settings.json 병합 배포 (모델 제한, 보존 기간, 차단 규칙)</span><em>Part 4</em></li>
    <li><b>TASK 03</b><span>개인 설정으로 우회 시도, 실패 확인</span><em>Part 4</em></li>
    <li><b>TASK 04</b><span>managed-settings.d drop-in과 깨진 JSON 동작</span><em>Part 4</em></li>
    <li><b>TASK 05</b><span>백업으로 원복</span><em>정리</em></li>
    <li><b>TASK 06</b><span>use_gateway, bob 로그인: 파일 없이도 그룹 정책으로 Opus 제외, use_bedrock_direct로 복귀</span><em>MORE</em></li>
  </ol>
  <p class="where">Hands-on Lab 포털에서 Chapter 2를 엽니다. 점심 후 13:00에 시작합니다. 게이트웨이 로그인은 Cognito device code로 하고, 배너에 Sonnet 5.5와 Cloud gateway가 함께 표시되는지 확인합니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 실습 50분, 점심 후 13:00 시작
• TASK 01부터 05: 연결 읽기, 정책 병합 배포, 우회 시도, drop-in과 깨진 JSON, 원복
• TASK 06: 게이트웨이 그룹 정책으로 파일 없이 Opus 제외

{cue: demo}
실습은 점심 후 13시에 50분 동안 진행합니다.
TASK 01에서 지금 연결 상태를 읽고, TASK 02에서 정책을 병합 배포하고, TASK 03에서 개인 설정으로 우회를 시도해 실패하는 걸 확인합니다.
TASK 04는 drop-in 조각과 깨진 JSON 동작, TASK 05는 백업으로 원복입니다.
마지막 TASK 06에서는 게이트웨이로 바꿔 bob 사용자로 로그인하면, Cognito device code로 로그인한 뒤 배너에 Sonnet 5.5와 Cloud gateway가 함께 표시되는지 확인합니다. 그러면 파일 없이도 그룹 정책으로 Opus가 빠지는 걸 봅니다. 이 차이는 더 알아보기 마지막 장에서 설명합니다.
:::

---
<!-- Slide 26: Deep dive divider (PDF p28) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / DEEP DIVE</span>
  <div class="name">더 알아보기</div>
  <p class="what">자주 받는 질문과 세부 설정</p>
  <ol>
    <li><b>01</b>OS별 차이</li>
    <li><b>02</b>추론 프로필 선택</li>
    <li><b>03</b>Bedrock 쿼터</li>
    <li><b>04</b>로컬 정책 vs 게이트웨이</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 시간이 남거나 질문이 나올 때 펼치는 더 알아보기
• OS별 차이, 추론 프로필 선택, 쿼터, 로컬 정책과 게이트웨이 정책

여기부터는 더 알아보기입니다. 시간이 남거나 질문이 나오면 펼칩니다.
Application inference profile 만들기, SSO 자동 갱신, OS별 정책 경로는 앞의 슬라이드에 합쳐 두었고, 여기서는 네 가지를 더 봅니다.
:::

---
<!-- Slide 27: OS differences (PDF p29) -->
@type: content
@fit: off

## 랩은 Linux, 회사는 macOS와 Windows
더 알아보기, OS별 차이 한눈에

:::html
<div class="fsi c2-os">
  <div class="fsi-grid-3" data-pick="c2-os">
    <button class="pick" data-key="mac"><span class="k">macOS</span><span class="t">회사 PC</span></button>
    <button class="pick" data-key="lnx"><span class="k">Linux, WSL2</span><span class="t">이 랩 (Amazon Linux 2023)</span></button>
    <button class="pick" data-key="win"><span class="k">Windows</span><span class="t">회사 PC</span></button>
  </div>
  <div class="panel" data-pick-panel="c2-os">
    <p class="hint">OS를 고르면 설치, 정책 파일, 배포 도구, 사용자 설정, 셸, 샌드박스가 나옵니다.</p>
    <div data-for="mac"><div class="c2-kv">
      <span>설치</span><code>curl … install.sh | bash</code>
      <span>정책 파일</span><code>/Library/Application Support/ClaudeCode/</code>
      <span>배포 도구</span><b>Jamf, Intune (MDM)</b>
      <span>사용자 설정</span><code>~/.claude/</code>
      <span>Bash 도구, 훅</span><b>기본 셸</b>
      <span>샌드박스</span><b>Seatbelt (내장)</b>
    </div></div>
    <div data-for="lnx"><div class="c2-kv">
      <span>설치</span><code>curl … install.sh | bash</code>
      <span>정책 파일</span><code>/etc/claude-code/</code>
      <span>배포 도구</span><b>Ansible, SSM, 이미지</b>
      <span>사용자 설정</span><code>~/.claude/</code>
      <span>Bash 도구, 훅</span><b>기본 셸</b>
      <span>샌드박스</span><b>bubblewrap + socat</b>
    </div></div>
    <div data-for="win"><div class="c2-kv">
      <span>설치</span><code>PowerShell: irm … install.ps1 | iex</code>
      <span>정책 파일</span><code>C:\Program Files\ClaudeCode\</code>
      <span>배포 도구</span><b>Intune, GPO, SCCM</b>
      <span>사용자 설정</span><code>%USERPROFILE%\.claude\</code>
      <span>Bash 도구, 훅</span><b>Git for Windows(Git Bash) 필요</b>
      <span>샌드박스</span><b>네이티브 미지원, WSL2 사용</b>
    </div></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c2-os', { start: 1 }); });
:::

:::notes
{timing: 1min}
[요약]
• 랩은 Amazon Linux 2023, 회사 PC는 대부분 macOS와 Windows
• 정책 파일: macOS /Library/Application Support/ClaudeCode/, Linux /etc/claude-code/, Windows C:\Program Files\ClaudeCode\
• 배포 도구: Jamf, Intune / Ansible, SSM, 이미지 / Intune, GPO, SCCM
• Windows는 Bash 도구와 훅에 Git for Windows 필요, 샌드박스는 WSL2

랩은 Amazon Linux 2023이지만 회사 PC는 대부분 macOS와 Windows입니다. OS를 골라 보겠습니다.
{cue: demo}
macOS는 정책 파일이 /Library/Application Support/ClaudeCode에 있고 Jamf나 Intune으로 배포하며 샌드박스는 Seatbelt가 내장입니다.
Linux는 /etc/claude-code이고, 샌드박스에 bubblewrap과 socat이 필요합니다.
Windows는 Program Files 아래에 두고 Intune, GPO, SCCM으로 배포합니다. Bash 도구와 훅을 쓰려면 Git for Windows가 필요하고, 샌드박스는 네이티브로 지원하지 않아 WSL2를 씁니다.
:::

---
<!-- Slide 28: Inference profile choice (PDF p31) -->
@type: content
@fit: off

## 용량과 데이터 위치, 무엇이 먼저인가
더 알아보기, 추론 프로필 선택

:::html
<div class="fsi fsi-split c2-prof">
  <div class="fsi-stack" data-pick="c2-prof">
    <button class="pick" data-key="g"><span class="k">global.*</span><span class="t">상용 리전 전체</span></button>
    <button class="pick" data-key="geo"><span class="k">us. / eu. / apac.*</span><span class="t">해당 지역 안</span></button>
    <button class="pick" data-key="one"><span class="k">단일 리전 모델 ID</span><span class="t">그 리전만</span></button>
    <button class="pick" data-key="app"><span class="k">Application profile</span><span class="t">원본 프로필을 그대로 따름</span></button>
  </div>
  <div class="panel" data-pick-panel="c2-prof">
    <p class="hint">선택지를 누르면 맞는 경우가 나옵니다.</p>
    <div data-for="g"><h4>용량 우선</h4><p>데이터 위치 제약이 없을 때 맞습니다.</p></div>
    <div data-for="geo"><h4>지역 내 처리 요건</h4><p>같은 지역 안에서만 처리해야 할 때 맞습니다.</p></div>
    <div data-for="one"><h4>엄격한 위치 요건</h4><p>처리 위치를 한 리전으로 고정합니다. <b>용량은 가장 작습니다</b>.</p></div>
    <div data-for="app"><h4>팀별 태그, 비용 분리</h4><p>라우팅 범위는 원본 프로필을 따르고, 태그로 팀별 비용을 나눕니다 (Part 3).</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c2-prof', { start: 0 }); });
:::

:::notes
{timing: 1min}
[요약]
• global.*: 상용 리전 전체, 용량 우선, 데이터 위치 제약 없음
• us./eu./apac.*: 해당 지역 안, 지역 내 처리 요건
• 단일 리전 모델 ID: 그 리전만, 엄격한 위치 요건, 용량은 가장 작음
• Application profile: 원본을 그대로 따르며 팀별 태그와 비용 분리

추론 프로필은 용량과 데이터 위치 중 무엇을 먼저 둘지로 고릅니다.
{cue: demo}
global은 상용 리전 전체로 라우팅돼 용량이 가장 넓고, 지역 프로필은 그 지역 안에서만, 단일 리전 ID는 그 리전에서만 처리되지만 용량은 가장 작습니다.
Application profile은 원본 프로필의 범위를 그대로 따르면서 팀별 비용을 나누는 용도입니다.
:::

---
<!-- Slide 29: Bedrock quota (PDF p34) -->
@type: content
@fit: off

## 동시 사용 급증은 미리 준비한다
더 알아보기, Bedrock 쿼터와 라이브 교육

:::html
<div class="fsi c2-quota">
  <div class="fsi-grid-3">
    <div class="rc"><b>QUOTA</b><span class="t"><span class="rp-detail" tabindex="0" data-tip="Tokens Per Minute, Requests Per Minute. 분당 토큰 수와 요청 수 한도">TPM, RPM</span></span><span class="d">모델, 리전, 프로필별 한도. Service Quotas에서 확인</span></div>
    <div class="rc"><b>LEAD TIME</b><span class="t">증액 요청</span><span class="d">교육, 온보딩 일정 전에 신청. 승인까지 시간이 걸림</span></div>
    <div class="rc"><b>SYMPTOM</b><span class="t">ThrottlingException</span><span class="d">Claude Code가 재시도하고, 체감은 느려짐으로 나타남</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• TPM, RPM은 모델, 리전, 프로필별 한도, Service Quotas에서 확인
• 교육과 온보딩 일정 전에 증액 요청, 승인까지 시간 소요
• 한도에 걸리면 ThrottlingException, Claude Code가 재시도해 느려짐으로 체감

교육이나 전사 온보딩처럼 동시에 많은 분이 쓰면 쿼터에 걸립니다.
{cue: demo}
TPM과 RPM은 모델, 리전, 프로필별로 따로 있고 Service Quotas에서 확인합니다. 증액은 승인까지 시간이 걸리니 일정 전에 미리 신청하세요.
한도에 걸리면 ThrottlingException이 나고 Claude Code가 재시도하기 때문에, 사용자는 오류보다 느려짐으로 느끼게 됩니다.

[약어]
• TPM, RPM: Tokens Per Minute, Requests Per Minute
:::

---
<!-- Slide 30: Local policy vs 게이트웨이 policy (PDF p35) -->
@type: content
@fit: off

## 두 층을 함께 써야 빈틈이 없다
더 알아보기, 로컬 정책 vs 게이트웨이 정책

:::html
<div id="c2-sv-gw"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:520,h:430,l:'개발자 PC (머신)'},{x:580,y:30,w:580,h:430,l:'서버 쪽',tone:'info'}];
  var MS = {id:'ms',x:50,y:80,w:460,h:96,t:'managed-settings',s:'deny, 훅, 샌드박스, 마켓플레이스 잠금',c:'danger'};
  var CC = {id:'cc',x:50,y:300,w:460,h:96,t:'Claude Code',s:'로컬에서 일어나는 일',c:'accent'};
  var GW = {id:'gw',x:620,y:80,w:500,h:96,t:'Claude Apps Gateway',s:'모델 허용 목록, 지출 한도, 사용자 식별',c:'info'};
  var IDP = {id:'idp',x:620,y:220,w:230,h:84,t:'IdP 그룹',s:'그룹별 정책',c:'info'};
  var BR = {id:'br',x:890,y:330,w:230,h:84,t:'Amazon Bedrock',s:'추론',c:'info'};
  var ALL = [MS,CC,GW,IDP,BR];
  F.stepviz('#c2-sv-gw', [
    {kicker:'MACHINE', title:'managed-settings는 머신을 통제합니다',
     body:'권한 deny, 훅, 샌드박스, 마켓플레이스 잠금처럼 <b>로컬에서 일어나는 일</b>을 통제하고, MDM으로 파일을 배포합니다. 단, <b>로컬 관리자 권한이 있으면 수정할 수 있습니다</b>.',
     facts:['로컬에서 일어나는 일을 통제','MDM으로 파일 배포','약점: 로컬 관리자 권한이면 수정 가능'],
     zones:Z, nodes:ALL, hot:['ms','cc'],
     edges:[{f:'ms',t:'cc',c:'danger',l:'적용',o:0}],
     loop:true,
     snip:{hd:'머신 층',path:'managed-settings.json',lines:['permissions.deny','hooks','sandbox','마켓플레이스 잠금'],hl:[1,2,3,4],note:'로컬 관리자 권한을 가진 사용자에게는 <b>이것만으로 충분하지 않습니다</b>.'}},
    {kicker:'SERVER', title:'게이트웨이는 요청마다 서버에서 강제합니다',
     body:'Claude Apps Gateway는 <b>IdP(회사 계정 인증 시스템) 그룹</b>에 따라 모델 허용 목록, 지출 한도, 사용자 식별을 <b>추론 요청 단위로 서버에서</b> 강제합니다. <b>forceLoginGatewayUrl</b>로 경로를 강제합니다.',
     facts:['모델 허용 목록, 지출 한도, 사용자 식별','추론 요청 단위로 서버에서 강제','forceLoginGatewayUrl로 경로 강제'],
     zones:Z, nodes:ALL, hot:['cc','gw','idp','br'],
     edges:[{f:'cc',t:'gw',c:'accent',l:'추론 요청',o:0},{f:'idp',t:'gw',c:'info',l:'그룹',o:1},{f:'gw',t:'br',c:'info',l:'허용된 것만',o:2}],
     loop:true, stagger:0.7,
     snip:{hd:'서버 층',path:'Claude Apps Gateway',lines:['모델 허용 목록','지출 한도','사용자 식별','','forceLoginGatewayUrl   # 경로 강제'],hl:[1,2,3,5],note:'랩 TASK 06에서 bob으로 로그인하면 <b>파일 없이도 Opus가 빠집니다</b>.'}},
    {kicker:'CONDITION', title:'게이트웨이 구성: 개발자 Bedrock IAM 불필요',
     body:'게이트웨이 구성에서는 <b>개발자에게 Bedrock IAM이 필요 없습니다</b>. 개발자 Bedrock IAM을 회수하면 게이트웨이를 돌아가는 직접 호출 경로도 닫힙니다.',
     facts:['개발자 Bedrock IAM 불필요','IAM 회수 시 직접 호출 경로가 닫힘','두 층을 함께 써야 빈틈이 없음'],
     zones:Z, nodes:ALL, hot:['cc','gw','br','ms'],
     edges:[{f:'cc',t:'gw',c:'accent',o:0},{f:'gw',t:'br',c:'info',o:1},{f:'cc',t:'br',c:'danger',dash:true,side:'b',curve:40,l:'직접 호출 (IAM 회수로 차단)'}],
     loop:true, stagger:0.7,
     snip:{hd:'두 층의 역할',path:'로컬 정책 vs 게이트웨이 정책',lines:['managed-settings      머신에서 일어나는 일','Claude Apps Gateway   추론 요청 단위 강제','','게이트웨이 구성: 개발자 Bedrock IAM 불필요'],hl:[1,2,4],note:'점선은 열어 두면 안 되는 경로입니다.'}}
  ], {legend:[['danger','머신 정책'],['accent','Claude Code'],['info','게이트웨이와 추론']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• managed-settings(머신): 권한 deny, 훅, 샌드박스, 마켓플레이스 잠금, 로컬 관리자 권한이면 수정 가능
• Claude Apps Gateway(IdP 그룹): 모델 허용 목록, 지출 한도, 사용자 식별을 추론 요청 단위로 서버에서 강제
• forceLoginGatewayUrl로 경로 강제
• 조건: 게이트웨이 구성에서는 개발자 Bedrock IAM이 불필요, 회수하면 직접 호출 경로가 닫힘

{cue: demo}
마지막으로 로컬 정책과 게이트웨이 정책의 차이입니다.
managed-settings는 머신 위에서 일어나는 일을 통제합니다. 다만 로컬 관리자 권한이 있는 사용자는 파일을 고칠 수 있습니다.
Claude Apps Gateway는 IdP 그룹에 따라 모델, 지출 한도, 사용자 식별을 요청마다 서버에서 강제하고, forceLoginGatewayUrl로 경로를 강제합니다.
게이트웨이 구성에서는 개발자에게 Bedrock IAM이 필요 없습니다. 그리고 개발자 Bedrock IAM을 회수하면 게이트웨이를 돌아가는 직접 호출 경로도 닫힙니다. 랩 TASK 06에서 use_bedrock_direct로 돌아갈 수 있는 건 랩 계정에 이 권한이 남아 있기 때문입니다. 두 층을 함께 써야 빈틈이 없습니다.

[약어]
• IdP: Identity Provider, 회사 계정 인증 시스템
:::

---
<!-- Slide 31: Recap (PDF p36) -->
@type: content
@fit: off

## 배포 핵심 일곱 줄
Chapter 2 Key Takeaways

:::html
<div class="fsi fsi-recap c2-recap">
  <div class="fsi-grid-4">
    <div class="rc"><b>01</b><span>CLAUDE_CODE_USE_BEDROCK + 리전이면 연결 완료</span></div>
    <div class="rc"><b>02</b><span>IAM은 호출 2 + 프로필 조회 2 + Marketplace</span></div>
    <div class="rc"><b>03</b><span>장기 키 대신 SSO 프로필 + awsAuthRefresh</span></div>
    <div class="rc"><b>04</b><span>모델은 반드시 고정 (고정하지 않으면 기본 Opus 5.5)</span></div>
    <div class="rc"><b>05</b><span>Inference profile ARN = 팀별 비용 경계</span></div>
    <div class="rc"><b>06</b><span>정책은 managed-settings.json, /status로 검증</span></div>
    <div class="rc"><b>07</b><span>그룹 단위 정책은 Claude Apps Gateway가 서버에서 강제</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 연결은 CLAUDE_CODE_USE_BEDROCK + 리전, IAM은 호출 2 + 조회 2 + Marketplace
• 장기 키 대신 SSO + awsAuthRefresh, 모델은 반드시 고정
• 프로필 ARN이 팀별 비용 경계, 정책은 managed-settings.json과 /status 검증
• 그룹 단위 정책은 Claude Apps Gateway가 서버에서 강제

Chapter 2를 일곱 줄로 정리합니다.
{cue: pause}
연결은 CLAUDE_CODE_USE_BEDROCK과 리전이면 끝나고, IAM은 호출 두 개, 프로필 조회 두 개, Marketplace입니다. 장기 키 대신 SSO 프로필과 awsAuthRefresh를 쓰고, 기본이 Opus 5.5이니 모델은 반드시 고정합니다.
inference profile ARN이 팀별 비용 경계가 되고, 정책은 managed-settings.json으로 내려 /status로 검증합니다. 그룹 단위 정책은 Claude Apps Gateway가 서버에서 강제합니다.
:::

---
<!-- Slide 32: Thank you (PDF p37) -->
@type: thankyou
@toc: toc.html
@next: 03-ch3-guardrails-dlp.html
@next-label: Chapter 3
@message: 다음은 11:20 Preflight와 Ch1 Lab, 점심 후 13:00 Ch2 Lab입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 받습니다.

:::notes
{timing: 0.5min}
[요약]
• 다음: 11:20 Preflight와 Ch1 Lab, 점심, 13:00 Ch2 Lab
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 바로 이어서 11시 20분에 Preflight와 Ch1 Lab을 하고, 점심 후 13시에 오늘 본 정책을 Ch2 Lab에서 직접 배포하겠습니다.
질문은 Slack 채널에 언제든 편하게 남겨 주세요.
:::
