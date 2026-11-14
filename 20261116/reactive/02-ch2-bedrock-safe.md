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
:::
---
<!-- Slide 2: Agenda -->
@type: content
@fit: off

## 핵심은 강의, 깊이는 실습
세 개의 Part, 연결에서 정책과 가드레일까지

:::html
<div class="fsi fsi-agenda">
  <div class="fsi-grid-3">
    <div class="pick"><span class="k">PART 01</span><span class="t">Bedrock에 연결하기</span><span class="d">환경변수 두 개, SSO 로그인, 모델 고정과 팀별 비용</span></div>
    <div class="pick"><span class="k">PART 02</span><span class="t">정책은 파일로</span><span class="d">managed settings, 우선순위, /status로 확인</span></div>
    <div class="pick"><span class="k">PART 03</span><span class="t">무엇을 못 하게 할 것인가</span><span class="d">deny가 이긴다, 훅은 exit 2, DLP 다섯 겹, 남는 기록</span></div>
  </div>
  <div class="fsi-grid-2">
    <div class="pick lab"><span class="k">LAB / Ch2 Lab 1</span><span class="t">정책 배포, managed settings와 게이트웨이 그룹 정책</span><span class="d">정책을 배포하고, 개인 설정으로 우회가 안 되는지 확인</span></div>
    <div class="pick lab"><span class="k">LAB / Ch2 Lab 2</span><span class="t">가드레일과 DLP, 훅과 auto mode</span><span class="d">훅을 만들고 직접 뚫어 본 뒤 고치기</span></div>
  </div>
</div>
:::

:::notes
{timing: 1.5min}
[요약]
• Part 1 Bedrock에 연결하기, Part 2 정책은 파일로, Part 3 무엇을 못 하게 할 것인가
• 강의는 핵심 기능 위주, IAM 세부, auto mode, 샌드박스, 게이트웨이 같은 깊은 내용은 실습으로
• 실습은 점심 뒤 통합 랩에서 Preflight, Ch1 Lab에 이어 Ch2 Lab 1과 Lab 2

오늘은 세 Part로 갑니다.
첫 번째는 Bedrock에 어떻게 붙는지예요. 두 번째는 회사 정책을 어떻게 파일로 내려보내는지, 세 번째는 위험한 동작을 어떻게 막고 기록하는지입니다.
{cue: pause}
처음 보시는 분이 많아서 강의에서는 꼭 알아야 할 기능만 짚을게요. IAM 정책 세부, auto mode, 샌드박스, 게이트웨이 같은 깊은 내용은 Ch2 Lab 1과 Lab 2에서 직접 해 보면서 익히시면 됩니다.
:::
---
<!-- Slide 3: Why Bedrock -->
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
{timing: 2.5min}
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
<!-- Slide 4: Private path to Bedrock -->
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
    <div class="fs-hint">장면을 누르면 멈춤, 다시 누르면 재생. IP와 이름은 예시 값</div>
  </div>
</div>
:::

