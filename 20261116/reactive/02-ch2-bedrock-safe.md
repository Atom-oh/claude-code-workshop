---
remarp: true
block: ch2-bedrock-safe
---
<!-- Slide 1: Cover -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 2. Bedrock 위에서 안전하게 쓰기
## 키는 나눠 주지 않고, 정책은 파일로, 막을 것은 앞에서 (Claude Code v2.1.319, Bedrock 기준)
Oh, Junseok
Sr. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=[].some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch2.css');css('assets/ch3.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
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
{timing: 0.5min}
[요약]
• Bedrock 연결, 정책 배포, 가드레일을 한 번에 보는 강의
• 핵심 메시지: 키는 나눠 주지 않고, 정책은 파일로 강제하고, 막을 것은 앞에서 막는다
• 깊은 내용은 Ch2 Lab 1과 Lab 2에서 직접 다룸

이번 시간은 Chapter 2, Bedrock 위에서 안전하게 쓰기입니다. Bedrock에 어떻게 연결하고, 회사 정책을 어떻게 내려보내고, 무엇을 못 하게 막을지까지 볼 거예요.
오늘은 핵심 기능만 쉽게 훑고요, 자세한 설정은 실습에서 직접 해 보겠습니다.

{cue: transition}
순서 보기 전에, 사전 설문 결과부터 잠깐 볼게요.
:::
---
<!-- Slide 2: Pre-survey opening -->
@type: content
@fit: off

## 열에 여섯이 고른 주제, 안전하게 쓰기
사전 설문 결과로 정한 이 챕터의 목표

:::html
<div class="fsi fsi-survey c2-survey">
  <div class="sv-big">
    <span class="eyebrow">PRE-SURVEY</span>
    <div class="num"><span id="c2-survey-num">87명</span></div>
    <p class="lead">참가 확정자 <b>142명 중 87명</b>이 망분리와 보안, 규제와 감사 대응, Admin Setup 가운데 하나 이상을 기대 주제로 골랐습니다. 모두 이 챕터가 답하는 주제입니다.</p>
    <p class="why">그런데 지금 Bedrock으로 쓰는 분은 17명입니다. 그래서 Bedrock에 닿는 길부터 그림으로 보고, 정책 배포와 가드레일로 넘어갑니다.</p>
  </div>
  <div class="bars" id="c2-survey-bars">
    <div class="bar lo" data-v="87"><span class="lb">셋 중 하나 이상</span><span class="tr"><i></i></span><span class="v">87명</span></div>
    <div class="bar" data-v="51"><span class="lb">망분리, 보안 (<span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span>, 감사 로그)</span><span class="tr"><i></i></span><span class="v">51명</span></div>
    <div class="bar" data-v="45"><span class="lb">규제, 감사 대응</span><span class="tr"><i></i></span><span class="v">45명</span></div>
    <div class="bar" data-v="28"><span class="lb">Admin Setup (IAM, <span class="rp-detail" tabindex="0" data-tip="Single Sign-On. 회사 계정 한 번 로그인으로 AWS 임시 자격증명을 받는 방식">SSO</span>, 관리형 정책)</span><span class="tr"><i></i></span><span class="v">28명</span></div>
    <div class="bar" data-v="17"><span class="lb">지금 Bedrock으로 사용 중</span><span class="tr"><i></i></span><span class="v">17명</span></div>
    <p class="cap">기대 주제는 복수 선택, 막대 길이는 응답 인원</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var host = document.querySelector('.slide-deck #c2-survey-bars') || document.getElementById('c2-survey-bars');
  var bars = Array.prototype.slice.call(host.querySelectorAll('.bar'));
  /* static: bars drawn at full length, no count-up (Ch2 keeps motion to the flow scenes and a few diagrams) */
  bars.forEach(function (b) { var i = b.querySelector('i'); i.style.transition = 'none'; i.style.width = (b.dataset.v / 87 * 100) + '%'; });
});
:::

:::notes
{timing: 1.5min}
[요약]
• 참가 확정자 142명 중 87명(61.3%)이 Ch2 주제 셋 가운데 하나 이상을 선택: 망분리와 보안 51명, 규제와 감사 대응 45명, Admin Setup(IAM, SSO, 관리형 정책) 28명 (복수 선택)
• 지금 Bedrock으로 쓰는 분은 17명이라, Bedrock에 닿는 길부터 그림으로 시작

{cue: pause}
사전 설문에서 142분 중 87분, 열에 여섯 분이 이 챕터 주제 가운데 하나 이상을 골라 주셨어요.
망분리와 보안이 51분, 규제와 감사 대응이 45분, IAM과 SSO 같은 Admin Setup이 28분이었습니다. 겹쳐 고르신 분도 많고요.
그런데 지금 Bedrock으로 쓰고 계신 분은 17분이에요. 그래서 오늘은 Bedrock에 어떻게 닿는지부터 그림으로 보고, 정책을 파일로 내려보내는 법, 그리고 무엇을 앞에서 막는지까지 이어 가겠습니다.

[출처]
• 이번 워크숍 사전 설문, 참가 확정자 142명, 복수 선택 (2026-11-14 집계)

{cue: transition}
그럼 순서부터 볼게요.
:::
---
<!-- Slide 3: Agenda -->
@type: content
@fit: off

## 핵심은 강의, 깊이는 실습
세 개의 Part, 연결에서 정책과 가드레일까지

:::html
<div class="fsi fsi-agenda">
  <div class="fsi-grid-3">
    <div class="pick"><span class="k">PART 01</span><span class="t">Bedrock에 연결하기</span><span class="d">사내망에서 Bedrock까지의 길, 환경변수와 IAM, 키 대신 SSO, 모델 고정과 팀 이름표</span></div>
    <div class="pick"><span class="k">PART 02</span><span class="t">정책은 파일로</span><span class="d">파일 한 장이 모든 PC로, 키 충돌과 잠금 스위치, 배포 후 확인</span></div>
    <div class="pick"><span class="k">PART 03</span><span class="t">무엇을 못 하게 할 것인가</span><span class="d">deny가 이긴다, 요청이 지나는 문들, DLP는 프롬프트 앞에서, 남는 기록</span></div>
  </div>
  <div class="fsi-grid-2">
    <div class="pick lab"><span class="k">LAB / Ch2 Lab 1</span><span class="t">정책 배포, managed settings와 게이트웨이 그룹 정책</span><span class="d">정책을 배포하고, 개인 설정으로 우회가 안 되는지 확인</span></div>
    <div class="pick lab"><span class="k">LAB / Ch2 Lab 2</span><span class="t">가드레일과 DLP, 훅과 auto mode</span><span class="d">훅을 만들고 직접 뚫어 본 뒤 고치기</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• Part 1 Bedrock에 연결하기, Part 2 정책은 파일로, Part 3 무엇을 못 하게 할 것인가
• 강의는 핵심 기능 위주, IAM 세부, auto mode, 샌드박스, 게이트웨이 같은 깊은 내용은 실습으로
• 실습은 점심 뒤 통합 랩에서 Preflight, Ch1 Lab에 이어 Ch2 Lab 1과 Lab 2

오늘은 세 Part로 갑니다.
첫 번째는 사내망에서 Bedrock까지 요청이 어떤 길로 가는지, 그리고 키 대신 SSO로 붙는 법이에요. 두 번째는 회사 정책을 어떻게 파일로 내려보내는지, 세 번째는 위험한 동작을 어떻게 막고 기록하는지입니다.
{cue: pause}
처음 보시는 분이 많아서 강의에서는 꼭 알아야 할 기능만 짚을게요. IAM 정책 세부, auto mode, 샌드박스, 게이트웨이 같은 깊은 내용은 Ch2 Lab 1과 Lab 2에서 직접 해 보면서 익히시면 됩니다.
:::
---
<!-- Slide 4: Why Bedrock -->
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

금융권 고객께서 Claude Code를 Bedrock으로 쓰시는 이유는 크게 세 가지예요.
첫 번째는 추론이 내 AWS 계정 경계 안에서 일어난다는 겁니다. 다만 처리 리전은 추론 프로필 범위를 따르고, global 프로필이면 리전 밖에서 처리될 수도 있어요.
두 번째는 이미 쓰고 계신 IAM, Identity Center, CloudTrail, Organizations를 그대로 쓴다는 거예요. 세 번째는 청구가 AWS 청구서 하나로 모인다는 거고요.
{cue: pause}
대신 빠지는 것도 있어요. claude.ai의 관리 콘솔, Analytics, 정책 서버는 없습니다. 그래서 정책은 파일과 MDM으로, 관측은 OTel로 그 빈자리를 채워야 해요. 이번 챕터와 Ch6에서 볼 내용입니다.

[약어]
• IAM: Identity and Access Management
• MDM: Mobile Device Management
• OTel: OpenTelemetry
:::
---
<!-- Slide 5: Private path to Bedrock -->
@type: content
@fit: off

## 사내망에서 Bedrock까지, 인터넷 없이
요청 하나가 지나가는 길 (사내망과 전용선 기준)

:::html
<div class="fsi fs" id="c2-pl">
  <div class="fs-stage"></div>
  <div class="fs-side">
    <div class="fs-step"></div>
    <div class="fs-title"></div>
    <pre class="fs-code"></pre>
    <div class="fs-checks"></div>
    <div class="fs-say"></div>
    <div class="fs-prog"><i></i></div>
    <div class="fs-hint">장면을 누르거나 ↓ 키로 다음 단계, ↑ 키로 이전 단계</div>
  </div>
</div>
:::

:::script
import('./assets/flowscene.js').then(function (m) { m.mount('#c2-pl', {
  aria: '사내망 개발자 PC의 요청이 Direct Connect 전용선, VPC 엔드포인트, IAM 판단을 거쳐 Amazon Bedrock에 닿고 같은 길로 돌아오는 흐름',
  zones: [
    { box: [-0.4, 0, 0, 9.2, 4.2, 0.4], label: '사내망 (망분리)', labelAt: [-0.2, 0, -0.75] },
    { box: [11.6, 0, 0, 15.4, 4.2, 0.4], label: 'AWS 리전 us-east-1', labelAt: [11.8, 0, -0.75] },
    { box: [12.2, 0.4, 0.4, 9.6, 3.4, 0.25], label: '고객 VPC (회사 AWS 계정) 10.20.0.0/16, private subnet', labelAt: [12.4, 0.4, -0.5], sub: true }
  ],
  parts: {
    pc: { boxes: [[1.4, 1.2, 0.4, 1.8, 1.4, 0.8], [1.7, 2.4, 1.2, 1.2, 0.15, 1.0]] },
    dns: { boxes: [[4.0, 2.4, 0.4, 1.0, 1.0, 1.9]] },
    fw: { boxes: [[7.2, 0.6, 0.4, 0.5, 3.0, 1.7]] },
    net: { clouds: [[[6.4, 3.0, 5.0], 58, 20, '인터넷']] },
    onep: { boxes: [[9.4, 3.0, 4.4, 1.4, 1.0, 1.0]] },
    dx: { pipes: [[[7.7, 2.0, 1.0], [12.6, 2.0, 1.0]]] },
    vgw: { boxes: [[12.6, 1.4, 0.65, 0.8, 1.2, 1.0]] },
    r53: { boxes: [[14.4, 2.6, 0.65, 1.3, 1.0, 1.2]] },
    vpce: { boxes: [[16.4, 1.3, 0.65, 1.4, 1.4, 1.3]], rings: [[[17.1, 2.0, 0.66], 40, 14]] },
    iam: { boxes: [[20.0, 0.9, 0.65, 0.22, 2.4, 2.2], [20.42, 0.9, 0.65, 0.22, 2.4, 2.2], [20.84, 0.9, 0.65, 0.22, 2.4, 2.2], [21.26, 0.9, 0.65, 0.22, 2.4, 2.2]] },
    bedrock: { boxes: [[23.2, 1.0, 0.4, 2.4, 2.4, 2.8]] }
  },
  marks: [{ id: 'x', at: [6.8, 2.4, 3.6] }],
  tags: [
    { id: 'ip', at: [10.4, 3.4, 3.0], text: 'bedrock-runtime.us-east-1.amazonaws.com → 10.20.1.15', show: ['dns', 'dx', 'vpce'] },
    { id: 'model', at: [24.4, 1.0, -0.6], text: 'global.anthropic.claude-sonnet-5-5', show: ['model', 'back'] }
  ],
  wires: {
    inet: { pts: [[3.0, 2.0, 1.6], [6.0, 2.4, 2.6], [6.8, 2.4, 3.6]], cls: 'fs-alt' },
    inet1p: { pts: [[3.0, 2.0, 1.6], [6.0, 2.4, 2.6], [6.4, 3.0, 4.6], [10.1, 3.5, 5.0]], cls: 'fs-alt fs-bad' },
    inetpub: { pts: [[3.0, 2.0, 1.6], [6.0, 2.4, 2.6], [6.4, 3.0, 4.6], [15.0, 3.6, 6.2], [24.4, 2.4, 3.3]], cls: 'fs-alt fs-bad' },
    dns: { pts: [[3.0, 2.4, 1.8], [4.5, 2.9, 2.0], [7.45, 2.0, 1.5], [7.7, 2.0, 1.0], [12.6, 2.0, 1.0], [13.0, 2.0, 1.4], [15.0, 3.1, 1.6]], cls: 'fs-alt' },
    req: { pts: [[3.2, 1.9, 1.0], [7.45, 1.9, 1.0], [7.7, 2.0, 1.0], [12.6, 2.0, 1.0], [13.0, 2.0, 1.2], [17.1, 2.0, 1.3], [20.8, 2.0, 1.3], [24.4, 2.2, 1.6]] }
  },
  callouts: [
    { id: 'pc', n: 1, anchor: [2.3, 1.2, 1.2], at: [40, 430], title: '개발자 PC, Claude Code', sub: 'SSO 임시 자격증명으로 서명' },
    { id: 'net', n: 4, anchor: [6.4, 3.0, 4.6], at: [150, 40], title: '인터넷, 망분리에서는 막힘', sub: '부가 통신도 환경변수로 끔' },
    { id: 'onep', n: 2, anchor: [10.1, 3.5, 5.4], at: [380, 40], title: 'Anthropic API (1P)', sub: 'api.anthropic.com, 회사 밖 인터넷' },
    { id: 'dns', n: 5, anchor: [4.5, 2.4, 2.3], at: [150, 150], title: '사내 DNS, Route 53 Resolver', sub: '이름을 사설 IP로' },
    { id: 'dx', n: 6, anchor: [10.1, 2.0, 1.2], at: [290, 462], title: 'Direct Connect 전용선', sub: 'private VIF(사설 연결), 공용 인터넷 아님' },
    { id: 'vpce', n: 7, anchor: [17.1, 1.3, 1.2], at: [520, 470], title: 'VPC 엔드포인트 (PrivateLink)', sub: '사설 IP 10.20.1.15, 보안 그룹은 443만' },
    { id: 'iam', n: 8, anchor: [20.6, 3.3, 2.9], at: [560, 120], title: 'IAM 판단 4단계', sub: '하나라도 거부면 멈춤' },
    { id: 'pub', n: 3, anchor: [22.0, 3.4, 4.6], at: [610, 40], title: 'Bedrock 공용 엔드포인트', sub: 'VPC 엔드포인트가 없을 때, 인터넷' },
    { id: 'bedrock', n: 9, anchor: [24.4, 3.4, 3.2], at: [720, 190], title: 'Amazon Bedrock (AWS 서비스)', sub: '추론 프로필이 가리키는 모델이 답함' }
  ],
  figures: [{ at: [0.6, 1.9, 0.4], scale: 0.9, pose: 'type', act: { start: 'type' } }],
  code: [
    'export CLAUDE_CODE_USE_BEDROCK=1',
    'export AWS_REGION=us-east-1',
    'export AWS_PROFILE=fsi-dev   # aws sso login',
    'export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1',
    'export ANTHROPIC_MODEL=global.anthropic.claude-sonnet-5-5',
    '# DNS: bedrock-runtime... → 10.20.1.15',
    '# IAM: bedrock:InvokeModel*'
  ],
  checks: ['서명 확인 (SigV4: AWS 요청 서명)', '역할 정책에 bedrock:InvokeModel*', '엔드포인트 정책이 허용', '조직 SCP(계정 전체 권한 상한)가 막지 않음'],
  checksDoneAfter: 'iam',
  overview: { label: '전체 그림', title: '인터넷으로 가는 길과 사설로 가는 길', say: '빨간 점선은 PrivateLink 없이 인터넷으로 가는 길(1P API, Bedrock 공용 엔드포인트), 주황 선은 전용선과 PrivateLink로 가는 사설 길입니다. Part 1은 사설 길을 하나씩 엽니다.' },
  phases: [
    { key: 'start', d: 2.8, focus: ['pc'], cam: ['pc', 'dns'], zoom: 0.3, badge: 'pc', lines: [1, 3], label: '1  출발', title: '요청은 사내망의 개발자 PC에서', say: 'Claude Code가 Bedrock 모드로 요청을 만들고, <b>SSO로 받은 임시 자격증명</b>으로 서명합니다. PC에 오래 쓰는 키는 없습니다.' },
    { key: 'onep', d: 3.6, focus: ['pc', 'net', 'onep'], badge: 'onep', lines: [], packet: { wire: 'inet1p', colour: 'var(--danger)' }, label: '2  PrivateLink가 없으면 (1)', title: 'Claude API를 바로 쓰면, 인터넷으로', say: 'Bedrock이 아니라 <b>Anthropic API(1P)</b>를 바로 쓰면, 요청은 회사 밖 인터넷을 지나 api.anthropic.com으로 갑니다.' },
    { key: 'pub', d: 4.4, focus: ['pc', 'net', 'bedrock'], badge: 'pub', lines: [1], packet: { wire: 'inetpub', colour: 'var(--danger)' }, label: '3  PrivateLink가 없으면 (2)', title: 'Bedrock도 공용 엔드포인트로, 인터넷으로', say: '<b>VPC 엔드포인트가 없으면</b> Bedrock 주소가 공용 IP로 풀려, 요청은 인터넷으로 <b>공용 엔드포인트</b>에 갑니다.' },
    { key: 'inet', d: 2.8, focus: ['pc', 'net'], cam: ['pc', 'fw', 'net'], badge: 'net', lines: [4], packet: { wire: 'inet', mode: 'block', mark: 'x' }, label: '4  망분리에서는 막힘', title: '두 길 모두 인터넷, 망분리에서는 막힌다', say: '망분리에서는 두 길 모두 방화벽에서 막힙니다. 업데이트, 오류 리포트 같은 부가 통신도 <b>환경변수 하나로</b> 끕니다.' },
    { key: 'dns', d: 5.2, focus: ['pc', 'dns', 'dx', 'vgw', 'r53'], badge: 'dns', lines: [6], packet: { wire: 'dns', mode: 'pingpong', colour: 'var(--info)' }, label: '5  이름 찾기', title: 'Bedrock 주소를 사설 IP로 바꾼다', say: '사내 DNS가 질문을 전용선 너머 <b>Route 53 Resolver</b>로 넘기면, Bedrock 주소가 <b>VPC 안의 사설 IP</b>로 돌아옵니다.' },
    { key: 'dx', d: 4.2, focus: ['pc', 'fw', 'dx', 'vgw'], cam: ['dx'], zoom: 0.3, segment: false, badge: 'dx', lines: [2], packet: { wire: 'req', span: [0, 4] }, label: '6  전용선', title: '요청은 전용선으로 고객 VPC에', say: '요청은 방화벽을 지나 <b>Direct Connect 전용선</b>으로 고객 VPC(회사 AWS 계정)에 들어갑니다. 공용 인터넷을 거치지 않습니다.' },
    { key: 'vpce', d: 2.8, focus: ['vpce'], badge: 'vpce', lines: [6], packet: { wire: 'req', span: [4, 5] }, label: '7  PrivateLink', title: 'VPC 엔드포인트가 Bedrock의 사설 입구', say: '사설 IP의 주인은 고객 VPC 안의 <b>Bedrock Runtime VPC 엔드포인트</b>입니다. 요청은 여기서 AWS 사설망으로 Bedrock에 닿습니다. 보안 그룹은 443 포트만 엽니다.' },
    { key: 'iam', d: 4.6, focus: ['iam'], zoom: 0.26, badge: 'iam', lines: [3, 7], checks: true, packet: { wire: 'req', span: [5, 6], mode: 'wait', waitAt: 0.55, hold: 0.82 }, label: '8  IAM 판단', title: '네 번 확인하고, 하나라도 거부면 멈춤', say: '서명, 역할 정책, 엔드포인트 정책, 조직 SCP를 차례로 봅니다. <b>모두 허용일 때만</b> 지나갑니다.' },
    { key: 'model', d: 2.8, focus: ['bedrock'], zoom: 0.28, badge: 'bedrock', lines: [5], packet: { wire: 'req', span: [6, 7] }, label: '9  모델', title: '이름표가 가리키는 모델이 답한다', say: '요청의 <b>모델 ID(추론 프로필)</b>가 어떤 Claude가 답할지 정합니다.' },
    { key: 'back', d: 5.0, focus: ['bedrock', 'iam', 'vpce', 'dx', 'pc'], lines: [], packet: { wire: 'req', span: [7, 0] }, label: '10  응답', title: '답은 같은 길로 돌아온다', say: '답도 같은 길로 돌아옵니다. <b>처음부터 끝까지 공용 인터넷을 지나지 않습니다.</b> 2, 3단계의 길과 비교해 보세요.' }
  ],
  frame: function (c) {
    var rings = c.parts.iam.querySelectorAll('.fs-box');
    for (var k = 0; k < rings.length; k++) rings[k].querySelectorAll('.fs-face').forEach(function (f) { f.style.stroke = k < c.lit ? 'var(--success)' : ''; });
    c.parts.bedrock.querySelector('.fs-top').style.fill = c.ph.key === 'model' ? 'var(--accent)' : '';
  }
}); });
:::

:::notes
{timing: 3min}
[요약]
• 사내망 개발자 PC → 사내 DNS와 Route 53 Resolver(사설 IP) → Direct Connect 전용선 → Bedrock Runtime VPC 엔드포인트(PrivateLink) → IAM 판단 → Bedrock
• 인터넷 길은 막혀 있고, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1로 부가 통신도 끔
• IAM 판단은 서명(SSO 임시 자격증명), 역할 정책, 엔드포인트 정책, 조직 SCP. 하나라도 거부면 멈춤
• 응답도 같은 길로, 공용 인터넷을 지나지 않음

{cue: demo}
사내망에 있는 개발자 PC에서 요청 하나가 Bedrock까지 어떻게 가는지, 구간마다 가까이 가서 볼게요.↓
먼저 Claude Code가 Bedrock 모드로 요청을 만들고, SSO로 받은 임시 자격증명으로 서명합니다. PC에 오래 쓰는 키는 없어요.↓
그런데 PrivateLink가 없으면 어떻게 될까요? Anthropic API, 1P를 바로 쓰면 요청은 인터넷을 지나 api.anthropic.com으로 갑니다.↓ Bedrock을 쓰더라도 VPC 엔드포인트가 없으면 Bedrock 공용 엔드포인트로, 역시 인터넷 구간을 지나요.↓
망분리 환경에서는 이 두 길이 모두 방화벽에서 막힙니다. 업데이트나 오류 리포트 같은 부가 통신도 환경변수 하나로 끕니다. 그래서 인터넷 없이 닿는 길이 필요해요.↓
그다음 이름 찾기예요. 사내 DNS가 질문을 전용선 너머 Route 53 Resolver로 넘기면, Bedrock 주소가 VPC 안의 사설 IP로 돌아옵니다.↓
요청은 방화벽을 지나 Direct Connect 전용선으로 고객 VPC, 그러니까 회사 AWS 계정의 VPC에 들어갑니다.↓ 그리고 그 사설 IP의 주인인 VPC 엔드포인트, 즉 PrivateLink를 통해 AWS 사설망으로 Bedrock에 닿습니다.↓
여기서 IAM이 네 번 확인해요. 서명이 맞는지, 역할에 호출 권한이 있는지, 엔드포인트 정책이 허용하는지, 조직 SCP가 막지 않는지. 하나라도 거부면 멈춥니다.↓
모두 통과하면 모델 이름표, 추론 프로필이 가리키는 Claude가 답합니다.↓ 답은 같은 길로 돌아옵니다. 처음부터 끝까지 공용 인터넷을 지나지 않아요.

{cue: transition}
이제 이 길을 하나씩 열어 보겠습니다. 먼저 환경변수부터요.

[약어]
• VPC: Virtual Private Cloud. 회사 AWS 계정 안의 사설 네트워크
• PrivateLink, VPC 엔드포인트: 인터넷 없이 VPC 안에서 AWS 서비스에 닿는 사설 입구
• Direct Connect, private VIF: 사내망과 AWS를 잇는 전용선과 그 위의 사설 연결
• Route 53 Resolver 인바운드 엔드포인트: 사내 DNS가 VPC 안의 이름을 물어볼 수 있게 하는 입구
• ENI: 엔드포인트가 VPC 안에 받는 네트워크 카드와 사설 IP, SG(보안 그룹)는 그 방화벽 규칙
• SigV4: AWS 요청 서명 방식, SCP: AWS Organizations가 계정 전체에 거는 권한 상한
• 1P: Anthropic이 직접 제공하는 Claude API (api.anthropic.com)

[출처]
• docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html
• docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html
• code.claude.com/docs/en/amazon-bedrock
• code.claude.com/docs/en/network-config
:::
---
<!-- Slide 6: Air-gapped checklist -->
@type: content
@fit: off

## 망분리 환경의 여덟 가지 점검
인터넷 없이 Bedrock만 열려 있을 때 먼저 확인할 것

:::html
<div class="fsi c2-air8">
  <div class="fsi-grid-4">
    <div class="pick"><span class="k">모델 호출</span><span class="t">Bedrock Runtime VPC 엔드포인트</span><span class="d">PrivateLink로 계정 안에서 추론 (앞 장의 길)</span></div>
    <div class="pick"><span class="k">SSO 로그인</span><span class="t">Identity Center, OIDC, STS</span><span class="d">aws sso login이 되는지 먼저 확인 (STS: 임시 자격증명 발급)</span></div>
    <div class="pick"><span class="k">사내 프록시</span><span class="t">HTTPS_PROXY, NO_PROXY</span><span class="d">프록시를 거쳐야 하는 경우</span></div>
    <div class="pick"><span class="k">사내 인증서</span><span class="t">NODE_EXTRA_CA_CERTS</span><span class="d">프록시가 TLS(HTTPS 암호화)를 다시 서명할 때</span></div>
    <div class="pick"><span class="k">외부 통신 끄기</span><span class="t">CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1</span><span class="d">자동 업데이트, 오류 리포트 등을 한 번에</span></div>
    <div class="pick"><span class="k">설치와 업데이트</span><span class="t">사내 배포, DISABLE_AUTOUPDATER=1</span><span class="d">버전을 정해 단말에 배포</span></div>
    <div class="pick"><span class="k">플러그인</span><span class="t">사내 git 마켓플레이스</span><span class="d">Ch4에서 실습</span></div>
    <div class="pick"><span class="k">웹 접근</span><span class="t">WebFetch deny 또는 허용 도메인</span><span class="d">허용 도메인은 skipWebFetchPreflight: true와 함께, WebSearch는 Bedrock에 없음</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 모델 호출은 Bedrock Runtime VPC 엔드포인트(PrivateLink), SSO 로그인은 Identity Center, OIDC, STS 엔드포인트에 닿아야 함
• 사내 프록시 HTTPS_PROXY와 NO_PROXY, 사내 인증서 NODE_EXTRA_CA_CERTS
• 외부 통신은 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1, 업데이트는 사내 배포와 DISABLE_AUTOUPDATER=1
• 플러그인은 사내 git 마켓플레이스(Ch4), WebFetch는 deny 또는 허용 도메인만. 허용 도메인을 쓰면 skipWebFetchPreflight: true

망분리 환경, 그러니까 인터넷 없이 Bedrock만 열린 환경이라면 이 여덟 가지를 먼저 확인하세요.
모델 호출은 방금 본 VPC 엔드포인트로 끝나요. SSO 로그인은 Identity Center 포털과 OIDC, STS 엔드포인트에 닿아야 하니, aws sso login이 되는지부터 봅니다.
사내 프록시를 거친다면 HTTPS_PROXY와 NO_PROXY, 프록시가 TLS를 다시 서명한다면 NODE_EXTRA_CA_CERTS로 사내 인증서를 지정합니다.
자동 업데이트와 오류 리포트 같은 외부 통신은 환경변수 하나로 한 번에 끄고, 설치와 업데이트는 버전을 정해 사내에서 배포합니다. 플러그인은 사내 git 마켓플레이스로 받고, 웹 접근은 WebFetch를 막거나 허용 도메인만 엽니다. WebFetch는 원래 주소를 먼저 api.anthropic.com에 확인받는데, 망분리에서는 거기 닿지 못하니 허용 도메인을 쓸 때는 skipWebFetchPreflight를 true로 둡니다.

[약어]
• OIDC: OpenID Connect. 로그인 결과를 토큰으로 넘겨주는 표준
• STS: Security Token Service. 짧게 쓰는 임시 AWS 자격증명을 발급
• TLS: Transport Layer Security. HTTPS 암호화 통신 규약

[출처]
• code.claude.com/docs/en/network-config
• code.claude.com/docs/en/amazon-bedrock
• code.claude.com/docs/en/settings (DISABLE_AUTOUPDATER, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC)
:::
---
<!-- Slide 7: Part 01 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 01</span>
  <div class="name">Bedrock에 연결하기</div>
  <p class="what">첫 세션까지 가장 짧은 길</p>
  <ol>
    <li><b>01</b>환경변수와 IAM 권한</li>
    <li><b>02</b>키 대신 SSO 로그인</li>
    <li><b>03</b>모델 고정과 팀 이름표</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1: Bedrock에 연결하기