:::script
import('./assets/flowscene.js').then(function (m) { m.mount('#c2-pl', {
  aria: '사내망 개발자 PC의 요청이 Direct Connect 전용선, VPC 엔드포인트, IAM 판단을 거쳐 Amazon Bedrock에 닿고 같은 길로 돌아오는 흐름',
  zones: [
    { box: [-0.4, 0, 0, 9.2, 4.2, 0.4], label: '사내망 (망분리)', labelAt: [-0.2, 0, -0.75] },
    { box: [11.6, 0, 0, 15.4, 4.2, 0.4], label: 'AWS 리전 us-east-1', labelAt: [11.8, 0, -0.75] },
    { box: [12.2, 0.4, 0.4, 9.6, 3.4, 0.25], label: '회사 VPC 10.20.0.0/16, private subnet', labelAt: [12.4, 0.4, -0.5], sub: true }
  ],
  parts: {
    pc: { boxes: [[1.4, 1.2, 0.4, 1.8, 1.4, 0.8], [1.7, 2.4, 1.2, 1.2, 0.15, 1.0]] },
    dns: { boxes: [[4.0, 2.4, 0.4, 1.0, 1.0, 1.9]] },
    fw: { boxes: [[7.2, 0.6, 0.4, 0.5, 3.0, 1.7]] },
    net: { clouds: [[[6.4, 3.0, 5.0], 58, 20, '인터넷']] },
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
    dns: { pts: [[3.0, 2.4, 1.8], [4.5, 2.9, 2.0], [7.45, 2.0, 1.5], [7.7, 2.0, 1.0], [12.6, 2.0, 1.0], [13.0, 2.0, 1.4], [15.0, 3.1, 1.6]], cls: 'fs-alt' },
    req: { pts: [[3.2, 1.9, 1.0], [7.45, 1.9, 1.0], [7.7, 2.0, 1.0], [12.6, 2.0, 1.0], [13.0, 2.0, 1.2], [17.1, 2.0, 1.3], [20.8, 2.0, 1.3], [24.4, 2.2, 1.6]] }
  },
  callouts: [
    { id: 'pc', n: 1, anchor: [2.3, 1.2, 1.2], at: [40, 430], title: '개발자 PC, Claude Code', sub: 'SSO 임시 자격증명으로 서명' },
    { id: 'net', n: 2, anchor: [6.4, 3.0, 4.6], at: [420, 58], title: '인터넷 차단', sub: '부가 통신도 끔' },
    { id: 'dns', n: 3, anchor: [4.5, 2.4, 2.3], at: [150, 150], title: '사내 DNS, Route 53 Resolver', sub: '이름을 사설 IP로' },
    { id: 'dx', n: 4, anchor: [10.1, 2.0, 1.2], at: [290, 462], title: 'Direct Connect 전용선', sub: 'private VIF, 공용 인터넷 아님' },
    { id: 'vpce', n: 5, anchor: [17.1, 1.3, 1.2], at: [520, 470], title: 'VPC 엔드포인트 (PrivateLink)', sub: 'ENI 10.20.1.15, SG는 443만' },
    { id: 'iam', n: 6, anchor: [20.6, 3.3, 2.9], at: [560, 120], title: 'IAM 판단 4단계', sub: '하나라도 거부면 멈춤' },
    { id: 'bedrock', n: 7, anchor: [24.4, 3.4, 3.2], at: [720, 190], title: 'Amazon Bedrock', sub: '추론 프로필로 모델 선택' }
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
  checks: ['서명 확인 (SigV4, SSO 임시 자격증명)', '역할 정책에 bedrock:InvokeModel*', '엔드포인트 정책이 허용', '조직 SCP가 막지 않음'],
  checksDoneAfter: 'iam',
  overview: { label: '전체 그림', title: '사내망에서 Bedrock까지, 공용 인터넷 없이', say: '출발, 이름 찾기, 전용선, 엔드포인트, IAM 판단, 모델. Part 1은 이 길을 하나씩 엽니다.' },
  phases: [
    { key: 'start', d: 2.8, focus: ['pc'], badge: 'pc', lines: [1, 3], label: '1  출발', title: '요청은 사내망의 개발자 PC에서', say: 'Claude Code가 Bedrock 모드로 요청을 만들고, <b>SSO로 받은 임시 자격증명</b>으로 서명합니다. PC에 오래 쓰는 키는 없습니다.' },
    { key: 'inet', d: 2.8, focus: ['pc', 'net'], cam: ['pc', 'fw', 'net'], badge: 'net', lines: [4], packet: { wire: 'inet', mode: 'block', mark: 'x' }, label: '2  인터넷은 막힘', title: '인터넷으로 가는 길은 없다', say: '망분리 환경이라 인터넷 길은 막혀 있습니다. 업데이트나 오류 리포트 같은 부가 통신도 <b>환경변수 하나로</b> 끕니다.' },
    { key: 'dns', d: 4.2, focus: ['pc', 'dns', 'dx', 'vgw', 'r53'], badge: 'dns', lines: [6], packet: { wire: 'dns', mode: 'pingpong', colour: 'var(--info)', follow: false }, label: '3  이름 찾기', title: 'Bedrock 주소를 사설 IP로 바꾼다', say: '사내 DNS가 질문을 전용선 너머 <b>Route 53 Resolver</b>로 넘기면, Bedrock 주소가 <b>VPC 안의 사설 IP</b>로 돌아옵니다.' },
    { key: 'dx', d: 3.2, focus: ['pc', 'fw', 'dx', 'vgw'], cam: ['fw', 'dx', 'vgw'], badge: 'dx', lines: [2], packet: { wire: 'req', span: [0, 4] }, label: '4  전용선', title: '요청은 전용선으로 회사 VPC에', say: '요청은 방화벽을 지나 <b>Direct Connect 전용선</b>으로 회사 VPC에 들어갑니다. 공용 인터넷을 거치지 않습니다.' },
    { key: 'vpce', d: 2.8, focus: ['vpce'], badge: 'vpce', lines: [6], packet: { wire: 'req', span: [4, 5] }, label: '5  PrivateLink', title: 'VPC 엔드포인트가 Bedrock의 입구', say: '사설 IP의 주인은 <b>Bedrock Runtime VPC 엔드포인트</b>입니다. 보안 그룹은 443 포트만 엽니다.' },
    { key: 'iam', d: 4.6, focus: ['iam'], badge: 'iam', lines: [3, 7], checks: true, packet: { wire: 'req', span: [5, 6], mode: 'wait', waitAt: 0.55, hold: 0.82 }, label: '6  IAM 판단', title: '네 번 확인하고, 하나라도 거부면 멈춤', say: '서명, 역할 정책, 엔드포인트 정책, 조직 SCP를 차례로 봅니다. <b>모두 허용일 때만</b> 지나갑니다.' },
    { key: 'model', d: 2.8, focus: ['bedrock'], badge: 'bedrock', lines: [5], packet: { wire: 'req', span: [6, 7] }, label: '7  모델', title: '이름표가 가리키는 모델이 답한다', say: '요청의 <b>모델 ID(추론 프로필)</b>가 어떤 Claude가 답할지 정합니다.' },
    { key: 'back', d: 3.2, focus: ['bedrock', 'iam', 'vpce', 'dx', 'pc'], lines: [], packet: { wire: 'req', span: [7, 0] }, label: '8  응답', title: '답은 같은 길로 돌아온다', say: '답도 같은 길로 돌아옵니다. <b>처음부터 끝까지 공용 인터넷을 지나지 않습니다.</b>' }
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
이 장면은 저절로 돌아가요. 사내망에 있는 개발자 PC에서 요청 하나가 Bedrock까지 어떻게 가는지 따라가 볼게요.
먼저 Claude Code가 Bedrock 모드로 요청을 만들고, SSO로 받은 임시 자격증명으로 서명합니다. PC에 오래 쓰는 키는 없어요.
인터넷 쪽 길은 막혀 있습니다. 업데이트나 오류 리포트 같은 부가 통신도 환경변수 하나로 끕니다.
그다음 이름 찾기예요. 사내 DNS가 질문을 전용선 너머 Route 53 Resolver로 넘기면, Bedrock 주소가 VPC 안의 사설 IP로 돌아옵니다.
요청은 방화벽을 지나 Direct Connect 전용선으로 회사 VPC에 들어가고, 그 사설 IP의 주인인 VPC 엔드포인트, 즉 PrivateLink로 들어갑니다.
여기서 IAM이 네 번 확인해요. 서명이 맞는지, 역할에 호출 권한이 있는지, 엔드포인트 정책이 허용하는지, 조직 SCP가 막지 않는지. 하나라도 거부면 멈춥니다.
모두 통과하면 모델 이름표, 추론 프로필이 가리키는 Claude가 답하고, 답은 같은 길로 돌아옵니다. 처음부터 끝까지 공용 인터넷을 지나지 않아요.

{cue: transition}
이제 이 길을 하나씩 열어 보겠습니다. 먼저 환경변수부터요.

[출처]
• docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html
• docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html
• code.claude.com/docs/en/amazon-bedrock
• code.claude.com/docs/en/network-config
:::
---
<!-- Slide 5: Part 01 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 01</span>
  <div class="name">Bedrock에 연결하기</div>
  <p class="what">첫 세션까지 가장 짧은 길</p>
  <ol>
    <li><b>01</b>환경변수 두 개</li>
    <li><b>02</b>SSO로 로그인</li>
    <li><b>03</b>모델 고정과 팀별 비용</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1: Bedrock에 연결하기
• 환경변수 두 개, SSO로 로그인, 모델 고정과 팀별 비용

첫 번째 Part는 Bedrock에 연결하기예요. Claude Code가 Bedrock을 처음 부르려면 뭐가 필요한지부터 볼게요. 그다음 여러 명이 쓸 때 꼭 정해야 할 두 가지, 로그인 방식과 모델을 보겠습니다.
:::
---
<!-- Slide 6: Manual setup and region order -->
@type: content
@fit: off

## 환경변수 두 개로 연결
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
{timing: 3min}
[요약]
• 수동 설정은 CLAUDE_CODE_USE_BEDROCK=1과 AWS_REGION 두 개
• AWS_REGION은 프로필에 리전이 없을 때만, 사내 엔드포인트는 ANTHROPIC_BEDROCK_BASE_URL
• 리전 결정 순서: AWS_REGION, AWS_DEFAULT_REGION, 활성 프로필의 region, 기본 us-east-1
• /status에서 출처까지 확인

수동 설정은 환경변수 두 개면 돼요. CLAUDE_CODE_USE_BEDROCK=1, 그리고 프로필에 리전이 없을 때는 AWS_REGION입니다. 사내 엔드포인트나 게이트웨이를 쓰시면 ANTHROPIC_BEDROCK_BASE_URL을 추가하고요.
{cue: demo}
여기서 헷갈리는 게 리전을 어디서 정하느냐인데요. 오른쪽에서 위에 있는 게 먼저예요. AWS_REGION, AWS_DEFAULT_REGION, 활성 프로필의 region, 마지막이 기본값 us-east-1입니다.
버튼이나 아래 화살표로 위에서부터 하나씩 빼 보겠습니다. 세 값이 다 있으면 1번 AWS_REGION이 이기죠. AWS_REGION을 빼면 2번 AWS_DEFAULT_REGION, 그것도 빼면 3번 프로필의 region을 씁니다. 아무것도 없으면 4번 기본값 us-east-1이고요.
실제 환경에서는 /status를 열어서 리전과 그 출처를 꼭 확인해 주세요.
:::
---
<!-- Slide 7: Five credential methods -->
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
    <div data-for="sso"><p><b>권장</b>입니다. <span class="rp-detail" tabindex="0" data-tip="Single Sign-On. 회사 계정 한 번 로그인으로 여러 서비스에 접근하는 방식">SSO</span> 로그인으로 짧은 수명의 자격증명을 받습니다.</p><p>만료되면 다음 장의 자동 갱신으로 이어 갑니다.</p></div>
    <div data-for="con"><p><b>보조 수단</b>입니다.</p></div>
    <div data-for="api"><p>Bedrock API 키도 장기 키라 <b>비권장</b>입니다. 다섯 가지 중 <b>이 방식만 <span class="rp-detail" tabindex="0" data-tip="AWS SDK 기본 자격증명 체인. 환경 변수, 프로필(SSO 포함), 인스턴스 역할 순으로 자격증명을 찾는 규칙">AWS SDK 기본 자격증명 체인</span>을 거치지 않습니다</b>. SSO 프로필의 갱신 흐름 대신 키 하나로 인증합니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c2-cred', { start: 2 }); });
:::

:::notes
{timing: 2min}
[요약]
• Claude Code는 AWS SDK 기본 자격증명 체인을 그대로 따름
• 권장: SSO 프로필(aws sso login + AWS_PROFILE)
• 비권장: 액세스 키 환경변수, Bedrock API 키 (장기 키)
• AWS CLI 설정은 장기 액세스 키를 디스크에 저장해 비권장, 콘솔 자격증명은 보조 수단
• Bedrock API 키만 AWS SDK 기본 체인을 거치지 않음

자격증명 방식은 다섯 가지예요. 이 중에서 Bedrock API 키만 AWS SDK 기본 체인을 거치지 않습니다.
{cue: demo}
하나씩 보시면, aws configure는 장기 액세스 키를 디스크에 저장해서 권하지 않고, 액세스 키 환경변수와 Bedrock API 키도 장기 키라 권하지 않아요. aws login 콘솔 자격증명은 보조 수단입니다.
금융권에서 권하는 건 SSO 프로필 하나예요. aws sso login으로 받은 짧은 수명의 자격증명을 AWS_PROFILE로 쓰시면 됩니다.

[약어]
• SSO: Single Sign-On
:::
---
<!-- Slide 8: SSO auto refresh -->
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
{timing: 3min}
[요약]
• 자격증명은 만료 5분 전까지 메모리 캐시, 체인 해석 60초 타임아웃
• awsAuthRefresh: 만료됐을 때만 실행, aws sso login 같은 .aws 갱신 명령
• awsCredentialExport: 세션 시작마다 실행, JSON 출력, 교차 계정용
• 프록시 경유, TLS 검사 프록시 지원, 무한 로그인 탭이면 awsAuthRefresh 제거

{cue: demo}
SSO를 쓰면 자격증명이 만료되잖아요. 이때 Claude Code가 대신 로그인해 줍니다. 어떻게 이어지는지 하나씩 볼게요.
첫 번째는 세션 시작이에요. SDK 체인으로 자격증명을 찾고 만료 5분 전까지 캐시합니다.
두 번째, 만료되면 GetCallerIdentity로 확인하고 awsAuthRefresh에 넣은 aws sso login을 실행해요. 브라우저에서 로그인하시면 세션은 그대로 이어집니다.
세 번째는 교차 계정인데요. 이때는 awsCredentialExport를 씁니다. 세션 시작마다 실행되고, 자격증명을 JSON으로 내놓아요.
네 번째, 로그인 탭이 계속 열리면 awsAuthRefresh를 빼고 원인을 보시면 돼요.

[약어]
• TLS: Transport Layer Security
:::
---
<!-- Slide 9: Quick check 1 -->
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
{timing: 1.5min}
{cue: poll}
[요약]
• 정답 B, Opus 5.5
• 고정하지 않으면 Opus 단가로 청구
• 그래서 여러 사용자에게 배포할 때는 반드시 고정

여기서 퀴즈 하나 갈게요. 모델을 고정하지 않은 Bedrock 배포에서 기본 주 모델은 뭘까요? 손 들어서 답해 주세요.
{cue: pause}
정답은 B, Opus 5.5예요. 고정하지 않으면 모든 사용자가 Opus 단가로 청구되거든요. 그래서 다음 슬라이드처럼 반드시 고정해야 합니다.

[출처]
• code.claude.com/docs amazon-bedrock 문서
:::
---
<!-- Slide 10: Model version pinning -->
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
{timing: 3min}
[요약]
• 여러 사용자 배포는 ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL로 반드시 고정
• 고정 대신 ANTHROPIC_BEDROCK_REGION_PREFIX로 prefix만 바꾸는 방법도 있음
• prefix 규칙: us-*는 us., eu-*는 eu., ap-*(서울 포함)는 apac., 그 외는 global.
• 허용값 us, eu, apac, jp, au, global, 계정에 있는 profile ID로 채움

방금 퀴즈에서 봤죠. 여러 사용자에게 배포할 때는 managed settings의 env에서 세 가지 모델을 반드시 고정해야 해요. ANTHROPIC_DEFAULT_OPUS, SONNET, HAIKU_MODEL입니다.
{cue: demo}
모델 ID 앞의 prefix는 리전에 따라 달라져요. 오른쪽에서 골라 볼게요. us 리전은 us., eu 리전은 eu., 서울을 포함한 ap 리전은 apac., 그 밖은 global.입니다.
모델을 하나하나 고정하는 대신 ANTHROPIC_BEDROCK_REGION_PREFIX로 prefix만 바꿀 수도 있어요. 어느 쪽이든 실제 값은 고객님 계정에 있는 profile ID로 채워 주세요.
:::
---
<!-- Slide 11: Team cost tagging -->
@type: content
@fit: off

## 팀별 비용의 기준, 프로필 ARN
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
그럼 팀별로 비용은 어떻게 나눌까요? 세 단계로 살펴보죠.
첫 번째는 원본 프로필을 copyFrom으로 복사하는 거예요. 팀 A용 Application inference profile을 만들고 team, costcenter 태그를 답니다.
두 번째는 그 ARN을 managed settings의 modelOverrides에 연결하는 겁니다. 사용자가 /model에서 고르는 모델도 이 ARN으로 라우팅돼요. availableModels로 고를 수 있는 모델 자체를 제한하고요.
세 번째, 태그로 Cost Explorer에서 팀별 비용을 봅니다. 여기서 자주 놓치시는데요. Billing에서 비용 할당 태그로 활성화해야 보여요.
이렇게 팀마다 프로필 하나가 비용, 쿼터, 로그의 경계가 되고, IAM에서도 이 ARN 단위로 허용할 수 있어요.

[약어]
• ARN: Amazon Resource Name
:::
---
<!-- Slide 12: Part 02 divider -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 02 / PART 02</span>
  <div class="name">정책은 파일로</div>
  <p class="what">콘솔이 없으니 파일이 정책이다</p>
  <ol>
    <li><b>01</b>managed settings 파일</li>
    <li><b>02</b>키 충돌 시 상위 우선</li>
    <li><b>03</b>/status로 확인</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2: 정책은 파일로
• managed settings 파일, 같은 키는 위가 이긴다, /status로 확인

두 번째 Part는 정책은 파일로입니다. Bedrock에는 claude.ai 같은 관리 콘솔이 없잖아요. 그래서 회사 정책을 파일 한 장으로 단말에 내려보내야 해요. 그다음 실제로 적용됐는지까지 확인해 보겠습니다.
:::
---
<!-- Slide 13: Policy delivery channels -->
@type: content
@fit: off

## 콘솔 대신 파일과 MDM
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
    {kicker:'MDM', title:'MDM은 OS 정책 그대로 씁니다',
     body:'macOS는 <b>plist</b>, Windows는 <b>레지스트리</b>로 MDM이 같은 정책을 내려보냅니다.',
     facts:['macOS: plist','Windows: 레지스트리','단말 관리 체계를 그대로 재사용'],
     zones:Z, nodes:ALL, hot:['md','cc'],
     edges:[{f:'md',t:'cc',c:'accent',side:'h',curve:-30,o:0}],
     loop:true,
     snip:{hd:'MDM 채널',path:'OS 정책',lines:['macOS    plist','Windows  레지스트리'],hl:[1,2],note:'배포 도구는 OS마다 다릅니다. OS별 자세한 표는 PDF 덱의 더 알아보기에 있습니다.'}},
    {kicker:'FILE', title:'OS마다 정해진 경로가 있습니다',
     body:'관리자 권한이 있어야 쓰는 <b>OS별 고정 경로</b>에 managed-settings.json을 둡니다. 이 랩은 Linux 경로를 씁니다.',
     facts:['macOS: Jamf, Intune 등 MDM','Linux, WSL: 이 랩의 경로','Windows: Intune, GPO'],
     zones:Z, nodes:ALL, hot:['dt','ms','cc'],
     edges:[{f:'dt',t:'ms',c:'accent',o:0},{f:'ms',t:'cc',c:'danger',o:1}],
     loop:true, stagger:0.8,
     snip:{hd:'OS별 정책 파일',path:'managed-settings.json',lines:['# macOS','/Library/Application Support/ClaudeCode/','# Linux, WSL (이 랩)','/etc/claude-code/','# Windows','C:\\Program Files\\ClaudeCode\\'],hl:[2,4,6],note:'파일 이름은 모두 <b>managed-settings.json</b>입니다.'}},
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
{timing: 3.5min}
[요약]
• Server-managed settings(claude.ai 콘솔)는 Team, Enterprise 조직 필요, ANTHROPIC_BASE_URL이 비공식 호스트면 꺼짐
• MDM: macOS plist, Windows 레지스트리
• 파일: macOS /Library/Application Support/ClaudeCode/, Linux와 WSL /etc/claude-code/, Windows C:\Program Files\ClaudeCode\
• managed-settings.d/ drop-in 조각은 이름순 병합
• managed 소스가 여럿이면 기본은 서버, MDM, 파일 순으로 하나만, managedSourcesBehavior "merge"로 모두 합침

{cue: demo}
그럼 정책을 단말까지 어떻게 내려보내는지 보겠습니다.
claude.ai 콘솔의 서버 관리 설정은 Bedrock에서 쓸 수 없어요. Team, Enterprise 조직이 필요하고, 비공식 호스트를 쓰면 꺼지거든요.
대신 MDM으로 plist와 레지스트리를 내려보내거나, OS마다 정해진 경로에 managed-settings.json을 두시면 됩니다.
여러 팀이 정책을 나눠 관리한다면 파일 옆 managed-settings.d 디렉터리에 조각을 두세요. 그러면 이름순으로 합쳐져요.
마지막으로 하나 챙기셔야 해요. managed 소스가 여럿이어도 기본은 하나만 적용됩니다. 모두 합치려면 managedSourcesBehavior를 merge로 두시면 돼요.
:::
---
<!-- Slide 14: Settings precedence -->
@type: content
@fit: off

## 키 충돌 시 상위 우선
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
{timing: 3min}
[요약]
• 다섯 층: Managed, CLI 인자, Local, Project, User
• 같은 키가 충돌하면 위가 이김
• Managed는 파일, MDM으로 배포되고 사용자가 덮어쓸 수 없음
• CLI 인자는 이번 세션에만, Local은 개인 미커밋, Project는 팀 공유, User는 내 PC 전체

{cue: demo}
설정은 다섯 층에서 올 수 있고, 같은 키가 충돌하면 위가 이겨요. 다섯 층에 모두 값을 넣고, 위에서부터 하나씩 빼 볼게요.
처음에는 1번 Managed가 이깁니다. 관리자가 Managed에 값을 두면 아래 어떤 층도 덮어쓰지 못해요. 그러니까 사용자가 정책을 되돌릴 수 없는 거죠.
Managed를 빼면 2번 CLI 인자, 그것도 빼면 3번 Local을 씁니다. 그다음은 4번 팀이 커밋한 Project, 마지막이 5번 User 값이고요.
화면에 보이는 모델 값은 설명용 예시예요.
:::
---
<!-- Slide 15: Verification -->
@type: content
@fit: off

## 배포 이후가 진짜 시작
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
{timing: 2min}
[요약]
• 1 /status의 Setting sources에 Enterprise managed settings
• 2 ~/.claude/settings.json에서 같은 키를 바꿔도 적용되지 않는지
• 3 /model에 허용한 모델만 보이는지
• 4 .env 읽기 요청이 거부되는지

정책을 배포했으면 실제로 적용됐는지도 봐야 하잖아요. 네 단계로 확인합니다.
{cue: demo}
첫 번째, /status의 Setting sources에 Enterprise managed settings가 보여야 해요. 두 번째는 개인 설정 파일에서 같은 키를 바꿔 보는 겁니다. 바꿔도 적용되지 않아야 하죠.
세 번째는 /model에 허용한 모델만 보이는지예요. 네 번째, .env를 읽어 달라고 하면 거부돼야 합니다. 랩에서 이 네 가지를 그대로 해 볼 거예요.
:::
---
<!-- Slide 16: Part 03 divider -->
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
<!-- Slide 17: Pre-survey -->
@type: content
@fit: off

## 142명 중 51명이 고른 주제
사전 설문, 망분리와 보안(DLP, 감사로그)에 대한 기대

:::html
<div class="fsi fsi-survey c3-survey">
  <div class="sv-big">
    <span class="eyebrow">PRE-SURVEY</span>
    <div class="num"><span id="c3-survey-num">51</span></div>
    <p class="lead">참가 확정자 <b>142명 중 51명</b>이 "망분리, 보안(<span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span>, 감사로그)"를 기대 주제로 골랐습니다.</p>
    <p class="why">이 챕터는 그 기대에 답하는 시간입니다. 무엇을 막을 수 있고, 무엇이 기록으로 남는지 정리합니다.</p>
  </div>
  <div class="bars" id="c3-survey-bars">
    <div class="bar lo" data-v="51"><span class="lb">망분리, 보안</span><span class="tr"><i></i></span><span class="v">51명</span></div>
    <div class="bar" data-v="45"><span class="lb">규제, 감사 대응</span><span class="tr"><i></i></span><span class="v">45명</span></div>
    <div class="bar" data-v="60"><span class="lb">팀 표준화</span><span class="tr"><i></i></span><span class="v">60명</span></div>
    <p class="cap">복수 선택 응답, 막대 길이는 응답 인원</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var host = document.getElementById('c3-survey-bars');
  var bars = Array.prototype.slice.call(host.querySelectorAll('.bar'));
  function grow(on) { bars.forEach(function (b, i) { var w = on ? (b.dataset.v / 60 * 100) : 0; setTimeout(function () { b.querySelector('i').style.width = w + '%'; }, on ? 120 * i : 0); }); }
  F.countUp('#c3-survey-num', 51, { decimals: 0, suffix: '' });
  F.onEnter(host, function () { grow(false); setTimeout(function () { grow(true); }, 60); });
  grow(true);
});
:::

:::notes
{timing: 1.5min}
[요약]
• 참가 확정자 142명 중 51명이 망분리, 보안(DLP, 감사로그)을 기대 주제로 선택
• 규제, 감사 대응 45명, 팀 표준화 60명 (복수 선택)

{cue: pause}
사전 설문에서 142명 중 51명이 망분리와 보안, 특히 DLP와 감사로그를 기대 주제로 골라 주셨어요. 규제와 감사 대응도 45명이었고요.
이번 챕터에서 그 질문에 답해 보려고 합니다. 무엇을 막을 수 있는지, 막지 못한 것은 어떤 기록으로 남는지까지 정리할게요.

[출처]
• 이번 워크숍 사전 설문, 참가 확정자 142명, 복수 선택 (2026-11-14 집계)
:::
---
<!-- Slide 18: Permission evaluation order -->
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
첫 화면이 전체 그림이에요. 왼쪽 세 스코프의 규칙이 가운데에서 한 목록으로 합쳐지고, 오른쪽으로 deny, ask, allow 순서로 내려갑니다. 위에서 처음 맞는 줄이 결과예요.
한 단계씩 볼게요. 먼저 합치기. 어느 파일에 있느냐보다 어떤 규칙이 있느냐를 보셔야 합니다.
deny에 일치하면 바로 거부예요. user에 allow가 있어도 managed에 deny가 있으면 거부됩니다. 더 구체적인 allow를 적어도 deny에 예외를 낼 수는 없어요.
ask에 일치하면 사람에게 물어보고, allow에 일치하면 묻지 않고 실행합니다.
어디에도 일치하지 않으면 지금 권한 모드가 정해요. auto mode라면 이 자리에서 분류기가 판정합니다. 바로 뒤에서 볼게요.
오른쪽 문법은 Tool 괄호 지정자 하나예요. 현장에서 자주 걸리는 게 Bash 패턴인데, 우회하기가 쉽거든요. 그래서 샌드박스와 함께 씁니다.

[출처]
• code.claude.com/docs/en/permissions (Manage permissions, Settings precedence)

[약어]
• MCP: Model Context Protocol, 외부 시스템을 도구로 붙이는 표준
:::
---
<!-- Slide 19: Quick check 2 -->
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

퀴즈 하나 해 볼게요. user settings에는 curl을 허용하는 allow가 있고, managed에는 같은 패턴의 deny가 있어요. 어떻게 될까요?
{cue: pause}
정답은 C, 거부예요. 방금 본 것처럼 규칙은 먼저 합쳐지고, deny부터 평가하거든요. 나중에 적은 설정이 이기는 방식은 아닙니다.

[출처]
• code.claude.com/docs/en/permissions (Settings precedence)
:::
---
<!-- Slide 99: Auto mode two gates -->
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
  ], {legend:[['danger','거부'],['warning','사람 확인'],['success','바로 실행'],['info','분류기 판정']]});
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
Lab 2에서 쓰는 auto mode가 어떻게 판정하는지 보겠습니다. 문이 두 개라고 기억하시면 돼요.
첫 번째 문은 방금 본 권한 규칙입니다. deny에 걸리면 즉시 거부이고, 분류기나 사용자의 의도로도 풀지 못해요. ask에 걸리면 분류기가 안전하다고 봐도 반드시 사람에게 묻습니다.
Bash npm test처럼 좁게 허용한 명령과 읽기, 작업 폴더 안 편집은 분류기를 거치지 않고 바로 실행해요. 대신 Bash 별표처럼 넓은 allow는 auto에 들어가는 순간 꺼집니다.
두 번째 문이 분류기예요. hard_deny, soft_deny, allow 예외, 사용자 명시 의도 순서로 판정합니다. 여기서 명시 의도는 정확히 그 동작을 시킨 경우만이에요. "정리해 줘"는 force push를 허락한 게 아닙니다.

[출처]
• code.claude.com/docs/en/permission-modes (How the classifier evaluates actions)
• code.claude.com/docs/en/auto-mode-config (Override the block and allow rules)
• Ch2 Lab 2 TASK 03
:::
---
<!-- Slide 99: Classifier defaults -->
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
  ], {legend:[['warning','soft_deny'],['danger','hard_deny'],['success','통과'],['info','분류기']]});
});
:::