• 환경변수와 IAM 권한, 키 대신 SSO 로그인, 모델 고정과 팀 이름표

첫 번째 Part는 Bedrock에 연결하기예요. 방금 본 길을 실제로 여는 순서대로 갑니다.
먼저 환경변수와 IAM 권한, 그다음 키 대신 SSO로 로그인하는 방법, 마지막으로 여러 명이 쓸 때 꼭 정해야 하는 모델 고정과 팀 이름표를 보겠습니다.
:::
---
<!-- Slide 8: Manual setup and region order -->
@type: content
@fit: off

## 환경변수 두 개로 연결
변수마다 바뀌는 것 하나: 목적지, 리전, 경유지

:::html
<div id="c2-sv-env"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:330,h:420,l:'개발자 PC'},{x:390,y:30,w:770,h:130,l:'ANTHROPIC API'},{x:770,y:185,w:390,h:265,l:'AWS',tone:'info'}];
  var CC = {id:'cc',x:50,y:90,w:270,h:92,t:'Claude Code',s:'요청을 만드는 곳',c:'accent'};
  var ST = {id:'st',x:50,y:330,w:270,h:92,t:'/status',s:'리전과 출처 확인',c:'success'};
  var AN = {id:'an',x:770,y:52,w:360,h:88,t:'Anthropic API',s:'변수가 없을 때의 목적지',c:'muted'};
  var GW = {id:'gw',x:400,y:345,w:280,h:92,t:'사내 게이트웨이',s:'BASE_URL, 쓸 때만',c:'warning'};
  var BU = {id:'bu',x:800,y:232,w:330,h:92,t:'Bedrock us-east-1',s:'리전 값이 없을 때 기본',c:'info'};
  var BS = {id:'bs',x:800,y:340,w:330,h:92,t:'Bedrock ap-northeast-2',s:'AWS_REGION 예시 (서울)',c:'info'};
  var ALL = [CC,ST,AN,GW,BU,BS];
  var env = ['# 1. 목적지: Bedrock 사용','export CLAUDE_CODE_USE_BEDROCK=1','# 2. 리전: 프로필에 없을 때만','export AWS_REGION=ap-northeast-2','# 3. 경유지: 사내 게이트웨이를 쓸 때만','# export ANTHROPIC_BEDROCK_BASE_URL=https://...'];
  var P = '~/.zshrc 또는 settings.json의 env';
  F.stepviz('#c2-sv-env', [
    {kicker:'OVERVIEW', title:'변수 하나는 목적지, 하나는 리전',
     body:'<b>CLAUDE_CODE_USE_BEDROCK</b>은 요청이 가는 곳을 Bedrock으로 바꾸고, <b>AWS_REGION</b>은 어느 리전의 Bedrock인지 정합니다.',
     facts:['1 목적지: CLAUDE_CODE_USE_BEDROCK=1','2 리전: AWS_REGION (필요할 때만)','3 경유지: ANTHROPIC_BEDROCK_BASE_URL (선택)'],
     zones:Z, nodes:ALL,
     edges:[{f:'cc',t:'an',c:'muted',dash:true,l:'변수 없음'},{f:'cc',t:'bs',c:'accent',l:'두 변수',o:0},{f:'cc',t:'st',c:'success',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'변수 세 줄',path:P,lines:env,hl:[2,4],note:'필수는 두 줄, 세 번째 줄은 <b>사내 게이트웨이</b>를 쓸 때만 넣습니다.'}},
    {kicker:'STEP 1', title:'CLAUDE_CODE_USE_BEDROCK: 목적지',
     body:'이 값이 없으면 Claude Code는 Anthropic API로 갑니다. <b>1</b>이면 Bedrock으로 가고, 로그인 대신 <b>AWS 자격증명</b>으로 서명합니다.',
     facts:['claude.ai 로그인 대신 AWS 자격증명','Bedrock에서는 /logout을 쓰지 않음'],
     zones:Z, nodes:ALL, hot:['cc','an','bu','bs'],
     edges:[{f:'cc',t:'an',c:'muted',dash:true,l:'끔'},{f:'cc',t:'bu',c:'accent',l:'Bedrock으로',o:0}],
     loop:true,
     snip:{hd:'목적지',path:P,lines:env,hl:[1,2],note:'이 한 줄이 <b>공급자</b>를 Amazon Bedrock으로 바꿉니다.'}},
    {kicker:'STEP 2', title:'AWS_REGION: 어느 리전인지',
     body:'위에서부터 처음 찾은 값을 씁니다. <b>AWS_REGION</b>, AWS_DEFAULT_REGION, 활성 프로필의 region, 아무것도 없으면 <b>us-east-1</b>입니다.',
     facts:['1 AWS_REGION','2 AWS_DEFAULT_REGION','3 활성 프로필의 region','4 기본값 us-east-1'],
     zones:Z, nodes:ALL, hot:['cc','bu','bs'],
     edges:[{f:'cc',t:'bs',c:'accent',l:'AWS_REGION',o:0},{f:'cc',t:'bu',c:'muted',dash:true,l:'값이 없으면'}],
     loop:true,
     snip:{hd:'리전',path:P,lines:env,hl:[3,4],note:'프로필에 region이 있으면 <b>AWS_REGION은 생략</b>해도 됩니다.'}},
    {kicker:'STEP 3', title:'사내 게이트웨이를 거칠 때',
     body:'<b>ANTHROPIC_BEDROCK_BASE_URL</b>은 요청을 보낼 주소를 바꿉니다. 사내 게이트웨이나 지정한 엔드포인트를 지나야 할 때만 씁니다.',
     facts:['기본은 리전의 Bedrock 주소로 바로 감','쓰지 않으면 이 줄은 비워 둠'],
     zones:Z, nodes:ALL, hot:['cc','gw','bs'],
     edges:[{f:'cc',t:'gw',c:'warning',o:0},{f:'gw',t:'bs',c:'warning',o:1}],
     loop:true, stagger:0.7,
     snip:{hd:'경유지',path:P,lines:['export CLAUDE_CODE_USE_BEDROCK=1','export AWS_REGION=ap-northeast-2','export ANTHROPIC_BEDROCK_BASE_URL=\\','  https://bedrock.corp.example'],hl:[3,4],note:'주소는 예시입니다. 게이트웨이가 <b>스트리밍 응답을 그대로</b> 넘겨야 합니다.'}},
    {kicker:'STEP 4', title:'/status로 확인',
     body:'설정이 실제로 먹었는지는 Claude Code 안에서 <b>/status</b>로 봅니다. 리전이 설정 파일이나 기본값에서 왔다면 <b>그 출처</b>도 함께 나옵니다.',
     facts:['공급자가 Amazon Bedrock인지','리전과 그 출처'],
     zones:Z, nodes:ALL, hot:['cc','st'],
     edges:[{f:'cc',t:'st',c:'success',o:0}],
     loop:true,
     snip:{hd:'확인',path:'Claude Code 프롬프트',lines:['/status'],hl:[1],note:'Lab에서도 연결 직후 <b>/status</b>부터 봅니다.'}}
  ], { legend:[['accent','Bedrock 연결'],['info','Bedrock 리전'],['warning','경유지 (선택)'],['success','확인']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• CLAUDE_CODE_USE_BEDROCK=1: 목적지를 Anthropic API에서 Bedrock으로, 인증은 AWS 자격증명
• AWS_REGION: 프로필에 리전이 없을 때만. 결정 순서는 AWS_REGION, AWS_DEFAULT_REGION, 활성 프로필의 region, 기본 us-east-1
• ANTHROPIC_BEDROCK_BASE_URL: 사내 게이트웨이나 지정 엔드포인트를 거칠 때만
• /status로 공급자, 리전, 리전의 출처 확인

{cue: demo}
수동 설정은 환경변수 두 개면 돼요. 그림에서 변수 하나가 무엇을 바꾸는지 보시면 됩니다.↓
첫 번째 CLAUDE_CODE_USE_BEDROCK=1은 목적지를 바꿔요. 이게 없으면 Anthropic API로 가고, 1이면 Bedrock으로 갑니다. 이때부터는 claude.ai 로그인이 아니라 AWS 자격증명으로 서명합니다.↓
두 번째 AWS_REGION은 어느 리전의 Bedrock인지 정해요. 위에서부터 처음 찾은 값을 쓰는데요, AWS_REGION, AWS_DEFAULT_REGION, 프로필의 region 순이고, 아무것도 없으면 us-east-1입니다. 프로필에 리전이 있으면 생략하셔도 돼요.↓
사내 게이트웨이를 거쳐야 하면 ANTHROPIC_BEDROCK_BASE_URL로 주소만 바꿉니다.↓
마지막으로 /status를 열어서 공급자와 리전, 그 출처까지 꼭 확인해 주세요.

{cue: transition}
목적지가 Bedrock이 되면, 이제 IAM이 이 호출을 허용해 줘야 합니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (Set up manually, 3. Configure Claude Code)
:::
---
<!-- Slide 9: IAM permissions -->
@type: content
@fit: off

## IAM 권한은 호출, 조회, Marketplace
Claude Code가 부르는 API마다 필요한 권한

:::html
<div id="c2-sv-iam"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:300,h:420,l:'개발자 PC'},{x:350,y:30,w:810,h:420,l:'AWS 계정, 역할 정책',tone:'info'}];
  var CC = {id:'cc',x:45,y:189,w:250,h:92,t:'Claude Code',s:'SSO 역할로 서명',c:'accent'};
  var LS = {id:'ls',x:380,y:80,w:350,h:92,t:'1 프로필 목록 보기',s:'ListInferenceProfiles',c:'info'};
  var GT = {id:'gt',x:380,y:199,w:350,h:92,t:'2 프로필 뒤 모델 확인',s:'GetInferenceProfile',c:'info'};
  var IV = {id:'iv',x:380,y:318,w:350,h:92,t:'3 모델 호출',s:'InvokeModel, 스트리밍',c:'accent'};
  var PR = {id:'pr',x:800,y:80,w:330,h:92,t:'추론 프로필',s:'시스템 프로필, 앱 프로필',c:'info'};
  var FM = {id:'fm',x:800,y:199,w:330,h:92,t:'기반 모델',s:'foundation-model',c:'info'};
  var MK = {id:'mk',x:800,y:318,w:330,h:92,t:'Marketplace 구독',s:'Bedrock이 대신 확인',c:'warning'};
  var ALL = [CC,LS,GT,IV,PR,FM,MK];
  var s1 = ['"Action": [','  "bedrock:InvokeModel",','  "bedrock:InvokeModelWithResponseStream",','  "bedrock:GetInferenceProfile" ],','"Resource": [   # ... = arn:aws:bedrock:*:*','  "...:inference-profile/*",','  "...:application-inference-profile/*",','  "...:foundation-model/*" ]'];
  F.stepviz('#c2-sv-iam', [
    {kicker:'OVERVIEW', title:'부르는 API마다 권한 하나',
     body:'Claude Code는 시작할 때 <b>프로필을 조회</b>하고, 대화마다 <b>모델을 호출</b>하며, 처음 부를 때 Bedrock이 <b>Marketplace 구독</b>을 확인합니다.',
     facts:['문장 1: 호출 2개 + 프로필 읽기','문장 2: 목록 조회, Resource "*"','문장 3: Marketplace, Bedrock 경유일 때만'],
     zones:Z, nodes:ALL,
     edges:[{f:'cc',t:'ls',c:'info',o:0},{f:'cc',t:'gt',c:'info',o:1},{f:'cc',t:'iv',c:'accent',o:2},{f:'ls',t:'pr',c:'info',o:1},{f:'gt',t:'pr',c:'info',o:2},{f:'iv',t:'fm',c:'accent',o:3},{f:'iv',t:'mk',c:'warning',o:4}],
     loop:true, stagger:0.5,
     snip:{hd:'정책의 세 문장',path:'claude-code-bedrock-policy.json',lines:['# 문장 1: 호출과 프로필 읽기','bedrock:InvokeModel','bedrock:InvokeModelWithResponseStream','bedrock:GetInferenceProfile','# 문장 2: 목록 조회만 따로','bedrock:ListInferenceProfiles','# 문장 3: Bedrock 경유일 때만','aws-marketplace:ViewSubscriptions','aws-marketplace:Subscribe'],hl:[2,3,4,6,8,9],note:'Lab 1 TASK 01의 최소 정책과 같은 구성입니다.'}},
    {kicker:'STEP 1', title:'시작할 때: 어떤 프로필이 있나',
     body:'Claude Code는 계정의 <b>추론 프로필 목록</b>을 보고 쓸 수 있는 프로필을 고릅니다. 이 권한은 리소스를 지정할 수 없어서 <b>Resource "*"인 별도 문장</b>에 둡니다.',
     facts:['ListInferenceProfiles: 리소스 지정 불가','ARN(AWS 리소스 주소) 목록 문장에 합치면 목록 조회가 거부됨','없으면 prefix를 확인 없이 적용'],
     zones:Z, nodes:ALL, hot:['cc','ls','pr'],
     edges:[{f:'cc',t:'ls',c:'info',o:0},{f:'ls',t:'pr',c:'info',l:'목록',o:1}],
     loop:true, stagger:0.7,
     snip:{hd:'문장 2',path:'claude-code-bedrock-policy.json',lines:['{ "Effect": "Allow",','  "Action": "bedrock:ListInferenceProfiles",','  "Resource": "*" }'],hl:[2,3],note:'Lab 환경의 정책 시뮬레이터에서 합친 문장은 <b>implicitDeny</b>로 나왔습니다.'}},
    {kicker:'STEP 2', title:'앱 프로필이면: 뒤의 모델 확인',
     body:'팀 이름표 같은 <b>애플리케이션 추론 프로필</b>은 이름만 봐서는 어떤 모델인지 모릅니다. <b>GetInferenceProfile</b>로 뒤의 모델을 읽어 요청 모양을 고릅니다.',
     facts:['없어도 호출은 되지만 새 모델마다 한 번 더 왕복','앱 프로필은 이 장 끝에서 다시 봄'],
     zones:Z, nodes:ALL, hot:['cc','gt','pr','fm'],
     edges:[{f:'cc',t:'gt',c:'info',o:0},{f:'gt',t:'pr',c:'info',l:'읽기',o:1},{f:'pr',t:'fm',c:'info',o:2}],
     loop:true, stagger:0.7,
     snip:{hd:'문장 1',path:'claude-code-bedrock-policy.json',lines:s1,hl:[4],note:'호출 권한과 <b>같은 Resource</b>에 둡니다.'}},
    {kicker:'STEP 3', title:'호출: 프로필과 모델 둘 다',
     body:'<b>InvokeModel</b>과 스트리밍 호출이 실제 대화입니다. 프로필로 불러도 그 뒤의 <b>기반 모델까지 허용</b>해야 호출됩니다.',
     facts:['Resource: 프로필, 앱 프로필, 기반 모델','실제로는 허용할 프로필 ARN으로 좁힘','Claude Code 전용 AWS 계정을 권장'],
     zones:Z, nodes:ALL, hot:['cc','iv','pr','fm'],
     edges:[{f:'cc',t:'iv',c:'accent',o:0},{f:'iv',t:'pr',c:'accent',o:1},{f:'pr',t:'fm',c:'accent',o:2}],
     loop:true, stagger:0.7,
     snip:{hd:'문장 1',path:'claude-code-bedrock-policy.json',lines:s1,hl:[2,3,6,7,8],note:'예시는 와일드카드입니다. 배포할 때는 <b>허용할 프로필 ARN</b>으로 좁힙니다.'}},
    {kicker:'STEP 4', title:'Marketplace: Bedrock을 거칠 때만',
     body:'Anthropic 모델은 Marketplace 구독으로 제공되어, 호출할 때 Bedrock이 <b>구독을 확인</b>합니다. 조건 <b>aws:CalledViaLast</b>로 Bedrock을 거친 요청에만 허용합니다.',
     facts:['ViewSubscriptions, Subscribe','개발자가 직접 구독하는 권한이 아님'],
     zones:Z, nodes:ALL, hot:['iv','mk'],
     edges:[{f:'iv',t:'mk',c:'warning',l:'구독 확인',o:0}],
     loop:true,
     snip:{hd:'문장 3',path:'claude-code-bedrock-policy.json',lines:['{ "Effect": "Allow",','  "Action": [ "aws-marketplace:ViewSubscriptions",','              "aws-marketplace:Subscribe" ],','  "Resource": "*",','  "Condition": { "StringEquals": {','    "aws:CalledViaLast": "bedrock.amazonaws.com" } } }'],hl:[2,3,6],note:'모델 사용 신청(use case 양식)은 계정마다 한 번, 콘솔에서 합니다.'}}
  ], { legend:[['accent','모델 호출'],['info','프로필 조회'],['warning','Marketplace']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• 시작할 때 ListInferenceProfiles(목록, Resource "*" 별도 문장), 앱 프로필이면 GetInferenceProfile(뒤의 모델 확인)
• 대화마다 InvokeModel, InvokeModelWithResponseStream. 프로필과 그 뒤의 기반 모델까지 허용
• GetInferenceProfile이 없으면 새 모델마다 한 번 더 왕복
• Marketplace ViewSubscriptions, Subscribe는 aws:CalledViaLast = bedrock.amazonaws.com 조건으로
• 실제 배포는 허용할 프로필 ARN으로 좁히고, Claude Code 전용 AWS 계정 권장

{cue: demo}
IAM 권한은 Claude Code가 부르는 API를 따라가면 쉬워요. 위에서부터 순서대로 봅니다.↓
첫째, 시작할 때 계정에 어떤 추론 프로필이 있는지 목록을 봐요. ListInferenceProfiles인데, 리소스를 지정할 수 없는 권한이라 Resource 별표인 별도 문장에 둡니다. 다른 ARN 목록과 합치면 목록 조회가 거부돼요.↓
둘째, 팀 이름표 같은 애플리케이션 추론 프로필은 이름만으로는 어떤 모델인지 몰라서 GetInferenceProfile로 뒤의 모델을 읽습니다. 빠져도 호출은 되지만 새 모델마다 한 번씩 더 왕복해요.↓
셋째가 실제 대화, InvokeModel과 스트리밍 호출입니다. 프로필로 부르더라도 그 뒤의 기반 모델까지 허용해야 해요. 예시는 와일드카드지만 실제로는 허용할 프로필 ARN으로 좁혀 주세요.↓
마지막으로 Marketplace 구독 확인 권한을, Bedrock을 거친 요청일 때만 허용하는 조건과 함께 넣습니다.

{cue: transition}
그럼 이 권한을 가진 자격증명은 개발자 PC에 어떻게 줄까요? 키를 나눠 주면 무슨 일이 생기는지부터 보겠습니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (IAM configuration)
• 20261116/ClaudeCode_Ch2_HandsOnLab.html TASK 01 Step 3 (ListInferenceProfiles를 별도 문장으로 둔 최소 정책, 시뮬레이터 확인)
• docs.aws.amazon.com/service-authorization/latest/reference/list_amazonbedrock.html
:::
---
<!-- Slide 10: Key leak versus SSO -->
@type: content
@fit: off

## 복사되는 키, 만료되는 SSO
키는 나눠 주지 않고, 로그인해서 짧게 빌려 쓰기

:::html
<div class="fsi fs" id="c2-key">
  <div class="fs-stage"></div>
  <div class="fs-side">
    <div class="fs-step"></div>
    <div class="fs-title"></div>
    <pre class="fs-code"></pre>
    <div class="fs-say"></div>
    <div class="fs-prog"><i></i></div>
    <div class="fs-hint">장면을 누르거나 ↓ 키로 다음 단계, ↑ 키로 이전 단계</div>
  </div>
</div>
:::

:::script
import('./assets/flowscene.js').then(function (m) { m.mount('#c2-key', {
  aria: '개발자 PC의 장기 액세스 키가 메신저와 저장소로 복사되어 다른 PC에서 Bedrock 호출에 다시 쓰이는 흐름과, aws sso login으로 IAM Identity Center에서 STS 임시 자격증명을 받고 만료되면 awsAuthRefresh로 다시 로그인하는 흐름의 비교',
  zones: [
    { box: [-0.4, 0, 0, 7.4, 4.2, 0.4], label: '개발자 PC (회사)', labelAt: [-0.2, 0, -0.75] },
    { box: [12.0, 2.2, 3.4, 3.6, 2.0, 0.25], label: '회사 밖의 PC', labelAt: [12.1, 2.2, 2.75], sub: true },
    { box: [16.4, 0, 0, 10.6, 4.2, 0.4], label: 'AWS 계정', labelAt: [16.6, 0, -0.75] }
  ],
  parts: {
    pc: { boxes: [[1.4, 1.2, 0.4, 1.8, 1.4, 0.8], [1.7, 2.4, 1.2, 1.2, 0.15, 1.0]] },
    chat: { clouds: [[[6.6, 2.5, 5.0], 50, 19, '메신저']] },
    repo: { clouds: [[[10.2, 2.5, 5.6], 50, 19, '저장소']] },
    ext: { boxes: [[12.9, 2.6, 3.65, 1.6, 1.2, 0.5], [13.1, 3.6, 4.15, 1.1, 0.15, 0.8]] },
    idc: { boxes: [[17.2, 0.8, 0.4, 1.8, 1.4, 1.8]] },
    sts: { boxes: [[20.0, 0.8, 0.4, 1.6, 1.4, 1.4]] },
    bedrock: { boxes: [[23.2, 1.0, 0.4, 2.4, 2.4, 2.8]] }
  },
  marks: [{ id: 'x', at: [22.7, 2.4, 3.7] }],
  tags: [
    { id: 'akia', at: [5.2, 0, 2.3], text: 'AKIA…EXAMPLE (만료 없음)', anchor: 'start', show: ['key', 'leak', 'reuse'] },
    { id: 'tmp', at: [10.6, 0.6, 1.7], text: 'SessionToken + Expiration', show: ['sts', 'expire'] }
  ],
  wires: {
    leak: { pts: [[2.3, 2.4, 2.2], [6.6, 2.5, 4.4], [10.2, 2.5, 5.0]] },
    reuse: { pts: [[10.2, 2.5, 5.0], [13.7, 3.1, 4.3], [19.0, 3.0, 5.0], [23.4, 2.4, 3.5]] },
    sso: { pts: [[3.2, 1.6, 1.0], [17.2, 1.4, 1.2]] },
    sts: { pts: [[20.2, 0.9, 0.9], [3.2, 1.1, 0.7]], cls: 'fs-alt' },
    call: { pts: [[3.2, 0.9, 0.5], [21.6, 0.3, 0.5], [23.4, 1.0, 1.0]], cls: 'fs-alt' }
  },
  callouts: [
    { id: 'key', n: 1, anchor: [2.3, 1.2, 1.2], at: [20, 200], title: '장기 액세스 키', sub: 'aws configure, 지우기 전까지 유효' },
    { id: 'chat', n: 2, anchor: [6.6, 2.5, 5.6], at: [190, 70], title: '메신저, 저장소로 유출', sub: '붙여 넣은 키, 커밋한 .env' },
    { id: 'ext', n: 3, anchor: [13.7, 3.1, 4.9], at: [500, 110], title: '다른 PC에서 재사용', sub: '키만 있으면 같은 권한' },
    { id: 'idc', n: 4, anchor: [18.1, 0.8, 0.4], at: [400, 452], title: 'IAM Identity Center', sub: 'aws sso login, 회사 계정 로그인' },
    { id: 'sts', n: 5, anchor: [20.8, 0.8, 0.4], at: [700, 452], title: 'STS 임시 자격증명', sub: '만료 시각이 붙어 나옴' },
    { id: 'exp', n: 6, anchor: [22.7, 2.4, 3.9], at: [730, 150], title: '만료 시각이 지나면', sub: '복사본도 거부' },
    { id: 'ref', n: 7, anchor: [2.3, 1.2, 0.4], at: [130, 470], title: 'awsAuthRefresh', sub: '만료되면 다시 로그인' }
  ],
  figures: [
    { at: [0.6, 1.9, 0.4], scale: 0.9, pose: 'type', act: { key: 'type', sso: 'type', refresh: 'type', retry: 'type' } },
    { at: [12.4, 3.4, 3.65], scale: 0.75, colour: 'var(--text-muted)', pose: 'type', act: { reuse: 'type', expire: 'type' } }
  ],
  code: [
    '# 나눠 주는 키 (비권장)',
    'aws_access_key_id = AKIA…EXAMPLE',
    '# SSO 프로필 (권장)',
    'aws sso login --profile fsi-dev',
    'export AWS_PROFILE=fsi-dev',
    '"awsAuthRefresh":',
    '  "aws sso login --profile fsi-dev"'
  ],
  overview: { label: '전체 그림', title: '퍼지는 키와 만료되는 자격증명', say: '위쪽은 나눠 준 키가 퍼지는 길, 아래쪽은 SSO로 <b>짧게 빌린 자격증명</b>이 도는 길입니다.' },
  phases: [
    { key: 'key', d: 2.8, focus: ['pc'], badge: 'key', lines: [1, 2], label: '1  장기 키', title: '액세스 키가 PC에 저장된다', say: 'aws configure로 넣은 <b>IAM 사용자 액세스 키</b>는 누가 지우거나 바꿀 때까지 계속 유효합니다.' },
    { key: 'leak', d: 3.2, focus: ['pc', 'chat', 'repo'], badge: 'chat', lines: [2], packet: { wire: 'leak', colour: 'var(--danger)' }, label: '2  유출', title: '메신저와 저장소로 복사된다', say: '설정을 도와주려고 키를 <b>메신저에 붙이거나</b>, 실수로 <b>.env를 커밋</b>하면 키가 회사 밖으로 나갑니다.' },
    { key: 'reuse', d: 3.4, focus: ['repo', 'ext', 'bedrock'], cam: ['repo', 'ext', 'bedrock', 'exp'], badge: 'ext', lines: [2], packet: { wire: 'reuse', colour: 'var(--danger)' }, label: '3  재사용', title: '다른 곳에서 그대로 호출된다', say: '키를 가진 누구든 <b>다른 PC에서 같은 권한으로</b> Bedrock을 부릅니다. 키에는 만료가 없습니다.' },
    { key: 'sso', d: 3.4, focus: ['pc', 'idc'], badge: 'idc', lines: [3, 4, 5], packet: { wire: 'sso', mode: 'pingpong', colour: 'var(--info)' }, label: '4  SSO 로그인', title: '키 대신 회사 계정으로 로그인', say: 'PC에는 오래 가는 키가 없습니다. <b>aws sso login</b>이 브라우저를 열고 <b>IAM Identity Center</b>에 회사 계정으로 로그인합니다.' },
    { key: 'sts', d: 3.0, focus: ['sts', 'pc'], cam: ['sts', 'idc', 'pc'], badge: 'sts', lines: [5], packet: { wire: 'sts', colour: 'var(--success)' }, label: '5  임시 자격증명', title: '짧게 사는 STS 자격증명', say: 'PC가 받는 것은 <b>STS 임시 자격증명</b>입니다. 만료 시각이 붙어 있어, 시간이 지나면 저절로 못 씁니다.' },
    { key: 'expire', d: 3.4, focus: ['ext', 'bedrock'], cam: ['ext', 'bedrock', 'exp'], badge: 'exp', lines: [], packet: { wire: 'reuse', span: [1, 3], mode: 'block', stopAt: 0.7, mark: 'x' }, label: '6  만료', title: '새어 나가도 곧 쓸모없다', say: '이 자격증명이 어딘가에 복사되더라도, <b>만료 시각이 지나면</b> 호출은 거부됩니다.' },
    { key: 'refresh', d: 3.6, focus: ['pc', 'idc'], badge: 'ref', lines: [6, 7], packet: { wire: 'sso', mode: 'pingpong', colour: 'var(--warning)' }, label: '7  awsAuthRefresh', title: '만료되면 Claude Code가 다시 로그인', say: '만료를 감지하면 <b>GetCallerIdentity</b>로 한 번 더 확인하고, <b>awsAuthRefresh</b>에 넣은 aws sso login을 실행합니다.' },
    { key: 'retry', d: 3.0, focus: ['pc', 'bedrock'], cam: ['pc', 'idc', 'sts', 'bedrock'], lines: [5], packet: { wire: 'call' }, label: '8  이어서 호출', title: '새 자격증명으로 같은 요청을 다시', say: '로그인이 끝나면 새 자격증명으로 <b>요청을 다시 보내고</b>, 세션은 그대로 이어집니다.' }
  ],
  frame: function (c) {
    ['leak', 'reuse'].forEach(function (id) { var n = c.wires[id].node; n.style.stroke = n.classList.contains('on') && (c.all || c.ph.key !== 'expire') ? 'var(--danger)' : ''; });
    c.parts.bedrock.querySelector('.fs-top').style.fill = c.ph.key === 'reuse' && c.u > 0.8 ? 'var(--danger)' : (c.ph.key === 'retry' && c.u > 0.8 ? 'var(--accent)' : '');
  }
}); });
:::

:::notes
{timing: 2min}
[요약]
• 장기 액세스 키는 지우거나 바꿀 때까지 유효, 메신저나 저장소로 복사되면 다른 PC에서 같은 권한으로 호출
• SSO: aws sso login으로 IAM Identity Center에 회사 계정 로그인, PC는 STS 임시 자격증명만 받음
• 임시 자격증명은 만료 시각이 지나면 거부, 복사돼도 피해가 짧음
• 만료되면 Claude Code가 GetCallerIdentity로 확인한 뒤 awsAuthRefresh(aws sso login)를 실행하고 요청을 다시 보냄

{cue: demo}
위쪽은 키를 나눠 줬을 때, 아래쪽은 SSO로 로그인했을 때입니다.↓
먼저 위쪽이요. aws configure로 넣은 IAM 사용자 액세스 키는 누가 지우기 전까지 계속 유효합니다.↓ 그런데 설정을 도와주다가 이 키를 메신저에 붙여 넣거나, .env 파일을 실수로 커밋하면 키가 회사 밖으로 나가요.↓
그러면 키를 가진 누구든 다른 PC에서 같은 권한으로 Bedrock을 부를 수 있습니다. 키에는 만료가 없거든요.↓
{cue: pause}
아래쪽은 SSO예요. PC에는 오래 가는 키가 없고, aws sso login으로 회사 계정에 로그인합니다.↓ 그러면 IAM Identity Center를 통해 만료 시각이 붙은 STS 임시 자격증명을 받아요.↓
이 자격증명이 어딘가에 복사되더라도 시간이 지나면 거부됩니다.↓
만료되면 어떻게 하냐고요? Claude Code가 GetCallerIdentity로 진짜 만료됐는지 확인하고, awsAuthRefresh에 넣어 둔 aws sso login을 대신 실행합니다.↓ 로그인하시면 같은 요청을 다시 보내고 세션은 그대로 이어져요.

{cue: transition}
그래서 다섯 가지 자격증명 방식 중에 권장은 하나입니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (2. Configure AWS credentials, Advanced credential configuration)
• docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html (IAM 사용자 액세스 키 경고)
• docs.aws.amazon.com/singlesignon/latest/userguide/howtogetcredentials.html
:::
---
<!-- Slide 11: Five credential methods -->
@type: content
@fit: off

## 다섯 가지 중 권장은 하나
Bedrock API 키만 AWS SDK 기본 체인을 거치지 않음

:::html
<div id="c2-sv-cred"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:450,h:420,l:'방식 다섯 가지'},{x:500,y:30,w:330,h:420,l:'CLAUDE CODE'},{x:860,y:30,w:300,h:420,l:'AWS',tone:'info'}];
  var CF = {id:'cf',x:40,y:72,w:410,h:66,t:'aws configure',s:'장기 키를 ~/.aws에 저장',c:'danger'};
  var AK = {id:'ak',x:40,y:146,w:410,h:66,t:'액세스 키 환경변수',s:'IAM 사용자 키면 장기 키',c:'danger'};
  var SS = {id:'ss',x:40,y:220,w:410,h:66,t:'SSO 프로필 (권장)',s:'aws sso login, 임시 자격증명',c:'success'};
  var CO = {id:'co',x:40,y:294,w:410,h:66,t:'콘솔 자격증명',s:'aws login, 최대 12시간',c:'info'};
  var AP = {id:'ap',x:40,y:368,w:410,h:66,t:'Bedrock API 키',s:'AWS_BEARER_TOKEN_BEDROCK',c:'warning'};
  var CH = {id:'ch',x:520,y:190,w:290,h:100,t:'AWS SDK 기본 체인',s:'찾아서 캐시하고 서명',c:'accent'};
  var BR = {id:'br',x:880,y:190,w:260,h:100,t:'Amazon Bedrock',s:'요청을 받는 곳',c:'info'};
  var ALL = [CF,AK,SS,CO,AP,CH,BR];
  var chain = [{f:'cf',t:'ch',c:'danger',o:0},{f:'ak',t:'ch',c:'danger',o:0},{f:'ss',t:'ch',c:'success',o:0},{f:'co',t:'ch',c:'info',o:0}];
  F.stepviz('#c2-sv-cred', [
    {kicker:'OVERVIEW', title:'네 가지는 체인으로, 하나는 체인 밖',
     body:'위의 네 방식은 <b>AWS SDK 기본 체인</b>이 찾아 쓰고, Bedrock API 키만 체인을 건너뜁니다. 금융권 권장은 가운데 <b>SSO 프로필</b> 하나입니다.',
     facts:['권장: SSO 프로필','보조: 콘솔 자격증명','비권장: 장기 키, Bedrock API 키'],
     zones:Z, nodes:ALL,
     edges:chain.concat([{f:'ch',t:'br',c:'accent',o:1},{f:'ap',t:'br',c:'warning',curve:70,o:0}]),
     loop:true, stagger:0.8,
     snip:{hd:'권장 설정',path:'~/.claude/settings.json',lines:['{','  "env": {','    "CLAUDE_CODE_USE_BEDROCK": "1",','    "AWS_PROFILE": "fsi-dev"','  }','}'],hl:[4],note:'AWS_PROFILE이 <b>SSO 프로필</b>을 가리키게 합니다.'}},
    {kicker:'STEP 1', title:'장기 키 두 가지: 비권장',
     body:'aws configure는 IAM 사용자 키를 <b>~/.aws/credentials</b>에 저장합니다. 환경변수 방식도 IAM 사용자 키라면 <b>지우기 전까지 유효</b>합니다. 앞 장의 유출 장면이 이 경우입니다.',
     facts:['AWS도 IAM 사용자 키 사용을 경고','세션 토큰이 있으면 임시 자격증명'],
     zones:Z, nodes:ALL, hot:['cf','ak','ch'],
     edges:[{f:'cf',t:'ch',c:'danger',o:0},{f:'ak',t:'ch',c:'danger',o:1}],
     loop:true, stagger:0.6,
     snip:{hd:'나눠 주게 되는 것',path:'Terminal',lines:['aws configure   # ~/.aws/credentials에 저장','export AWS_ACCESS_KEY_ID=...','export AWS_SECRET_ACCESS_KEY=...'],hl:[1,2,3],note:'키를 <b>나눠 주는 순간</b> 회수와 교체가 운영 업무가 됩니다.'}},
    {kicker:'STEP 2', title:'SSO 프로필: 권장',
     body:'<b>IAM Identity Center</b>에 브라우저로 로그인해 <b>임시 자격증명</b>을 받습니다. 나눠 줄 키가 없고, 만료되면 다음 장의 자동 재로그인으로 이어 갑니다.',
     facts:['회사 계정 로그인 한 번','만료가 있는 임시 자격증명','sso_region은 Bedrock 리전과 달라도 됨'],
     zones:Z, nodes:ALL, hot:['ss','ch','br'],
     edges:[{f:'ss',t:'ch',c:'success',o:0},{f:'ch',t:'br',c:'accent',o:1}],
     loop:true, stagger:0.7,
     snip:{hd:'SSO 프로필',path:'Terminal',lines:['aws configure sso   # 처음 한 번','aws sso login --profile fsi-dev','export AWS_PROFILE=fsi-dev'],hl:[2,3],note:'Lab 환경은 인스턴스 역할을 쓰므로 <b>키 배포 경로가 아예 없습니다</b>.'}},
    {kicker:'STEP 3', title:'콘솔 자격증명: 보조 수단',
     body:'<b>aws login</b>은 AWS 콘솔 계정으로 브라우저 로그인해 임시 자격증명을 받습니다. 세션은 <b>최대 12시간</b>입니다.',
     facts:['AWS CLI 2.32.0 이상','Identity Center를 쓰지 않는 계정용'],
     zones:Z, nodes:ALL, hot:['co','ch'],
     edges:[{f:'co',t:'ch',c:'info',o:0}],
     loop:true,
     snip:{hd:'콘솔 자격증명',path:'Terminal',lines:['aws login   # 12시간이 지나면 다시'],hl:[1],note:'회사에 Identity Center가 있으면 <b>SSO 프로필</b>을 씁니다.'}},
    {kicker:'STEP 4', title:'Bedrock API 키: 체인 밖',
     body:'<b>AWS_BEARER_TOKEN_BEDROCK</b>이 있으면 Claude Code는 다른 자격증명이 있어도 <b>체인을 보지 않고</b> 이 키로만 인증합니다.',
     facts:['단기 키: 최대 12시간','장기 키: AWS도 탐색용으로만 권장','배포용으로는 비권장'],
     zones:Z, nodes:ALL, hot:['ap','br'],
     edges:[{f:'ap',t:'br',c:'warning',curve:70,o:0}],
     loop:true,
     snip:{hd:'Bedrock API 키',path:'Terminal',lines:['export AWS_BEARER_TOKEN_BEDROCK=...','# 체인과 자격증명 캐시를 거치지 않음'],hl:[1],note:'키 하나가 곧 권한이라, <b>나눠 주는 키</b>와 같은 문제가 생깁니다.'}}
  ], { legend:[['success','권장'],['info','보조'],['danger','장기 키'],['warning','체인 밖']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• Claude Code는 AWS SDK 기본 체인을 따름. Bedrock API 키(AWS_BEARER_TOKEN_BEDROCK)만 체인을 거치지 않음
• 권장: SSO 프로필(aws sso login + AWS_PROFILE)
• 비권장: aws configure와 액세스 키 환경변수(IAM 사용자 장기 키), Bedrock API 키
• 보조: aws login 콘솔 자격증명, 최대 12시간

{cue: demo}
자격증명 방식은 다섯 가지예요. 왼쪽 위 네 개는 AWS SDK 기본 체인이 찾아 쓰고, 맨 아래 Bedrock API 키만 체인을 건너뜁니다.↓
위의 두 개, aws configure와 액세스 키 환경변수는 IAM 사용자의 장기 키라서 방금 장면처럼 퍼질 수 있어요. 권하지 않습니다.↓
권장은 가운데 SSO 프로필 하나예요. 회사 계정으로 로그인해서 임시 자격증명을 받습니다.↓
aws login 콘솔 자격증명은 최대 12시간짜리 보조 수단입니다.↓ Bedrock API 키는 키 하나가 곧 권한이라 배포용으로는 권하지 않습니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (2. Configure AWS credentials)
• docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html

[약어]
• SSO: Single Sign-On
:::
---
<!-- Slide 12: SSO auto refresh -->
@type: content
@fit: off

## 만료 시 자동 재로그인
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
  var ST = {id:'st',x:840,y:80,w:290,h:92,t:'GetCallerIdentity',s:'정말 만료됐는지 확인',c:'info'};
  var IC = {id:'ic',x:840,y:330,w:290,h:92,t:'IAM Identity Center',s:'브라우저 SSO 로그인',c:'info'};
  var EX = {id:'ex',x:440,y:80,w:310,h:92,t:'awsCredentialExport',s:'세션 시작마다 실행',c:'warning'};
  var cfg = ['{','  "awsAuthRefresh": "aws sso login --profile fsi-dev",','  "env": {','    "AWS_PROFILE": "fsi-dev"','  }','}'];
  F.stepviz('#c2-sv-sso', [
    {kicker:'OVERVIEW', title:'캐시, 확인, 재로그인, 다시 호출',
     body:'평소에는 <b>캐시</b>한 자격증명을 쓰고, 만료되면 <b>정말 만료됐는지 확인</b>한 뒤 <b>로그인 명령</b>을 대신 실행합니다.',
     facts:['평소: 메모리 캐시','만료: GetCallerIdentity로 확인','갱신: awsAuthRefresh 실행 후 재시도'],
     zones:Z, nodes:[CC,CA,RF,AW,ST,IC],
     edges:[{f:'cc',t:'st',c:'info',side:'h',curve:-70,o:0},{f:'cc',t:'rf',c:'warning',o:1},{f:'rf',t:'ic',c:'warning',o:2},{f:'ic',t:'aw',c:'info',o:3},{f:'aw',t:'ca',c:'info',o:4},{f:'ca',t:'cc',c:'info',o:5}],
     loop:true, stagger:0.6,
     snip:{hd:'설정 한 장',path:'~/.claude/settings.json',lines:cfg,hl:[2,4],note:'두 줄이면 됩니다. <b>AWS_PROFILE</b>은 SSO 프로필, <b>awsAuthRefresh</b>는 그 로그인 명령입니다.'}},
    {kicker:'STEP 1', title:'세션 시작: 찾고, 캐시',
     body:'Claude Code는 <b>AWS SDK 기본 체인</b>으로 자격증명을 한 번 찾고 메모리에 둡니다. <b>만료 5분 전까지</b>, 만료 정보가 없으면 1시간 동안 다시 씁니다.',
     facts:['만료 5분 전까지 메모리 캐시','만료 정보가 없으면 1시간','체인 해석 60초 타임아웃'],
     zones:Z, nodes:[CC,CA,RF,AW,ST,IC], hot:['cc','aw','ca'],
     edges:[{f:'cc',t:'aw',c:'info',l:'체인 해석',o:0},{f:'aw',t:'ca',c:'info',l:'캐시',o:1},{f:'ca',t:'cc',c:'info',o:2}],
     loop:true, stagger:0.8,
     snip:{hd:'설정 한 장',path:'~/.claude/settings.json',lines:cfg,hl:[4],note:'AWS_PROFILE로 <b>SSO 프로필</b>을 가리킵니다.'}},
    {kicker:'STEP 2', title:'만료되면 로그인 명령을 대신 실행',
     body:'시각으로 만료를 알거나 API가 자격증명 오류를 내면, 먼저 <b>GetCallerIdentity</b>로 확인합니다. 정말 만료됐을 때만 <b>awsAuthRefresh</b>를 실행하고 요청을 다시 보냅니다.',
     facts:['아직 유효하면 명령을 건너뜀','.aws를 갱신하는 명령을 넣음','출력은 보이지만 입력은 받지 않음'],
     zones:Z, nodes:[CC,CA,RF,AW,ST,IC], hot:['cc','rf','st','ic','aw'],
     edges:[{f:'cc',t:'st',c:'info',side:'h',curve:-70,l:'만료 확인',o:0},{f:'cc',t:'rf',c:'warning',l:'만료 시',o:1},{f:'rf',t:'ic',c:'warning',l:'브라우저 SSO',o:2},{f:'ic',t:'aw',c:'info',l:'갱신',o:3},{f:'aw',t:'cc',c:'info',o:4}],
     loop:true, stagger:0.6,
     snip:{hd:'설정 한 장',path:'~/.claude/settings.json',lines:cfg,hl:[2],note:'<b>aws sso login</b>을 Claude Code가 대신 실행합니다.'}},
    {kicker:'STEP 3', title:'교차 계정이면 awsCredentialExport',
     body:'<b>awsCredentialExport</b>는 세션 시작과 자격증명을 다시 읽을 때마다 실행되고, 자격증명을 <b>JSON으로 출력</b>하는 명령을 넣습니다. .aws를 바꿀 수 없을 때만 씁니다.',
     facts:['세션 시작마다 실행, 출력은 숨김','Expiration이 있으면 5분 전까지 캐시','awsAuthRefresh와 쓰임이 다름'],
     zones:Z, nodes:[CC,CA,EX,AW,ST,IC], hot:['cc','ex'],
     edges:[{f:'ex',t:'cc',c:'warning',l:'JSON 자격증명',o:0}],
     loop:true,
     snip:{hd:'두 설정의 차이',path:'settings.json 키',lines:['awsAuthRefresh       # 만료됐을 때만, .aws 갱신','awsCredentialExport  # 세션 시작마다, JSON 출력'],hl:[1,2],note:'같은 계정은 awsAuthRefresh, <b>교차 계정</b>은 awsCredentialExport입니다.'}},
    {kicker:'STEP 4', title:'막힐 때 보는 곳',
     body:'VPN이나 TLS 검사 프록시가 브라우저 로그인을 끊으면 로그인 탭이 <b>계속 열립니다</b>. 이때는 <b>awsAuthRefresh를 빼고</b> 시작 전에 aws sso login을 직접 실행합니다.',
     facts:['확인 호출도 HTTPS_PROXY를 따름','사내 루트 인증서: OS 저장소나 NODE_EXTRA_CA_CERTS','무한 로그인 탭: awsAuthRefresh 제거'],
     zones:Z, nodes:[CC,CA,{id:'rf',x:440,y:80,w:310,h:92,t:'awsAuthRefresh',s:'무한 로그인 탭이면 제거',c:'danger'},AW,ST,IC], hot:['rf','cc'],
     edges:[{f:'cc',t:'rf',c:'danger',l:'반복 실행',o:0},{f:'rf',t:'cc',c:'danger',curve:60,o:1}],
     loop:true, stagger:0.6,
     snip:{hd:'Identity Center와 함께',path:'managed-settings.json (예시)',lines:['{','  "awsAuthRefresh": "aws sso login --profile fsi-dev",','  "env": {','    "CLAUDE_CODE_USE_BEDROCK": "1",','    "AWS_PROFILE": "fsi-dev",','    "AWS_REGION": "us-east-1"','  }','}'],hl:[2,5],note:'Identity Center <b>권한 세트로 Bedrock 최소 권한</b>을 줍니다.'}}
  ], {legend:[['accent','Claude Code'],['info','자격증명 흐름'],['warning','갱신 명령'],['danger','문제 상황']]});
});
:::

:::notes
{timing: 2min}
[요약]
• 자격증명은 만료 5분 전까지(만료 정보가 없으면 1시간) 메모리 캐시, 체인 해석 60초 타임아웃
• awsAuthRefresh: 시각이나 API 오류로 만료를 알면 GetCallerIdentity로 확인하고, 정말 만료됐을 때만 실행 후 재시도
• awsCredentialExport: 세션 시작과 재로드마다 실행, JSON 출력, .aws를 바꿀 수 없는 교차 계정용
• 무한 로그인 탭이면 awsAuthRefresh를 빼고 aws sso login을 직접 실행

{cue: demo}
방금 장면의 마지막 부분, 자동 재로그인을 조금 더 자세히 보겠습니다. 설정은 두 줄이에요. AWS_PROFILE은 SSO 프로필, awsAuthRefresh는 그 로그인 명령입니다.↓
첫 번째, 세션을 시작하면 SDK 체인으로 자격증명을 한 번 찾고 메모리에 둡니다. 만료 5분 전까지 다시 쓰고요.↓
두 번째, 만료됐다 싶으면 먼저 GetCallerIdentity로 정말 만료됐는지 확인해요. 정말 만료됐을 때만 awsAuthRefresh의 aws sso login을 실행하고, 로그인하시면 요청을 다시 보냅니다.↓
세 번째, .aws를 바꿀 수 없는 교차 계정이면 awsCredentialExport를 씁니다. 세션 시작마다 실행되고 자격증명을 JSON으로 내놓아요.↓
네 번째, VPN이나 TLS 검사 프록시 때문에 로그인 탭이 계속 열리면 awsAuthRefresh를 빼고, 시작 전에 aws sso login을 직접 실행하시면 됩니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (Credential caching and resolution timeout, Advanced credential configuration, Troubleshooting)
• code.claude.com/docs/en/settings-reference (awsAuthRefresh, awsCredentialExport)

[약어]
• TLS: Transport Layer Security
:::
---
<!-- Slide 13: Quick check 1 -->
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
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, Opus 5.5
• 고정하지 않으면 Opus 단가로 청구
• 그래서 여러 사용자에게 배포할 때는 반드시 고정

여기서 퀴즈 하나 갈게요. 모델을 고정하지 않은 Bedrock 배포에서 기본 주 모델은 뭘까요? 손 들어서 답해 주세요.↓
{cue: pause}
정답은 B, Opus 5.5예요. 고정하지 않으면 모든 사용자가 Opus 단가로 청구되거든요. 그래서 다음 슬라이드처럼 반드시 고정해야 합니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (4. Pin model versions)
:::
---
<!-- Slide 14: Model version pinning -->
@type: content
@fit: off

## 여러 사용자에게 배포하면 반드시 고정
별칭이 어느 모델 ID로 가는지 정하기

:::html
<div id="c2-sv-pin"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:290,h:420,l:'사용자가 고름'},{x:340,y:30,w:400,h:420,l:'CLAUDE CODE가 바꿈'},{x:770,y:30,w:390,h:420,l:'BEDROCK 모델 ID',tone:'info'}];
  var AL = {id:'al',x:40,y:189,w:250,h:92,t:'opus, sonnet',s:'/model의 별칭',c:'accent'};
  var DF = {id:'df',x:370,y:80,w:340,h:92,t:'1 내장 기본값',s:'Claude Code 버전마다 바뀜',c:'warning'};
  var PN = {id:'pn',x:370,y:199,w:340,h:92,t:'2 managed env 고정',s:'ANTHROPIC_DEFAULT_*_MODEL',c:'success'};
  var PX = {id:'px',x:370,y:318,w:340,h:92,t:'3 리전 → prefix',s:'us. eu. apac. global.',c:'info'};
  var I1 = {id:'i1',x:800,y:80,w:330,h:92,t:'Opus 5.5',s:'고정 안 하면 주 모델',c:'warning'};
  var I2 = {id:'i2',x:800,y:199,w:330,h:92,t:'고정한 그 ID',s:'global.anthropic.claude-opus-5-5',c:'success'};
  var I3 = {id:'i3',x:800,y:318,w:330,h:92,t:'prefix + 모델',s:'계정에 있는 프로필 ID',c:'info'};
  var ALL = [AL,DF,PN,PX,I1,I2,I3];
  var pin = ['# 이 랩: us-east-1, global 프로필','ANTHROPIC_DEFAULT_OPUS_MODEL=','  global.anthropic.claude-opus-5-5','ANTHROPIC_DEFAULT_SONNET_MODEL=','  global.anthropic.claude-sonnet-5-5','ANTHROPIC_DEFAULT_HAIKU_MODEL=','  global.anthropic.claude-haiku-5-5'];
  F.stepviz('#c2-sv-pin', [
    {kicker:'OVERVIEW', title:'별칭은 그대로, 가는 곳은 정해 둠',
     body:'사용자는 <b>opus, sonnet</b> 같은 별칭을 고릅니다. 고정하지 않으면 <b>내장 기본값</b>으로, 고정하면 <b>정한 ID</b>로 갑니다.',
     facts:['고정 안 함: Opus 5.5, Opus 단가','고정: managed settings env','prefix: 리전 그룹을 따름'],
     zones:Z, nodes:ALL,
     edges:[{f:'al',t:'df',c:'warning',dash:true},{f:'df',t:'i1',c:'warning',dash:true},{f:'al',t:'pn',c:'success',o:0},{f:'pn',t:'i2',c:'success',o:1},{f:'px',t:'i3',c:'info',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'세 줄 고정',path:'managed-settings.json의 env',lines:pin,hl:[2,3,4,5,6,7],note:'여러 사용자에게 배포한다면 <b>이 세 줄이 기본</b>입니다.'}},
    {kicker:'STEP 1', title:'고정하지 않으면 내장 기본값',
     body:'<b>opus</b> 별칭은 Claude Code에 들어 있는 기본값으로 갑니다. 지금 주 모델은 <b>Opus 5.5</b>라 Opus 단가로 청구되고, Claude Code를 올리면 기본값도 바뀔 수 있습니다.',
     facts:['주 모델: Opus 5.5','계정에 없으면 이번 세션만 낮은 모델로 대체','언제 바뀔지 조직이 정하지 못함'],
     zones:Z, nodes:ALL, hot:['al','df','i1'],
     edges:[{f:'al',t:'df',c:'warning',o:0},{f:'df',t:'i1',c:'warning',o:1}],
     loop:true, stagger:0.7,
     snip:{hd:'고정 없음',path:'Bedrock 기본값',lines:['# 주 모델: Opus 5.5','#   예: us.anthropic.claude-opus-5-5 (us-* 리전)','# 보조 작업: 기본 Sonnet'],hl:[1],note:'퀴즈의 정답이 이 경우입니다.'}},
    {kicker:'STEP 2', title:'managed settings env로 고정',
     body:'여러 사용자에게 배포할 때는 <b>managed settings의 env</b>에 세 모델을 고정합니다. managed env의 고정은 시작할 때 <b>새 버전 제안도 띄우지 않습니다</b>.',
     facts:['OPUS, SONNET, HAIKU 세 줄','바꾸는 시점을 조직이 정함','값은 계정에 있는 프로필 ID'],
     zones:Z, nodes:ALL, hot:['al','pn','i2'],
     edges:[{f:'al',t:'pn',c:'success',o:0},{f:'pn',t:'i2',c:'success',o:1}],
     loop:true, stagger:0.7,
     snip:{hd:'세 줄 고정',path:'managed-settings.json의 env',lines:pin,hl:[2,3,4,5,6,7],note:'Lab 1에서 이 세 줄을 managed settings로 배포합니다.'}},
    {kicker:'STEP 3', title:'prefix는 리전 그룹을 따름',
     body:'모델 ID 앞의 prefix는 리전에서 나옵니다. us-*는 <b>us.</b>, eu-*는 <b>eu.</b>, 서울을 포함한 ap-*는 <b>apac.</b>, 그 밖은 <b>global.</b>입니다.',
     facts:['이 랩: us-east-1에서 global 프로필','계정에서 켜진 프로필인지 확인'],
     zones:Z, nodes:ALL, hot:['px','i3'],
     edges:[{f:'px',t:'i3',c:'info',o:0}],
     loop:true,
     snip:{hd:'리전과 prefix',path:'amazon-bedrock 문서',lines:['us-*    → us.','eu-*    → eu.','ap-*    → apac.    # 서울 포함','그 밖   → global.'],hl:[3],note:'고정할 때는 이 prefix가 붙은 <b>계정의 프로필 ID</b>를 적습니다.'}},
    {kicker:'STEP 4', title:'prefix만 바꾸는 방법',
     body:'<b>ANTHROPIC_BEDROCK_REGION_PREFIX</b>는 내장 기본값은 그대로 두고 prefix만 바꿉니다. 버전까지 정하려면 STEP 2의 고정을 씁니다.',
     facts:['허용값: us, eu, apac, jp, au, global','기본값의 버전은 여전히 바뀔 수 있음'],
     zones:Z, nodes:ALL, hot:['al','df','px','i3'],
     edges:[{f:'al',t:'df',c:'warning',o:0},{f:'df',t:'px',c:'info',o:1},{f:'px',t:'i3',c:'info',o:2}],
     loop:true, stagger:0.7,
     snip:{hd:'prefix만',path:'환경변수',lines:['export ANTHROPIC_BEDROCK_REGION_PREFIX=global','# opus → global.anthropic.','#        claude-opus-5-5'],hl:[1],note:'예를 들어 us-* 리전에서도 <b>global.</b> 프로필을 쓰게 합니다.'}}
  ], { legend:[['accent','별칭'],['warning','내장 기본값'],['success','고정'],['info','prefix']]});
});
:::

:::notes
{timing: 2min}
[요약]
• 고정하지 않으면 별칭이 내장 기본값(주 모델 Opus 5.5)으로, Claude Code 버전에 따라 바뀜
• 여러 사용자 배포는 managed settings env의 ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL로 고정, 새 버전 제안도 뜨지 않음
• prefix 규칙: us-*는 us., eu-*는 eu., ap-*(서울 포함)는 apac., 그 외는 global.
• ANTHROPIC_BEDROCK_REGION_PREFIX는 기본값을 두고 prefix만 바꿈 (us, eu, apac, jp, au, global)

{cue: demo}
퀴즈에서 봤듯이, 사용자는 opus, sonnet 같은 별칭을 고르고 Claude Code가 그걸 실제 모델 ID로 바꿔요. 위에서부터 세 갈래를 보겠습니다.↓
첫째, 고정하지 않으면 Claude Code에 들어 있는 기본값으로 갑니다. 지금은 Opus 5.5라 Opus 단가로 청구되고, Claude Code를 올리면 기본값도 바뀔 수 있어요.↓
둘째, 그래서 여러 사용자에게 배포할 때는 managed settings의 env에 세 모델을 고정합니다. 이렇게 고정하면 새 버전 제안도 뜨지 않고, 바꾸는 시점을 조직이 정해요.↓
셋째, 모델 ID 앞의 prefix는 리전 그룹을 따릅니다. 서울을 포함한 ap 리전은 apac., 이 랩처럼 global 프로필을 쓰면 global.이고요.↓
버전은 두고 prefix만 바꾸고 싶으면 ANTHROPIC_BEDROCK_REGION_PREFIX를 씁니다. 어느 쪽이든 실제 값은 고객님 계정에 있는 프로필 ID로 채워 주세요.

[출처]
• code.claude.com/docs/en/amazon-bedrock (4. Pin model versions, Startup model checks, Cross-region inference profile prefixes)
:::
---
<!-- Slide 15: Team cost tagging -->
@type: content
@fit: off

## 팀마다 다른 이름표, 추론 프로필
누구의 호출이 어느 프로필을 지났는지 남기기

:::html
<div id="c2-sv-tag"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:30,w:290,h:420,l:'팀'},{x:340,y:30,w:420,h:420,l:'팀별 이름표',tone:'info'},{x:790,y:30,w:370,h:420,l:'기록과 통제'}];
  var TA = {id:'ta',x:40,y:80,w:250,h:92,t:'A팀 개발자',s:'A팀 정책을 받음',c:'accent'};
  var TB = {id:'tb',x:40,y:318,w:250,h:92,t:'B팀 개발자',s:'B팀 정책을 받음',c:'accent'};
  var PA = {id:'pa',x:370,y:80,w:360,h:92,t:'A팀 이름표',s:'sonnet-team-a',c:'info'};
  var MD = {id:'md',x:370,y:199,w:360,h:92,t:'같은 Sonnet 5.5',s:'원본 global 프로필',c:'muted'};
  var PB = {id:'pb',x:370,y:318,w:360,h:92,t:'B팀 이름표',s:'sonnet-team-b',c:'info'};
  var LG = {id:'lg',x:815,y:80,w:320,h:92,t:'CloudTrail 기록',s:'누가, 어느 프로필로',c:'success'};
  var CO = {id:'co',x:815,y:199,w:320,h:92,t:'비용 태그',s:'계산은 Ch6에서',c:'muted'};
  var IA = {id:'ia',x:815,y:318,w:320,h:92,t:'IAM 정책',s:'자기 팀 이름표만 허용',c:'warning'};
  var ALL = [TA,TB,PA,MD,PB,LG,CO,IA];
  F.stepviz('#c2-sv-tag', [
    {kicker:'OVERVIEW', title:'팀마다 이름표 하나, 기록에 남는 이름',
     body:'같은 모델을 써도 팀마다 <b>자기 이름표</b>를 달고 부릅니다. 그러면 기록만 보고도 <b>누구의 호출인지</b> 알고, 다른 팀 이름표는 막을 수 있습니다.',
     facts:['1 팀마다 이름표 (앱 추론 프로필)','2 정책으로 배포 (modelOverrides)','3 기록과 통제 (CloudTrail, IAM)','비용 계산은 Ch6에서'],
     zones:Z, nodes:ALL,
     edges:[{f:'ta',t:'pa',c:'accent',o:0},{f:'tb',t:'pb',c:'accent',o:0},{f:'pa',t:'md',c:'info',o:1},{f:'pb',t:'md',c:'info',o:1},{f:'pa',t:'lg',c:'success',o:2},{f:'pb',t:'ia',c:'warning',o:2}],
     loop:true, stagger:0.8,
     snip:{hd:'개념',path:'팀 → 이름표 → 모델',lines:['A팀 → sonnet-team-a → Sonnet 5.5','B팀 → sonnet-team-b → Sonnet 5.5'],hl:[1,2],note:'이름표의 정식 이름은 <b>애플리케이션 추론 프로필</b>입니다.'}},
    {kicker:'STEP 1', title:'팀마다 자기 이름표',
     body:'원본 프로필을 복사해 팀 이름과 태그를 단 <b>애플리케이션 추론 프로필</b>을 만듭니다. 모델은 같고, <b>이름표만</b> 팀마다 다릅니다.',
     facts:['원본 프로필의 모델과 리전을 그대로 따름','태그: team, costcenter'],
     zones:Z, nodes:ALL, hot:['ta','tb','pa','pb','md'],
     edges:[{f:'ta',t:'pa',c:'accent',o:0},{f:'tb',t:'pb',c:'accent',o:0},{f:'pa',t:'md',c:'info',o:1},{f:'pb',t:'md',c:'info',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'개념',path:'팀 → 이름표 → 모델',lines:['A팀 → sonnet-team-a → Sonnet 5.5','B팀 → sonnet-team-b → Sonnet 5.5'],hl:[1,2],note:'만드는 명령과 실제 문자열은 <b>마지막 단계</b>에서 봅니다.'}},
    {kicker:'STEP 2', title:'이름표는 정책으로 배포',
     body:'팀마다 <b>managed settings</b>의 <b>modelOverrides</b>로 모델 이름을 그 팀 이름표에 묶습니다. /model에서 무엇을 골라도 <b>이 이름표로</b> 갑니다.',
     facts:['/model 선택도 이름표로 라우팅','이름표로 고정하면 새 버전 제안이 뜨지 않음'],
     zones:Z, nodes:ALL, hot:['ta','pa'],
     edges:[{f:'ta',t:'pa',c:'accent',o:0}],
     loop:true,
     snip:{hd:'A팀의 정책',path:'managed-settings.json',lines:['"modelOverrides": {','  "claude-sonnet-5-5": "<A팀 이름표의 ARN>"','}'],hl:[2],note:'개발자가 이름표를 고르지 않습니다. <b>정책이 정해 줍니다</b>.'}},
    {kicker:'STEP 3', title:'기록이 누구의 호출인지 말함',
     body:'Bedrock 호출은 CloudTrail에 <b>누가</b>(SSO 사용자), <b>어느 프로필로</b> 불렀는지 남습니다. 모델 호출 로그와 사용량 지표도 이름표별로 봅니다.',
     facts:['CloudTrail: InvokeModel이 관리 이벤트로 기록','감사 질문: 이 호출은 어느 팀인가','태그로 나눈 비용 계산은 Ch6'],
     zones:Z, nodes:ALL, hot:['pa','pb','lg','co'],
     edges:[{f:'pa',t:'lg',c:'success',o:0},{f:'pb',t:'lg',c:'success',o:1},{f:'pb',t:'co',c:'muted',dash:true}],
     loop:true, stagger:0.7,
     snip:{hd:'기록에 남는 것',path:'CloudTrail 이벤트 (요약)',lines:['eventName: InvokeModel','userIdentity: fsi-dev 사용자 (SSO 역할)','modelId: <A팀 이름표의 ARN>'],hl:[2,3],note:'사람과 팀이 <b>한 줄에 같이</b> 남습니다.'}},
    {kicker:'STEP 4', title:'통제: 자기 팀 이름표만',
     body:'IAM 정책의 Resource를 <b>자기 팀 이름표</b>로 좁히면, 다른 팀 이름표로 부르는 요청은 <b>거부</b>됩니다.',
     facts:['앞의 IAM 정책 Resource를 좁힌 모양','뒤의 기반 모델 권한은 그대로 필요'],
     zones:Z, nodes:ALL, hot:['tb','pa','pb','ia'],
     edges:[{f:'tb',t:'pb',c:'accent',o:0},{f:'pb',t:'ia',c:'warning',l:'허용',o:1},{f:'tb',t:'pa',c:'danger',dash:true,l:'거부'}],
     loop:true, stagger:0.7,
     snip:{hd:'B팀 역할 정책 (일부)',path:'IAM',lines:['"Resource": [','  "<B팀 이름표의 ARN>",','  "arn:aws:bedrock:*:*:inference-profile/*",','  "arn:aws:bedrock:*:*:foundation-model/*" ]'],hl:[2],note:'Lab 1 최소 정책의 <b>application-inference-profile/*</b> 자리를 팀 이름표로 바꾼 것입니다.'}},
    {kicker:'STEP 5', title:'실제 문자열, 프로필 ARN',
     body:'이름표를 만드는 명령과 그 결과입니다. 결과로 나온 <b>ARN</b>이 앞 단계의 정책 자리에 들어갑니다.',
     facts:['arn:aws:bedrock: 서비스','us-east-1: 리전','111122223333: 계정 (예시)','application-inference-profile/: 이름표'],
     zones:Z, nodes:ALL, hot:['pa','md'],
     edges:[{f:'pa',t:'md',c:'info',o:0}],
     loop:true,
     snip:{hd:'이름표 만들기',path:'Terminal',lines:['aws bedrock create-inference-profile \\','  --inference-profile-name sonnet-team-a \\','  --model-source copyFrom=arn:aws:bedrock:\\','us-east-1:111122223333:inference-profile/\\','global.anthropic.claude-sonnet-5-5 \\','  --tags key=team,value=team-a','# 결과','arn:aws:bedrock:us-east-1:111122223333:','application-inference-profile/a1b2c3d4e5f6'],hl:[2,6,8,9],note:'ARN은 화면 폭 때문에 나눠 적었습니다. 실제로는 한 줄입니다.'}}
  ], { legend:[['accent','팀'],['info','이름표'],['success','기록'],['warning','통제'],['danger','거부']]});
});
:::