:::notes
{timing: 1min}
[요약]
• 분류기는 설정하지 않아도 기본 규칙으로 네 범주를 막음: 외부 코드 실행, 데이터 반출, 되돌릴 수 없는 일, 운영
• 반출은 기본 hard_deny(지시해도 안 풀림), 나머지는 soft_deny(정확히 그 동작을 지시하면 풀림)
• 작업 폴더 파일, lock 파일 의존성 설치, 읽기 전용 HTTP, 현재 저장소 push는 통과
• 루트, 홈, 작업 폴더 rm은 allow 규칙이나 훅으로도 승인 불가, 사람 확인
• 규칙을 더할 때는 "$defaults"를 남김

분류기는 아무것도 설정하지 않아도 기본 규칙을 갖고 있어요.
{cue: demo}
네 범주를 차례로 볼게요. 외부 코드 실행, 예를 들어 curl로 받아 bash로 바로 실행하는 것. 데이터 반출, 민감 데이터를 밖으로 보내는 것. 이건 기본이 hard_deny라 사용자가 시켜도 안 풀려요. 되돌릴 수 없는 일, force push나 세션 전부터 있던 파일을 지우는 것. 그리고 운영 배포와 마이그레이션입니다.
반대로 작업 폴더 파일 작업, lock 파일에 있는 의존성 설치, 읽기 전용 HTTP는 그냥 통과해요. 현재 저장소로 push하는 것도 기본 통과라서, 꼭 묻게 하려면 앞 장의 ask를 거시면 됩니다.

[출처]
• code.claude.com/docs/en/permission-modes (What the classifier blocks by default, Critical paths)
• code.claude.com/docs/en/auto-mode-config (Common boundaries, Override the block and allow rules)
:::
---
<!-- Slide 20: DLP 5 layers -->
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
    <div class="fs-hint">장면을 누르면 멈춤, 다시 누르면 재생. 폴더 이름은 예시 값</div>
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
{timing: 2.5min}
[요약]
• 도구 호출 하나의 검사 순서: PreToolUse 훅, 권한 규칙(deny, ask, allow), auto 분류기(Manual이면 사람 확인), 실행 중 샌드박스(OS)
• 예: "정리해 줘"에 Claude가 rm -rf ../shared-ledger. 훅은 패턴이 없어 통과, managed deny Bash(rm -rf *)에서 거부
• 모양을 바꾼 find -delete는 deny 패턴을 빠져나가지만 분류기가 기존 파일 영구 삭제로 차단, 승인돼도 샌드박스가 작업 폴더 밖 쓰기를 막음
• 네 층의 설정은 managed-settings.json으로 잠금
• 랩의 층 번호(1 권한 규칙, 2 샌드박스, 3 훅, 4 Guardrails, 5 반출 채널)는 종류 번호, 실제 검사는 훅이 먼저