:::notes
{timing: 2min}
[요약]
• 팀마다 애플리케이션 추론 프로필(이름표)을 하나씩, 모델은 같고 이름표만 다름
• managed settings의 modelOverrides로 모델 이름을 팀 이름표에 묶어 배포, /model 선택도 이 이름표로
• CloudTrail에 누가(SSO 사용자), 어느 프로필로 불렀는지 남음
• IAM Resource를 자기 팀 이름표로 좁히면 다른 팀 이름표는 거부
• ARN 문자열은 마지막에. 태그로 나눈 비용 계산은 Ch6에서

{cue: demo}
Part 1 마지막은 팀마다 다른 이름표예요. A팀과 B팀이 같은 Sonnet을 쓰더라도, 각자 자기 이름표를 달고 부르게 하는 겁니다.↓
첫째, 이 이름표의 정식 이름이 애플리케이션 추론 프로필이에요. 원본 프로필을 복사해서 팀 이름과 태그만 다르게 만듭니다.↓
둘째, 팀마다 managed settings의 modelOverrides로 모델 이름을 그 팀 이름표에 묶어요. 개발자가 /model에서 무엇을 골라도 이 이름표로 갑니다.↓
셋째, 그러면 CloudTrail에 누가, 어느 이름표로 불렀는지 한 줄에 남아요. 감사 때 이 호출이 어느 팀 것이냐는 질문에 바로 답할 수 있습니다.↓
넷째, IAM에서 자기 팀 이름표만 허용하면 다른 팀 이름표로는 못 부릅니다.↓
마지막으로 실제 문자열이에요. 만드는 명령의 결과로 나오는 ARN이 앞에서 본 정책 자리에 들어갑니다. 태그로 비용을 나누는 계산은 Ch6에서 자세히 다룰게요.