{cue: demo}
이 장면도 저절로 돌아가요. 개발자가 공간 좀 정리해 달라고만 했는데, Claude가 작업 폴더 밖의 shared-ledger를 rm -rf로 지우려는 상황입니다.
도구가 실행되기 직전에 가장 먼저 도는 건 PreToolUse 훅이에요. 우리 DLP 훅은 주민번호 같은 패턴만 보니까 이 명령은 통과시킵니다. 훅은 적어 둔 것만 잡아요.
그다음이 권한 규칙이에요. managed에 deny Bash rm -rf 별표가 있으니 여기서 즉시 거부됩니다.
{cue: pause}
그럼 모양을 바꾸면 어떨까요. find에 -delete를 붙이면 deny 패턴에는 안 걸려요. 이걸 auto 분류기가 세션 전부터 있던 파일을 영구 삭제하는 동작으로 보고 막습니다. Manual 모드라면 이 자리에서 사람에게 묻고요.
사람이 실수로 승인해도 끝이 아니에요. 명령은 샌드박스 안에서 돌고, 작업 폴더 밖 쓰기는 OS가 막습니다.
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
<!-- Slide 99: DLP before the prompt -->
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
    <div class="fs-hint">장면을 누르면 멈춤, 다시 누르면 재생. 주민번호는 형식만 맞춘 가짜 값</div>
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
{timing: 2min}
[요약]
• 프롬프트는 Enter를 누르면 UserPromptSubmit 훅(dlp-guard.sh)을 먼저 지나야 Bedrock에 닿음
• 가명 데이터 요청: 패턴 없음, exit 0 통과
• 주민번호 형식(가짜 값): exit 2로 차단, 프롬프트는 Claude에 닿지 않고 입력창으로 돌아옴, 사유(stderr)는 사용자에게
• jq가 없으면 원래 스크립트는 검사 없이 exit 0, 127 같은 다른 코드도 비차단 오류라 통과(fail-open). Guardrails가 있으면 AWS 쪽에서 한 번 더
• 수정본: command -v jq || exit 2, 스크립트 없음, 시작 실패, 시간 초과는 onFailure: block (v2.1.295+)

{cue: demo}
분석가가 Enter를 누르면 프롬프트는 바로 모델로 가지 않아요. UserPromptSubmit 훅이 먼저 봅니다. 랩에서 만드는 dlp-guard.sh가 여기 붙어요.
첫 번째, 가명 토큰만 든 요청은 패턴이 없으니 exit 0으로 그대로 Bedrock에 갑니다. 평소 일은 막지 않아요.
두 번째, 형식만 맞춘 가짜 주민번호를 넣으면 exit 2로 막혀요. 프롬프트는 Claude에 닿지 않고, 보낸 문장은 입력창에 그대로 돌아옵니다.
{cue: pause}
세 번째가 함정이에요. jq가 없는 PC에서는 스크립트가 검사 없이 끝나서 통과합니다. 127 같은 다른 코드로 끝나도 마찬가지예요. exit 2가 아니면 비차단 오류거든요. 이럴 때 Bedrock Guardrails를 걸어 뒀다면 AWS 쪽에서 한 번 더 잡습니다.
네 번째, 그래서 수정본은 jq가 없으면 exit 2로 막고, 스크립트가 아예 없거나 시간이 초과되는 경우는 onFailure block으로 막아요.

[출처]
• code.claude.com/docs/en/hooks (Exit code output, onFailure)
• Ch2 Lab 2 TASK 01, TASK 02, 선택 TASK 05
:::
---
<!-- Slide 21: DLP hook script and fail-open -->
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
  ], {legend:[['accent','입력'],['success','통과'],['danger','차단'],['muted','검사 실패']]});
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
방금 장면의 스크립트를 열어 볼게요.
패턴이 없으면 exit 0으로 통과합니다. 프롬프트 단계에서는 .prompt를, 도구 실행 전 단계에서는 .tool_input을 검사해요.
패턴이 보이면 exit 2로 막습니다. 프롬프트 단계라면 사유가 사용자에게 가고, 도구 단계라면 Claude에게 가요.
{cue: pause}
세 번째를 보세요. 원본은 jq가 없으면 검사할 글자가 비어서 exit 0으로 끝나요. 다른 코드로 끝나도 2가 아니면 진행됩니다. 이게 fail-open이에요.
그래서 수정본은 jq부터 확인해서 없으면 exit 2로 막고, grep이 1, 즉 불일치일 때만 통과시킵니다. 일치든 검사기 오류든 나머지는 전부 차단해요.