{cue: transition}
여기까지가 연결이었고요, 이제 이 설정들을 회사 전체에 어떻게 내려보내는지 보겠습니다.

[출처]
• code.claude.com/docs/en/amazon-bedrock (Map each model version to an inference profile, Startup model checks)
• docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html
• docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html

[약어]
• ARN: Amazon Resource Name
:::
---
<!-- Slide 16: Part 02 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 02</span>
  <div class="name">정책은 파일로</div>
  <p class="what">콘솔이 없으니 파일이 정책이다</p>
  <ol>
    <li><b>01</b>파일 한 장이 모든 PC로</li>
    <li><b>02</b>키 충돌과 잠금 스위치</li>
    <li><b>03</b>배포 후 확인</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2: 정책은 파일로
• 파일 한 장이 모든 PC로, 키 충돌과 잠금 스위치, 배포 후 확인

두 번째 Part는 정책은 파일로입니다. Bedrock으로 쓸 때는 claude.ai 같은 관리 콘솔을 쓸 수 없잖아요. 그래서 회사 정책을 파일 한 장으로 모든 PC에 내려보냅니다. 그 파일이 어떻게 이기는지, 어떤 잠금을 거는지, 그리고 적용됐는지 확인하는 방법까지 보겠습니다.
:::
---
<!-- Slide 17: Policy delivery channels -->
@type: content
@fit: off

## 콘솔 대신 파일과 MDM
정책 파일 한 장이 모든 개발자 PC로 가는 길

:::html
<div class="fsi fs" id="c2-mdm">
  <div class="fs-stage"></div>
  <div class="fs-side">
    <div class="fs-step"></div>
    <div class="fs-title"></div>
    <pre class="fs-code"></pre>
    <div class="fs-checks"></div>
    <div class="fs-say"></div>
    <div class="fs-prog"><i></i></div>
    <div class="fs-hint">장면을 누르거나 ↓ 키로 다음 단계, ↑ 키로 이전 단계</div>
  </div>
</div>
:::

:::script
import('./assets/flowscene.js').then(function (m) { m.mount('#c2-mdm', {
  aria: '인프라 엔지니어가 쓴 managed-settings.json이 MDM과 배포 도구로 모든 개발자 PC의 시스템 경로에 놓이고, Claude Code가 시작할 때 읽으며, 개발자가 개인 설정으로 풀려고 해도 managed 규칙이 이기는 흐름',
  zones: [
    { box: [-0.4, 0, 0, 8.6, 4.2, 0.4], label: '인프라 팀', labelAt: [-0.2, 0, -0.75] },
    { box: [11.0, 0, 0, 16.6, 4.2, 0.4], label: '개발자 PC (전 직원)', labelAt: [11.2, 0, -0.75] }
  ],
  parts: {
    pcs: { boxes: [[11.3, 3.2, 0.4, 0.8, 0.7, 0.5], [12.4, 3.2, 0.4, 0.8, 0.7, 0.5]] },
    ws: { boxes: [[1.4, 1.2, 0.4, 1.8, 1.4, 0.8], [1.7, 2.4, 1.2, 1.2, 0.15, 1.0]] },
    doc: { boxes: [[3.8, 1.6, 0.4, 0.9, 0.15, 1.3]] },
    net: { clouds: [[[5.6, 3.0, 5.4], 74, 20, 'claude.ai 콘솔']] },
    mdm: { boxes: [[6.2, 1.0, 0.4, 1.2, 2.2, 2.0]] },
    link: { pipes: [[[7.4, 2.0, 1.0], [11.6, 2.0, 1.0]]] },
    sys: { boxes: [[14.0, 1.0, 0.4, 1.6, 1.6, 1.6]] },
    dd: { boxes: [[16.0, 1.0, 0.4, 0.9, 1.6, 1.1]] },
    cc: { boxes: [[19.2, 1.2, 0.4, 2.4, 1.8, 2.2]] },
    proj: { boxes: [[23.6, 2.7, 0.4, 1.4, 1.1, 0.7]] },
    user: { boxes: [[23.6, 0.8, 0.4, 1.4, 1.4, 1.0]] }
  },
  marks: [{ id: 'x', at: [14.4, 3.0, 4.5] }, { id: 'y', at: [22.4, 1.8, 1.1] }],
  tags: [
    { id: 'deny', at: [14.8, 1.0, 2.35], text: 'deny Read(raw/**)', show: ['land', 'start', 'win'] },
    { id: 'allow', at: [24.3, 0.8, 2.45], text: 'allow Read(raw/**)', show: ['loosen'] },
    { id: 'res', at: [20.4, 1.2, 3.15], text: 'raw/ Read 거부', show: ['win'] },
    { id: 'status', at: [20.4, 1.2, -0.62], text: '/status: Enterprise managed settings (file)', show: ['start'] }
  ],
  wires: {
    console: { pts: [[5.6, 3.0, 5.4], [12.5, 3.0, 5.2], [20.4, 2.1, 2.7]], cls: 'fs-alt' },
    fan: { pts: [[7.4, 2.4, 1.0], [10.8, 3.5, 0.9], [13.2, 3.5, 0.9]], cls: 'fs-alt' },
    push: { pts: [[4.3, 1.6, 1.0], [6.2, 1.6, 1.2], [7.4, 2.0, 1.2], [11.6, 2.0, 1.0], [14.0, 1.8, 1.0]] },
    read: { pts: [[15.6, 1.8, 1.4], [19.2, 2.0, 1.4]] },
    user: { pts: [[23.6, 1.5, 0.9], [21.6, 2.0, 1.2]] }
  },
  callouts: [
    { id: 'doc', n: 1, anchor: [4.25, 1.6, 1.7], at: [40, 440], title: '정책 파일 한 장', sub: '인프라 엔지니어가 작성' },
    { id: 'net', n: 2, anchor: [5.6, 3.0, 4.75], at: [300, 92], title: '서버 관리 설정은 건너뜀', sub: 'CLAUDE_CODE_USE_BEDROCK이면' },
    { id: 'mdm', n: 3, anchor: [6.8, 2.0, 2.4], at: [190, 474], title: 'MDM, 배포 도구', sub: 'Jamf, Intune, GPO, Ansible' },
    { id: 'sys', n: 4, anchor: [14.8, 1.0, 1.2], at: [420, 474], title: 'OS별 고정 경로', sub: '관리자만 쓸 수 있는 폴더' },
    { id: 'dd', n: 5, anchor: [16.45, 1.0, 1.5], at: [470, 178], title: 'managed-settings.d/', sub: '팀별 조각, 이름순 병합' },
    { id: 'cc', n: 6, anchor: [20.4, 1.2, 0.6], at: [610, 474], title: 'Claude Code', sub: '시작할 때 읽고, 바뀌면 다시 읽음' },
    { id: 'user', n: 7, anchor: [24.3, 0.8, 1.4], at: [730, 112], title: '개인 설정 파일', sub: '~/.claude/settings.json' }
  ],
  figures: [
    { at: [0.4, 1.9, 0.4], scale: 0.9, pose: 'type', colour: 'var(--info)', act: { write: 'type' } },
    { at: [26.3, 1.5, 0.4], scale: 0.9, dir: -1, act: { loosen: 'type', win: 'raise' } }
  ],
  code: [
    '# 인프라 팀 (Linux, WSL 경로)',
    '/etc/claude-code/managed-settings.json',
    '"deny": ["Read(~/claude-lab/ch2/raw/**)"]',
    '# mac /Library/Application Support/ClaudeCode/',
    '# win C:\\Program Files\\ClaudeCode\\',
    '# 개발자 ~/.claude/settings.json',
    '"allow": ["Read(~/claude-lab/ch2/raw/**)"]',
    '# 결과: raw/ Read는 여전히 거부'
  ],
  checks: ['시작할 때 읽고, 바뀌면 다시 읽음', '사용자, 프로젝트, --settings보다 위', '/status에 Enterprise managed settings'],
  checksDoneAfter: 'start',
  overview: { label: '전체 그림', title: '정책은 파일로 배포된다', say: '파일 한 장이 MDM으로 <b>모든 PC</b>에 놓이고, 시작할 때 읽힙니다. 개인 설정으로는 못 풉니다.' },
  phases: [
    { key: 'write', d: 2.8, focus: ['ws', 'doc'], badge: 'doc', lines: [1, 2, 3], label: '1  작성', title: '인프라 엔지니어가 정책 한 장을 쓴다', say: '회사 정책을 <b>managed-settings.json</b> 한 장에 씁니다. 예시는 원본 고객 데이터 <b>raw/ 읽기 금지</b>입니다.' },
    { key: 'console', d: 2.8, focus: ['net', 'cc'], cam: ['net', 'doc', 'cc'], badge: 'net', lines: [], packet: { wire: 'console', mode: 'block', mark: 'x' }, label: '2  콘솔은 막힘', title: '콘솔에서 내려오는 길은 닫혀 있다', say: 'claude.ai 콘솔의 서버 관리 설정은 Team, Enterprise 플랜용입니다. <b>CLAUDE_CODE_USE_BEDROCK</b>을 켜면 Claude Code는 이 길을 건너뜁니다.' },
    { key: 'push', d: 3.2, focus: ['doc', 'mdm', 'link', 'sys', 'pcs'], badge: 'mdm', lines: [4, 5], packet: { wire: 'push' }, label: '3  배포', title: 'MDM이 모든 PC에 같은 파일을', say: 'Jamf, Intune, GPO 같은 <b>MDM</b>은 plist나 레지스트리로, Ansible 같은 <b>배포 도구</b>는 파일 복사로 모든 PC에 내려보냅니다.' },
    { key: 'land', d: 3.0, focus: ['sys', 'dd'], badge: 'sys', lines: [2, 4, 5], label: '4  시스템 경로', title: 'OS마다 정해진 폴더에 놓인다', say: '파일은 <b>관리자 권한으로만 쓰는 폴더</b>에 놓입니다. 옆의 <b>managed-settings.d/</b>에 팀별 조각을 두면 이름순으로 합쳐집니다.' },
    { key: 'start', d: 3.4, focus: ['sys', 'cc'], badge: 'cc', lines: [2, 3], checks: true, packet: { wire: 'read' }, label: '5  시작', title: 'Claude Code가 시작할 때 읽는다', say: '시작할 때 읽고, 파일이 바뀌면 다시 읽습니다. <b>사용자, 프로젝트 설정보다 위</b>에서 적용됩니다.' },
    { key: 'loosen', d: 3.4, focus: ['user', 'cc'], badge: 'user', lines: [6, 7], packet: { wire: 'user', mode: 'block', mark: 'y' }, label: '6  풀어 보기', title: '개발자가 개인 설정으로 풀어 보면', say: '개발자가 <b>~/.claude/settings.json</b>에 같은 경로의 allow를 넣습니다. 이 줄은 managed 정책을 넘지 못합니다.' },
    { key: 'win', d: 3.0, focus: ['cc', 'sys', 'user'], badge: 'cc', lines: [3, 8], packet: { wire: 'read' }, label: '7  결과', title: 'managed 규칙이 그대로 이긴다', say: '규칙은 모든 층에서 합쳐지고 <b>deny가 먼저</b> 평가됩니다. raw/ 읽기는 여전히 거부. 개인이 정책을 되돌릴 수 없습니다.' }
  ],
  frame: function (c) {
    if (!c.svg.__lock) {
      var NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'c2-lock');
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', 486); r.setAttribute('y', 334); r.setAttribute('width', 15); r.setAttribute('height', 12); r.setAttribute('rx', 2);
      var a = document.createElementNS(NS, 'path');
      a.setAttribute('d', 'M489 334 v-4 a4.5 4.5 0 0 1 9 0 v4');
      g.appendChild(a); g.appendChild(r); c.svg.appendChild(g); c.svg.__lock = g;
    }
    var k = c.ph.key;
    c.svg.__lock.style.opacity = (c.all || k === 'land' || k === 'start' || k === 'win' || k === 'push') ? 1 : 0.3;
    c.parts.cc.querySelector('.fs-top').style.fill = k === 'win' ? 'var(--accent)' : '';
    c.parts.user.querySelector('.fs-top').style.fill = k === 'loosen' ? 'var(--warning)' : '';
  }
}); });
:::

:::notes
{timing: 2.5min}
[요약]
• 인프라 엔지니어가 managed-settings.json 한 장을 쓰고, MDM(plist, HKLM 레지스트리)이나 배포 도구가 모든 개발자 PC에 내려보냄
• 서버 관리 설정(claude.ai 콘솔)은 Team, Enterprise 플랜용이고 CLAUDE_CODE_USE_BEDROCK을 켜면 건너뜀
• 경로: macOS /Library/Application Support/ClaudeCode/, Linux와 WSL /etc/claude-code/, Windows C:\Program Files\ClaudeCode\
• managed-settings.d/ 조각은 본 파일 다음에 이름순 병합. managed 소스가 여럿이면 기본은 우선순위가 가장 높은 하나만, managedSourcesBehavior "merge"로 합침
• Claude Code는 시작할 때 읽고 파일이 바뀌면 다시 읽음. 개인 설정의 allow로는 managed deny를 풀 수 없음

{cue: demo}
왼쪽이 인프라 팀, 오른쪽이 전 직원의 개발자 PC입니다.↓
먼저 인프라 엔지니어가 정책 파일 한 장을 씁니다. 여기서는 원본 고객 데이터, raw 폴더 읽기 금지를 예로 들었어요.↓
위쪽 claude.ai 콘솔에서 내려오는 서버 관리 설정은 Team, Enterprise 플랜용이에요. 그리고 CLAUDE_CODE_USE_BEDROCK을 켜면 Claude Code가 이 길을 아예 건너뜁니다. 그래서 Bedrock에서는 파일과 MDM을 씁니다.↓
Jamf, Intune, GPO 같은 MDM은 plist나 레지스트리로, Ansible 같은 배포 도구는 파일 복사로 모든 PC에 같은 정책을 내려보내요.↓
파일은 OS마다 정해진, 관리자만 쓸 수 있는 폴더에 놓입니다. 오늘 랩은 Linux라서 /etc/claude-code를 써요. 여러 팀이 나눠 관리한다면 옆의 managed-settings.d 폴더에 조각을 두시면 이름순으로 합쳐집니다.↓
Claude Code는 시작할 때 이 파일을 읽고, 파일이 바뀌면 다시 읽어요. 그리고 사용자 설정, 프로젝트 설정보다 위에서 적용됩니다.↓
이제 개발자가 자기 settings.json에 같은 경로의 allow를 넣어서 풀어 보려고 하죠.↓ 그래도 막혀요. 규칙은 모든 층에서 합쳐지고 deny가 먼저 평가되거든요. 개인이 정책을 되돌릴 수 없습니다.
하나만 더요. MDM과 파일을 같이 쓰면 기본은 우선순위가 높은 소스 하나만 적용돼요. 다 합치려면 managedSourcesBehavior를 merge로 두시면 됩니다.

{cue: transition}
그럼 같은 키가 여러 파일에 있으면 어느 값이 이길까요?

[출처]
• code.claude.com/docs/en/managed-settings (경로, 전달 방식, drop-in 순서, 소스 우선순위)
• code.claude.com/docs/en/server-managed-settings (플랜 요건, 서드파티 공급자 사용 시 건너뜀)
• code.claude.com/docs/en/settings (설정 우선순위)
• Ch2 Lab 1 TASK 02, TASK 03
:::
---
<!-- Slide 18: Settings precedence -->
@type: content
@fit: off

## 키 충돌 시 상위 우선
같은 키가 다섯 층에 있을 때 이기는 값

:::html
<div id="c2-sv-prec"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:10,w:560,h:440,l:'설정 층 (위가 이김)'},{x:595,y:10,w:220,h:440,l:'이 층의 값'},{x:840,y:10,w:330,h:440,l:'이번 세션'}];
  var LY = [['1  Managed','managed-settings.json, MDM','danger'],['2  CLI 인자','claude --settings (이번 세션만)','info'],['3  Local','.claude/settings.local.json (개인)','info'],['4  Project','.claude/settings.json (팀, 커밋)','info'],['5  User','~/.claude/settings.json (내 PC 전체)','info']];
  var HD = ['# 1 Managed','# 2 --settings','# 3 Local','# 4 Project','# 5 User'];
  var DAYS = [14, 3, 7, 30, 90];
  function scene(top, vals, res, resSub, lines, hl, win, lose) {
    var nodes = [], hot = ['r'], edges = [];
    LY.forEach(function (l, i) {
      var y = 52 + i * 78, on = i >= top;
      nodes.push({id:'l'+i,x:40,y:y,w:520,h:66,t:l[0],s:l[1],c:l[2]});
      nodes.push({id:'v'+i,x:610,y:y,w:190,h:66,t:vals[i],c:on && vals[i] !== '키 없음' ? (win.indexOf(i) >= 0 ? 'accent' : 'muted') : 'muted'});
      if (on && vals[i] !== '키 없음') hot.push('l'+i);
      if (win.indexOf(i) >= 0) { hot.push('v'+i); edges.push({f:'v'+i,t:'r',c:'accent',o:edges.length}); }
      else if (lose.indexOf(i) >= 0) edges.push({f:'v'+i,t:'r',c:'muted',dash:true});
    });
    nodes.push({id:'r',x:860,y:185,w:290,h:110,t:res,s:resSub,c:'accent'});
    return {zones:Z, nodes:nodes, hot:hot, edges:edges, loop:true, stagger:0.6, snipLines:lines, hl:hl};
  }
  function cdays(top) {
    var vals = DAYS.map(function (d, i) { return i < top ? '키 없음' : d + '일'; });
    var lines = [];
    HD.forEach(function (h, i) { lines.push((i < top ? '{ }' : (i === 1 ? '\'{"cleanupPeriodDays": 3}\'' : '{ "cleanupPeriodDays": ' + DAYS[i] + ' }')) + '  ' + h); });
    lines.push(''); lines.push('# 이번 세션에 적용'); lines.push('cleanupPeriodDays = ' + DAYS[top]);
    var lose = []; for (var i = top + 1; i < 5; i++) lose.push(i);
    return scene(top, vals, DAYS[top] + '일 보관', LY[top][0].replace(/^\d\s+/, '') + ' 값이 이김', lines, [top + 1, 8], [top], lose);
  }
  function mk(base, o) { var s = base; for (var k in o) s[k] = o[k]; s.snip = {hd:o.hd, path:o.path, lines:base.snipLines, hl:base.hl, note:o.note}; return s; }
  var LIST = scene(0, ['raw/**','키 없음','키 없음','.env','[ ]'], 'deny 2개', 'raw/**와 .env 모두', ['# 1 Managed','"deny": ["Read(~/claude-lab/ch2/raw/**)"]','# 4 Project','"deny": ["Read(./.env)"]','# 5 User','"deny": []','','# 이번 세션의 deny (합집합)','Read(~/claude-lab/ch2/raw/**)','Read(./.env)'], [1,2,3,4,8,9,10], [0, 3], [4]);
  F.stepviz('#c2-sv-prec', [
    mk(cdays(0), {kicker:'OVERVIEW', title:'다섯 층에 같은 키, 맨 위가 이깁니다',
     body:'다섯 층 모두 <b>cleanupPeriodDays</b>(세션 기록 보관 일수)를 적었습니다. 값은 다르지만 적용되는 값은 하나, <b>맨 위 Managed의 14일</b>입니다.',
     facts:['순서: Managed, CLI 인자, Local, Project, User','같은 키는 가장 위 층의 값 하나만','Managed는 어떤 개인 파일로도 못 덮음'],
     hd:'같은 키, 다섯 파일', path:'cleanupPeriodDays', note:'Managed가 있는 한 아래 네 층의 값은 <b>쓰이지 않습니다</b>.'}),
    mk(cdays(1), {kicker:'STEP 1', title:'Managed가 없으면 CLI 인자',
     body:'정책이 없을 때는 <b>--settings</b>로 준 값이 이깁니다. 이번 세션에만 쓰이고 파일은 바뀌지 않습니다.',
     facts:['--settings: Managed 아래, 모든 파일 위','이번 세션에만 적용'],
     hd:'Managed를 빼면', path:'claude --settings', note:'CLI 인자도 <b>Managed는 못 넘습니다</b>.'}),
    mk(cdays(2), {kicker:'STEP 2', title:'CLI 인자도 없으면 Local',
     body:'개인이 이 프로젝트에만 두는 <b>.claude/settings.local.json</b>이 이깁니다. 저장소에 커밋하지 않습니다.',
     facts:['개인, 이 프로젝트만','Claude Code가 git에서 빼 둠'],
     hd:'CLI 인자를 빼면', path:'.claude/settings.local.json', note:'팀 설정을 <b>나만</b> 바꾸고 싶을 때 쓰는 층입니다.'}),
    mk(cdays(3), {kicker:'STEP 3', title:'Local도 없으면 Project',
     body:'팀이 저장소에 커밋한 <b>.claude/settings.json</b>이 팀원 모두에게 적용됩니다.',
     facts:['팀 공유, 저장소에 커밋','User보다 위'],
     hd:'Local을 빼면', path:'.claude/settings.json', note:'팀 규칙은 이 파일로 <b>PR 리뷰</b>를 거쳐 바꿉니다.'}),
    mk(cdays(4), {kicker:'STEP 4', title:'마지막은 User',
     body:'<b>~/.claude/settings.json</b>은 내 PC의 모든 프로젝트에 적용되는 <b>가장 아래 층</b>입니다.',
     facts:['내 PC의 모든 프로젝트','위 층에 같은 키가 있으면 짐'],
     hd:'개인 설정만 남으면', path:'~/.claude/settings.json', note:'키가 어디에도 없으면 기본값(30일)입니다.'}),
    mk(LIST, {kicker:'LISTS', title:'목록 키는 고르지 않고 합칩니다',
     body:'<b>permissions.deny</b> 같은 목록은 <b>모든 층의 항목을 합칩니다</b>. User가 빈 목록을 적어도 조직이 넣은 deny는 남습니다.',
     facts:['목록: 모든 층의 항목을 합침','예외: managed의 availableModels는 합치지 않고 그대로','fallbackModel처럼 순서가 있는 목록은 한 층 값만'],
     hd:'목록 키', path:'permissions.deny', note:'그래서 개인이 <b>조직의 deny를 지울 수 없습니다</b>.'})
  ], {legend:[['danger','Managed (사용자가 못 바꿈)'],['info','개인과 팀 설정'],['accent','이기는 값'],['muted','쓰이지 않는 값']]});
});
:::