[출처]
• code.claude.com/docs/en/hooks (Exit code output)
• Ch2 Lab 2 TASK 01, TASK 02
:::
---
<!-- Slide 22: Quick check 3 -->
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

방금 본 내용으로 퀴즈 하나 갈게요. 위에 종료 코드별 결과가 있어요. 0은 진행, 2는 차단. 그럼 jq가 없어서 127로 끝나면 어떻게 될까요?
{cue: pause}
정답은 B, 통과예요. 많은 분이 A를 고르시는데요. 훅은 exit 2만 차단으로 보거든요. 그래서 오류 경로에도 exit 2를 꼭 넣고, 훅 설정에는 onFailure block을 함께 겁니다.

[출처]
• code.claude.com/docs/en/hooks (Exit code output, onFailure)
:::
---
<!-- Slide 99: Enforce hooks by policy -->
@type: content
@fit: off

## 훅은 정책으로 강제한다
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
  ], {legend:[['danger','정책, 강제'],['accent','훅 지점'],['warning','스크립트'],['muted','무시됨']]});
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

훅은 만들기만 해서는 안 되고, 사용자가 끄지 못하게, 그리고 고장 나도 막히게 정책으로 강제해야 해요.
{cue: demo}
첫째, allowManagedHooksOnly를 켜면 user나 project, 플러그인 훅은 돌지 않아요. 사용자가 DLP 훅을 끌 수 없습니다.
둘째, 같은 스크립트를 프롬프트 제출과 Bash, Write, Edit, WebFetch 실행 직전에 겁니다. 다만 훅은 입력만 봐요. Read로 읽은 내용이나 리다이렉션 출력은 못 봅니다.
셋째, 스크립트 파일도 관리자만 고칠 수 있는 경로에 둬야 해요. 파일을 고칠 수 있으면 정책이 의미가 없으니까요.
넷째, onFailure를 block으로 두면 스크립트가 없거나, 시작에 실패하거나, 시간이 초과돼도 차단합니다. v2.1.295 이상이에요.
마지막으로 /hooks를 열면 managed hooks only라고 나오는지 확인합니다.

[출처]
• code.claude.com/docs/en/hooks (allowManagedHooksOnly, onFailure)
• code.claude.com/docs/en/permissions (Precedence among rules, hooks, and mods)
• Ch2 Lab 2 TASK 01, TASK 02
:::
---
<!-- Slide 99: MCP server control -->
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
  ], {legend:[['success','허용, 연결'],['danger','거부'],['muted','목록에 없음'],['warning','플러그인 경로']]});
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

MCP 서버는 하나하나가 외부로 나가는 새 통로예요.
{cue: demo}
allowManagedMcpServersOnly를 켜면 managed에 적은 허용 목록만 인정해요. 사용자가 서버를 추가해도 켜지지 않습니다.
허용 목록은 이름이 아니라 URL이나 실행 명령으로 적어야 해요. 이름은 사용자가 아무렇게나 붙일 수 있거든요.
거부 목록에 맞으면 허용 목록에 있어도 차단이고, 플러그인에 들어 있는 MCP 서버도 같은 검사를 받아서 플러그인으로 우회할 수 없습니다.

[출처]
• code.claude.com/docs/en/managed-mcp (Policy-based control with allowlists and denylists, How a server is evaluated)
:::
---
<!-- Slide 23: What remains as records -->
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

감사에서 근거로 쓸 기록은 네 곳에 남아요. PC 쪽에 둘, AWS 쪽에 둘입니다.
{cue: demo}
먼저 PC에는 세션 JSONL이 남아요. 무엇을 시켰고 Claude가 무엇을 했는지가 평문으로 기본 30일 남습니다. 고객 데이터가 들어 있을 수 있다는 점도 기억해 주세요.
AWS 쪽에는 CloudTrail이 기본으로 Bedrock 호출을 남겨요. 누가, 언제, 어떤 모델을 불렀는지요. Part 1에서 본 SSO 임시 자격증명 덕분에 역할 뒤의 사람 이름까지 이어집니다. 원문은 없어요.
OTel을 켜면 사용자별 토큰, 비용, 도구 사용이 우리 사내 수집기로 갑니다. 이건 Ch6에서 대시보드로 만들어요.
{cue: pause}
마지막으로 Bedrock invocation logging을 켜면 프롬프트 원문까지 남아요. 대신 그 저장소 자체가 민감 데이터가 되니 권한과 보존 정책부터 정하셔야 합니다. 그리고 Anthropic 텔레메트리는 Bedrock에서 기본 꺼져 있지만, WebFetch 사전 검사는 호스트명을 보낸다는 점, skipWebFetchPreflight로 끈다는 점만 기억해 주세요.

[출처]
• code.claude.com/docs/en/data-usage (Local caching, Default behaviors by API provider, WebFetch domain safety check)
• code.claude.com/docs/en/monitoring-usage
• docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html
• docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html
:::
---
<!-- Slide 24: Deeper topics move to the labs -->
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
{timing: 2min}
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
<!-- Slide 25: Key Takeaways -->
@type: content
@fit: off

## 기억할 여섯 줄
Chapter 2 Key Takeaways

:::html
<div class="fsi fsi-recap c2-recap">
  <div class="fsi-grid-3">
    <div class="rc"><b>01</b><span>CLAUDE_CODE_USE_BEDROCK + 리전이면 연결 완료</span></div>
    <div class="rc"><b>02</b><span>장기 키 대신 SSO 프로필 + awsAuthRefresh</span></div>
    <div class="rc"><b>03</b><span>모델은 반드시 고정, 팀별 비용은 프로필 ARN으로</span></div>
    <div class="rc"><b>04</b><span>정책은 managed-settings.json, 충돌하면 managed가 이기고 /status로 확인</span></div>
    <div class="rc"><b>05</b><span>권한은 deny가 먼저, 훅은 exit 2만 차단하니 오류 경로도 exit 2로</span></div>
    <div class="rc"><b>06</b><span>네이티브 DLP는 없다, 다섯 겹을 쌓고 못 막은 것은 기록으로</span></div>
  </div>
</div>
:::

:::notes
{timing: 1.5min}
[요약]
• 연결은 환경변수 두 개, 로그인은 SSO와 awsAuthRefresh
• 모델 고정, 팀별 비용은 프로필 ARN
• 정책은 managed-settings.json, managed가 이기고 /status로 확인
• deny가 먼저, 훅은 exit 2만 차단, DLP는 다섯 겹과 기록

자, 오늘 내용을 여섯 줄로 정리해 볼게요.
{cue: pause}
연결은 환경변수 두 개면 돼요. 로그인은 장기 키 대신 SSO 프로필과 awsAuthRefresh를 쓰고, 모델은 반드시 고정하고, 팀별 비용은 프로필 ARN으로 나눕니다.
정책은 managed-settings.json 파일로 내려요. 같은 키가 부딪히면 managed가 이기죠. 배포한 뒤에는 /status로 꼭 확인하세요.
권한 규칙은 deny가 먼저예요. 훅은 exit 2일 때만 막으니까 오류 경로도 exit 2로 닫아야 합니다. DLP 기능이 따로 있는 게 아니라 다섯 겹을 쌓는 거고, 못 막은 것은 기록으로 답합니다.
:::
---
<!-- Slide 26: Thank you -->
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