:::notes
{timing: 2min}
[요약]
• 다섯 층: Managed, CLI 인자(--settings), Local, Project, User. 같은 키는 가장 위 층의 값 하나
• 예시 키 cleanupPeriodDays: 14(Managed), 3(--settings), 7(Local), 30(Project), 90(User) → 14일
• Managed는 어떤 개인 파일이나 --settings로도 못 덮음
• 목록 키(permissions.allow, deny 등)는 모든 층을 합침. 예외: managed의 availableModels는 그대로 적용, fallbackModel은 한 층 값만

{cue: demo}
같은 키가 여러 파일에 있으면 어느 값이 이길까요? 예로 세션 기록을 며칠 남길지 정하는 cleanupPeriodDays를 다섯 층에 모두 적어 봤어요.
값은 층마다 다르지만 적용되는 건 하나, 맨 위 Managed의 14일입니다. 관리자가 Managed에 두면 아래 어떤 층도 덮어쓰지 못해요.↓
위에서부터 하나씩 빼 볼게요. Managed를 빼면 --settings로 준 CLI 인자가 이깁니다. 이건 이번 세션에만 쓰여요.↓
그것도 빼면 개인 Local이에요.↓ 그다음이 팀이 커밋한 Project이고요.↓ 마지막이 User예요. 어디에도 없으면 기본값 30일이고요.↓
마지막 장이 중요합니다. deny 같은 목록 키는 하나를 고르지 않고 모든 층을 합쳐요. 그래서 개인이 빈 목록을 적어도 조직의 deny는 남습니다. 단, managed의 availableModels는 합치지 않고 그 목록 그대로 씁니다.

{cue: transition}
그런데 합치는 규칙만으로는 개인이 allow를 더하는 것까지는 못 막아요. 그 문을 닫는 게 잠금 스위치입니다.

[출처]
• code.claude.com/docs/en/settings (Settings precedence, Lists merge instead of overriding)
• code.claude.com/docs/en/settings-reference (cleanupPeriodDays 기본 30일)
:::
---
<!-- Slide 19: Lock keys -->
@type: content
@fit: off

## 조직이 거는 잠금 스위치 여섯 개
managed-settings.json에 넣는 잠금 키와 그 효과

:::html
<div id="c2-sv-lock"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:10,w:640,h:440,l:'managed-settings.json의 잠금 키'},{x:720,y:10,w:450,h:440,l:'개발자 PC에서'}];
  var KD = [['k1','disableBypassPermissionsMode','권한 우회 모드 금지'],['k2','allowManagedPermissionRulesOnly','권한 규칙은 managed만'],['k3','allowManagedHooksOnly','조직이 배포한 훅만'],['k4','allowedHttpHookUrls','HTTP 훅 목적지 제한'],['k5','requiredMinimumVersion','낮은 버전은 시작 거부'],['k6','strictKnownMarketplaces','허용한 마켓플레이스만']];
  var K = KD.map(function (k, i) { return {id:k[0],x:40,y:46+i*66,w:600,h:62,t:(i+1)+'  '+k[1],s:k[2],c:'danger'}; });
  var J = ['{','  "permissions": {','    "disableBypassPermissionsMode": "disable" },','  "allowManagedPermissionRulesOnly": true,','  "allowManagedHooksOnly": true,','  "allowedHttpHookUrls":','    ["https://audit.corp.example/*"],','  "requiredMinimumVersion": "2.1.300",','  "strictKnownMarketplaces": [{ "source": "git",','    "url": "https://git.corp.example/p.git" }]','}'];
  var HL = { k1:[2,3], k2:[4], k3:[5], k4:[6,7], k5:[8], k6:[9,10] };
  function ed(id, o) { return {f:id,t:'ef',c:'danger',side:'h',o:o}; }
  function st(id, kicker, title, body, et, es, facts, note) {
    return {kicker:kicker, title:title, body:body, facts:facts, zones:Z,
      nodes:K.concat([{id:'ef',x:740,y:165,w:410,h:140,t:et,s:es,c:'accent'}]), hot:[id,'ef'], edges:[ed(id,0)], loop:true,
      snip:{hd:'잠금 키 묶음 (예시 값)', path:'/etc/claude-code/managed-settings.json', lines:J, hl:HL[id], note:note}};
  }
  F.stepviz('#c2-sv-lock', [
    {kicker:'OVERVIEW', title:'개인 설정으로 못 여는 문 여섯 개',
     body:'합치는 규칙만으로는 개인이 allow를 <b>더하는 것</b>까지 막지 못합니다. 그 문을 닫는 것이 잠금 키입니다. 위에서부터 하나씩 켜 봅니다.',
     facts:['넷은 managed 전용 키','disableBypassPermissionsMode, allowedHttpHookUrls는 어느 파일에나','조직에 강제하려면 모두 managed에'],
     zones:Z, nodes:K.concat([{id:'ef',x:740,y:165,w:410,h:140,t:'잠금 키 여섯 개',s:'개인 설정으로는 못 끔',c:'accent'}]),
     hot:['k1','k2','k3','k4','k5','k6','ef'], edges:['k1','k2','k3','k4','k5','k6'].map(function (k, i) { return ed(k, i); }), loop:true, stagger:0.4,
     snip:{hd:'잠금 키 묶음 (예시 값)', path:'/etc/claude-code/managed-settings.json', lines:J, hl:[3,4,5,6,7,8,9,10], note:'파일이 깨지면 <b>시작을 거부</b>하니 배포 전에 <b>jq .</b>로 검증합니다.'}},
    st('k1','KEY 1','우회 모드는 항상 잠급니다','모든 권한 확인을 건너뛰는 <b>bypassPermissions</b> 모드를 막습니다. 플래그를 줘도 우회 모드로 들어가지 않습니다.',
       '우회 모드에 못 들어감','--dangerously-skip-permissions도',['범위: 어느 설정 파일에나','managed에 두면 개인이 못 끔','권고: 항상 켬'],'랩 TASK 03에서 <b>exit=0이지만 우회 모드는 꺼진</b> 모습을 봅니다.'),
    st('k2','KEY 2','권한 규칙은 managed 것만','<b>사용자, 프로젝트, local, --settings</b>의 allow, ask, deny를 모두 무시합니다. <b>--allowedTools</b>도 무시합니다.',
       '개인 allow가 통하지 않음','항상 허용 선택지도 숨김',['범위: managed 전용','새 규칙 저장도 멈춤','권고: 규제 환경의 기본값'],'켜면 필요한 allow도 <b>managed에 직접</b> 넣어야 합니다.'),
    st('k3','KEY 3','훅은 조직이 배포한 것만','<b>사용자, 프로젝트, local 훅</b>과 다른 플러그인의 훅을 막고, managed 훅과 강제 설치한 플러그인의 훅만 실행합니다.',
       '개인 훅은 실행 안 됨','DLP 훅을 끄거나 바꿀 수 없음',['범위: managed 전용','managed가 강제한 플러그인 훅은 실행','권고: Part 3 DLP 훅과 짝'],'개인이 DLP 훅을 <b>우회하는 길</b>을 닫습니다.'),
    st('k4','KEY 4','HTTP 훅의 목적지를 제한','HTTP 훅은 <b>목록의 URL</b>로만 보냅니다. 맞지 않는 훅은 실행하지 않고 막습니다.',
       '허용 URL로만 전송','빈 배열이면 모든 HTTP 훅 차단',['범위: 어느 설정 파일에나','목록은 층마다 합쳐짐','권고: 감사 수집기만 허용'],'감사 로그가 <b>엉뚱한 서버</b>로 새지 않게 합니다.'),
    st('k5','KEY 5','오래된 버전은 시작 거부','실행 중인 버전이 이보다 낮으면 Claude Code가 <b>시작할 때 종료</b>합니다. 이미 도는 세션은 계속됩니다.',
       '낮은 버전은 시작 안 됨','claude update로 복구는 가능',['범위: managed 전용, 시작할 때만 검사','minimumVersion은 업데이트 하한만 정함','권고: 보안 수정이 든 버전을 하한으로'],'버전 값은 예시입니다.'),
    st('k6','KEY 6','마켓플레이스는 허용 목록만','마켓플레이스 추가와 플러그인 설치, 업데이트를 <b>허용한 출처</b>로만 제한합니다.',
       '허용한 출처만 설치','다른 마켓플레이스는 오류',['범위: managed 전용','빈 배열이면 공식 마켓플레이스까지 차단','Ch4 확장하기에서 다시 봄'],'git 주소는 예시입니다.')
  ], {legend:[['danger','managed 잠금 키'],['accent','개발자 PC의 효과']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• permissions.disableBypassPermissionsMode "disable": 우회 모드 금지 (어느 파일에나, managed에 두면 강제)
• allowManagedPermissionRulesOnly: 사용자, 프로젝트, local, --settings의 권한 규칙과 --allowedTools 무시 (managed 전용)
• allowManagedHooksOnly: managed 훅과 강제 설치 플러그인 훅만 실행 (managed 전용)
• allowedHttpHookUrls: HTTP 훅 목적지 제한, 빈 배열은 전부 차단 (어느 파일에나, 배열 병합)
• requiredMinimumVersion: 낮은 버전은 시작 거부 (managed 전용). minimumVersion은 업데이트 하한만
• strictKnownMarketplaces: 마켓플레이스 출처 허용 목록 (managed 전용)

{cue: demo}
합치는 규칙만으로는 개인이 allow를 더하는 것까지는 막지 못해요. 그 문을 닫는 게 잠금 키입니다. 위에서부터 하나씩 켜 볼게요.↓
첫째, disableBypassPermissionsMode는 모든 확인을 건너뛰는 우회 모드를 막습니다. 이건 항상 켜세요.↓
둘째, allowManagedPermissionRulesOnly를 켜면 개인과 프로젝트의 권한 규칙을 아예 무시해요. 규제 환경이라면 기본으로 권합니다.↓
셋째, allowManagedHooksOnly는 조직이 배포한 훅만 돌게 합니다. Part 3의 DLP 훅과 짝이에요.↓ 넷째, allowedHttpHookUrls는 HTTP 훅이 감사 수집기로만 가게 하고요.↓
다섯째, requiredMinimumVersion은 정한 버전보다 낮으면 시작을 거부합니다. 비슷한 이름의 minimumVersion은 업데이트 하한만 정하니까 헷갈리지 마세요.↓
여섯째, strictKnownMarketplaces는 플러그인 마켓플레이스를 허용 목록으로 묶어요. Ch4에서 다시 봅니다.

[출처]
• code.claude.com/docs/en/settings-reference (permissions.disableBypassPermissionsMode, allowManagedPermissionRulesOnly, allowManagedHooksOnly, allowedHttpHookUrls, requiredMinimumVersion, minimumVersion, strictKnownMarketplaces)
• Ch2 Lab 1 TASK 03
:::
---
<!-- Slide 20: Lab policy file -->
@type: content
@fit: off

## Lab에서 배포할 정책 한 장
managed-settings.json, 줄마다 담은 뜻

:::html
<div id="c2-sv-ms"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:10,w:430,h:440,l:'정책 파일의 키'},{x:480,y:10,w:690,h:440,l:'개발자 PC에서 보이는 것'}];
  var LK = [['f1','availableModels','+ enforceAvailableModels, env','accent'],['f2','cleanupPeriodDays','14','info'],['f3','permissions.deny','Read, 경로 두 개','warning'],['f4','disableBypassPermissionsMode','"disable"','success']];
  var RS = [['/model에 Sonnet, Haiku만','--model opus도 목록 안으로, 기본은 Sonnet'],['세션 기록은 14일만','로컬 세션 JSONL을 14일 뒤 정리'],['raw/ Read 거부','실제 경로와 링크 경로 둘 다'],['권한 우회 모드 꺼짐','우회 플래그를 줘도 우회 모드로 안 들어감']];
  var ALL = [];
  LK.forEach(function (k, i) { var y = 55 + i * 95; ALL.push({id:k[0],x:40,y:y,w:390,h:80,t:k[1],s:k[2],c:k[3]}); ALL.push({id:'r'+(i+1),x:500,y:y,w:650,h:80,t:RS[i][0],s:RS[i][1],c:k[3]}); });
  function E(i) { return {f:'f'+i,t:'r'+i,c:LK[i-1][3],o:0}; }
  var J = ['{','  "availableModels": ["sonnet", "haiku"],','  "enforceAvailableModels": true,','  "env": { "ANTHROPIC_MODEL": "sonnet" },','  "cleanupPeriodDays": 14,','  "permissions": { "deny": [','    "Read(~/claude-lab/mydata/raw/**)",','    "Read(~/claude-lab/ch2/raw/**)" ],','    "disableBypassPermissionsMode":','      "disable" }','}'];
  function sn(hl, note) { return {hd:'Ch2 Lab 1 TASK 02', path:'/etc/claude-code/managed-settings.json', lines:J, hl:hl, note:note}; }
  F.stepviz('#c2-sv-ms', [
    {kicker:'OVERVIEW', title:'파일 한 장, 효과 네 가지',
     body:'오늘 랩에서 그대로 배포할 정책입니다. 줄 묶음 하나가 개발자 PC에서 <b>보이는 변화 하나</b>가 됩니다.',
     facts:['모델, 보존 기간, 원본 데이터, 우회 모드','기존 파일에 jq로 병합해 배포','값은 이 랩의 예시'],
     zones:Z, nodes:ALL, hot:ALL.map(function (n) { return n.id; }),
     edges:[1,2,3,4].map(function (i) { var e = E(i); e.o = i - 1; return e; }), loop:true, stagger:0.5,
     snip:sn([2,3,4,5,6,7,8,9,10],'랩은 이 내용을 기존 managed-settings에 <b>병합</b>합니다.')},
    {kicker:'MODEL', title:'모델은 세 줄로 묶습니다',
     body:'<b>availableModels</b>로 선택지를 줄이고, <b>enforceAvailableModels</b>로 --model 지정도 목록 안으로 바꾸고, <b>env.ANTHROPIC_MODEL</b>로 기본 모델을 고정합니다.',
     facts:['availableModels만으로는 기본 모델이 안 바뀜','managed env는 사용자 env보다 우선','시작 화면에 Sonnet 5.5'],
     zones:Z, nodes:ALL, hot:['f1','r1'], edges:[E(1)], loop:true,
     snip:sn([2,3,4],'이 랩의 사용자 설정에는 ANTHROPIC_MODEL=opus가 있어서 <b>세 줄이 함께</b> 필요합니다.')},
    {kicker:'RETENTION', title:'세션 기록은 14일만 남깁니다',
     body:'<b>cleanupPeriodDays</b>로 로컬에 남는 세션 기록(JSONL)을 14일 뒤 지웁니다. 기본값은 30일입니다.',
     facts:['기본 30일, 최소 1일','지운 세션은 /resume에 안 보임'],
     zones:Z, nodes:ALL, hot:['f2','r2'], edges:[E(2)], loop:true,
     snip:sn([5],'PC에 남는 대화 기록의 <b>보존 기간</b>입니다.')},
    {kicker:'DENY', title:'원본 데이터 raw/는 읽지 못하게',
     body:'<b>permissions.deny</b>에 실제 경로(mydata/raw)와 작업 폴더의 링크 경로(ch2/raw)를 <b>둘 다</b> 넣습니다. 규칙은 도구가 받은 경로 그대로 맞춰 보기 때문입니다.',
     facts:['Read deny는 Read, Grep, Glob 같은 파일 도구를 막음','cat 같은 셸 명령은 Lab 2의 Sandbox가 맡음','pseudo/는 그대로 읽힘'],
     zones:Z, nodes:ALL, hot:['f3','r3'], edges:[E(3)], loop:true,
     snip:sn([6,7,8],'경로를 하나만 넣으면 <b>링크 쪽으로 새어 나갑니다</b>.')},
    {kicker:'BYPASS', title:'우회 모드는 잠급니다',
     body:'<b>disableBypassPermissionsMode</b>를 두면 --dangerously-skip-permissions를 줘도 우회 모드로 들어가지 않습니다. deny 규칙도 그대로 살아 있습니다.',
     facts:['실행은 exit=0으로 끝남','우회 모드만 꺼짐'],
     zones:Z, nodes:ALL, hot:['f4','r4'], edges:[E(4)], loop:true,
     snip:sn([9,10],'랩 TASK 03에서 <b>직접 확인</b>합니다.')}
  ], { legend:[['accent','모델'],['info','보존 기간'],['warning','원본 데이터'],['success','우회 모드']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• availableModels ["sonnet","haiku"], enforceAvailableModels true, env.ANTHROPIC_MODEL "sonnet": 선택지, 명령줄 지정, 기본 모델을 함께 묶음
• cleanupPeriodDays 14: 로컬 세션 기록 14일 보존 (기본 30일)
• permissions.deny: raw/ 읽기 금지, 실제 경로와 링크 경로 둘 다. Read deny는 파일 도구만, 셸은 Lab 2 Sandbox
• disableBypassPermissionsMode "disable": 우회 플래그를 줘도 우회 모드로 안 들어감 (exit=0)

이게 오늘 랩에서 그대로 배포할 정책 한 장이에요. 줄 묶음 하나가 개발자 PC에서 보이는 변화 하나가 됩니다.↓
{cue: demo}
먼저 모델은 세 줄로 묶어요. availableModels로 선택지를 Sonnet과 Haiku로 줄이고, enforceAvailableModels로 --model opus처럼 목록 밖을 지정해도 목록 안으로 바꾸고, env의 ANTHROPIC_MODEL로 기본 모델을 고정합니다. availableModels만으로는 기본 모델이 안 바뀌어서 세 줄이 같이 있어야 해요.↓
cleanupPeriodDays 14는 PC에 남는 세션 기록을 14일만 둡니다. 기본은 30일이고요.↓
deny에는 원본 데이터 경로를 실제 경로와 링크 경로 둘 다 넣었어요. 규칙은 도구가 받은 경로 그대로 맞춰 보거든요. 그리고 Read deny는 Claude의 파일 도구를 막는 거라, cat 같은 셸 명령은 Lab 2의 Sandbox가 맡습니다.↓
마지막으로 disableBypassPermissionsMode로 우회 모드를 잠급니다.

[출처]
• Ch2 Lab 1 TASK 02 (정책 내용과 효과 표), TASK 03
• code.claude.com/docs/en/settings-reference (availableModels, enforceAvailableModels, cleanupPeriodDays, permissions.disableBypassPermissionsMode)
:::
---
<!-- Slide 21: Quick check broken JSON -->
@type: content
@fit: off

## JSON이 깨지면 어떻게 될까?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c2-qc-json">
  <p class="q">managed-settings.json에 JSON 문법 오류가 있으면?</p>
  <div class="opts">
    <button class="opt"><b>A</b>무시하고 실행</button>
    <button class="opt"><b>B</b>틀린 줄만 빼고 실행</button>
    <button class="opt right"><b>C</b>시작을 거부</button>
    <button class="opt"><b>D</b>기본값으로 실행</button>
  </div>
  <p class="ans">정답 C. "Managed settings document could not be parsed" 오류를 내고 시작하지 않습니다(claude -p는 exit=1). JSON은 맞고 항목 하나만 틀렸다면 그 항목만 빠지고 나머지는 적용됩니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c2-qc-json'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 C, 시작을 거부 ("Managed settings document could not be parsed", claude -p는 exit=1)
• 다른 managed 소스에 정상 정책이 있어도 거부
• JSON은 맞고 개별 항목만 틀리면 그 항목만 빠지고 나머지는 적용
• 배포 파이프라인에 jq . 검증

퀴즈 하나 갈게요. managed-settings.json에 JSON 문법 오류가 있으면 Claude Code는 어떻게 할까요? 손 들어서 답해 주세요.↓
{cue: pause}
정답은 C, 시작을 거부합니다. Managed settings document could not be parsed라는 오류를 내고 시작하지 않아요. 정책이 조용히 빠지는 것보다 안전한 쪽이죠.
반대로 JSON은 맞는데 항목 하나만 틀렸다면 그 항목만 빠지고 나머지 정책은 그대로 적용됩니다. 그래서 배포 파이프라인에 jq 점 검증을 꼭 넣어 두세요. 랩 TASK 04에서 일부러 깨뜨려 볼 거예요.

[출처]
• code.claude.com/docs/en/managed-settings (Invalid entries in managed settings, 파싱 실패 시 시작 거부)
• code.claude.com/docs/en/errors (Managed settings document could not be parsed)
• Ch2 Lab 1 TASK 04 Step 2
:::
---
<!-- Slide 22: Verification -->
@type: content
@fit: off

## 배포 이후가 진짜 시작
적용 검증 4단계, 랩 순서 그대로

:::html
<div id="c2-sv-verify"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:10,w:1150,h:190,l:'확인할 것'},{x:20,y:220,w:1150,h:230,l:'보여야 하는 것'}];
  var X = [25, 310, 595, 880];
  var A = [['/status','Setting sources 줄'],['/model','모델 선택지'],['raw/ 읽기 요청','Read 도구로만'],['개인 설정에 allow','~/.claude/settings.json']];
  var B = [['Enterprise managed','settings (file) 표시'],['Sonnet, Haiku만','시작 화면도 Sonnet 5.5'],['raw/ 거부','pseudo/는 읽힘'],['그래도 거부','우회 플래그도 우회 모드 안 됨']];
  var N = [];
  A.forEach(function (a, i) { N.push({id:'a'+i,x:X[i]+15,y:60,w:250,h:110,t:(i+1)+'  '+a[0],s:a[1],c:'info'}); });
  B.forEach(function (b, i) { N.push({id:'b'+i,x:X[i]+15,y:285,w:250,h:120,t:b[0],s:b[1],c:'success'}); });
  function st(i, kicker, title, body, facts, sn) {
    return {kicker:kicker, title:title, body:body, facts:facts, zones:Z, nodes:N, hot:['a'+i,'b'+i],
      edges:[{f:'a'+i,t:'b'+i,c:'success',o:0}], loop:true, snip:sn};
  }
  F.stepviz('#c2-sv-verify', [
    {kicker:'OVERVIEW', title:'배포했으면 네 가지로 확인합니다',
     body:'정책 파일이 <b>읽혔는지</b>, <b>모델</b>이 묶였는지, <b>deny</b>가 통하는지, 개인이 <b>되돌릴 수 없는지</b>. 랩에서 이 순서 그대로 해 봅니다.',
     facts:['1, 2: TASK 02','3, 4: TASK 03','깨진 JSON: TASK 04'],
     zones:Z, nodes:N, hot:N.map(function (n) { return n.id; }),
     edges:[0,1,2,3].map(function (i) { return {f:'a'+i,t:'b'+i,c:'success',o:i}; }), loop:true, stagger:0.5,
     snip:{hd:'확인 순서', path:'Ch2 Lab 1', lines:['1 /status    managed settings (file)','2 /model     Sonnet, Haiku만','3 raw/ Read  거부, pseudo/는 읽힘','4 개인 allow 그래도 거부'], hl:[1,2,3,4], note:'하나라도 다르면 <b>경로, JSON, 재시작</b>부터 봅니다.'}},
    st(0,'STEP 1','정책 파일이 읽혔나','<b>/status</b>의 Setting sources 줄에 <b>Enterprise managed settings (file)</b>이 보여야 합니다. 괄호 안은 정책이 온 길입니다.',
       ['(file): managed-settings.json','(plist), (HKLM): MDM','(drop-ins): managed-settings.d/'],
       {hd:'Claude 입력창', path:'/status', lines:['/status','','# Status 탭','Setting sources:','  Enterprise managed settings (file)'], hl:[1,5], note:'안 보이면 <b>경로와 파일 이름</b>부터 확인합니다.'}),
    st(1,'STEP 2','모델이 묶였나','시작 화면이 <b>Sonnet 5.5</b>로 바뀌고, <b>/model</b>에 Sonnet과 Haiku만 보여야 합니다.',
       ['Opus는 선택지에서 빠짐','Default 줄 설명의 버전 표기는 무시'],
       {hd:'Claude 입력창', path:'/model', lines:['/model','','# 보여야 하는 것','Default','Sonnet','Haiku','# Opus는 없음'], hl:[1,5,6], note:'실제 모델은 <b>시작 화면과 /status</b>로 봅니다.'}),
    st(2,'STEP 3','deny가 통하나','Read 도구로 <b>raw/customers.csv</b>를 읽게 하면 거부되고, <b>pseudo/</b>는 읽혀야 합니다.',
       ['원본만 막고 분석은 그대로','Bash로 우회하지 않게 Read 도구로만 요청'],
       {hd:'Claude 입력창', path:'~/claude-lab/ch2', lines:['# Read 도구로만 읽게 요청','raw/customers.csv     → 거부','pseudo/customers.csv  → 읽힘'], hl:[2,3], note:'Read deny는 <b>Claude의 파일 도구</b>를 막습니다.'}),
    st(3,'STEP 4','개인이 되돌릴 수 없나','개인 <b>settings.json</b>에 allow를 넣어도 읽기는 여전히 거부됩니다. 우회 플래그를 줘도 우회 모드로 들어가지 않습니다.',
       ['권한 규칙은 합쳐지고 deny가 먼저','끝나면 개인 설정을 원복'],
       {hd:'Terminal', path:'~/claude-lab/ch2', lines:['# ~/.claude/settings.json에 allow 추가','"allow": ["Read(~/claude-lab/ch2/raw/**)"]','claude -p "Use the Read tool to read raw/customers.csv"','# → 여전히 거부','claude --dangerously-skip-permissions -p "hi"','# → exit=0, 우회 모드는 꺼진 채'], hl:[2,3,5], note:'이 확인이 <b>정책이 강제된다</b>는 증거입니다.'})
  ], { legend:[['info','확인할 것'],['success','보여야 하는 것']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• 1 /status의 Setting sources에 Enterprise managed settings (file)
• 2 시작 화면 Sonnet 5.5, /model에 Sonnet과 Haiku만
• 3 Read 도구로 raw/ 읽기는 거부, pseudo/는 읽힘
• 4 개인 settings.json에 allow를 넣어도 거부, 우회 플래그를 줘도 우회 모드 안 됨

정책을 배포했으면 실제로 적용됐는지 봐야 하잖아요. 랩 순서 그대로 네 가지로 확인합니다.↓
{cue: demo}
첫째, /status의 Setting sources에 Enterprise managed settings가 보여야 해요. 괄호 안에 file이라고 나오면 파일로 온 정책입니다.↓
둘째, 시작 화면이 Sonnet 5.5로 바뀌고 /model에 Sonnet과 Haiku만 보여야 하고요.↓
셋째, Read 도구로 raw 폴더를 읽게 하면 거부되고 pseudo는 읽혀야 합니다.↓ 넷째, 개인 settings.json에 allow를 넣어 봐도 여전히 거부돼야 해요. 이 네 가지가 맞으면 정책이 강제되고 있다는 증거입니다.

{cue: transition}
여기까지가 정책을 내려보내는 법이었고, 이제 무엇을 막을지로 넘어가겠습니다.

[출처]
• code.claude.com/docs/en/managed-settings (Read the source in /status)
• Ch2 Lab 1 TASK 02 Step 2, TASK 03
:::
---
<!-- Slide 23: Part 03 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 03</span>
  <div class="name">무엇을 못 하게 할 것인가</div>
  <p class="what">앞에서 막고, 놓친 것은 뒤에서, 남는 것은 기록으로</p>
  <ol>
    <li><b>01</b>권한 규칙과 분류기, 두 개의 문</li>
    <li><b>02</b>층마다 잡는 것, 프롬프트 앞의 DLP 훅</li>
    <li><b>03</b>정책으로 강제, 남는 기록</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 3: 무엇을 못 하게 할 것인가
• 처음 설문의 망분리, 보안(51명)과 규제, 감사 대응(45명)에 답하는 Part
• 권한 규칙과 분류기, 층마다 잡는 것과 DLP 훅, 정책 강제와 감사 기록 순서

세 번째 Part는 무엇을 못 하게 할 것인가입니다. 처음에 본 설문에서 51명이 망분리와 보안을, 45명이 규제와 감사 대응을 고르셨죠. 그 질문에 답하는 Part예요.
권한 규칙과 분류기부터 보고, 위험한 명령 하나가 어느 층에서 멈추는지, 주민번호가 든 프롬프트를 어떻게 모델 앞에서 막는지 본 다음, 그걸 정책으로 강제하고 기록으로 남기는 데까지 갈게요.
:::
---
<!-- Slide 24: Permission evaluation order -->
@type: content
@fit: off

## deny 절대 우선
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
    {kicker:'OVERVIEW', title:'합치고, deny부터 위에서 아래로',
     body:'세 스코프의 규칙이 <b>한 목록으로 합쳐진 뒤</b>, <b>deny, ask, allow</b> 순서로 봅니다. 위에서 처음 맞는 줄이 결과입니다. 더 구체적인 allow가 있어도 순서는 바뀌지 않습니다.',
     facts:['스코프별 규칙이 한 목록으로 합쳐짐','deny, ask, allow 순서, 처음 맞는 것이 결과','어디에 적혔든 deny에 걸리면 거부'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, edges:merge.concat([{f:'m',t:'d1',c:'ink',side:'h',o:1},{f:'d1',t:'d2',c:'muted',o:2},{f:'d2',t:'d3',c:'muted',o:3},{f:'d3',t:'d4',c:'muted',o:4},{f:'d1',t:'r1',c:'danger',o:2},{f:'d2',t:'r2',c:'warning',o:3},{f:'d3',t:'r3',c:'success',o:4},{f:'d4',t:'r4',c:'muted',o:5}]), stagger:0.35,
     snip:{hd:'규칙 문법',path:'permissions (Tool(specifier) 한 가지 형식)',lines:rule,hl:[],note:'아래 화살표로 <b>합치기</b>부터 한 단계씩 봅니다.'}},
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
     facts:['deny 다음에 평가','사용자가 승인해야 실행','auto mode에서도 분류기보다 먼저 (Lab 2)'],
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
     body:'어느 규칙에도 일치하지 않으면 <b>현재 권한 모드의 기본 동작</b>을 따릅니다. auto mode라면 여기서 <b>분류기</b>가 판정합니다.',
     facts:['Manual이면 확인, acceptEdits면 편집 자동 등','auto mode면 분류기가 판정 (다음 장)','복잡한 판단은 훅 (이 Part 뒤쪽)'],
     zones:[{x:10,y:30,w:270,h:400,l:'스코프'}],
     nodes:ALL, hot:['m','d1','d2','d3','d4','r4'], edges:[{f:'m',t:'d1',c:'ink',side:'h',o:0},{f:'d1',t:'d2',c:'muted',o:1},{f:'d2',t:'d3',c:'muted',o:2},{f:'d3',t:'d4',c:'muted',l:'일치 없음',o:3},{f:'d4',t:'r4',c:'muted',o:4}],
     stagger:0.4,
     snip:{hd:'현장에서 걸리는 지점',path:'',lines:['# Bash 패턴은 우회가 쉬움: 샌드박스와 함께','# 경로는 ./ 기준 상대 경로','# MCP는 mcp__서버명 단위','# 복잡한 판단은 훅으로'],hl:[],note:'사용자가 이 규칙을 못 바꾸게 하는 건 <b>Part 2의 잠금 키</b>입니다.'}}
  ], {legend:[['danger','거부'],['warning','사람 확인'],['success','바로 실행'],['muted','다음 단계로']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• 권한 규칙은 Managed, Project, User 등 모든 스코프에서 합쳐진 뒤 평가
• 평가 순서: deny, ask, allow, 처음 맞는 것이 결과. 일치 없음이면 권한 모드 기본 동작 (auto mode면 분류기)
• 어디에 있든 deny에 걸리면 거부, 더 구체적인 allow로 deny에 예외를 낼 수 없음
• 형식은 Tool(specifier), 경로는 ./ 상대 경로, MCP는 mcp__서버명 단위
• Bash 패턴은 우회가 쉬우니 샌드박스와 함께, 복잡한 판단은 훅으로

{cue: demo}
첫 화면이 전체 그림이에요. 왼쪽 세 스코프의 규칙이 가운데에서 한 목록으로 합쳐지고, 오른쪽으로 deny, ask, allow 순서로 내려갑니다. 위에서 처음 맞는 줄이 결과예요.↓
한 단계씩 볼게요. 먼저 합치기. 어느 파일에 있느냐보다 어떤 규칙이 있느냐를 보셔야 합니다.↓
deny에 일치하면 바로 거부예요. user에 allow가 있어도 managed에 deny가 있으면 거부됩니다. 더 구체적인 allow를 적어도 deny에 예외를 낼 수는 없어요.↓
ask에 일치하면 사람에게 물어봅니다.↓ allow에 일치하면 묻지 않고 실행합니다.↓
어디에도 일치하지 않으면 지금 권한 모드가 정해요. auto mode라면 이 자리에서 분류기가 판정합니다. 바로 뒤에서 볼게요.
오른쪽 문법은 Tool 괄호 지정자 하나예요. 현장에서 자주 걸리는 게 Bash 패턴인데, 우회하기가 쉽거든요. 그래서 샌드박스와 함께 씁니다.

[출처]
• code.claude.com/docs/en/permissions (Manage permissions, Settings precedence)

[약어]
• MCP: Model Context Protocol, 외부 시스템을 도구로 붙이는 표준
:::
---
<!-- Slide 25: Quick check 2 -->
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
{timing: 1min}
{cue: poll}
[요약]
• 정답 C, 거부
• 규칙은 합쳐진 뒤 deny가 먼저 평가되므로 user의 allow는 의미 없음

퀴즈 하나 해 볼게요. user settings에는 curl을 허용하는 allow가 있고, managed에는 같은 패턴의 deny가 있어요. 어떻게 될까요?↓
{cue: pause}
정답은 C, 거부예요. 방금 본 것처럼 규칙은 먼저 합쳐지고, deny부터 평가하거든요. 나중에 적은 설정이 이기는 방식은 아닙니다.

[출처]
• code.claude.com/docs/en/permissions (Settings precedence)
:::
---
<!-- Slide 26: Auto mode two gates -->
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
  var G3 = {id:'g3',x:690,y:200,w:210,h:84,t:'좁은 allow',s:'읽기, 작업 폴더 편집',c:'success'};
  var G4 = {id:'g4',x:950,y:200,w:210,h:84,t:'분류기',s:'별도 모델 호출',c:'info'};
  var O1 = {id:'o1',x:230,y:360,w:210,h:76,t:'즉시 거부',s:'분류기도 못 풂',c:'danger'};
  var O2 = {id:'o2',x:460,y:360,w:210,h:76,t:'항상 사람 확인',s:'분류기가 대신 못 함',c:'warning'};
  var O3 = {id:'o3',x:690,y:360,w:210,h:76,t:'바로 실행',s:'분류기 생략',c:'success'};
  var O4 = {id:'o4',x:950,y:360,w:210,h:76,t:'차단 또는 허용',c:'info'};
  var N = [RQ,G1,G2,G3,G4,O1,O2,O3,O4];
  var Z = [{x:220,y:150,w:690,h:300,l:'GATE 1 권한 규칙'},{x:930,y:150,w:240,h:300,l:'GATE 2',tone:'info'}];
  var chain = function (k) { var e = [{f:'rq',t:'g1',c:'accent',o:0}]; var ids = ['g1','g2','g3','g4']; for (var i = 0; i < k; i++) e.push({f:ids[i],t:ids[i+1],c:'muted',o:i+1}); return e; };
  var outs = [{f:'g1',t:'o1',c:'danger',o:1},{f:'g2',t:'o2',c:'warning',o:2},{f:'g3',t:'o3',c:'success',o:3},{f:'g4',t:'o4',c:'info',o:4}];
  F.stepviz('#c3-sv-auto', [
    {kicker:'OVERVIEW', title:'문이 두 개입니다',
     body:'auto mode에서도 <b>deny와 ask는 분류기보다 먼저</b> 평가됩니다. 권한 규칙이 첫 번째 문, 분류기가 두 번째 문입니다. 처음 맞는 문이 결과를 정합니다.',
     facts:['1 permissions.deny','2 permissions.ask','3 좁은 allow, 읽기, 작업 폴더 안 편집','4 나머지는 분류기'],
     zones:Z, nodes:N, edges:chain(3).concat(outs), stagger:0.45,
     snip:{hd:'판정 순서',path:'auto mode',lines:['1 permissions.deny  → 즉시 거부','2 permissions.ask   → 항상 사람 확인','3 좁은 allow, 읽기, 작업 폴더 편집','                    → 분류기 없이 실행','4 분류기            → 별도 모델이 판정'],hl:[1,2,3,4,5],note:'<b>Bash(*)</b> 같은 넓은 allow는 auto에 들어가는 순간 <b>꺼지고</b>, 나오면 돌아옵니다.'}},
    {kicker:'GATE 1-1', title:'deny는 누구도 못 풉니다',
     body:'permissions.deny에 걸리면 <b>즉시 거부</b>입니다. 분류기도, 사용자의 의도 표현도 풀지 못합니다.',
     facts:['분류기, 사용자 의도로 못 풂','가장 단단한 경계','고객 원장 경로, 운영 DB 도구 등'],
     zones:Z, nodes:N, hot:['rq','g1','o1'], edges:[{f:'rq',t:'g1',c:'accent',o:0},{f:'g1',t:'o1',c:'danger',o:1}],
     snip:{hd:'예시',path:'permissions',lines:['"deny": ["Read(./secrets/**)"]'],hl:[1],note:'deny는 auto mode에서도 <b>첫 번째</b>입니다.'}},
    {kicker:'GATE 1-2', title:'ask는 분류기가 대신 못 합니다',
     body:'permissions.ask에 걸리면 <b>항상 사람에게</b> 확인합니다. 분류기가 안전하다고 판단해도 대신 승인하지 못합니다.',
     facts:['사람 확인이 반드시 필요한 동작','git push, PR 생성, 배포 스크립트','auto에서도 그대로 확인 창 (Lab 2 TASK 03)'],
     zones:Z, nodes:N, hot:['rq','g1','g2','o2'], edges:chain(1).concat([{f:'g2',t:'o2',c:'warning',o:2}]),
     snip:{hd:'예시',path:'permissions',lines:['"ask": ["Bash(git push *)", "Bash(gh pr create *)"]'],hl:[1],note:'"push만은 꼭 묻게" 하고 싶다면 <b>ask</b>입니다.'}},
    {kicker:'GATE 1-3', title:'좁은 allow는 바로 통과합니다',
     body:'<b>Bash(npm test)</b> 같은 좁은 allow와 읽기, 작업 폴더 안 편집은 <b>분류기를 거치지 않고</b> 실행합니다.',
     facts:['분류기 호출이 없어 빠르고 토큰도 안 씀','Bash(*), Bash(python*) 같은 넓은 allow는 auto 동안 꺼짐','모든 셸 명령을 분류기로: autoMode.classifyAllShell'],
     zones:Z, nodes:N, hot:['rq','g1','g2','g3','o3'], edges:chain(2).concat([{f:'g3',t:'o3',c:'success',o:3}]), stagger:0.4,
     snip:{hd:'예시',path:'permissions',lines:['"allow": ["Bash(npm test)"]','','# 넓은 패턴은 auto 동안 꺼짐','"allow": ["Bash(*)"]'],hl:[1],note:'넓게 열어 둔 allow는 auto에서 <b>효과가 없습니다</b>.'}},
    {kicker:'GATE 2', title:'남은 것은 분류기가 판정합니다',
     body:'앞의 문을 모두 지난 호출은 <b>분류기</b>가 판정합니다. 순서는 <b>hard_deny, soft_deny, allow 예외, 사용자 명시 의도</b>입니다.',
     facts:['hard_deny: 무조건 막음','soft_deny: 막되 allow 예외나 명시 의도로 풀림','"정리해 줘"는 명시 의도 아님, "force push 해 줘"는 명시 의도'],
     zones:Z, nodes:N, hot:['rq','g4','o4'], edges:chain(3).concat([{f:'g4',t:'o4',c:'info',o:4}]), stagger:0.4,
     snip:{hd:'분류기 판정 순서',path:'GATE 2',lines:['hard_deny          # 무조건','soft_deny          # 기본 차단','allow 예외         # soft_deny를 풂','사용자 명시 의도   # 정확히 그 동작을 지시'],hl:[1,2,3,4],note:'분류기는 <b>별도 모델 호출</b>이라 Bedrock에서는 토큰이 듭니다.'}}
  ], { legend:[['danger','거부'],['warning','사람 확인'],['success','바로 실행'],['info','분류기 판정']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• auto mode에서도 deny와 ask가 분류기보다 먼저 평가
• deny는 즉시 거부, 분류기나 사용자 의도로 못 풂
• ask는 항상 사람 확인, 분류기가 대신 승인 못 함
• 좁은 allow와 읽기, 작업 폴더 편집은 분류기 생략, Bash(*) 같은 넓은 allow는 auto 동안 꺼짐
• 분류기 판정: hard_deny, soft_deny, allow 예외, 사용자 명시 의도 순. 일반적인 요청은 명시 의도가 아님

{cue: demo}
Lab 2에서 쓰는 auto mode가 어떻게 판정하는지 보겠습니다. 문이 두 개라고 기억하시면 돼요.↓
첫 번째 문은 방금 본 권한 규칙입니다. deny에 걸리면 즉시 거부이고, 분류기나 사용자의 의도로도 풀지 못해요.↓ ask에 걸리면 분류기가 안전하다고 봐도 반드시 사람에게 묻습니다.↓
Bash npm test처럼 좁게 허용한 명령과 읽기, 작업 폴더 안 편집은 분류기를 거치지 않고 바로 실행해요. 대신 Bash 별표처럼 넓은 allow는 auto에 들어가는 순간 꺼집니다.↓
두 번째 문이 분류기예요. hard_deny, soft_deny, allow 예외, 사용자 명시 의도 순서로 판정합니다. 여기서 명시 의도는 정확히 그 동작을 시킨 경우만이에요. "정리해 줘"는 force push를 허락한 게 아닙니다.

[출처]
• code.claude.com/docs/en/permission-modes (How the classifier evaluates actions)
• code.claude.com/docs/en/auto-mode-config (Override the block and allow rules)
• Ch2 Lab 2 TASK 03
:::
---
<!-- Slide 27: Classifier defaults -->
@type: content
@fit: off

## 설정하지 않아도 막는 네 가지
분류기의 기본 규칙이 막는 것과 통과시키는 것

:::html
<div id="c2p3-sv-cats"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var E1 = {id:'e1',x:20,y:30,w:330,h:82,t:'외부 코드 실행',s:'curl | bash',c:'warning'};
  var E2 = {id:'e2',x:20,y:140,w:330,h:82,t:'데이터 반출',s:'민감 데이터 외부 전송',c:'danger'};
  var E3 = {id:'e3',x:20,y:250,w:330,h:82,t:'되돌릴 수 없는 일',s:'force push, 기존 파일 영구 삭제',c:'warning'};
  var E4 = {id:'e4',x:20,y:360,w:330,h:82,t:'운영',s:'운영 배포, 마이그레이션',c:'warning'};
  var CL = {id:'cl',x:430,y:190,w:250,h:92,t:'분류기',s:'기본 규칙 ($defaults)',c:'info'};
  var SD = {id:'sd',x:770,y:40,w:390,h:92,t:'soft_deny: 차단',s:'정확히 그 동작을 지시하면 풀림',c:'warning'};
  var HD = {id:'hd',x:770,y:190,w:390,h:92,t:'hard_deny: 무조건 차단',s:'지시해도 안 풀림',c:'danger'};
  var PS = {id:'ps',x:770,y:340,w:390,h:92,t:'allow: 묻지 않고 통과',s:'작업 폴더, lock 의존성, 읽기 HTTP',c:'success'};
  var N = [E1,E2,E3,E4,CL,SD,HD,PS];
  var into = function (id, c) { return {f:id,t:'cl',c:c,side:'h',o:0}; };
  var codes = ['$ claude auto-mode defaults','soft_deny:','  Code from External     # curl | bash','  Git Destructive        # force push','  Production Deploy      # 운영 배포','hard_deny:','  Data Exfiltration      # 민감 데이터 반출','allow:','  작업 폴더 파일, lock 의존성, 읽기 HTTP','# "$defaults"를 빼고 쓰면 그 목록이 통째로 사라짐'];
  F.stepviz('#c2p3-sv-cats', [
    {kicker:'OVERVIEW', title:'아무것도 안 적어도 켜져 있습니다',
     body:'분류기는 설정이 없어도 <b>기본 규칙</b>으로 판정합니다. 네 범주는 막고, 일상 작업은 묻지 않고 통과시킵니다. 반출만 <b>무조건</b> 막습니다.',
     facts:['막는 것: 외부 코드 실행, 반출, 되돌릴 수 없는 일, 운영','통과: 작업 폴더 파일, lock 파일 의존성 설치, 읽기 전용 HTTP','기본은 현재 저장소와 그 원격만 신뢰'],
     zones:[], nodes:N, edges:[into('e1','warning'),into('e2','danger'),into('e3','warning'),into('e4','warning'),{f:'cl',t:'sd',c:'warning',o:1},{f:'cl',t:'hd',c:'danger',o:1},{f:'cl',t:'ps',c:'success',o:1}], stagger:0.5,
     snip:{hd:'기본 규칙 이름 (일부)',path:'claude auto-mode defaults',lines:codes,hl:[],note:'거부 메시지의 <b>[...]</b> 안에 이 규칙 이름이 나옵니다.'}},
    {kicker:'1 EXEC', title:'외부 코드 실행',
     body:'인터넷에서 받은 스크립트를 <b>바로 실행</b>하는 것을 막습니다. <code>curl ... | bash</code>가 대표 예입니다.',
     facts:['다운로드 후 바로 실행','soft_deny: 정확히 그 명령을 지시하면 풀림','Lab 2 TASK 03에서 확인'],
     zones:[], nodes:N, hot:['e1','cl','sd'], edges:[into('e1','warning'),{f:'cl',t:'sd',c:'warning',o:1}],
     snip:{hd:'기본 규칙 이름 (일부)',path:'claude auto-mode defaults',lines:codes,hl:[2,3],note:'모델이 먼저 받아 내용을 확인하는 쪽을 고르기도 합니다.'}},
    {kicker:'2 EXFIL', title:'데이터 반출',
     body:'민감 데이터를 <b>신뢰 범위 밖</b>으로 보내는 것을 막습니다. 기본 <b>hard_deny</b>라 사용자가 지시해도 풀리지 않습니다.',
     facts:['신뢰 범위 밖 = autoMode.environment에 없는 곳','hard_deny: 명시 의도로도 안 풀림','민감 위치는 environment에 이름으로 적기'],
     zones:[], nodes:N, hot:['e2','cl','hd'], edges:[into('e2','danger'),{f:'cl',t:'hd',c:'danger',o:1}],
     snip:{hd:'기본 규칙 이름 (일부)',path:'claude auto-mode defaults',lines:codes,hl:[6,7],note:'"외부"의 기준은 <b>autoMode.environment</b>가 정합니다.'}},
    {kicker:'3 DESTROY', title:'되돌릴 수 없는 일',
     body:'force push, 원격 이력 덮어쓰기, <b>세션 전부터 있던 파일의 영구 삭제</b>, 클라우드 저장소 대량 삭제를 막습니다.',
     facts:['force push, 원격 브랜치 삭제','세션 전부터 있던 파일 영구 삭제','루트, 홈, 작업 폴더 rm은 분류기가 아니라 항상 사람 확인'],
     zones:[], nodes:N, hot:['e3','cl','sd'], edges:[into('e3','warning'),{f:'cl',t:'sd',c:'warning',o:1}],
     snip:{hd:'기본 규칙 이름 (일부)',path:'claude auto-mode defaults',lines:codes,hl:[2,4],note:'루트, 홈, 작업 폴더를 지우는 rm은 <b>allow 규칙이나 훅으로도</b> 승인되지 않습니다.'}},
    {kicker:'4 PROD', title:'운영',
     body:'<b>운영 배포와 마이그레이션</b>을 막습니다. 이름에 prod, production이 든 원격 대상은 민감한 곳으로 봅니다.',
     facts:['운영 배포, DB 마이그레이션','prod 이름의 원격 대상','사내 운영 대상은 environment에 이름으로'],
     zones:[], nodes:N, hot:['e4','cl','sd'], edges:[into('e4','warning'),{f:'cl',t:'sd',c:'warning',o:1}],
     snip:{hd:'기본 규칙 이름 (일부)',path:'claude auto-mode defaults',lines:codes,hl:[2,5],note:'운영 대상을 이름으로 적으면 추측 대신 <b>그 목록</b>으로 판정합니다.'}},
    {kicker:'PASS', title:'묻지 않고 통과하는 것',
     body:'작업 폴더 파일 작업, lock 파일에 선언된 의존성 설치, 읽기 전용 HTTP는 통과합니다. <b>현재 저장소로의 push도 기본 통과</b>라서, 꼭 묻게 하려면 ask를 겁니다.',
     facts:['작업 폴더 파일, lock 의존성, 읽기 HTTP','현재 저장소 push는 기본 통과 (기본 브랜치 포함)','push만은 묻게: permissions.ask'],
     zones:[], nodes:N, hot:['cl','ps'], edges:[{f:'cl',t:'ps',c:'success',o:0}],
     snip:{hd:'기본 규칙 이름 (일부)',path:'claude auto-mode defaults',lines:codes,hl:[8,9,10],note:'규칙을 더할 때는 <b>"$defaults"</b>를 남겨 기본 규칙을 지킵니다.'}}
  ], { legend:[['warning','soft_deny'],['danger','hard_deny'],['success','통과'],['info','분류기']]});
});
:::

:::notes
{timing: 0.5min}
[요약]
• 분류기는 설정하지 않아도 기본 규칙으로 네 범주를 막음: 외부 코드 실행, 데이터 반출, 되돌릴 수 없는 일, 운영
• 반출은 기본 hard_deny(지시해도 안 풀림), 나머지는 soft_deny(정확히 그 동작을 지시하면 풀림)
• 작업 폴더 파일, lock 파일 의존성 설치, 읽기 전용 HTTP, 현재 저장소 push는 통과
• 루트, 홈, 작업 폴더 rm은 allow 규칙이나 훅으로도 승인 불가, 사람 확인
• 규칙을 더할 때는 "$defaults"를 남김

분류기는 아무것도 설정하지 않아도 기본 규칙을 갖고 있어요.↓
{cue: demo}
네 범주를 차례로 볼게요. 외부 코드 실행, 예를 들어 curl로 받아 bash로 바로 실행하는 것.↓ 데이터 반출, 민감 데이터를 밖으로 보내는 것. 이건 기본이 hard_deny라 사용자가 시켜도 안 풀려요.↓ 되돌릴 수 없는 일, force push나 세션 전부터 있던 파일을 지우는 것.↓ 그리고 운영 배포와 마이그레이션입니다.↓
반대로 작업 폴더 파일 작업, lock 파일에 있는 의존성 설치, 읽기 전용 HTTP는 그냥 통과해요. 현재 저장소로 push하는 것도 기본 통과라서, 꼭 묻게 하려면 앞 장의 ask를 거시면 됩니다.

[출처]
• code.claude.com/docs/en/permission-modes (What the classifier blocks by default, Critical paths)
• code.claude.com/docs/en/auto-mode-config (Common boundaries, Override the block and allow rules)
:::
---
<!-- Slide 28: DLP 5 layers -->
@type: content
@fit: off

## 앞 층이 놓친 것은 다음 층에서
위험한 명령 하나가 지나가는 검사 순서

:::html
<div class="fsi fs" id="c2-layers">
  <div class="fs-stage"></div>
  <div class="fs-side">
    <div class="fs-step"></div>
    <div class="fs-title"></div>
    <pre class="fs-code"></pre>
    <div class="fs-say"></div>
    <div class="fs-prog"><i></i></div>
    <div class="fs-hint">장면을 누르거나 ↓ 키로 다음 단계, ↑ 키로 이전 단계</div>
  </div>
</div>
:::

:::script
import('./assets/flowscene.js').then(function (m) { m.mount('#c2-layers', {
  aria: '개발자의 정리 요청으로 Claude가 만든 rm -rf 명령이 PreToolUse 훅을 지나 권한 규칙 deny에서 멈추고, 모양을 바꾼 find -delete 명령은 auto 분류기와 샌드박스가 막는 흐름. 네 층의 설정은 managed 정책이 잠금',
  zones: [
    { box: [-0.4, 0, 0, 25.4, 4.4, 0.4], label: '개발자 PC, 도구 실행 전과 실행 중', labelAt: [-0.2, 0, -1.6] }
  ],
  parts: {
    pc: { boxes: [[1.2, 1.2, 0.4, 1.8, 1.4, 0.8], [1.5, 2.4, 1.2, 1.2, 0.15, 1.0]] },
    cc: { boxes: [[3.9, 1.3, 0.4, 1.5, 1.5, 1.4]] },
    managed: { boxes: [[6.6, 0.2, 0.4, 12.4, 3.8, 0.14]] },
    hook: { boxes: [[7.6, 0.6, 0.54, 0.5, 3.0, 2.0]] },
    rules: { boxes: [[10.8, 0.6, 0.54, 0.5, 3.0, 2.0]] },
    cls: { boxes: [[14.0, 0.6, 0.54, 0.5, 3.0, 2.0]] },
    sbx: { boxes: [[17.4, 0.3, 0.54, 0.35, 3.6, 2.8]] },
    target: { boxes: [[20.6, 1.0, 0.4, 2.6, 2.2, 1.1], [20.9, 1.3, 1.5, 2.0, 1.6, 0.35]] }
  },
  marks: [{ id: 'xr', at: [10.4, 2.0, 1.25] }, { id: 'xc', at: [13.6, 3.0, 1.05] }, { id: 'xs', at: [17.0, 3.0, 1.05] }],
  tags: [
    { id: 'cmd1', at: [6.2, 2.0, 2.6], text: 'rm -rf ../shared-ledger', show: ['hook', 'rules'] },
    { id: 'cmd2', at: [12.0, 3.4, 3.6], text: 'find ../shared-ledger -delete', show: ['alt', 'sbx'] },
    { id: 'e0', at: [7.85, 0.6, -0.9], text: 'exit 0, 패턴 없음', show: ['hook'] },
    { id: 'dn', at: [11.05, 0.6, -0.9], text: 'deny Bash(rm -rf *)', show: ['rules'] },
    { id: 'cb', at: [14.25, 0.6, -0.9], text: '되돌릴 수 없는 삭제', show: ['alt'] },
    { id: 'op', at: [17.6, 0.3, -0.9], text: 'Operation not permitted', show: ['sbx'] },
    { id: 'tg', at: [21.9, 1.0, -0.9], text: '../shared-ledger (작업 폴더 밖)', show: [] }
  ],
  wires: {
    req: { pts: [[5.4, 2.0, 1.25], [7.85, 2.0, 1.25], [11.05, 2.0, 1.25], [14.25, 2.0, 1.25], [17.6, 2.0, 1.25], [20.6, 2.0, 1.0]] },
    alt: { pts: [[5.4, 3.0, 1.05], [7.85, 3.0, 1.05], [11.05, 3.0, 1.05], [14.25, 3.0, 1.05], [17.6, 3.0, 1.05], [20.6, 3.0, 0.95]], cls: 'fs-alt' }
  },
  callouts: [
    { id: 'pc', n: 1, anchor: [2.1, 1.2, 1.2], at: [30, 478], title: '"공간 좀 정리해 줘"', sub: '일반 요청, 삭제를 지시하진 않음' },
    { id: 'hook', n: 2, anchor: [7.85, 2.0, 2.6], at: [120, 110], title: 'PreToolUse 훅', sub: '도구 입력을 패턴 검사 (랩 3층)' },
    { id: 'rules', n: 3, anchor: [11.05, 2.0, 2.6], at: [290, 52], title: '권한 규칙', sub: 'deny, ask, allow 순서 (랩 1층)' },
    { id: 'cls', n: 4, anchor: [14.25, 2.0, 2.6], at: [470, 110], title: 'auto 분류기', sub: 'Manual이면 사람 확인' },
    { id: 'sbx', n: 5, anchor: [17.6, 2.0, 3.4], at: [620, 52], title: '샌드박스 (OS)', sub: '작업 폴더 밖 쓰기 불가 (랩 2층)' },
    { id: 'managed', n: 6, anchor: [9.2, 0.2, 0.5], at: [330, 470], title: 'managed 정책', sub: '네 층의 설정을 사용자가 못 끔' }
  ],
  figures: [
    { at: [0.4, 1.9, 0.4], scale: 0.9, pose: 'type', act: { ask: 'type' } },
    { at: [6.3, -0.7, 0.4], scale: 0.8, colour: 'var(--info)', act: { managed: 'raise' } }
  ],
  code: [
    '요청: "공간 좀 정리해 줘"',
    'Bash: rm -rf ../shared-ledger',
    'PreToolUse dlp-guard.sh   → exit 0',
    '"deny": ["Bash(rm -rf *)"] → 거부',
    'Bash: find ../shared-ledger -delete',
    'auto 분류기: soft_deny     → 차단',
    '"sandbox": { "enabled": true } → 쓰기 불가',
    '/etc/claude-code/managed-settings.json'
  ],
  overview: { label: '전체 그림', title: '훅, 규칙, 분류기, 샌드박스 순서로', say: '명령 하나가 네 층을 차례로 지납니다. 이번엔 <b>권한 규칙</b>에서 멈추고, 모양을 바꾼 명령은 <b>뒤의 층</b>이 잡습니다.' },
  phases: [
    { key: 'ask', d: 2.8, focus: ['pc', 'cc'], badge: 'pc', lines: [1, 2], label: '1  요청', title: '정리해 달랬더니 rm -rf', say: '개발자는 <b>정리</b>만 부탁했는데, Claude가 작업 폴더 밖 <b>../shared-ledger</b>를 지우는 명령을 만듭니다.' },
    { key: 'hook', d: 3.0, focus: ['cc', 'hook'], badge: 'hook', lines: [3], packet: { wire: 'req', span: [0, 1] }, label: '2  PreToolUse 훅', title: '훅이 가장 먼저 봅니다', say: '도구 실행 직전에 <b>훅</b>이 먼저 돕니다. DLP 훅은 주민번호 같은 패턴만 보니 <b>exit 0</b>으로 통과시킵니다.' },
    { key: 'rules', d: 3.4, focus: ['hook', 'rules'], badge: 'rules', lines: [4], packet: { wire: 'req', span: [1, 2], mode: 'block', mark: 'xr', stopAt: 0.55 }, label: '3  권한 규칙', title: 'deny에 걸려 여기서 멈춤', say: 'managed의 <b>deny Bash(rm -rf *)</b>에 일치해 즉시 거부됩니다. user의 allow로도 풀 수 없습니다.' },
    { key: 'alt', d: 3.8, focus: ['rules', 'cls'], cam: ['hook', 'rules', 'cls'], badge: 'cls', lines: [5, 6], packet: { wire: 'alt', span: [0, 3], mode: 'block', mark: 'xc', stopAt: 0.72, colour: 'var(--info)' }, label: '4  모양을 바꾸면', title: '규칙이 놓친 것은 분류기가', say: '<b>find -delete</b>는 deny 패턴에 안 걸립니다. auto 분류기가 <b>세션 전부터 있던 파일의 영구 삭제</b>로 보고 막습니다. Manual이면 사람에게 묻습니다.' },
    { key: 'sbx', d: 3.6, focus: ['cls', 'sbx', 'target'], badge: 'sbx', lines: [7], packet: { wire: 'alt', span: [3, 4], mode: 'block', mark: 'xs', stopAt: 0.6, colour: 'var(--info)' }, label: '5  샌드박스', title: '사람이 승인해도 OS가 막음', say: '누가 승인해도 명령은 <b>샌드박스</b> 안에서 돕니다. 작업 폴더 밖 쓰기는 OS가 <b>Operation not permitted</b>로 막습니다.' },
    { key: 'managed', d: 3.4, focus: ['managed', 'hook', 'rules', 'cls', 'sbx'], cam: ['managed', 'hook', 'sbx'], badge: 'managed', lines: [8], label: '6  managed 정책', title: '네 층을 정책 파일이 잠근다', say: '훅, deny, auto 설정, 샌드박스를 <b>managed-settings.json</b>에 두면 사용자가 끄거나 덮어쓸 수 없습니다.' }
  ],
  frame: function (c) {
    var paint = function (part, on, col) { c.parts[part].querySelectorAll('.fs-face').forEach(function (f) { f.style.stroke = on ? col : ''; }); };
    paint('hook', c.ph.key === 'hook' && c.u > 0.8, 'var(--success)');
    paint('rules', (c.ph.key === 'rules' && c.u > 0.55) || c.all, 'var(--danger)');
    paint('cls', c.ph.key === 'alt' && c.u > 0.72, 'var(--danger)');
    paint('sbx', c.ph.key === 'sbx' && c.u > 0.6, 'var(--danger)');
    paint('managed', c.ph.key === 'managed', 'var(--accent)');
    if (c.all) ['e0', 'dn', 'cb', 'op'].forEach(function (id) { c.tags[id].style.opacity = 0; });
  }
}); });
:::

:::notes
{timing: 2min}
[요약]
• 도구 호출 하나의 검사 순서: PreToolUse 훅, 권한 규칙(deny, ask, allow), auto 분류기(Manual이면 사람 확인), 실행 중 샌드박스(OS)
• 예: "정리해 줘"에 Claude가 rm -rf ../shared-ledger. 훅은 패턴이 없어 통과, managed deny Bash(rm -rf *)에서 거부
• 모양을 바꾼 find -delete는 deny 패턴을 빠져나가지만 분류기가 기존 파일 영구 삭제로 차단, 승인돼도 샌드박스가 작업 폴더 밖 쓰기를 막음
• 네 층의 설정은 managed-settings.json으로 잠금
• 랩의 층 번호(1 권한 규칙, 2 샌드박스, 3 훅, 4 Guardrails, 5 반출 채널)는 종류 번호, 실제 검사는 훅이 먼저

{cue: demo}
↓ 개발자가 공간 좀 정리해 달라고만 했는데, Claude가 작업 폴더 밖의 shared-ledger를 rm -rf로 지우려는 상황입니다.↓
도구가 실행되기 직전에 가장 먼저 도는 건 PreToolUse 훅이에요. 우리 DLP 훅은 주민번호 같은 패턴만 보니까 이 명령은 통과시킵니다. 훅은 적어 둔 것만 잡아요.↓
그다음이 권한 규칙이에요. managed에 deny Bash rm -rf 별표가 있으니 여기서 즉시 거부됩니다.↓
{cue: pause}
그럼 모양을 바꾸면 어떨까요. find에 -delete를 붙이면 deny 패턴에는 안 걸려요. 이걸 auto 분류기가 세션 전부터 있던 파일을 영구 삭제하는 동작으로 보고 막습니다. Manual 모드라면 이 자리에서 사람에게 묻고요.↓
사람이 실수로 승인해도 끝이 아니에요. 명령은 샌드박스 안에서 돌고, 작업 폴더 밖 쓰기는 OS가 막습니다.↓
마지막으로 이 네 층의 설정을 managed 정책 파일에 두면 사용자가 끄지 못해요. 랩에서 1층, 2층, 3층이라고 부르는 건 종류 번호이고, 실제로 먼저 도는 건 훅이라는 점만 기억해 주세요.

{cue: transition}
이번엔 명령이 아니라 프롬프트 자체에 민감정보가 들어 있는 경우를 보겠습니다.

[출처]
• code.claude.com/docs/en/permissions (Extend permissions with hooks: exit 2는 권한 규칙 평가 전에 멈춤)
• code.claude.com/docs/en/permission-modes (How the classifier evaluates actions, What the classifier blocks by default)
• code.claude.com/docs/en/sandboxing (기본 쓰기 범위: 작업 폴더와 임시 폴더)
• Ch2 Lab 2 TASK 01, 선택 TASK 04
:::
---
<!-- Slide 29: DLP before the prompt -->
@type: content
@fit: off

## DLP는 프롬프트 앞에서
UserPromptSubmit 훅이 모델보다 먼저 본다

:::html
<div class="fsi fs" id="c2-dlp">
  <div class="fs-stage"></div>
  <div class="fs-side">
    <div class="fs-step"></div>
    <div class="fs-title"></div>
    <pre class="fs-code"></pre>
    <div class="fs-say"></div>
    <div class="fs-prog"><i></i></div>
    <div class="fs-hint">장면을 누르거나 ↓ 키로 다음 단계, ↑ 키로 이전 단계</div>
  </div>
</div>
:::

:::script
import('./assets/flowscene.js').then(function (m) { m.mount('#c2-dlp', {
  aria: '분석가의 프롬프트가 UserPromptSubmit 훅 dlp-guard.sh를 지나 Bedrock으로 가는 흐름. 가명 데이터 요청은 exit 0으로 통과, 가짜 주민번호가 든 요청은 exit 2로 차단, jq가 없는 고장 난 훅은 통과시켜 Guardrails가 다음 그물이 되고, fail-closed 수정본과 onFailure block은 다시 막음',
  zones: [
    { box: [-0.4, 0, 0, 12.6, 4.2, 0.4], label: '분석가 PC', labelAt: [-0.2, 0, -0.75] },
    { box: [13.4, 0, 0, 10.8, 4.2, 0.4], label: 'AWS 계정, Amazon Bedrock', labelAt: [13.6, 0, -0.75] }
  ],
  parts: {
    pc: { boxes: [[1.2, 1.2, 0.4, 1.8, 1.4, 0.8], [1.5, 2.4, 1.2, 1.2, 0.15, 1.0]] },
    cc: { boxes: [[4.2, 1.3, 0.4, 1.5, 1.5, 1.4]] },
    hook: { boxes: [[8.2, 0.6, 0.4, 0.5, 3.0, 2.2]] },
    guard: { boxes: [[15.4, 0.6, 0.4, 0.5, 3.0, 2.2]] },
    bedrock: { boxes: [[19.2, 1.0, 0.4, 2.4, 2.4, 2.8]] }
  },
  marks: [{ id: 'xh', at: [7.8, 2.0, 1.25] }, { id: 'xg', at: [15.0, 2.0, 1.25] }],
  tags: [
    { id: 'p1', at: [4.6, 3.4, 3.0], text: '"pseudo/customers.csv 연령대 분포를 요약해줘"', show: ['clean'] },
    { id: 'p2', at: [4.6, 3.4, 3.7], text: '"고객 900101-1****** 의 가입 이력을 정리해줘"', show: ['dirty', 'broken', 'fixed'] },
    { id: 'e0', at: [8.45, 0.6, -0.8], text: 'exit 0: 통과', show: ['clean'] },
    { id: 'e2', at: [8.45, 0.6, -1.4], text: 'exit 2: 차단, 문장은 입력창으로', show: ['dirty', 'fixed'] },
    { id: 'e9', at: [8.45, 0.6, -2.0], text: 'jq 없음: exit 0 또는 127, 비차단', show: ['broken'] },
    { id: 'gi', at: [15.65, 0.6, -1.5], text: 'GUARDRAIL_INTERVENED', show: ['broken'] }
  ],
  wires: {
    req: { pts: [[3.2, 1.9, 1.0], [4.2, 2.0, 1.1], [5.7, 2.0, 1.25], [8.45, 2.0, 1.25], [15.65, 2.0, 1.25], [19.2, 2.2, 1.6]] }
  },
  callouts: [
    { id: 'pc', n: 1, anchor: [2.1, 1.2, 1.2], at: [30, 478], title: '분석가의 프롬프트', sub: 'Enter를 누른 순간' },
    { id: 'hook', n: 2, anchor: [8.45, 2.0, 2.8], at: [200, 96], title: 'UserPromptSubmit 훅', sub: 'dlp-guard.sh, 모델보다 먼저' },
    { id: 'guard', n: 3, anchor: [15.65, 2.0, 2.8], at: [470, 96], title: 'Bedrock Guardrails', sub: '선택, AWS 쪽 다음 그물 (랩 4층)' },
    { id: 'bedrock', n: 4, anchor: [20.4, 3.4, 3.2], at: [650, 200], title: 'Claude 모델', sub: '여기 닿기 전에 막는다' }
  ],
  figures: [
    { at: [0.4, 1.9, 0.4], scale: 0.9, pose: 'type', act: { clean: 'type', dirty: 'type' } },
    { at: [10.9, -0.7, 0.4], scale: 0.8, colour: 'var(--info)', act: { fixed: 'raise' } }
  ],
  code: [
    '"UserPromptSubmit": [{ "hooks": [{',
    '  "command": "/opt/dlp/dlp-guard.sh",',
    '  "onFailure": "block" }] }]  # 2.1.295+',
    'PAT=\'...[0-9]{6}-[1-4][0-9]{6}...\'',
    '일치     → exit 2  # 차단, 사유는 사용자에게',
    '불일치   → exit 0  # Bedrock으로',
    'jq 없음  → exit 0, 127  # 비차단, 통과',
    'command -v jq || exit 2  # 수정본'
  ],
  overview: { label: '전체 그림', title: '프롬프트는 훅을 지나야 모델에 닿는다', say: 'Enter를 누르면 <b>UserPromptSubmit 훅</b>이 먼저 검사합니다. 통과, 차단, 고장, 수정본 네 경우를 차례로 봅니다.' },
  phases: [
    { key: 'clean', d: 3.8, focus: ['pc', 'cc', 'hook', 'guard', 'bedrock'], badge: 'hook', lines: [1, 2, 6], packet: { wire: 'req', mode: 'pingpong', colour: 'var(--success)' }, label: '1  가명 데이터', title: '패턴이 없으면 exit 0, 그대로 Bedrock으로', say: '가명 토큰만 든 분석 요청은 패턴이 없어 <b>exit 0</b>입니다. 평소 일은 막지 않습니다.' },
    { key: 'dirty', d: 3.4, focus: ['pc', 'cc', 'hook'], badge: 'hook', lines: [4, 5], packet: { wire: 'req', span: [0, 3], mode: 'block', mark: 'xh', stopAt: 0.6 }, label: '2  주민번호', title: '주민번호 형식이면 exit 2, 모델에 안 감', say: '주민번호 형식이 보이면 <b>exit 2</b>로 막습니다. 프롬프트는 Claude에 <b>닿지 않고</b>, 문장은 입력창으로 돌아옵니다.' },
    { key: 'broken', d: 4.2, focus: ['hook', 'guard'], cam: ['cc', 'hook', 'guard'], badge: 'guard', lines: [7], packet: { wire: 'req', span: [0, 4], mode: 'block', mark: 'xg', stopAt: 0.78, colour: 'var(--warning)' }, label: '3  훅이 고장 나면', title: 'jq가 없으면 검사 없이 통과', say: 'jq가 없는 PC에서는 검사 없이 끝나 <b>통과</b>합니다(fail-open). 127로 끝나도 exit 2가 아니면 진행됩니다. Guardrails를 걸어 뒀다면 AWS 쪽에서 한 번 더 잡습니다.' },
    { key: 'fixed', d: 3.6, focus: ['cc', 'hook'], badge: 'hook', lines: [3, 8], packet: { wire: 'req', span: [0, 3], mode: 'block', mark: 'xh', stopAt: 0.6 }, label: '4  fail-closed', title: '오류 경로도 exit 2로 막는다', say: '수정본은 jq가 없으면 <b>exit 2</b>입니다. 스크립트가 아예 없거나 시간이 초과돼도 <b>onFailure: block</b>이 막습니다.' }
  ],
  frame: function (c) {
    var paint = function (part, on, col) { c.parts[part].querySelectorAll('.fs-face').forEach(function (f) { f.style.stroke = on ? col : ''; }); };
    var k = c.ph.key;
    paint('hook', (k === 'clean' && c.u > 0.3) ? true : ((k === 'dirty' || k === 'fixed') && c.u > 0.6) || k === 'broken', k === 'clean' ? 'var(--success)' : (k === 'broken' ? 'var(--warning)' : 'var(--danger)'));
    paint('guard', k === 'broken' && c.u > 0.78, 'var(--danger)');
    c.parts.bedrock.querySelector('.fs-top').style.fill = k === 'clean' && c.u > 0.4 && c.u < 0.6 ? 'var(--accent)' : '';
  }
}); });
:::

:::notes
{timing: 2.5min}
[요약]
• 프롬프트는 Enter를 누르면 UserPromptSubmit 훅(dlp-guard.sh)을 먼저 지나야 Bedrock에 닿음
• 가명 데이터 요청: 패턴 없음, exit 0 통과
• 주민번호 형식(가짜 값): exit 2로 차단, 프롬프트는 Claude에 닿지 않고 입력창으로 돌아옴, 사유(stderr)는 사용자에게
• jq가 없으면 원래 스크립트는 검사 없이 exit 0, 127 같은 다른 코드도 비차단 오류라 통과(fail-open). Guardrails가 있으면 AWS 쪽에서 한 번 더
• 수정본: command -v jq || exit 2, 스크립트 없음, 시작 실패, 시간 초과는 onFailure: block (v2.1.295+)

{cue: demo}
분석가가 Enter를 누르면 프롬프트는 바로 모델로 가지 않아요. UserPromptSubmit 훅이 먼저 봅니다. 랩에서 만드는 dlp-guard.sh가 여기 붙어요.↓
첫 번째, 가명 토큰만 든 요청은 패턴이 없으니 exit 0으로 그대로 Bedrock에 갑니다. 평소 일은 막지 않아요.↓
두 번째, 형식만 맞춘 가짜 주민번호를 넣으면 exit 2로 막혀요. 프롬프트는 Claude에 닿지 않고, 보낸 문장은 입력창에 그대로 돌아옵니다.↓
{cue: pause}
세 번째가 함정이에요. jq가 없는 PC에서는 스크립트가 검사 없이 끝나서 통과합니다. 127 같은 다른 코드로 끝나도 마찬가지예요. exit 2가 아니면 비차단 오류거든요. 이럴 때 Bedrock Guardrails를 걸어 뒀다면 AWS 쪽에서 한 번 더 잡습니다.↓
네 번째, 그래서 수정본은 jq가 없으면 exit 2로 막고, 스크립트가 아예 없거나 시간이 초과되는 경우는 onFailure block으로 막아요.

[출처]
• code.claude.com/docs/en/hooks (Exit code output, onFailure)
• Ch2 Lab 2 TASK 01, TASK 02, 선택 TASK 05
:::
---
<!-- Slide 30: DLP hook script and fail-open -->
@type: content
@fit: off

## 차단은 exit 2뿐
DLP 훅 예제와 fail-open, 그리고 수정본

:::html
<div id="c3-sv-hook"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var IN = {id:'in',x:20,y:190,w:230,h:90,t:'입력',s:'프롬프트 또는 도구 인자',c:'accent'};
  var HK = {id:'hk',x:310,y:190,w:250,h:90,t:'dlp-guard.sh',s:'UserPromptSubmit, PreToolUse',c:'warning'};
  var O0 = {id:'o0',x:640,y:50,w:250,h:84,t:'exit 0',s:'통과',c:'success'};
  var O2 = {id:'o2',x:640,y:193,w:250,h:84,t:'exit 2',s:'차단',c:'danger'};
  var OX = {id:'ox',x:640,y:336,w:250,h:84,t:'검사 실패',s:'jq 없음: exit 0, 127 등',c:'muted'};
  var CC = {id:'cc',x:950,y:190,w:210,h:90,t:'다음 동작',s:'사유는 사용자 또는 Claude',c:'ink'};
  var N = [IN,HK,O0,O2,OX,CC];
  var PAT = 'PAT=\'(^|[^0-9])([0-9]{6}-[1-4][0-9]{6}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}|01[016789]-[0-9]{3,4}-[0-9]{4}|[0-9]{3}-[0-9]{2,6}-[0-9]{5,7})([^0-9]|$)|AKIA[0-9A-Z]{16}\'';
  var script = ['#!/bin/bash','INPUT=$(cat)','TEXT=$(echo "$INPUT" | jq -r \'.prompt // (.tool_input | tostring)\')','# 주민번호, 카드번호, 휴대폰, 계좌번호, AWS 액세스 키 (탐지 예시)',PAT,'if echo "$TEXT" | grep -Eq "$PAT"; then','  echo "DLP: 민감정보 패턴이 감지되어 차단했습니다" >&2','  exit 2','fi','exit 0'];
  var fixed = ['#!/bin/bash','INPUT=$(cat)','command -v jq >/dev/null || { echo "DLP: 검사기 오류(jq 없음)" >&2; exit 2; }','TEXT=$(echo "$INPUT" | jq -r \'.prompt // (.tool_input | tostring)\') \\','  || { echo "DLP: 입력 해석 실패" >&2; exit 2; }','PAT=\'...\'   # 위와 같음','echo "$TEXT" | grep -Eq "$PAT"; RC=$?','[ "$RC" -eq 1 ] && exit 0   # 1 = 패턴 없음, 통과','echo "DLP: 차단 (grep $RC)" >&2   # 0 일치, 2+ 검사기 오류','exit 2'];
  F.stepviz('#c3-sv-hook', [
    {kicker:'OVERVIEW', title:'결과는 셋, 막는 것은 exit 2뿐',
     body:'훅의 결과는 세 갈래입니다. <b>exit 0</b>은 통과, <b>exit 2</b>는 차단, 그 밖의 종료(검사가 돌지 못한 경우 포함)는 <b>비차단 오류로 진행</b>합니다. 그래서 수정본은 오류 경로도 <b>exit 2</b>로 보냅니다.',
     facts:['exit 0 통과, exit 2 차단','jq 없음 등 검사 실패: exit 0 또는 127, 둘 다 진행','수정본: command -v jq || exit 2, onFailure: "block"'],
     zones:[], nodes:N, hot:['in','hk','o0','o2','ox','cc'],
     edges:[{f:'in',t:'hk',c:'accent'},{f:'hk',t:'o0',c:'success'},{f:'hk',t:'o2',c:'danger'},{f:'hk',t:'ox',c:'muted'},{f:'o0',t:'cc',c:'success',l:'진행'},{f:'ox',t:'cc',c:'muted',l:'진행'}],
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'Lab 2 TASK 01 원본',lines:script,hl:[5,6,7,8,10],note:'exit 2가 아닌 종료는 막지 못합니다.'}},
    {kicker:'CASE 1', title:'민감 패턴이 없으면 통과합니다',
     body:'패턴이 없으면 <b>exit 0</b>으로 통과합니다.<br>검사 대상은 <b>.prompt</b>(UserPromptSubmit) 또는 <b>.tool_input</b>(PreToolUse)입니다.',
     facts:['UserPromptSubmit은 .prompt 검사','PreToolUse는 .tool_input 검사','탐지 예시일 뿐, 운영 룰은 사내 DLP 기준'],
     zones:[], nodes:N, hot:['in','hk','o0','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'o0',c:'success',o:1},{f:'o0',t:'cc',c:'success',l:'진행',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'Lab 2 TASK 01 원본',lines:script,hl:[2,3,10],note:'훅은 표준 입력으로 JSON을 받습니다.'}},
    {kicker:'CASE 2', title:'패턴이 보이면 exit 2로 막습니다',
     body:'형식만 맞춘 가짜 주민번호(예: <b>900101-1******</b> 형식)가 들어오면 grep이 걸리고 <b>exit 2</b>로 차단합니다. 사유(stderr)는 UserPromptSubmit이면 <b>사용자에게</b>, PreToolUse면 <b>Claude에게</b> 갑니다.',
     facts:['exit 2만 차단','UserPromptSubmit: 프롬프트가 Claude에 닿지 않음','PreToolUse: 도구 호출이 멈추고 사유는 Claude에게'],
     zones:[], nodes:N, hot:['in','hk','o2','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'o2',c:'danger',o:1},{f:'o2',t:'cc',c:'danger',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'Lab 2 TASK 01 원본',lines:script,hl:[5,6,7,8],note:'앞뒤가 숫자로 이어지면 안 걸리게 감싸, 금액이나 기간 표기를 잘못 잡지 않습니다.'}},
    {kicker:'CASE 3', title:'이 상태는 jq가 없으면 통과합니다',
     body:'jq가 없으면 TEXT가 비고 grep이 못 찾아 <b>exit 0</b>으로 끝납니다. 127처럼 2가 아닌 코드로 끝나도 비차단 오류라 <b>그대로 진행</b>됩니다. 검사가 실패했는데 통과하는 것, fail-open입니다.',
     facts:['exit 2만 차단','jq 없음: 스크립트는 exit 0','exit 127 같은 그 밖의 종료도 진행'],
     zones:[], nodes:N, hot:['in','hk','ox','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'ox',c:'muted',l:'jq 없음',o:1},{f:'ox',t:'cc',c:'warning',l:'그대로 진행',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'원본, jq 줄에 실패 처리가 없음',lines:script,hl:[3],note:'바로 다음 퀴즈의 상황입니다. 랩 TASK 02에서 직접 확인합니다.'}},
    {kicker:'CASE 4', title:'수정본은 오류 경로도 막습니다',
     body:'수정본은 jq가 없거나 해석이 실패하면 <b>exit 2</b>로 막고, grep 결과가 <b>1(불일치)일 때만</b> 통과시킵니다. 0(일치)과 2 이상(검사기 오류)은 모두 차단합니다. 이것이 <b>fail-closed</b>입니다.',
     facts:['jq 없음, 해석 실패: exit 2','grep 1(불일치)만 통과','스크립트 자체가 없으면: onFailure: block (다음 장)'],
     zones:[], nodes:N, hot:['in','hk','o2','cc'],
     edges:[{f:'in',t:'hk',c:'accent',o:0},{f:'hk',t:'o2',c:'danger',o:1},{f:'o2',t:'cc',c:'danger',o:2}], loop:true,
     snip:{hd:'/opt/dlp/dlp-guard.sh',path:'수정본 요약 (Lab 2 TASK 02)',lines:fixed,hl:[3,4,5,7,8,9,10],note:'<b>if grep ...; then</b> 형태는 grep 오류를 불일치처럼 통과시킵니다.'}}
  ], { legend:[['accent','입력'],['success','통과'],['danger','차단'],['muted','검사 실패']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• DLP 훅 예제는 UserPromptSubmit의 .prompt, PreToolUse의 .tool_input을 패턴으로 검사
• exit 2만 차단. 사유(stderr)는 UserPromptSubmit이면 사용자에게, PreToolUse면 Claude에게
• 원본은 jq가 없으면 검사 없이 exit 0, exit 127 같은 그 밖의 종료도 진행 (fail-open)
• 수정본: command -v jq와 해석 실패에 exit 2, grep 1(불일치)만 통과, 0 일치와 2+ 오류는 차단 (fail-closed)
• 패턴은 탐지 예시, 운영 룰은 사내 DLP 기준

{cue: demo}
방금 장면의 스크립트를 열어 볼게요.↓
패턴이 없으면 exit 0으로 통과합니다. 프롬프트 단계에서는 .prompt를, 도구 실행 전 단계에서는 .tool_input을 검사해요.↓
패턴이 보이면 exit 2로 막습니다. 프롬프트 단계라면 사유가 사용자에게 가고, 도구 단계라면 Claude에게 가요.↓
{cue: pause}
세 번째를 보세요. 원본은 jq가 없으면 검사할 글자가 비어서 exit 0으로 끝나요. 다른 코드로 끝나도 2가 아니면 진행됩니다. 이게 fail-open이에요.↓
그래서 수정본은 jq부터 확인해서 없으면 exit 2로 막고, grep이 1, 즉 불일치일 때만 통과시킵니다. 일치든 검사기 오류든 나머지는 전부 차단해요.

[출처]
• code.claude.com/docs/en/hooks (Exit code output)
• Ch2 Lab 2 TASK 01, TASK 02
:::
---
<!-- Slide 31: Quick check 3 -->
@type: content
@fit: off

## jq 없이 exit 127이면?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc c2p3-qc" id="c3-qc-3">
  <p class="q">DLP 훅이 jq 미설치로 exit 127로 끝나면 어떻게 될까요?</p>
  <div class="c2p3-lanes" aria-label="훅 종료 코드별 결과">
    <div class="ln ok"><code>exit 0</code><i></i><span>진행</span></div>
    <div class="ln no"><code>exit 2</code><i></i><span>차단</span></div>
    <div class="ln q127"><code>exit 127</code><i></i><span class="hide">?</span><span class="show">비차단 오류, 진행</span></div>
  </div>
  <div class="opts">
    <button class="opt"><b>A</b>차단된다</button>
    <button class="opt right"><b>B</b>통과된다</button>
    <button class="opt"><b>C</b>세션이 종료된다</button>
    <button class="opt"><b>D</b>자동 재시도</button>
  </div>
  <p class="ans">정답 B. exit 2만 차단입니다. 그 외 0이 아닌 종료는 비차단 오류로 처리되어 그대로 진행됩니다. onFailure: "block"을 걸면 이 경우도 차단됩니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c3-qc-3'); });
:::

:::notes
{timing: 0.75min}
{cue: poll}
[요약]
• 정답 B, 통과
• exit 2만 차단, 그 외 0이 아닌 종료는 비차단 오류로 진행
• 훅 설정에 onFailure: "block"(v2.1.295+)을 넣으면 0, 2가 아닌 종료도 차단으로 처리

방금 본 내용으로 퀴즈 하나 갈게요. 위에 종료 코드별 결과가 있어요. 0은 진행, 2는 차단. 그럼 jq가 없어서 127로 끝나면 어떻게 될까요?↓
{cue: pause}
정답은 B, 통과예요. 많은 분이 A를 고르시는데요. 훅은 exit 2만 차단으로 보거든요. 그래서 오류 경로에도 exit 2를 꼭 넣고, 훅 설정에는 onFailure block을 함께 겁니다.

[출처]
• code.claude.com/docs/en/hooks (Exit code output, onFailure)
:::
---
<!-- Slide 32: Enforce hooks by policy -->
@type: content
@fit: off

## 정책으로 강제하는 훅
사용자가 끄지 못하게, 고장 나도 막히게

:::html
<div id="c2p3-sv-hookpol"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var MS = {id:'ms',x:20,y:170,w:290,h:100,t:'managed-settings.json',s:'/etc/claude-code',c:'danger'};
  var UH = {id:'uh',x:20,y:340,w:290,h:84,t:'user, project 훅',s:'무시됨',c:'muted'};
  var E1 = {id:'e1',x:390,y:50,w:320,h:84,t:'UserPromptSubmit',s:'모든 프롬프트',c:'accent'};
  var E2 = {id:'e2',x:390,y:190,w:320,h:84,t:'PreToolUse',s:'Bash|Write|Edit|WebFetch',c:'accent'};
  var HC = {id:'hc',x:390,y:340,w:320,h:84,t:'/hooks',s:'managed hooks only 표시',c:'info'};
  var SH = {id:'sh',x:800,y:110,w:360,h:92,t:'/opt/dlp/dlp-guard.sh',s:'root만 쓰기 (755)',c:'warning'};
  var OF = {id:'of',x:800,y:290,w:360,h:92,t:'onFailure: block',s:'없음, 시작 실패, 시간 초과도 차단',c:'danger'};
  var N = [MS,UH,E1,E2,HC,SH,OF];
  var code = ['"allowManagedHooksOnly": true,','"hooks": {','  "UserPromptSubmit": [{ "hooks": [{','    "type": "command",','    "command": "/opt/dlp/dlp-guard.sh",','    "onFailure": "block" }] }],','  "PreToolUse": [{','    "matcher": "Bash|Write|Edit|WebFetch",','    "hooks": [ 위와 같은 훅 ] }]','}'];
  var all = [{f:'ms',t:'e1',c:'danger',o:0},{f:'ms',t:'e2',c:'danger',o:0},{f:'uh',t:'ms',c:'muted',dash:true},{f:'e1',t:'sh',c:'accent',o:1},{f:'e2',t:'sh',c:'accent',o:1},{f:'sh',t:'of',c:'danger',side:'v',o:2}];
  F.stepviz('#c2p3-sv-hookpol', [
    {kicker:'OVERVIEW', title:'정책 파일 한 장이 훅을 붙잡는다',
     body:'관리자가 <b>managed-settings.json</b>에 훅을 등록하고, 다른 출처의 훅은 끄고, 스크립트는 관리자만 고칠 수 있는 곳에 둡니다. 고장 나도 <b>차단</b>되게 합니다.',
     facts:['managed 훅만, 두 지점에 같은 스크립트','스크립트는 root만 쓰는 경로','onFailure: block으로 고장도 차단'],
     zones:[], nodes:N, edges:all, stagger:0.5,
     snip:{hd:'managed-settings.json (hooks)',path:'요약, Lab 2 TASK 01, TASK 02',lines:code,hl:[1,5,6],note:'아래 화살표로 한 줄씩 봅니다.'}},
    {kicker:'STEP 1', title:'managed 훅만 돕니다',
     body:'<b>allowManagedHooksOnly: true</b>면 user, project, local, 플러그인 훅은 돌지 않습니다. 사용자가 DLP 훅을 끄거나 덮어쓸 수 없습니다.',
     facts:['user, project, local, 플러그인 훅 무시','managed가 강제 설치한 플러그인의 훅은 예외','disableAllHooks로도 managed 훅은 못 끔'],
     zones:[], nodes:N, hot:['ms','uh'], edges:[{f:'uh',t:'ms',c:'muted',dash:true,l:'무시'}],
     snip:{hd:'managed-settings.json (hooks)',path:'',lines:code,hl:[1],note:'훅을 만드는 것보다 <b>못 끄게</b> 하는 것이 먼저입니다.'}},
    {kicker:'STEP 2', title:'프롬프트와 도구, 두 지점',
     body:'같은 스크립트를 <b>UserPromptSubmit</b>(모든 프롬프트)과 <b>PreToolUse</b>(Bash, Write, Edit, WebFetch 직전)에 겁니다.',
     facts:['UserPromptSubmit: .prompt 검사','PreToolUse: .tool_input 검사','Read 결과, Bash 리다이렉션 출력은 못 봄 (Lab 2 TASK 01)'],
     zones:[], nodes:N, hot:['ms','e1','e2'], edges:[{f:'ms',t:'e1',c:'danger',o:0},{f:'ms',t:'e2',c:'danger',o:0}],
     snip:{hd:'managed-settings.json (hooks)',path:'',lines:code,hl:[3,7,8,9],note:'훅은 <b>입력</b>만 봅니다. 민감 파일 읽기는 deny와 샌드박스로 막습니다.'}},
    {kicker:'STEP 3', title:'스크립트도 관리자만 고친다',
     body:'정책이 가리키는 <b>/opt/dlp/dlp-guard.sh</b>를 사용자가 고칠 수 있으면 정책은 의미가 없습니다. root만 쓰고 모두 실행만 하게 둡니다.',
     facts:['sudo로 /opt/dlp에 배치','chmod 755: 쓰기는 root만','사용자 홈 아래 경로는 금지'],
     zones:[], nodes:N, hot:['e1','e2','sh'], edges:[{f:'e1',t:'sh',c:'accent',o:0},{f:'e2',t:'sh',c:'accent',o:0}],
     snip:{hd:'managed-settings.json (hooks)',path:'',lines:code,hl:[5],note:'정책 파일과 스크립트, <b>둘 다</b> 관리자 소유입니다.'}},
    {kicker:'STEP 4', title:'고장 나도 막힌다',
     body:'<b>onFailure: "block"</b>(v2.1.295+)이면 스크립트가 없거나, 시작하지 못하거나, 0과 2가 아닌 코드로 끝나거나, 시간이 초과돼도 <b>exit 2처럼</b> 차단합니다.',
     facts:['대상: 시작 실패, 0, 2 아닌 종료, 시간 초과, 잘못된 출력','PreToolUse 시간 초과는 원래 통과, block이면 차단','command, http 훅에만 적용'],
     zones:[], nodes:N, hot:['sh','of'], edges:[{f:'sh',t:'of',c:'danger',side:'v',o:0}],
     snip:{hd:'managed-settings.json (hooks)',path:'',lines:code,hl:[6],note:'스크립트 안의 fail-closed와 <b>설정의 onFailure</b>, 둘 다 겁니다.'}},
    {kicker:'STEP 5', title:'/hooks로 확인합니다',
     body:'세션에서 <b>/hooks</b>를 열면 <b>managed hooks only</b> 표시와 "Only hooks from managed settings run here"가 보입니다. managed 훅 자체는 이 목록에 나오지 않습니다.',
     facts:['managed hooks only 표시 확인','managed 훅은 목록에 안 보임','managed 설정이 있으면 mod가 승인해도 훅 차단은 유지'],
     zones:[], nodes:N, hot:['ms','hc'], edges:[{f:'ms',t:'hc',c:'info',o:0}],
     snip:{hd:'확인',path:'Claude 입력창',lines:['/hooks','# managed hooks only','# Only hooks from managed settings run here'],hl:[1,2,3],note:'랩 TASK 01 마지막 단계에서 직접 봅니다.'}}
  ], { legend:[['danger','정책, 강제'],['accent','훅 지점'],['warning','스크립트'],['muted','무시됨']]});
});
:::

:::notes
{timing: 1.25min}
[요약]
• allowManagedHooksOnly: true로 managed 훅만 실행, user, project, local, 플러그인 훅 무시
• UserPromptSubmit과 PreToolUse(matcher Bash|Write|Edit|WebFetch)에 같은 dlp-guard.sh 등록
• 스크립트는 root만 쓰는 /opt/dlp에, chmod 755
• onFailure: "block"(v2.1.295+): 시작 실패, 0과 2가 아닌 종료, 시간 초과, 잘못된 출력도 차단
• /hooks에 managed hooks only 표시, managed 훅 자체는 목록에 안 보임

훅은 만들기만 해서는 안 되고, 사용자가 끄지 못하게, 그리고 고장 나도 막히게 정책으로 강제해야 해요.↓
{cue: demo}
첫째, allowManagedHooksOnly를 켜면 user나 project, 플러그인 훅은 돌지 않아요. 사용자가 DLP 훅을 끌 수 없습니다.↓
둘째, 같은 스크립트를 프롬프트 제출과 Bash, Write, Edit, WebFetch 실행 직전에 겁니다. 다만 훅은 입력만 봐요. Read로 읽은 내용이나 리다이렉션 출력은 못 봅니다.↓
셋째, 스크립트 파일도 관리자만 고칠 수 있는 경로에 둬야 해요. 파일을 고칠 수 있으면 정책이 의미가 없으니까요.↓
넷째, onFailure를 block으로 두면 스크립트가 없거나, 시작에 실패하거나, 시간이 초과돼도 차단합니다. v2.1.295 이상이에요.↓
마지막으로 /hooks를 열면 managed hooks only라고 나오는지 확인합니다.

[출처]
• code.claude.com/docs/en/hooks (allowManagedHooksOnly, onFailure)
• code.claude.com/docs/en/permissions (Precedence among rules, hooks, and mods)
• Ch2 Lab 2 TASK 01, TASK 02
:::
---
<!-- Slide 33: MCP server control -->
@type: content
@fit: off

## MCP 서버 하나가 통로 하나
새 반출 채널을 정책으로 닫는다

:::html
<div id="c2p3-sv-mcp"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var CC = {id:'cc',x:20,y:190,w:220,h:92,t:'Claude Code',s:'MCP 서버를 켤 때',c:'accent'};
  var PO = {id:'po',x:320,y:190,w:280,h:92,t:'managed 목록',s:'거부 먼저, 허용은 그다음',c:'danger'};
  var A1 = {id:'a1',x:690,y:14,w:470,h:76,t:'https://mcp.corp.example.com',s:'serverUrl 일치, 연결',c:'success'};
  var A2 = {id:'a2',x:690,y:106,w:470,h:76,t:'python /opt/mcp/jira.py',s:'serverCommand 일치, 연결',c:'success'};
  var B1 = {id:'b1',x:690,y:198,w:470,h:76,t:'사용자가 추가한 서버',s:'허용 목록에 없음, 차단',c:'muted'};
  var B2 = {id:'b2',x:690,y:290,w:470,h:76,t:'https://x.paste.example.com',s:'deniedMcpServers, 무조건 차단',c:'danger'};
  var P1 = {id:'p1',x:690,y:382,w:470,h:76,t:'플러그인에 든 MCP 서버',s:'같은 검사를 받음',c:'warning'};
  var N = [CC,PO,A1,A2,B1,B2,P1];
  var code = ['"allowManagedMcpServersOnly": true,','"allowedMcpServers": [','  { "serverUrl":','      "https://mcp.corp.example.com/*" },','  { "serverCommand":','      ["python", "/opt/mcp/jira.py"] }','],','"deniedMcpServers": [','  { "serverUrl":','      "https://*.paste.example.com/*" }',']'];
  var base = {f:'cc',t:'po',c:'accent',o:0};
  F.stepviz('#c2p3-sv-mcp', [
    {kicker:'OVERVIEW', title:'서버마다 문 하나, 목록으로 연다',
     body:'MCP 서버 하나는 데이터가 나갈 수 있는 <b>새 통로 하나</b>입니다. 켜기 전에 <b>거부 목록</b>을 먼저 보고, 그다음 <b>managed 허용 목록</b>에 있는 것만 엽니다.',
     facts:['거부 목록이 늘 먼저, 아무것도 못 풂','허용 목록은 managed 것만 인정','목적지는 이름이 아니라 URL, 명령으로'],
     zones:[], nodes:N, edges:[base,{f:'po',t:'a1',c:'success',o:1},{f:'po',t:'a2',c:'success',o:1},{f:'po',t:'b1',c:'muted',dash:true},{f:'po',t:'b2',c:'danger',dash:true},{f:'po',t:'p1',c:'warning',o:1}], stagger:0.5,
     snip:{hd:'managed-settings.json (MCP)',path:'예시 도메인',lines:code,hl:[1,4,6,10],note:'아래 화살표로 한 줄씩 봅니다.'}},
    {kicker:'STEP 1', title:'managed 허용 목록만 인정',
     body:'<b>allowManagedMcpServersOnly: true</b>면 user, project 설정의 허용 목록은 무시됩니다. 목록에 없는 서버는 <b>추가해도 켜지지 않습니다</b>.',
     facts:['user, project 허용 목록 무시','claude mcp add도 정책 오류로 거절','allowManagedPermissionRulesOnly와는 별개 키'],
     zones:[], nodes:N, hot:['cc','po','b1'], edges:[base,{f:'po',t:'b1',c:'muted',dash:true,l:'차단'}],
     snip:{hd:'managed-settings.json (MCP)',path:'',lines:code,hl:[1],note:'이 키가 없으면 사용자가 자기 설정으로 <b>허용 목록을 넓힐 수</b> 있습니다.'}},
    {kicker:'STEP 2', title:'목적지를 URL과 명령으로 고정',
     body:'원격 서버는 <b>serverUrl</b>, 로컬 서버는 <b>serverCommand</b>로 허용합니다. serverName은 사용자가 붙이는 <b>이름표</b>일 뿐이라 통제 수단이 아닙니다.',
     facts:['serverUrl: 와일드카드 가능','serverCommand: 명령과 인자가 정확히 같아야','serverName: 누구나 github라고 이름 붙일 수 있음'],
     zones:[], nodes:N, hot:['cc','po','a1','a2'], edges:[base,{f:'po',t:'a1',c:'success',o:1},{f:'po',t:'a2',c:'success',o:1}],
     snip:{hd:'managed-settings.json (MCP)',path:'',lines:code,hl:[2,3,4,5,6,7],note:'허용 목록에 URL 항목이 하나라도 있으면 원격 서버는 <b>URL이 맞아야</b> 켜집니다.'}},
    {kicker:'STEP 3', title:'거부 목록이 이깁니다',
     body:'<b>deniedMcpServers</b>에 맞으면 허용 목록에 있어도 차단입니다. 거부 목록은 모든 스코프에서 합쳐지고, 무엇으로도 풀리지 않습니다.',
     facts:['허용과 거부에 모두 맞으면 거부','거부는 URL, 명령, 이름 어느 것으로든','외부 붙여넣기 사이트 같은 곳을 미리 닫기'],
     zones:[], nodes:N, hot:['cc','po','b2'], edges:[base,{f:'po',t:'b2',c:'danger',dash:true,l:'거부'}],
     snip:{hd:'managed-settings.json (MCP)',path:'',lines:code,hl:[8,9,10,11],note:'포트까지 막으려면 <b>https://host:*/*</b>처럼 적습니다.'}},
    {kicker:'STEP 4', title:'플러그인에 든 MCP도 같은 검사',
     body:'플러그인이 가져온 MCP 서버도 <b>같은 허용, 거부 목록</b>을 지나야 켜집니다. 플러그인으로 우회할 수 없습니다. 서버 목록을 통째로 고정하려면 <b>managed-mcp.json</b>을 씁니다.',
     facts:['플러그인, claude.ai 커넥터도 검사','managed-mcp.json: 정해 둔 서버만, 나머지 금지','사용 현황은 OTel로 (OTEL_LOG_TOOL_DETAILS=1)'],
     zones:[], nodes:N, hot:['cc','po','p1'], edges:[base,{f:'po',t:'p1',c:'warning',o:1}],
     snip:{hd:'managed-settings.json (MCP)',path:'',lines:code,hl:[2,8],note:'플러그인 자체의 허용 목록은 <b>Ch4</b>에서 다룹니다.'}}
  ], { legend:[['success','허용, 연결'],['danger','거부'],['muted','목록에 없음'],['warning','플러그인 경로']]});
});
:::

:::notes
{timing: 1min}
[요약]
• MCP 서버 하나는 외부로 나가는 통로 하나
• allowManagedMcpServersOnly로 managed 허용 목록만 인정
• 목적지는 serverUrl, serverCommand로 고정, serverName은 이름표일 뿐
• deniedMcpServers가 허용보다 우선, 플러그인과 claude.ai 커넥터의 MCP도 같은 검사
• 목록을 통째로 고정하려면 managed-mcp.json

MCP 서버는 하나하나가 외부로 나가는 새 통로예요.↓
{cue: demo}
allowManagedMcpServersOnly를 켜면 managed에 적은 허용 목록만 인정해요. 사용자가 서버를 추가해도 켜지지 않습니다.↓
허용 목록은 이름이 아니라 URL이나 실행 명령으로 적어야 해요. 이름은 사용자가 아무렇게나 붙일 수 있거든요.↓
거부 목록에 맞으면 허용 목록에 있어도 차단입니다.↓ 플러그인에 들어 있는 MCP 서버도 같은 검사를 받아서 플러그인으로 우회할 수 없습니다.

[출처]
• code.claude.com/docs/en/managed-mcp (Policy-based control with allowlists and denylists, How a server is evaluated)
:::
---
<!-- Slide 34: What remains as records -->
@type: content
@fit: off

## 감사 근거가 남는 네 곳
요청 하나가 어디에 무엇을 남기는가

:::html
<div id="c2p3-sv-audit"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var CC = {id:'cc',x:40,y:190,w:220,h:92,t:'Claude Code',s:'개발자 PC',c:'accent'};
  var J = {id:'j',x:320,y:56,w:370,h:88,t:'세션 JSONL',s:'~/.claude/projects, 기본 30일',c:'accent'};
  var OT = {id:'ot',x:320,y:330,w:370,h:88,t:'OTel 수집기 (사내)',s:'사용자별 토큰, 비용, 도구',c:'success'};
  var BR = {id:'br',x:790,y:193,w:370,h:86,t:'Amazon Bedrock',s:'추론 프로필로 호출',c:'ink'};
  var CT = {id:'ct',x:790,y:56,w:370,h:88,t:'CloudTrail',s:'누가, 언제, 어떤 모델 (기본 기록)',c:'info'};
  var IL = {id:'il',x:790,y:330,w:370,h:88,t:'invocation logging',s:'선택, 프롬프트 원문까지',c:'warning'};
  var N = [CC,J,OT,BR,CT,IL];
  var Z = [{x:10,y:14,w:700,h:440,l:'PC와 사내망'},{x:760,y:14,w:420,h:440,l:'AWS 계정',tone:'info'}];
  var E = {j:{f:'cc',t:'j',c:'accent'},ot:{f:'cc',t:'ot',c:'success'},br:{f:'cc',t:'br',c:'ink',side:'h'},ct:{f:'br',t:'ct',c:'info',side:'v'},il:{f:'br',t:'il',c:'warning',side:'v'}};
  var e = function (k, o) { var x = {}; for (var p in E[k]) x[p] = E[k][p]; x.o = o; return x; };
  F.stepviz('#c2p3-sv-audit', [
    {kicker:'OVERVIEW', title:'PC에 둘, AWS에 둘',
     body:'요청 하나가 <b>PC</b>에는 세션 기록과 OTel 지표를, <b>AWS 계정</b>에는 CloudTrail 호출 이력과 (켰다면) 원문 로그를 남깁니다. 감사 질문마다 볼 곳이 다릅니다.',
     facts:['PC: 세션 JSONL','사내: OTel 수집기','AWS: CloudTrail, invocation logging (선택)'],
     zones:Z, nodes:N, edges:[e('j',0),e('br',0),e('ot',0),e('ct',1),e('il',1)], stagger:0.6,
     snip:{hd:'네 곳 요약',path:'',lines:['1 세션 JSONL          무엇을 시켰나, 무엇을 했나','2 CloudTrail           누가 언제 어떤 모델을','3 OTel                 사용자별 토큰, 비용, 도구','4 invocation logging   프롬프트와 응답 원문'],hl:[1,2,3,4],note:'아래 화살표로 읽는 순서대로 봅니다.'}},
    {kicker:'1 PC', title:'세션 JSONL: 무엇을 시켰고 무엇을 했나',
     body:'세션 대화와 도구 호출이 PC의 <b>~/.claude/projects/</b> 아래에 <b>평문</b> JSONL로 남습니다. 기본 30일 뒤 지워지고, <b>cleanupPeriodDays</b>로 바꿉니다.',
     facts:['대화, 도구 호출, 결과가 평문으로','기본 30일, cleanupPeriodDays로 조정','고객 데이터를 담을 수 있으니 PC 보안도 필요'],
     zones:Z, nodes:N, hot:['cc','j'], edges:[e('j',0)],
     snip:{hd:'PC',path:'~/.claude/projects/<프로젝트>/<세션>.jsonl',lines:['// settings.json','{ "cleanupPeriodDays": 30 }   // 기본값'],hl:[2],note:'세션 재개용 기록이지 <b>중앙 감사 로그는 아닙니다</b>.'}},
    {kicker:'2 AWS', title:'CloudTrail: 누가 언제 어떤 모델을',
     body:'Bedrock 호출은 CloudTrail에 <b>기본으로</b> 남습니다. 누가(역할, 세션 이름), 언제, 어느 IP에서, 어떤 모델을 불렀는지가 남고 <b>프롬프트 원문은 없습니다</b>.',
     facts:['InvokeModel 계열은 관리 이벤트, 기본 기록','SSO 사용자가 세션 이름으로 보임','ApplyGuardrail 기록은 데이터 이벤트로 따로 켬'],
     zones:Z, nodes:N, hot:['cc','br','ct'], edges:[e('br',0),e('ct',1)],
     snip:{hd:'CloudTrail 이벤트 (예시 값)',path:'',lines:['"eventSource": "bedrock.amazonaws.com",','"eventName": "InvokeModelWithResponseStream",','"userIdentity": { "arn": "...:assumed-role/fsi-dev/dev01" },','"sourceIPAddress": "10.20.3.41"'],hl:[2,3],note:'Part 1의 <b>SSO 임시 자격증명</b>이 여기서 사람 이름으로 이어집니다.'}},
    {kicker:'3 사내', title:'OTel: 사용자별 토큰, 비용, 도구',
     body:'Claude Code가 <b>사내 OTel 수집기</b>로 사용자별 토큰, 비용, 도구 사용을 보냅니다. Anthropic이 아니라 <b>우리 수집기</b>로 갑니다.',
     facts:['CLAUDE_CODE_ENABLE_TELEMETRY=1로 켬','사용자별 토큰, 비용, 도구 이벤트','대시보드와 비용 보고는 Ch6'],
     zones:Z, nodes:N, hot:['cc','ot'], edges:[e('ot',0)],
     snip:{hd:'managed-settings.json (env)',path:'예시 주소',lines:['"CLAUDE_CODE_ENABLE_TELEMETRY": "1",','"OTEL_METRICS_EXPORTER": "otlp",','"OTEL_LOGS_EXPORTER": "otlp",','"OTEL_EXPORTER_OTLP_ENDPOINT": "http://otel.corp.example.com:4317"'],hl:[1,4],note:'managed env로 내리면 사용자가 <b>끄지 못합니다</b>.'}},
    {kicker:'4 AWS', title:'invocation logging: 원문까지, 선택',
     body:'Bedrock <b>model invocation logging</b>을 켜면 프롬프트와 응답 <b>원문</b>이 S3나 CloudWatch Logs에 남습니다. 그 저장소 자체가 <b>민감 데이터</b>가 됩니다.',
     facts:['기본 꺼짐, 계정과 리전 단위로 켬','S3, CloudWatch Logs로','저장소 접근 권한, 암호화, 보존 기간 먼저'],
     zones:Z, nodes:N, hot:['br','il'], edges:[e('br',0),e('il',1)],
     snip:{hd:'Bedrock 설정 (요약)',path:'aws bedrock put-model-invocation-logging-configuration',lines:['--logging-config \'{','  "s3Config": { "bucketName": "fsi-bedrock-logs" },','  "textDataDeliveryEnabled": true','}\''],hl:[2,3],note:'Anthropic으로 가는 텔레메트리는 Bedrock에서 <b>기본 꺼짐</b>, WebFetch 사전 검사만 호스트명을 보냅니다.'}}
  ], {legend:[['accent','PC 기록'],['success','사내 수집기'],['info','AWS 기본 기록'],['warning','선택, 원문']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• PC: 세션 JSONL, ~/.claude/projects 아래 평문, 기본 30일 (cleanupPeriodDays)
• AWS: CloudTrail에 Bedrock 호출이 기본 기록 (누가, 언제, 어떤 모델, 원문 없음)
• 사내: OTel 수집기로 사용자별 토큰, 비용, 도구 (Ch6)
• AWS: model invocation logging은 선택, 프롬프트 원문이 S3나 CloudWatch Logs에 남으므로 저장소가 민감 데이터
• Anthropic 텔레메트리는 Bedrock에서 기본 꺼짐, 단 WebFetch 사전 검사는 호스트명을 api.anthropic.com으로 보냄 (skipWebFetchPreflight로 끔)

감사에서 근거로 쓸 기록은 네 곳에 남아요. PC 쪽에 둘, AWS 쪽에 둘입니다.↓
{cue: demo}
먼저 PC에는 세션 JSONL이 남아요. 무엇을 시켰고 Claude가 무엇을 했는지가 평문으로 기본 30일 남습니다. 고객 데이터가 들어 있을 수 있다는 점도 기억해 주세요.↓
AWS 쪽에는 CloudTrail이 기본으로 Bedrock 호출을 남겨요. 누가, 언제, 어떤 모델을 불렀는지요. Part 1에서 본 SSO 임시 자격증명 덕분에 역할 뒤의 사람 이름까지 이어집니다. 원문은 없어요.↓
OTel을 켜면 사용자별 토큰, 비용, 도구 사용이 우리 사내 수집기로 갑니다. 이건 Ch6에서 대시보드로 만들어요.↓
{cue: pause}
마지막으로 Bedrock invocation logging을 켜면 프롬프트 원문까지 남아요. 대신 그 저장소 자체가 민감 데이터가 되니 권한과 보존 정책부터 정하셔야 합니다. 그리고 Anthropic 텔레메트리는 Bedrock에서 기본 꺼져 있지만, WebFetch 사전 검사는 호스트명을 보낸다는 점, skipWebFetchPreflight로 끈다는 점만 기억해 주세요.

[출처]
• code.claude.com/docs/en/data-usage (Local caching, Default behaviors by API provider, WebFetch domain safety check)
• code.claude.com/docs/en/monitoring-usage
• docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html
• docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html
:::
---
<!-- Slide 35: Deeper topics move to the labs -->
@type: content
@fit: off

## 더 깊은 내용은 실습에서 손으로
강의에서 줄인 주제와 실습 TASK

:::html
<div class="fsi fsi-lab c23-labmap">
  <ol class="steps">
    <li><b>Lab 1 TASK 01</b><span>지금의 연결 읽기: env, 추론 프로필, 최소 IAM 정책과 비교</span><em>IAM 세부</em></li>
    <li><b>Lab 1 TASK 02부터 04</b><span>정책 배포, 개인 설정으로 우회 시도, 정책 파일이 깨지면?</span><em>정책 배포</em></li>
    <li><b>Lab 1 TASK 06</b><span>같은 정책을 게이트웨이 그룹 정책으로 내려보내기</span><em>게이트웨이</em></li>
    <li><b>Lab 2 TASK 01, 02</b><span>DLP 훅을 정책으로 강제하고, fail-open을 고치기</span><em>훅</em></li>
    <li><b>Lab 2 TASK 03</b><span>auto mode로 확인 창을 줄이고 경계 긋기</span><em>auto mode</em></li>
    <li><b>Lab 2 선택 TASK</b><span>샌드박스로 curl 빈틈 막기, Bedrock Guardrails, 확장 통제</span><em>DLP 층</em></li>
  </ol>
  <p class="where">망분리 준비물, OS별 차이, 쿼터는 PDF 강의자료(정책편, 가드레일편)의 더 알아보기에 있습니다.</p>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 강의에서 줄인 내용은 실습 TASK로 이어짐
• Ch2 Lab 1: 최소 IAM, 정책 배포와 우회 시도, drop-in과 깨진 JSON, 게이트웨이 그룹 정책
• Ch2 Lab 2: DLP 훅 강제와 fail-open 수정, auto mode, 선택으로 샌드박스, Guardrails, 확장 통제
• 망분리 준비물, OS 차이, 쿼터는 PDF 덱의 더 알아보기

오늘 강의에서 일부러 깊이 들어가지 않은 주제들이 있죠. 그 내용은 실습에서 직접 해 보시면 훨씬 빨리 익숙해져요.
{cue: pause}
Lab 1에서는 지금 연결을 읽으면서 최소 IAM 정책과 비교합니다. 정책 파일을 배포한 뒤에는 개인 설정으로 뚫어 볼 거예요. 정책 조각과 깨진 JSON, 게이트웨이 그룹 정책도 여기서 보고요.
Lab 2에서는 DLP 훅을 만들어서 정책으로 강제합니다. 그다음 일부러 고장 내서 fail-open을 확인하고 고쳐 볼 거예요. auto mode, 샌드박스, Guardrails도 실습으로 다룹니다.
망분리 환경 준비물이나 OS별 차이 같은 운영 주제는 PDF 덱의 더 알아보기를 참고하시면 돼요.
:::
---
<!-- Slide 36: Key Takeaways -->
@type: content
@fit: off

## 기억할 여섯 줄
Chapter 2 Key Takeaways

:::html
<div class="fsi fsi-recap c2-recap">
  <div class="fsi-grid-3">
    <div class="rc"><b>01</b><span>전용선과 PrivateLink면 인터넷 없이 Bedrock에, 연결은 USE_BEDROCK과 리전</span></div>
    <div class="rc"><b>02</b><span>장기 키 대신 SSO 프로필 + awsAuthRefresh</span></div>
    <div class="rc"><b>03</b><span>모델은 반드시 고정, 팀마다 다른 이름표(추론 프로필)로 누구의 호출인지</span></div>
    <div class="rc"><b>04</b><span>정책은 managed-settings.json, 충돌하면 managed가 이기고 /status로 확인</span></div>
    <div class="rc"><b>05</b><span>요청은 훅, 권한 규칙, 분류기, 샌드박스를 차례로 지남, 훅은 exit 2만 차단</span></div>
    <div class="rc"><b>06</b><span>DLP는 프롬프트 앞에서, 못 막은 것은 기록으로</span></div>
  </div>
  <p class="c2-lead">비용을 줄이는 법은 Ch5(개인), 조직이 비용을 보고 통제하는 법은 Ch6에서 이어집니다.</p>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 사내망에서는 전용선과 PrivateLink로 인터넷 없이, 연결은 환경변수 두 개, 로그인은 SSO와 awsAuthRefresh
• 모델 고정, 팀마다 다른 추론 프로필로 누구의 호출인지 남김, 비용은 Ch5와 Ch6
• 정책은 managed-settings.json, managed가 이기고 /status로 확인
• deny가 먼저, 훅은 exit 2만 차단, DLP는 다섯 겹과 기록

자, 오늘 내용을 여섯 줄로 정리해 볼게요.
{cue: pause}
연결은 환경변수 두 개면 돼요. 로그인은 장기 키 대신 SSO 프로필과 awsAuthRefresh를 쓰고, 모델은 반드시 고정하고, 팀마다 다른 추론 프로필로 누구의 호출인지 남깁니다. 비용 이야기는 Ch5와 Ch6에서 이어 갈게요.
정책은 managed-settings.json 파일로 내려요. 같은 키가 부딪히면 managed가 이기죠. 배포한 뒤에는 /status로 꼭 확인하세요.
권한 규칙은 deny가 먼저예요. 훅은 exit 2일 때만 막으니까 오류 경로도 exit 2로 닫아야 합니다. DLP 기능이 따로 있는 게 아니라 다섯 겹을 쌓는 거고, 못 막은 것은 기록으로 답합니다.
:::
---
<!-- Slide 37: Thank you -->
@type: thankyou
@toc: toc.html
@next: 03-ch3-subagents.html
@next-label: Chapter 3
@message: 다음은 점심입니다. 식사 후 통합 랩에서 Preflight와 Ch1 Lab을 마친 뒤, 오늘 본 정책과 훅을 Ch2 Lab 1, Lab 2에서 직접 배포하고 뚫어 봅니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 받습니다.

:::notes
{timing: 0.5min}
[요약]
• 다음은 점심, 식사 후 통합 랩에서 Preflight와 Ch1 Lab, 이어서 Ch2 Lab 1과 Lab 2
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 이제 점심 시간이에요. 식사 후 통합 랩에서 Preflight와 Ch1 Lab을 마치고 나면, 오늘 본 정책과 훅을 Ch2 Lab 1과 Lab 2에서 직접 배포하고 뚫어 볼 거예요.
질문 있으시면 Slack 채널에 언제든 편하게 남겨 주세요.
:::
