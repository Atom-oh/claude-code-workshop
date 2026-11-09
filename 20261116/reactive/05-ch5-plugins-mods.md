---
remarp: true
block: ch5-plugins-mods
---
<!-- Slide 1: Cover (PDF p1) -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 5. Claude Code 확장하기
## Plugins & Mods로 나의 Claude Code를 팀의 플랫폼으로 (2026.11, Claude Code v2.1.319, Bedrock 기준)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=[].some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch5.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 5, Claude Code 확장하기
• 개인이 쌓은 설정을 팀의 플랫폼으로 묶어 배포하는 챕터
• 2026년 11월, Claude Code v2.1.319 (2026-11-08 리허설 검증), Amazon Bedrock 기준

둘째 날 첫 챕터, Claude Code 확장하기를 시작하겠습니다.
어제 Ch3에서 만든 DLP 훅과 Ch4에서 만든 Subagent를 오늘은 플러그인 하나로 묶어서 팀 전체에 배포합니다.
그리고 Claude Code 안에서 직접 도는 코드인 mod까지 다룹니다.

{cue: transition}
먼저 오늘의 순서를 보겠습니다.
:::

---
<!-- Slide 2: Agenda (PDF p2) -->
@type: content
@fit: off

## 강의 35분, 실습 45분
세 개의 Part와 Super Lab, 팀의 플랫폼까지 80분

:::html
<div class="fsi fsi-agenda">
  <div class="fsi-grid-4">
    <div class="pick"><span class="k">PART 01 / 12분</span><span class="t">Plugins</span><span class="d">여섯 가지 확장 방법, 플러그인 구조, 설치</span></div>
    <div class="pick"><span class="k">PART 02 / 10분</span><span class="t">사내 배포</span><span class="d">마켓플레이스, 강제 설치, 망분리</span></div>
    <div class="pick"><span class="k">PART 03 / 13분</span><span class="t">Mods</span><span class="d">Claude Code 안에서 도는 코드</span></div>
    <div class="pick lab"><span class="k">SUPER LAB / 45분</span><span class="t">팀 스타터 킷 + mod</span><span class="d">플러그인 하나로 묶기</span></div>
  </div>
  <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">폴더 구성, 마켓플레이스 소스, 조직 배포 설정, mod 이벤트와 호출, mod 리뷰, 운영 지표</span></div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 강의는 세 Part, 12분 10분 13분으로 35분
• 이어서 Super Lab 45분, 팀 스타터 킷과 mod를 플러그인 하나로 묶기
• 더 알아보기는 질문이 나오면 펼침

오늘은 세 Part로 진행합니다. 첫째, 플러그인이 무엇이고 어떻게 생겼는지, 둘째, 회사에서 어떻게 강제로 배포하고 출처를 제한하는지, 셋째, Claude Code 안에서 도는 코드인 mod입니다.
강의 35분이 끝나면 45분 동안 Super Lab에서 직접 팀 스타터 킷을 만들어 봅니다.
:::

---
<!-- Slide 3: Pre-survey (PDF p3) -->
@type: content
@fit: off

## 팀 표준화는 기대 주제 2위였다
사전 설문 결과로 정한 이 챕터의 목표

:::html
<div class="fsi fsi-survey c5-survey">
  <div class="sv-big">
    <span class="eyebrow">PRE-SURVEY</span>
    <div class="num"><span id="c5-survey-num">58명</span></div>
    <p class="lead">참가 확정자 <b>138명 중 58명</b>이 팀 표준화(설정, 권한, 훅, MCP)를 기대 주제로 골랐습니다.</p>
    <p class="why">이 챕터에서 그 표준을 플러그인 하나로 묶어 배포합니다.</p>
  </div>
  <div class="share" id="c5-survey-share">
    <div class="lb"><span>팀 표준화를 고른 사람</span><b>58 / 138명</b></div>
    <div class="tr"><i></i></div>
    <p class="rank">기대 주제 2위, 복수 선택 문항</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var bar = document.querySelector('.slide-deck #c5-survey-share .tr i') || document.querySelector('#c5-survey-share .tr i');
  function grow(on) { bar.style.width = on ? (58 / 138 * 100).toFixed(1) + '%' : '0'; }
  F.countUp('#c5-survey-num', 58, { suffix: '명' });
  F.onEnter(bar, function () { grow(false); setTimeout(function () { grow(true); }, 60); });
  grow(true);
});
:::

:::notes
{timing: 1min}
[요약]
• 138명 중 58명이 팀 표준화(설정, 권한, 훅, MCP)를 기대 주제로 선택
• 기대 주제 2위, 복수 선택
• 그 표준을 플러그인 하나로 묶어 배포하는 것이 이 챕터의 목표

사전 설문에서 138분 중 58분이 팀 표준화를 기대 주제로 고르셨습니다. 설정, 권한, 훅, MCP를 팀이 똑같이 쓰는 방법이고, 복수 선택에서 2위였습니다.
어제까지 각자 만든 것들을 오늘은 플러그인 하나로 묶어, 설치 한 줄로 동료가 같은 환경을 갖게 만드는 것이 목표입니다.

[출처]
• 이번 워크숍 사전 설문, 참가 확정자 138명 기준
:::

---
<!-- Slide 4: Chapter statement (PDF p4) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">CHAPTER 05</span>
  <div class="big">Claude Code 확장하기</div>
  <p class="lead">Plugins &amp; Mods로 스킬, Subagent, 훅, <span class="rp-detail" tabindex="0" data-tip="Model Context Protocol. 외부 시스템을 Claude가 쓰는 도구로 붙이는 표준">MCP</span>, mod를 한 번에 배포합니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 스킬, Subagent, 훅, MCP, mod를 한 번에 배포하는 단위가 플러그인

이 챕터의 한 문장입니다. 스킬, Subagent, 훅, MCP, 그리고 mod까지 한 번에 배포한다.
흩어져 있던 확장 수단을 하나의 배포 단위로 묶는 것, 그게 플러그인입니다.

[약어]
• MCP: Model Context Protocol
:::

---
<!-- Slide 5: Part 01 divider (PDF p5) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 05 / PART 01</span>
  <div class="name">Plugins</div>
  <p class="what">팀의 작업 방식을 묶어 배포하는 단위</p>
  <ol>
    <li><b>01</b>여섯 가지 확장 방법</li>
    <li><b>02</b>플러그인 구조</li>
    <li><b>03</b>설치와 갱신</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1은 플러그인: 확장 방법, 구조, 설치와 갱신

첫 번째 Part, 플러그인입니다. 무엇으로 확장할 수 있는지 지도를 먼저 보고, 플러그인 폴더가 어떻게 생겼는지, 어떻게 설치하고 갱신하는지 보겠습니다.
:::

---
<!-- Slide 6: Extension map (PDF p6) -->
@type: content
@fit: off

## 여섯 가지 중 다섯을 한 폴더에
무엇을 넣을지는 언제, 누가, 무엇을 바꾸는가로 선택

:::html
<div class="fsi c5-ext">
  <div class="map" data-pick="c5-ext">
    <div class="outside">
      <button class="pick" data-key="md"><span class="k">01</span><span class="t">CLAUDE.md</span><span class="d">플러그인 밖</span></button>
    </div>
    <div class="box">
      <span class="lbl">PLUGIN, 한 디렉터리로 배포</span>
      <div class="grid">
        <button class="pick" data-key="skill"><span class="k">02</span><span class="t">스킬</span></button>
        <button class="pick" data-key="sub"><span class="k">03</span><span class="t">Subagent</span></button>
        <button class="pick" data-key="hook"><span class="k">04</span><span class="t">훅</span></button>
        <button class="pick" data-key="mcp"><span class="k">05</span><span class="t">MCP</span></button>
        <button class="pick" data-key="mod"><span class="k">06</span><span class="t">mod</span></button>
      </div>
    </div>
  </div>
  <div class="panel" data-pick-panel="c5-ext">
    <p class="hint">CLAUDE.md는 managed CLAUDE.md나 저장소로,<br>나머지 5종은 한 디렉터리에 담아 플러그인으로 배포합니다.<br>하나를 누르면 언제 쓰는지 나옵니다.</p>
    <div data-for="md"><h4>CLAUDE.md</h4><p><b>항상 알아야 할 짧은 지침</b>을 둘 때 씁니다.</p><p>플러그인이 아니라 <b>managed CLAUDE.md나 저장소</b>로 배포합니다. 매 요청에 실리기 때문에 짧게 유지합니다 (Ch1, Ch6).</p></div>
    <div data-for="skill"><h4>스킬</h4><p><b>같은 지시를 반복할 때</b> 씁니다. 필요할 때만 로드됩니다.</p><p>예: 팀의 PR 리뷰 절차</p></div>
    <div data-for="sub"><h4>Subagent</h4><p><b>역할과 도구를 나눠 맡길 때</b> 씁니다.</p><p>예: Ch4에서 만든 code-reviewer</p></div>
    <div data-for="hook"><h4>훅</h4><p><b>이벤트에 스크립트로 막거나 기록할 때</b> 씁니다.</p><p>예: Ch3의 DLP 훅</p></div>
    <div data-for="mcp"><h4>MCP</h4><p><b>외부 시스템에 닿아야 할 때</b> 씁니다.</p><p>외부로 나가는 채널이라 반출 채널 검토 대상입니다.</p></div>
    <div data-for="mod"><h4>mod</h4><p><b>화면, 커맨드, 이벤트 자체를 바꿀 때</b> 씁니다.</p><p>Part 3에서 자세히 다룹니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-ext'); });
:::

:::notes
{timing: 2.5min}
[요약]
• 확장 방법은 CLAUDE.md, 스킬, Subagent, 훅, MCP, mod 여섯 가지
• CLAUDE.md는 managed CLAUDE.md나 저장소로, 나머지 5종은 한 디렉터리에 담아 플러그인으로 배포
• 무엇을 쓸지는 "언제, 누가, 무엇을 바꾸는가"로 고름

Claude Code를 확장하는 방법은 여섯 가지입니다.
{cue: demo}
아래 화살표로 하나씩 열어 보겠습니다. CLAUDE.md는 항상 알아야 할 짧은 지침, 스킬은 같은 지시를 반복할 때 필요할 때만 불러오는 것, Subagent는 역할과 도구를 나눠 맡길 때, 훅은 이벤트에 스크립트로 막거나 기록할 때, MCP는 외부 시스템에 닿아야 할 때, 그리고 mod는 화면이나 커맨드, 이벤트 자체를 바꿀 때 씁니다.
CLAUDE.md는 managed CLAUDE.md나 저장소로 배포하고, 나머지 다섯 가지를 한 디렉터리에 담아 배포하는 단위가 플러그인입니다.
어떤 것을 고를지는 언제, 누가, 무엇을 바꾸는가를 기준으로 생각하시면 됩니다.

[약어]
• MCP: Model Context Protocol
:::

---
<!-- Slide 7: Plugin structure (PDF p7, p25) -->
@type: content
@fit: off

## 폴더 하나에 팀의 표준을 담는다
플러그인 디렉터리 구성과 각 파일의 역할

:::html
<div class="fsi c5-tree">
  <div class="tree" data-pick="c5-tree">
    <div class="root">fsi-team-kit/</div>
    <button class="pick" data-key="manifest"><span class="p">.claude-plugin/plugin.json</span><span class="cm">이름, 버전, 설명</span></button>
    <button class="pick" data-key="skills"><span class="p">skills/pr-review/SKILL.md</span><span class="cm">팀 리뷰 절차</span></button>
    <button class="pick" data-key="agents"><span class="p">agents/code-reviewer.md</span><span class="cm">Ch4에서 만든 것</span></button>
    <div class="leaf"><span class="p">agents/test-writer.md, docs-writer.md</span><span class="cm">Ch4 건너뛰면 code-reviewer만</span></div>
    <button class="pick" data-key="hooks"><span class="p">hooks/hooks.json</span><span class="cm">DLP 훅 등록 (Ch3)</span></button>
    <button class="pick" data-key="scripts"><span class="p">scripts/dlp-guard.sh</span><span class="cm">검사 스크립트</span></button>
    <button class="pick extra" data-key="commands"><span class="p">commands/*.md</span><span class="cm">슬래시 커맨드</span></button>
    <button class="pick extra" data-key="mcp"><span class="p">.mcp.json</span><span class="cm">MCP 서버</span></button>
    <p class="cap">점선 두 줄은 이 예시에는 없지만 플러그인에 넣을 수 있는 파일입니다.</p>
  </div>
  <div class="panel" data-pick-panel="c5-tree">
    <p class="hint">파일을 누르면 무엇이 들어가는지 보여 줍니다. Ch3과 Ch4의 결과물을 그대로 넣고, 설치 한 줄로 동료가 같은 환경을 갖습니다.</p>
    <div data-for="manifest"><h4>.claude-plugin/plugin.json</h4><p>플러그인의 이름, 버전, 설명. <b>유일한 필수 파일</b>입니다.</p><p>버전으로 변경 이력을 관리합니다.</p></div>
    <div data-for="skills"><h4>skills/&lt;name&gt;/SKILL.md</h4><p>스킬. <b>설명만 항상 실리고</b> 본문은 필요할 때 로드됩니다.</p><p>예시는 팀의 PR 리뷰 절차입니다.</p></div>
    <div data-for="agents"><h4>agents/*.md</h4><p>Subagent. <b>Ch4에서 만든 정의를 그대로</b> 넣습니다. code-reviewer, test-writer, docs-writer 세 개입니다.</p><p>Ch4를 건너뛰었다면 code-reviewer만 넣습니다.</p></div>
    <div data-for="hooks"><h4>hooks/hooks.json</h4><p>훅을 등록하는 곳. Ch3의 <span class="rp-detail" tabindex="0" data-tip="Data Loss Prevention. 민감 정보가 밖으로 나가지 않게 막는 통제">DLP</span> 훅을 여기에 등록합니다.</p><p><b>mod도 같은 hooks/ 아래</b>에 들어가고, 경로는 <code>${CLAUDE_PLUGIN_ROOT}</code>를 씁니다.</p></div>
    <div data-for="scripts"><h4>scripts/dlp-guard.sh</h4><p>훅이 실행하는 검사 스크립트입니다.</p></div>
    <div data-for="commands"><h4>commands/*.md</h4><p>슬래시 커맨드. <b>스킬로 대체되는 추세</b>입니다.</p></div>
    <div data-for="mcp"><h4>.mcp.json</h4><p>MCP 서버 정의. 외부로 나가는 길이라 <b>반출 채널 검토 대상</b>입니다 (Ch3).</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-tree'); });
:::

:::notes
{timing: 2.5min}
[요약]
• 플러그인은 디렉터리 하나, 필수 파일은 .claude-plugin/plugin.json
• skills, agents, hooks, scripts 폴더에 Ch3과 Ch4 결과물을 그대로 넣음 (Subagent 3종, Ch4 건너뛰면 code-reviewer만)
• mod도 같은 hooks/ 아래, 버전으로 변경 이력 관리
• 설치 한 줄로 동료가 같은 환경

플러그인은 디렉터리 하나입니다. 오늘 랩에서 만들 fsi-team-kit을 예로 보겠습니다.
{cue: demo}
맨 위 .claude-plugin 아래 plugin.json에는 이름, 버전, 설명이 들어가고, 이것만 필수입니다.
skills에는 팀 리뷰 절차 같은 스킬을, agents에는 Ch4에서 만든 code-reviewer, test-writer, docs-writer를, Ch4를 건너뛰셨다면 code-reviewer만 넣습니다. hooks의 hooks.json에는 Ch3의 DLP 훅을 등록하고, 실제 검사 스크립트는 scripts에 둡니다.
점선으로 표시한 commands와 .mcp.json도 넣을 수 있습니다. 특히 .mcp.json은 외부로 나가는 길이라 반출 채널 검토 대상입니다.
버전으로 변경 이력을 관리하고, 설치 한 줄이면 동료가 같은 환경을 갖게 됩니다.

[약어]
• DLP: Data Loss Prevention
:::

---
<!-- Slide 8: Install and update (PDF p8, p26) -->
@type: content
@fit: off

## 등록, 설치, 적용, 갱신의 네 단계
마켓플레이스에서 동료의 세션까지 플러그인이 가는 길

:::html
<div id="c5-sv-install"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:1140,h:410,l:'INSTALL FLOW'}];
  var SRC = {id:'src',x:40,y:110,w:220,h:90,t:'소스',s:'git, URL, 로컬 디렉터리',c:'muted'};
  var MK = {id:'mk',x:320,y:110,w:240,h:90,t:'1 마켓플레이스 등록',s:'marketplace add',c:'info'};
  var IN = {id:'in',x:620,y:110,w:240,h:90,t:'2 설치',s:'이름@마켓플레이스',c:'accent'};
  var AP = {id:'ap',x:920,y:110,w:220,h:90,t:'3 적용',s:'리로드 또는 다음 세션',c:'success'};
  var UP = {id:'up',x:620,y:310,w:240,h:90,t:'4 갱신',s:'autoUpdate 또는 수동',c:'warning'};
  var ALL = [SRC, MK, IN, AP, UP];
  F.stepviz('#c5-sv-install', [
    {kicker:'STEP 1', title:'마켓플레이스를 등록합니다',
     body:'플러그인은 <b>마켓플레이스</b>를 통해 받습니다. 먼저 <b>/plugin marketplace add</b>로 마켓플레이스를 등록합니다. 소스는 git, URL, 로컬 디렉터리입니다.',
     facts:['로컬 경로: 개발, 테스트 (이 랩)','GitHub 저장소: 공개, 사내 GitHub','git URL: 사내 GitLab 등'],
     zones:Z, nodes:ALL, hot:['src','mk'],
     edges:[{f:'src',t:'mk',c:'info',o:0}],
     snip:{hd:'마켓플레이스 등록',path:'Claude Code 프롬프트, 소스별 예시',lines:['# 로컬 경로 (이 랩)','/plugin marketplace add ~/claude-lab/ch5/marketplace','','# GitHub 저장소','/plugin marketplace add owner/repo','','# 사내 git URL','/plugin marketplace add https://git.corp.example/...git'],hl:[2,5,8],note:'망분리 환경은 등록 대신 <b>seed 디렉터리</b>를 씁니다 (Part 2).'}},
    {kicker:'STEP 2', title:'이름@마켓플레이스로 설치합니다',
     body:'등록한 마켓플레이스에서 <b>/plugin install 이름@마켓플레이스</b>로 설치합니다. 동료는 이 한 줄이면 같은 플러그인을 받습니다.',
     facts:['이름과 마켓플레이스를 함께 지정','같은 이름이 여러 마켓플레이스에 있어도 구분','회사는 이 단계를 정책으로 강제 (Part 2)'],
     zones:Z, nodes:ALL, hot:['mk','in'],
     edges:[{f:'mk',t:'in',c:'accent',o:0}],
     snip:{hd:'설치',path:'Claude Code 프롬프트',lines:['# 랩','/plugin install fsi-team-kit@fsi-local','','# 형식: 이름@마켓플레이스'],hl:[2],note:'랩은 로컬 디렉터리 마켓플레이스 <b>fsi-local</b>을 씁니다. Part 2의 정책 예시는 fsi-tools입니다.'}},
    {kicker:'STEP 3', title:'리로드하거나 다음 세션부터',
     body:'설치한 플러그인은 <b>/reload-plugins</b>로 바로 적용하거나 <b>다음 세션</b>부터 적용됩니다.',
     facts:['/reload-plugins: 지금 세션에 적용','또는 다음 세션 시작 시','적용되면 스킬, Subagent, 훅이 함께 켜짐'],
     zones:Z, nodes:ALL, hot:['in','ap'],
     edges:[{f:'in',t:'ap',c:'success',o:0}],
     snip:{hd:'적용',path:'Claude Code 프롬프트',lines:['/reload-plugins','','# 또는 새 세션을 시작'],hl:[1],note:'랩의 mod는 파일을 고치면 hot reload로 바로 반영되고, 새 커맨드는 /exit 후 다시 열어 확인합니다 (TASK 03).'}},
    {kicker:'STEP 4', title:'갱신은 자동 또는 수동',
     body:'갱신은 <b>autoUpdate</b>로 자동으로 받거나 <b>수동 update</b>로 합니다. 갱신된 버전이 다시 적용 단계로 이어집니다.',
     facts:['autoUpdate: 자동 갱신','수동 update: 검토한 버전만 받기','남이 만든 mod는 자동 갱신 대신 검토한 버전 (더 알아보기)'],
     zones:Z, nodes:ALL, hot:['mk','up','ap'],
     edges:[{f:'mk',t:'up',c:'warning',l:'새 버전',o:0},{f:'up',t:'ap',c:'warning',o:1}],
     snip:{hd:'갱신',path:'두 가지 방식',lines:['# 자동: 마켓플레이스의 autoUpdate 설정','# 수동: 검토한 버전만 직접 update'],hl:[],note:'금융권에서는 <b>버전을 고정</b>하고 검토한 버전만 올리는 운영을 권합니다.'}},
    {kicker:'OVERVIEW', title:'네 단계가 한 줄로 이어집니다',
     body:'등록, 설치, 적용, 갱신. <b>동료는 설치 한 줄</b>로 팀과 같은 환경을 갖고, 갱신도 같은 길로 받습니다.',
     facts:['1 등록: /plugin marketplace add','2 설치: /plugin install 이름@마켓플레이스','3 적용: /reload-plugins 또는 다음 세션','4 갱신: autoUpdate 또는 수동 update'],
     zones:Z, nodes:ALL,
     edges:[{f:'src',t:'mk',c:'info',o:0},{f:'mk',t:'in',c:'accent',o:1},{f:'in',t:'ap',c:'success',o:2},{f:'mk',t:'up',c:'warning',o:3},{f:'up',t:'ap',c:'warning',o:4}],
     loop:true, stagger:0.7,
     snip:{hd:'한 번에 보기',path:'Claude Code 프롬프트',lines:['/plugin marketplace add <소스>','/plugin install <이름>@<마켓플레이스>','/reload-plugins'],hl:[1,2,3],note:'Super Lab TASK 02에서 등록과 설치 흐름을 새 폴더에서 동료처럼 따라 합니다.'}}
  ], {legend:[['info','등록'],['accent','설치'],['success','적용'],['warning','갱신']]});
});
:::

:::notes
{timing: 2.5min}
[요약]
• 1 등록: /plugin marketplace add, 소스는 git, URL, 로컬 디렉터리
• 2 설치: /plugin install 이름@마켓플레이스
• 3 적용: /reload-plugins 또는 다음 세션
• 4 갱신: autoUpdate 또는 수동 update

{cue: demo}
플러그인이 동료의 세션까지 가는 길을 네 단계로 보겠습니다.
첫째, 마켓플레이스 등록입니다. /plugin marketplace add로 등록하고, 소스는 로컬 경로, GitHub 저장소, 사내 git URL을 쓸 수 있습니다. 오늘 랩은 로컬 경로를 씁니다.
둘째, 설치는 이름 골뱅이 마켓플레이스 형식입니다. 랩에서는 fsi-team-kit@fsi-local로 설치합니다.
셋째, /reload-plugins로 바로 적용하거나 다음 세션부터 적용됩니다.
넷째, 갱신은 autoUpdate로 자동으로 받거나 수동으로 합니다. 금융권에서는 버전을 고정하고 검토한 버전만 올리는 쪽을 권합니다.
:::

---
<!-- Slide 9: Part 02 divider (PDF p9) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 05 / PART 02</span>
  <div class="name">사내 배포</div>
  <p class="what">설치를 강제하고 출처를 제한한다</p>
  <ol>
    <li><b>01</b>사내 마켓플레이스 강제</li>
    <li><b>02</b>망분리와 <span class="rp-detail" tabindex="0" data-tip="Continuous Integration. 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인">CI</span></li>
    <li><b>03</b>배포 후 측정</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2는 사내 배포: 강제 설치, 출처 제한, 망분리, 측정

두 번째 Part, 사내 배포입니다. 개인이 골라 설치하는 것이 아니라, 회사가 설치를 강제하고 출처를 제한하는 방법을 보겠습니다.
:::

---
<!-- Slide 10: Forced internal marketplace (PDF p10, p27) -->
@type: content
@fit: off

## 허용, 등록, 강제, 사이드로드 금지
managed-settings.json 네 개 키로 사내 마켓플레이스를 강제

:::html
<div id="c5-sv-force"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:300,h:410,l:'관리자'},{x:360,y:40,w:800,h:410,l:'사용자 PC의 Claude Code'}];
  var MS = {id:'ms',x:40,y:200,w:260,h:90,t:'managed-settings.json',s:'사용자가 못 바꿈',c:'accent'};
  var AL = {id:'al',x:400,y:90,w:340,h:72,t:'허용 목록',s:'your-org/*, 사내 git, skills-dir',c:'info'};
  var RG = {id:'rg',x:400,y:200,w:340,h:72,t:'등록된 마켓플레이스',s:'fsi-tools',c:'info'};
  var PL = {id:'pl',x:400,y:310,w:340,h:72,t:'fsi-team-kit',s:'강제 설치, 해제 불가',c:'success'};
  var SL = {id:'sl',x:800,y:310,w:330,h:72,t:'--plugin-dir',s:'로컬 사이드로드',c:'danger'};
  var SK = {id:'sk',x:800,y:90,w:330,h:72,t:'skills-dir',s:'로컬 스킬 플러그인 유지',c:'info'};
  var ALL = [MS, AL, RG, PL, SL, SK];
  var J = ['{',' "strictKnownMarketplaces": [','  { "source": "github", "repo": "your-org/*" },','  { "source": "hostPattern",','    "hostPattern": "^git\\\\.corp\\\\.example$" },','  { "source": "skills-dir" } ],',' "extraKnownMarketplaces": {','  "fsi-tools": { "source": { "source": "github",','    "repo": "your-org/fsi-tools" } } },',' "enabledPlugins": {','  "fsi-team-kit@fsi-tools": true },',' "disableSideloadFlags": true','}'];
  function snip(hl, note) { return {hd:'사내 마켓플레이스 강제',path:'managed-settings.json',lines:J,hl:hl,note:note}; }
  F.stepviz('#c5-sv-force', [
    {kicker:'OVERVIEW', title:'키 네 개가 각자 한 가지를 합니다',
     body:'사내 마켓플레이스를 강제하려면 <b>허용 목록, 등록, 강제 설치, 사이드로드 금지</b>를 함께 겁니다. 한 키만으로는 다 막히지 않습니다.',
     zones:Z, nodes:ALL,
     edges:[{f:'ms',t:'al',c:'info',o:0},{f:'ms',t:'rg',c:'info',o:1},{f:'ms',t:'pl',c:'success',o:2},{f:'sl',t:'pl',c:'danger',dash:true}],
     snip:snip([2,7,10,12],'네 줄이 각각 허용, 등록, 강제, 금지입니다. 다음 단계에서 하나씩 봅니다.')},
    {kicker:'KEY 1', title:'strictKnownMarketplaces: 허용만 합니다',
     body:'허용할 마켓플레이스 목록입니다. <b>여기 적어도 등록은 되지 않습니다</b>. <code>hostPattern</code>으로 사내 git 호스트를 허용하고, <code>skills-dir</code>을 넣으면 로컬 스킬 플러그인을 계속 쓸 수 있습니다.',
     zones:Z, nodes:ALL, hot:['ms','al','sk'],
     edges:[{f:'ms',t:'al',c:'info',l:'허용',o:0},{f:'al',t:'sk',c:'info',o:1}],
     snip:snip([2,3,4,5,6],'허용 목록 밖의 마켓플레이스는 등록할 수 없습니다.')},
    {kicker:'KEY 2', title:'extraKnownMarketplaces: 실제로 등록',
     body:'사용자가 직접 등록하지 않아도 <b>관리자가 마켓플레이스를 등록</b>해 둡니다. 예시는 <code>fsi-tools</code>입니다.',
     zones:Z, nodes:ALL, hot:['ms','rg'],
     edges:[{f:'ms',t:'rg',c:'info',l:'등록',o:0}],
     snip:snip([7,8,9],'더 알아보기에 사내 git URL로 등록하는 예시가 있습니다.')},
    {kicker:'KEY 3', title:'enabledPlugins true: 강제 설치',
     body:'<b>true로 지정한 플러그인은 강제로 설치되고 사용자가 해제할 수 없습니다</b>. 팀 스타터 킷을 모두에게 까는 키입니다.',
     zones:Z, nodes:ALL, hot:['ms','rg','pl'],
     edges:[{f:'ms',t:'pl',c:'success',l:'true',o:0},{f:'rg',t:'pl',c:'success',o:1}],
     snip:snip([10,11],'롤백도 같은 키입니다. <b>false로 바꾸면 즉시 차단</b>됩니다.')},
    {kicker:'KEY 4', title:'disableSideloadFlags: 사이드로드 금지',
     body:'<code>--plugin-dir</code>로 로컬 폴더의 플러그인을 직접 싣는 것을 <b>거부</b>합니다. 허용 목록만으로는 이 길이 막히지 않습니다.',
     zones:Z, nodes:ALL, hot:['ms','sl','pl'],
     edges:[{f:'ms',t:'sl',c:'danger',l:'거부',o:0,curve:70,side:'b'},{f:'sl',t:'pl',c:'danger',dash:true}],
     snip:snip([12],'바로 다음 퀴즈가 이 키에 관한 것입니다.')}
  ], {legend:[['accent','관리자 정책'],['info','허용과 등록'],['success','강제 설치'],['danger','거부되는 경로']]});
});
:::

:::notes
{timing: 3min}
[요약]
• 허용 + 등록 + 강제 설치 + 사이드로드 금지를 함께 걸어야 함
• strictKnownMarketplaces는 허용 목록일 뿐 등록은 안 함, hostPattern으로 사내 git, skills-dir로 로컬 스킬 유지
• extraKnownMarketplaces가 실제 등록
• enabledPlugins true는 강제 설치와 해제 불가, false는 즉시 차단
• disableSideloadFlags가 --plugin-dir을 거부

{cue: demo}
회사가 플러그인 배포를 강제하는 설정입니다. 오른쪽 managed-settings.json의 키 네 개를 하나씩 보겠습니다.
첫째, strictKnownMarketplaces는 허용 목록입니다. 여기에 적는다고 등록되지는 않는다는 점을 꼭 기억해 주세요. hostPattern으로 사내 git 호스트를 허용할 수 있고, skills-dir을 넣으면 로컬 스킬 플러그인은 계속 쓸 수 있습니다.
둘째, extraKnownMarketplaces가 실제 등록입니다. 사용자가 직접 등록하지 않아도 됩니다.
셋째, enabledPlugins에 true를 주면 강제로 설치되고 사용자가 해제할 수 없습니다. 반대로 false로 바꾸면 즉시 차단되니 롤백도 이 키입니다.
넷째, disableSideloadFlags는 --plugin-dir로 로컬 폴더를 직접 싣는 길을 막습니다.
:::

---
<!-- Slide 11: Quick check 1 (PDF p11) -->
@type: content
@fit: off

## 허용 목록이면 사이드로드도 막힐까?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c5-qc-1">
  <p class="q">strictKnownMarketplaces 허용 목록만 설정하면 <code>--plugin-dir</code> 로컬 로드는?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>막힌다</button>
    <button class="opt right"><b>B</b>막히지 않는다</button>
    <button class="opt"><b>C</b>경고만 뜬다</button>
  </div>
  <p class="ans">정답 B. 사이드로드는 disableSideloadFlags로만 막습니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c5-qc-1'); });
:::

:::notes
{timing: 1min}
{cue: poll}
[요약]
• 정답 B, 허용 목록만으로는 --plugin-dir이 막히지 않음
• 사이드로드는 disableSideloadFlags로만 막음

퀴즈입니다. strictKnownMarketplaces 허용 목록만 설정하면, --plugin-dir로 로컬 폴더를 싣는 것은 어떻게 될까요?
{cue: pause}
정답은 B, 막히지 않습니다. 허용 목록은 마켓플레이스를 거르는 키이고, 사이드로드는 disableSideloadFlags로만 막습니다. 그래서 두 키를 함께 거는 것입니다.
:::

---
<!-- Slide 12: Air-gapped and CI (PDF p12, p26) -->
@type: content
@fit: off

## git clone이 안 되면 미리 심어 둔다
망분리와 CI는 CLAUDE_CODE_PLUGIN_SEED_DIR

:::html
<div id="c5-sv-seed"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:540,h:410,l:'빌드 시점 (이미지 만들 때)'},{x:600,y:40,w:560,h:410,l:'런타임 (망분리, CI)',tone:'warning'}];
  var GT = {id:'gt',x:650,y:80,w:460,h:76,t:'git clone',s:'망 밖으로 못 나감',c:'danger'};
  var BI = {id:'bi',x:60,y:90,w:460,h:90,t:'claude plugin install',s:'CLAUDE_CODE_PLUGIN_CACHE_DIR',c:'accent'};
  var SD = {id:'sd',x:60,y:290,w:460,h:90,t:'/opt/claude-seed',s:'이미지에 미리 심기',c:'info'};
  var RT = {id:'rt',x:650,y:200,w:460,h:90,t:'Claude Code',s:'CLAUDE_CODE_PLUGIN_SEED_DIR, 읽기 전용',c:'success'};
  var PO = {id:'po',x:650,y:330,w:460,h:76,t:'허용, 차단 목록',s:'그대로 적용',c:'accent'};
  var ALL = [GT, BI, SD, RT, PO];
  var L = ['# 빌드 시점','CLAUDE_CODE_PLUGIN_CACHE_DIR=/opt/claude-seed \\','  claude plugin install …','','# 런타임','CLAUDE_CODE_PLUGIN_SEED_DIR=/opt/claude-seed'];
  F.stepviz('#c5-sv-seed', [
    {kicker:'STEP 1', title:'망분리 환경은 git clone이 안 됩니다',
     body:'마켓플레이스 등록과 설치는 보통 git이나 URL에서 받아 옵니다.<br><b>망분리 PC나 CI(자동 빌드와 테스트) 러너</b>에서는 그 길이 막혀 있습니다.',
     facts:['망분리 업무 PC','외부 접근이 없는 CI 러너','설치할 때 받아 오는 방식이 안 맞음'],
     zones:Z, nodes:ALL, hot:['gt','rt'],
     edges:[{f:'rt',t:'gt',c:'danger',dash:true}],
     snip:{hd:'망분리, CI',path:'플러그인을 받는 방법',lines:L,hl:[],note:'해법은 <b>빌드할 때 심고, 런타임에는 읽기만</b> 하는 것입니다.'}},
    {kicker:'STEP 2', title:'빌드할 때 플러그인을 심어 둡니다',
     body:'이미지를 만드는 시점에 <b>CLAUDE_CODE_PLUGIN_CACHE_DIR</b>을 seed 디렉터리로 지정하고 <code>claude plugin install</code>을 실행합니다.',
     facts:['빌드 시점에는 네트워크 사용 가능','설치 결과가 /opt/claude-seed에 남음','이 디렉터리를 이미지에 포함'],
     zones:Z, nodes:ALL, hot:['bi','sd'],
     edges:[{f:'bi',t:'sd',c:'info',l:'심기',o:0}],
     snip:{hd:'빌드 시점',path:'이미지 빌드 스크립트',lines:L,hl:[2,3],note:'빌드와 런타임 두 줄이 같은 경로(/opt/claude-seed)를 가리켜야 합니다.'}},
    {kicker:'STEP 3', title:'런타임에는 읽기 전용으로 씁니다',
     body:'런타임에는 <b>CLAUDE_CODE_PLUGIN_SEED_DIR</b>로 같은 디렉터리를 가리킵니다. Claude Code는 이 플러그인을 <b>읽기 전용</b>으로 씁니다.',
     facts:['같은 경로를 SEED_DIR로 지정','읽기 전용','git clone 없이 플러그인 사용'],
     zones:Z, nodes:ALL, hot:['sd','rt'],
     edges:[{f:'sd',t:'rt',c:'success',l:'읽기 전용',o:0,side:'h'}],
     snip:{hd:'런타임',path:'망분리 PC, CI 러너 환경 변수',lines:L,hl:[5,6],note:'더 알아보기의 마켓플레이스 소스 표에도 seed 디렉터리가 나옵니다.'}},
    {kicker:'STEP 4', title:'자동 업데이트는 꺼지고 정책은 그대로',
     body:'seed로 쓰면 <b>자동 업데이트는 꺼집니다</b>. 그래도 <b>허용, 차단 목록은 그대로 적용</b>되어 Part 2의 정책이 유지됩니다.',
     facts:['자동 업데이트 꺼짐: 이미지를 다시 빌드해 갱신','허용, 차단 목록은 그대로','강제 설치 정책과 함께 사용'],
     zones:Z, nodes:ALL, hot:['sd','rt','po'],
     edges:[{f:'sd',t:'rt',c:'success',o:0,side:'h'},{f:'po',t:'rt',c:'accent',l:'정책',o:1}],
     snip:{hd:'정리',path:'망분리, CI',lines:L,hl:[2,3,5,6],note:'갱신은 <b>이미지 재빌드</b>로 합니다. 검토한 버전만 들어가는 장점도 있습니다.'}}
  ], {legend:[['accent','설치와 정책'],['info','seed 디렉터리'],['success','런타임 사용'],['danger','막힌 경로']]});
});
:::

:::notes
{timing: 2min}
[요약]
• 망분리 PC와 CI는 git clone이 안 되므로 빌드 시점에 플러그인을 심어 둠
• 빌드: CLAUDE_CODE_PLUGIN_CACHE_DIR=/opt/claude-seed claude plugin install
• 런타임: CLAUDE_CODE_PLUGIN_SEED_DIR=/opt/claude-seed, 읽기 전용
• 자동 업데이트는 꺼지고 허용, 차단 목록은 그대로 적용

금융권에서 꼭 나오는 질문, 망분리 환경입니다.
{cue: demo}
망분리 PC나 외부 접근이 없는 CI 러너에서는 git clone으로 플러그인을 받아 올 수 없습니다.
그래서 이미지를 빌드하는 시점에 CLAUDE_CODE_PLUGIN_CACHE_DIR을 seed 디렉터리로 지정하고 플러그인을 설치해 둡니다.
런타임에는 CLAUDE_CODE_PLUGIN_SEED_DIR로 같은 디렉터리를 가리키면 읽기 전용으로 씁니다.
이렇게 쓰면 자동 업데이트는 꺼지지만, 허용과 차단 목록은 그대로 적용됩니다. 갱신은 이미지를 다시 빌드해서 합니다.

[약어]
• CI: Continuous Integration, 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인
:::

---
<!-- Slide 13: Measure after deploy (PDF p13) -->
@type: content
@fit: off

## 설치했다면 쓰이는지도 본다
배포 후 측정, OTel 이벤트 두 개와 이름 가림

:::html
<div class="fsi c5-pickrow">
  <div class="row3" data-pick="c5-otel">
    <button class="pick" data-key="inst"><span class="k">EVENT</span><span class="t">plugin_installed</span><span class="d">설치마다 기록</span></button>
    <button class="pick" data-key="load"><span class="k">EVENT</span><span class="t">plugin_loaded</span><span class="d">세션 시작 시 켜진 플러그인</span></button>
    <button class="pick" data-key="priv"><span class="k">PRIVACY</span><span class="t">이름 가림</span><span class="d">서드파티 플러그인 이름</span></button>
  </div>
  <div class="panel" data-pick-panel="c5-otel">
    <p class="hint">무엇이 설치되고 쓰이는지 <span class="rp-detail" tabindex="0" data-tip="OpenTelemetry. 사용량과 이벤트를 조직의 수집기로 보내는 표준">OTel</span>로 봅니다. 카드를 누르면 각 이벤트가 답하는 질문이 나옵니다.</p>
    <div data-for="inst"><h4>plugin_installed</h4><p><b>설치할 때마다</b> 기록됩니다. 누가 설치했는지 답합니다.</p></div>
    <div data-for="load"><h4>plugin_loaded</h4><p><b>세션이 시작될 때 켜진 플러그인</b>이 기록됩니다. 설치만 하고 안 쓰는지, 실제로 쓰이는지 답합니다.</p><p>배포 전 체크리스트의 측정 항목도 이 이벤트입니다.</p></div>
    <div data-for="priv"><h4>이름 가림</h4><p>서드파티 플러그인 이름은 기본으로 가려지고, <code>OTEL_LOG_TOOL_DETAILS=1</code>일 때만 표시됩니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-otel'); });
:::

:::notes
{timing: 1.5min}
[요약]
• plugin_installed: 설치마다 기록
• plugin_loaded: 세션 시작 시 켜진 플러그인, 실제 사용 여부
• 서드파티 이름은 OTEL_LOG_TOOL_DETAILS=1일 때만 표시
• OTel 설정 자체는 Ch6에서 다룸

배포했다면 무엇이 설치되고 실제로 쓰이는지 봐야 합니다. Ch6에서 다룰 OTel로 봅니다.
{cue: demo}
plugin_installed는 설치할 때마다, plugin_loaded는 세션이 시작될 때 켜진 플러그인을 기록합니다. 설치만 되고 안 쓰이는 플러그인을 찾을 수 있습니다.
그리고 서드파티 플러그인 이름은 기본으로 가려지고, OTEL_LOG_TOOL_DETAILS를 1로 줄 때만 보입니다.

[약어]
• OTel: OpenTelemetry
:::

---
<!-- Slide 14: Part 03 divider (PDF p14) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 05 / PART 03</span>
  <div class="name">Mods</div>
  <p class="what">Claude Code 안에서 도는 코드</p>
  <ol>
    <li><b>01</b>mod가 할 수 있는 것</li>
    <li><b>02</b>구조와 예시</li>
    <li><b>03</b>조직 통제</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 3은 mod: 할 수 있는 것, 구조와 예시, 조직 통제

세 번째 Part, mod입니다. Claude Code 안에서 직접 도는 코드라 할 수 있는 일이 많고, 그만큼 통제도 중요합니다.
:::

---
<!-- Slide 15: Mod statement (PDF p15) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">NEW, v2.1.287+</span>
  <div class="big">mod = 플러그인 안의 <em>이벤트 핸들러</em></div>
  <p class="lead">도구 호출, 프롬프트, 커맨드, 화면 그리기 이벤트를 관찰하고, 바꾸고, 대신 처리합니다. Bedrock에서도 동작합니다.</p>
</div>
:::

:::notes
{timing: 1min}
[요약]
• v2.1.287부터 들어온 새 기능
• mod는 플러그인 안의 이벤트 핸들러
• 도구 호출, 프롬프트, 커맨드, 화면 그리기 이벤트를 관찰, 변경, 대신 처리
• Bedrock에서도 동작

{cue: pause}
mod를 한 줄로 정의하면, 플러그인 안의 이벤트 핸들러입니다. v2.1.287부터 들어온 새 기능입니다.
도구 호출, 프롬프트, 커맨드, 화면 그리기 같은 이벤트를 관찰하고, 바꾸고, 대신 처리할 수 있습니다.
그리고 Bedrock에서도 똑같이 동작합니다.
:::

---
<!-- Slide 16: Smallest mod (PDF p16) -->
@type: content
@fit: off

## 도구 호출 수를 스피너 옆에 띄운다
가장 작은 mod, 이벤트 두 개를 다루는 register.js

:::html
<div id="c5-sv-mod"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:1140,h:410,l:'hooks/register.js'}];
  var EV = {id:'ev',x:50,y:90,w:250,h:84,t:'tool.call',s:'도구 호출 이벤트',c:'info'};
  var H1 = {id:'h1',x:350,y:90,w:300,h:84,t:'calls += 1',s:'관찰하고 세기',c:'accent'};
  var NX = {id:'nx',x:710,y:90,w:420,h:84,t:'next(e)',s:'도구는 그대로 실행',c:'success'};
  var IV = {id:'iv',x:350,y:220,w:300,h:84,t:'$.ui.invalidate',s:'ui.render 다시 그리기',c:'accent'};
  var RD = {id:'rd',x:50,y:340,w:250,h:84,t:'ui.render',s:'component: Spinner',c:'info'};
  var SP = {id:'sp',x:710,y:340,w:420,h:84,t:'스피너 suffix',s:'tool calls: N',c:'success'};
  var ALL = [EV, H1, NX, IV, RD, SP];
  var CODE = ['let calls = 0','export function register(on) {','  on(\'tool.call\', async ($, e, next) => {','    calls += 1','    $.ui.invalidate(\'ui.render\')','    return next(e)            // 도구는 그대로 실행','  })','  on(\'ui.render\', { component: \'Spinner\' }, async ($, e, next) => {','    return next({ ...e, props: { ...e.props,','      suffix: \' · tool calls: \' + calls + \'…\' } })','  })','}'];
  function snip(hl, note) { return {hd:'가장 작은 mod',path:'hooks/register.js',lines:CODE,hl:hl,note:note}; }
  F.stepviz('#c5-sv-mod', [
    {kicker:'STEP 1', title:'register(on)으로 핸들러를 겁니다',
     body:'mod는 <b>register 함수</b> 하나를 내보냅니다. Claude Code가 넘겨준 <b>on</b>으로 어떤 이벤트에 끼어들지 등록합니다.',
     zones:Z, nodes:ALL, hot:['ev','rd'],
     edges:[],
     snip:snip([2,3,8],'핸들러는 <code>($, e, next)</code>를 받습니다. $는 바깥 작업용 API입니다.')},
    {kicker:'STEP 2', title:'tool.call: 세고 그대로 넘깁니다',
     body:'도구가 호출될 때마다 <b>calls를 1 올리고</b>, <b>next(e)</b>로 원래 이벤트를 넘겨 도구는 그대로 실행됩니다. 이것이 <b>관찰</b>입니다.',
     zones:Z, nodes:ALL, hot:['ev','h1','nx'],
     edges:[{f:'ev',t:'h1',c:'info',o:0},{f:'h1',t:'nx',c:'success',l:'next(e)',o:1}],
     loop:true, stagger:0.8,
     snip:snip([3,4,6],'관찰, 변경, 대신 처리 중 이 핸들러는 <b>관찰</b>만 합니다.')},
    {kicker:'STEP 3', title:'화면을 다시 그리게 합니다',
     body:'<b>$.ui.invalidate(\'ui.render\')</b>로 화면을 다시 그리게 하면, Spinner를 그리는 <b>ui.render</b> 핸들러가 불립니다.',
     zones:Z, nodes:ALL, hot:['h1','iv','rd'],
     edges:[{f:'h1',t:'iv',c:'accent',o:0},{f:'iv',t:'rd',c:'accent',l:'다시 그리기',o:1}],
     snip:snip([5,8],'mod가 바깥에 하는 일은 모두 <b>$ API</b>를 거칩니다. 그래서 validate로 볼 수 있습니다.')},
    {kicker:'STEP 4', title:'props를 바꿔 스피너 옆에 표시',
     body:'ui.render 핸들러는 <b>props에 suffix를 더한 이벤트</b>를 next로 넘깁니다. 이것이 <b>변경</b>입니다. 스피너 옆에 호출 수가 붙습니다.',
     zones:Z, nodes:ALL, hot:['rd','sp'],
     edges:[{f:'rd',t:'sp',c:'success',l:'suffix 추가',o:0}],
     snip:snip([8,9,10],'Super Lab TASK 03에서 이 mod에 <code>/tally-reset</code> 커맨드를 Claude에게 추가시킵니다.')},
    {kicker:'FILES', title:'세 파일과 두 원칙',
     body:'mod는 <b>.claude-plugin/plugin.json</b>, 코드 위치를 적은 <b>hooks/hooks.json</b>, 그리고 <b>hooks/register.js</b> 세 파일로 된 플러그인입니다. 원칙은 두 가지, <b>관찰, 변경, 대신 처리</b>와 <b>바깥 작업은 $ API로만</b>입니다.',
     facts:['원칙 1: 관찰, 변경, 대신 처리','원칙 2: 바깥 작업은 $ API로만','배포와 통제는 일반 플러그인과 같음'],
     zones:Z, nodes:ALL,
     edges:[{f:'ev',t:'h1',c:'info',o:0},{f:'h1',t:'nx',c:'success',o:1},{f:'h1',t:'iv',c:'accent',o:2},{f:'iv',t:'rd',c:'accent',o:3},{f:'rd',t:'sp',c:'success',o:4}],
     loop:true, stagger:0.6,
     snip:{hd:'세 파일',path:'mod 플러그인',lines:['.claude-plugin/plugin.json','hooks/hooks.json      # 코드 위치','hooks/register.js'],hl:[1,2,3],note:'그래서 mod도 <b>Part 2의 배포와 통제를 그대로</b> 받습니다.'}}
  ], {legend:[['info','이벤트'],['accent','핸들러 동작'],['success','결과']]});
});
:::

:::notes
{timing: 3min}
[요약]
• mod는 register(on)을 내보내고 on으로 이벤트 핸들러를 등록
• tool.call: calls를 세고 next(e)로 도구는 그대로 실행 (관찰)
• $.ui.invalidate로 다시 그리기, ui.render에서 Spinner props에 suffix 추가 (변경)
• 파일은 plugin.json, hooks.json, register.js 세 개, 바깥 작업은 $ API로만

{cue: demo}
가장 작은 mod를 단계별로 보겠습니다. 도구 호출 수를 스피너 옆에 띄우는 예시입니다.
첫째, mod는 register 함수를 내보내고, 넘겨받은 on으로 이벤트에 핸들러를 겁니다.
둘째, tool.call 이벤트에서는 calls를 하나 올리고 next(e)로 원래 이벤트를 넘깁니다. 그래서 도구는 그대로 실행됩니다. 이게 관찰입니다.
셋째, $.ui.invalidate로 화면을 다시 그리게 하면 ui.render 핸들러가 불립니다. 바깥에 하는 일은 모두 $ API를 거칩니다.
넷째, ui.render에서는 Spinner의 props에 suffix를 더해서 넘깁니다. 이게 변경입니다.
파일은 세 개, 원칙은 두 가지입니다. 관찰, 변경, 대신 처리를 하고, 바깥 작업은 $ API로만 합니다. 배포는 일반 플러그인과 같습니다.
:::

---
<!-- Slide 17: Mod vs other extensions (PDF p17) -->
@type: content
@fit: off

## 다른 수단으로 되면 mod는 쓰지 않는다
mod와 다른 확장 비교, 바꿀 수 있는 것과 작성 언어

:::html
<div class="fsi c5-pickrow">
  <div class="row4" data-pick="c5-cmp">
    <button class="pick" data-key="mod"><span class="k">JS/TS</span><span class="t">mod</span></button>
    <button class="pick" data-key="hook"><span class="k">스크립트</span><span class="t">Settings 훅</span></button>
    <button class="pick" data-key="skill"><span class="k">Markdown</span><span class="t">Skill</span></button>
    <button class="pick" data-key="mcp"><span class="k">아무 언어</span><span class="t">MCP</span></button>
  </div>
  <div class="panel" data-pick-panel="c5-cmp">
    <p class="hint">네 가지를 눌러 비교합니다. 원칙은 하나, <b>이미 다른 수단으로 되면 mod를 쓰지 않습니다</b>.</p>
    <div data-for="mod"><dl class="kv"><dt>바꿀 수 있는 것</dt><dd>도구 호출, 프롬프트, 커맨드, 턴, 화면</dd><dt>작성</dt><dd>JS/TS (JavaScript, TypeScript)</dd><dt>고를 때</dt><dd>패널, 즉시 커맨드, 이벤트 재작성</dd></dl></div>
    <div data-for="hook"><dl class="kv"><dt>바꿀 수 있는 것</dt><dd>허용/차단, 입력과 결과 수정</dd><dt>작성</dt><dd>스크립트</dd><dt>고를 때</dt><dd>기존 스크립트로 막거나 기록</dd></dl></div>
    <div data-for="skill"><dl class="kv"><dt>바꿀 수 있는 것</dt><dd>Claude가 아는 것</dd><dt>작성</dt><dd>Markdown</dd><dt>고를 때</dt><dd>반복 지시</dd></dl></div>
    <div data-for="mcp"><dl class="kv"><dt>바꿀 수 있는 것</dt><dd>Claude가 쓰는 도구</dd><dt>작성</dt><dd>아무 언어</dd><dt>고를 때</dt><dd>외부 시스템 연결</dd></dl></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-cmp'); });
:::

:::notes
{timing: 2min}
[요약]
• mod: 도구 호출, 프롬프트, 커맨드, 턴, 화면을 JS/TS로, 패널과 즉시 커맨드, 이벤트 재작성에
• Settings 훅: 허용/차단과 입력, 결과 수정을 스크립트로
• Skill: Claude가 아는 것을 Markdown으로, MCP: 쓰는 도구를 아무 언어로
• 이미 다른 수단으로 되면 mod를 쓰지 않음

mod는 강력하지만, 원칙은 이미 다른 수단으로 되면 mod를 쓰지 않는다는 것입니다.
{cue: demo}
mod는 도구 호출부터 화면까지 바꿀 수 있고 JS나 TS로 씁니다. 패널, 즉시 실행되는 커맨드, 이벤트 재작성이 필요할 때 고릅니다.
막거나 기록하는 것은 Settings 훅으로 충분합니다. Claude가 알아야 할 것은 Skill, 써야 할 도구는 MCP입니다.
화면이나 이벤트 자체를 바꿔야 할 때만 mod를 고르시면 됩니다.

[약어]
• JS/TS: JavaScript, TypeScript
:::

---
<!-- Slide 18: Official sample mods (PDF p18) -->
@type: content
@fit: off

## 공식 샘플 셋으로 감을 잡는다
claude-code-playground 저장소, 공식 지원 대상은 아님

:::html
<div class="fsi c5-pickrow">
  <div class="row3" data-pick="c5-samples">
    <button class="pick" data-key="tw"><span class="k">CONTEXT</span><span class="t">token-weather</span></button>
    <button class="pick" data-key="br"><span class="k">SAFETY</span><span class="t">blast-radius</span></button>
    <button class="pick" data-key="rt"><span class="k">REVIEW</span><span class="t">replay-theater</span></button>
  </div>
  <div class="panel" data-pick-panel="c5-samples">
    <p class="hint">샘플 하나를 누르면 무엇을 하는 mod인지 보여 줍니다.</p>
    <div data-for="tw"><h4>token-weather</h4><p>컨텍스트 창 사용량을 <b>예보처럼</b> 프롬프트 위에 표시합니다.</p></div>
    <div data-for="br"><h4>blast-radius</h4><p>rm -rf, force push 같은 <b>위험 명령을 붙잡고</b> 영향 범위를 보여 준 뒤, 진행이나 취소 버튼을 띄웁니다.</p></div>
    <div data-for="rt"><h4>replay-theater</h4><p><code>/replay</code>로 지난 턴의 파일 편집을 <b>단계별로 재생</b>합니다.</p></div>
  </div>
  <p class="note">샘플은 claude-code-playground 저장소에 있으며 공식 지원 대상이 아닙니다. 도입 전에 더 알아보기의 mod 리뷰 절차를 거칩니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-samples'); });
:::

:::notes
{timing: 1.5min}
[요약]
• claude-code-playground 저장소의 공식 샘플 mod 세 가지, 공식 지원 대상은 아님
• token-weather: 컨텍스트 사용량을 예보처럼 표시
• blast-radius: 위험 명령을 붙잡고 영향 범위를 보여 준 뒤 진행 또는 취소
• replay-theater: /replay로 지난 턴의 편집을 단계별 재생

mod로 무엇을 할 수 있는지 공식 샘플 세 개로 감을 잡아 보겠습니다. claude-code-playground 저장소에 있고, 공식 지원 대상은 아닙니다.
{cue: demo}
token-weather는 컨텍스트 사용량을 날씨 예보처럼 보여 주고, blast-radius는 rm -rf나 force push 같은 위험 명령을 붙잡아 영향 범위를 보여 준 다음 진행할지 묻습니다. replay-theater는 지난 턴의 파일 편집을 단계별로 재생합니다.
:::

---
<!-- Slide 19: Trust model (PDF p19) -->
@type: content
@fit: off

## mod는 사용자 권한으로 모든 것에 닿는다
설치 전에 알아야 할 신뢰 모델, 닿는 것과 막히는 것

:::html
<div id="c5-sv-trust"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:560,h:410,l:'닿는 것 (사용자 권한으로)',tone:'danger'},{x:620,y:40,w:540,h:410,l:'막히는 것',tone:'success'}];
  var MD = {id:'md',x:330,y:200,w:220,h:90,t:'mod',s:'사용자 권한',c:'warning'};
  var R1 = {id:'r1',x:40,y:70,w:270,h:76,t:'파일, 프로세스, 네트워크',s:'읽기, 쓰기, 실행',c:'danger'};
  var R2 = {id:'r2',x:40,y:165,w:270,h:76,t:'비밀값',s:'환경변수, 설정 속',c:'danger'};
  var R3 = {id:'r3',x:40,y:260,w:270,h:76,t:'프롬프트, 도구 호출',s:'모든 것',c:'danger'};
  var R4 = {id:'r4',x:40,y:355,w:270,h:76,t:'모델 사용량',s:'사용자의 것',c:'danger'};
  var B1 = {id:'b1',x:660,y:80,w:460,h:84,t:'managed deny 규칙',s:'managed PreToolUse 차단',c:'success'};
  var B2 = {id:'b2',x:660,y:200,w:460,h:84,t:'권한 프롬프트 화면',s:'mod가 바꿀 수 없음',c:'success'};
  var B3 = {id:'b3',x:660,y:320,w:460,h:84,t:'로드 자체를 정책으로 통제',s:'validate, allowManagedModsOnly',c:'accent'};
  var ALL = [MD, R1, R2, R3, R4, B1, B2, B3];
  F.stepviz('#c5-sv-trust', [
    {kicker:'STEP 1', title:'사용자가 닿는 곳엔 mod도 닿습니다',
     body:'mod는 <b>사용자 권한으로</b> 돕니다. 파일 읽기와 쓰기, 프로세스 실행, 네트워크, 환경변수와 설정 속 비밀값, 모든 프롬프트와 도구 호출, 모델 사용량까지 닿습니다.',
     facts:['mod에는 샌드박스가 없음','비밀값과 모든 프롬프트에 접근','설치는 곧 신뢰'],
     zones:Z, nodes:ALL, hot:['md','r1','r2','r3','r4'],
     edges:[{f:'md',t:'r1',c:'danger',o:0},{f:'md',t:'r2',c:'danger',o:1},{f:'md',t:'r3',c:'danger',o:2},{f:'md',t:'r4',c:'danger',o:3}],
     stagger:0.3,
     snip:{hd:'닿는 것',path:'사용자 권한으로',lines:['파일 읽기, 쓰기','프로세스 실행','네트워크','환경변수, 설정 속 비밀값','모든 프롬프트와 도구 호출','사용자의 모델 사용량'],hl:[1,2,3,4,5,6],note:'그래서 <b>남이 만든 mod</b>는 플러그인보다 더 엄격하게 검토합니다.'}},
    {kicker:'STEP 2', title:'조직의 차단과 권한 화면은 못 넘습니다',
     body:'<b>managed deny 규칙과 managed PreToolUse 차단</b>은 mod가 우회하지 못합니다. <b>권한 프롬프트 화면</b>도 mod가 바꿀 수 없습니다.',
     facts:['managed deny 규칙','managed PreToolUse 차단','권한 프롬프트 화면은 고정'],
     zones:Z, nodes:ALL, hot:['md','b1','b2'],
     edges:[{f:'md',t:'b1',c:'success',dash:true},{f:'md',t:'b2',c:'success',dash:true}],
     snip:{hd:'막히는 것',path:'조직 정책이 이기는 곳',lines:['managed deny 규칙','managed PreToolUse 차단','권한 프롬프트 화면'],hl:[1,2,3],note:'Ch3에서 건 managed 통제는 mod가 있어도 그대로입니다.'}},
    {kicker:'STEP 3', title:'그래서 로드 자체를 통제합니다',
     body:'mod가 띄운 프로세스는 <b>샌드박스 밖</b>입니다. 그래서 정책으로 <b>로드 자체</b>를 통제하고, 설치 전 <b>claude plugin validate</b>로 hooks와 calls를 확인합니다.',
     facts:['mod가 띄운 프로세스는 샌드박스 밖','정책으로 로드 자체를 통제','설치 전 claude plugin validate'],
     zones:Z, nodes:ALL, hot:['md','b3'],
     edges:[{f:'b3',t:'md',c:'accent',l:'로드 통제',o:0}],
     snip:{hd:'설치 전',path:'shell',lines:['claude plugin validate ./some-mod','','# hooks: 언제 끼어드는가','# calls: 바깥에 하는 일'],hl:[1],note:'다음 장에서 정책 키와 validate 출력 읽는 법을 봅니다.'}}
  ], {legend:[['danger','mod가 닿는 것'],['success','mod가 못 넘는 것'],['accent','로드 통제']]});
});
:::

:::notes
{timing: 2min}
[요약]
• mod는 사용자 권한으로 파일, 프로세스, 네트워크, 비밀값, 모든 프롬프트, 모델 사용량에 닿음
• managed deny, managed PreToolUse 차단, 권한 프롬프트 화면은 못 넘음
• mod가 띄운 프로세스는 샌드박스 밖이라 정책으로 로드 자체를 통제, 설치 전 validate

{cue: demo}
설치 전에 꼭 알아야 할 신뢰 모델입니다.
첫째, mod는 사용자 권한으로 돕니다. 사용자가 닿는 곳이면 mod도 닿습니다. 비밀값과 모든 프롬프트까지요. mod에는 샌드박스가 없습니다.
둘째, 그래도 조직의 managed deny 규칙과 managed PreToolUse 차단, 그리고 권한 프롬프트 화면은 mod가 넘지 못합니다.
셋째, mod가 띄운 프로세스는 샌드박스 밖이기 때문에, 결국 통제는 로드 자체를 막는 것입니다. 설치 전에는 claude plugin validate로 무엇에 끼어들고 무엇을 호출하는지 확인합니다.
:::

---
<!-- Slide 20: Mod org control (PDF p20) -->
@type: content
@fit: off

## 사용자 mod는 막고, 조직 mod는 검토
allowManagedModsOnly와 claude plugin validate 읽는 법

:::html
<div id="c5-sv-ctrl"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:300,h:410,l:'관리자'},{x:360,y:40,w:800,h:410,l:'사용자 PC'}];
  var MS = {id:'ms',x:40,y:110,w:260,h:90,t:'managed-settings.json',s:'allowManagedModsOnly',c:'accent'};
  var VA = {id:'va',x:40,y:300,w:260,h:90,t:'plugin validate',s:'설치 전 보안 리뷰',c:'warning'};
  var OM = {id:'om',x:420,y:110,w:330,h:90,t:'조직 mod',s:'로컬 디렉터리 마켓플레이스',c:'success'};
  var UM = {id:'um',x:800,y:110,w:330,h:90,t:'사용자 mod',s:'로드되지 않음',c:'danger'};
  var CC = {id:'cc',x:420,y:300,w:710,h:90,t:'Claude Code',s:'파일, MDM 정책이면 Bedrock에서도 같게',c:'info'};
  var ALL = [MS, VA, OM, UM, CC];
  var POL = ['{','  "pluginConfigs": {','    "cc-plugin-sec-default@builtin": {','      "options": { "allowManagedModsOnly": true }','    }','  }','}'];
  var VAL = ['$ claude plugin validate ./some-mod','','❯ ./register.js hooks: session.start, tool.call,','   ui.render{component=Pane}','❯ ./register.js calls: $.fs.read, $.http.fetch,','   $.store.set, $.ui.open'];
  F.stepviz('#c5-sv-ctrl', [
    {kicker:'STEP 1', title:'allowManagedModsOnly: 조직 mod만 로드',
     body:'내장 보안 플러그인 <code>cc-plugin-sec-default@builtin</code>의 옵션 <b>allowManagedModsOnly</b>를 켜면 <b>조직이 배포한 mod만</b> 로드됩니다.',
     facts:['managed-settings.json의 pluginConfigs','사용자가 설치한 mod는 로드 안 됨','사이드로드는 disableSideloadFlags와 함께'],
     zones:Z, nodes:ALL, hot:['ms','om','um','cc'],
     edges:[{f:'ms',t:'om',c:'success',l:'허용',o:0},{f:'um',t:'cc',c:'danger',dash:true},{f:'om',t:'cc',c:'success',o:1}],
     snip:{hd:'사용자 mod 차단',path:'managed-settings.json',lines:POL,hl:[3,4],note:'Super Lab TASK 05에서 이 설정으로 사용자 mod가 막히는지 확인한 뒤 원복합니다.'}},
    {kicker:'STEP 2', title:'조직 mod는 로컬 마켓플레이스로',
     body:'조직 mod는 <b>로컬 디렉터리 마켓플레이스</b>에 두고 <b>prependPlugins</b>로 싣습니다.',
     facts:['로컬 디렉터리 마켓플레이스','prependPlugins','검토한 버전만 올림'],
     zones:Z, nodes:ALL, hot:['ms','om','cc'],
     edges:[{f:'ms',t:'om',c:'success',l:'prependPlugins',o:0},{f:'om',t:'cc',c:'success',o:1}],
     snip:{hd:'조직 mod 배포',path:'요약',lines:['조직 mod','  로컬 디렉터리 마켓플레이스','  + prependPlugins'],hl:[2,3],note:'배포 경로를 <b>managed 마켓플레이스로만</b> 두는 것이 리뷰 체크리스트의 한 항목입니다.'}},
    {kicker:'STEP 3', title:'validate 출력은 두 줄을 읽습니다',
     body:'<b>hooks</b> 줄은 언제 끼어드는지, <b>calls</b> 줄은 바깥에 무엇을 하는지입니다. calls에 <b>$.process.run, $.http.fetch</b>가 있으면 정밀 검토합니다.',
     facts:['hooks: 언제 끼어드는가','calls: 바깥에 하는 일','$.process.run, $.http.fetch는 정밀 검토'],
     zones:Z, nodes:ALL, hot:['va','om'],
     edges:[{f:'va',t:'om',c:'warning',l:'검토 후 배포',o:0,side:'h'}],
     snip:{hd:'설치 전 검토',path:'shell (예시 출력)',lines:VAL,hl:[3,5,6],note:'이 예시는 <b>$.http.fetch</b>가 있으니 네트워크 호출 대상을 확인해야 합니다.'}},
    {kicker:'STEP 4', title:'파일과 MDM 정책은 Bedrock에서도 같습니다',
     body:'이 통제는 파일이나 <b>MDM(단말 관리 도구)</b>으로 배포한 managed settings라서 <b>Bedrock 사용자에게도 똑같이</b> 적용됩니다.',
     facts:['파일, MDM 정책','Bedrock에서도 똑같이 적용','서버 관리 설정에 기대지 않음'],
     zones:Z, nodes:ALL,
     edges:[{f:'ms',t:'cc',c:'accent',l:'파일, MDM',o:0,side:'h'},{f:'om',t:'cc',c:'success',o:1},{f:'um',t:'cc',c:'danger',dash:true}],
     snip:{hd:'사용자 mod 차단',path:'managed-settings.json',lines:POL,hl:[4],note:'다음 퀴즈는 managed settings가 <b>없는</b> 경우입니다.'}}
  ], {legend:[['accent','관리자 정책'],['warning','검토'],['success','허용된 mod'],['danger','막힌 mod']]});
});
:::

:::notes
{timing: 2.5min}
[요약]
• cc-plugin-sec-default@builtin의 allowManagedModsOnly: 조직 mod만 로드
• 조직 mod는 로컬 디렉터리 마켓플레이스 + prependPlugins
• claude plugin validate의 hooks 줄과 calls 줄, $.process.run과 $.http.fetch가 있으면 정밀 검토
• 파일, MDM 정책이면 Bedrock에서도 똑같이 적용

{cue: demo}
mod의 조직 통제입니다.
첫째, managed-settings.json에서 내장 보안 플러그인의 allowManagedModsOnly를 켜면 조직이 배포한 mod만 로드되고 사용자가 설치한 mod는 로드되지 않습니다.
둘째, 조직 mod는 로컬 디렉터리 마켓플레이스에 두고 prependPlugins로 싣습니다.
셋째, 설치 전에는 claude plugin validate를 돌려 두 줄을 읽습니다. hooks는 언제 끼어드는지, calls는 바깥에 무엇을 하는지입니다. calls에 프로세스 실행이나 http fetch가 보이면 정밀 검토 대상입니다.
넷째, 파일이나 MDM으로 배포한 정책이라 Bedrock 사용자에게도 똑같이 적용됩니다.

[약어]
• MDM: Mobile Device Management, 회사 단말에 설정과 파일을 배포하는 관리 도구
:::

---
<!-- Slide 21: Quick check 2 (PDF p21) -->
@type: content
@fit: off

## managed settings 없으면 guard는?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c5-qc-2">
  <p class="q">Bedrock 사용자 PC에 managed settings가 없다면, 내장 guard(sec-default)는?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>항상 로드된다</button>
    <button class="opt right"><b>B</b>로드되지 않는다</button>
    <button class="opt"><b>C</b>Bedrock이면 자동 로드</button>
  </div>
  <p class="ans">정답 B. Bedrock, API 키 사용자는 managed settings가 있는 머신에서만 guard가 로드됩니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c5-qc-2'); });
:::

:::notes
{timing: 1min}
{cue: poll}
[요약]
• 정답 B, managed settings가 없으면 내장 guard(sec-default)는 로드되지 않음
• Bedrock, API 키 사용자는 managed settings가 있는 머신에서만 guard 로드

퀴즈입니다. Bedrock 사용자 PC에 managed settings가 없다면, 방금 본 내장 guard, sec-default는 어떻게 될까요?
{cue: pause}
정답은 B, 로드되지 않습니다. Bedrock이나 API 키 사용자는 managed settings가 있는 머신에서만 guard가 로드됩니다. 그래서 Ch2에서 managed settings를 배포하는 것이 모든 통제의 전제입니다.
:::

---
<!-- Slide 22: Quick check 3 (PDF p22) -->
@type: content
@fit: off

## --plugin-dir로 실은 mod를 막으려면?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c5-qc-3">
  <p class="q">사용자가 <code>--plugin-dir</code>로 mod를 실어도 로드되지 않게 하려면?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>CLAUDE.md에 금지 문구</button>
    <button class="opt right"><b>B</b>managed settings의 disableSideloadFlags와 allowManagedModsOnly</button>
    <button class="opt"><b>C</b>사용자 settings.json에 enabledPlugins false</button>
  </div>
  <p class="ans">정답 B. 사용자 설정은 정책을 이기지 못합니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c5-qc-3'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, managed settings의 disableSideloadFlags와 allowManagedModsOnly
• CLAUDE.md 문구나 사용자 설정은 정책을 이기지 못함

이번 Part 마지막 퀴즈입니다. 사용자가 --plugin-dir로 mod를 실어도 로드되지 않게 하려면 무엇을 해야 할까요?
{cue: pause}
정답은 B, managed settings에 disableSideloadFlags와 allowManagedModsOnly를 함께 거는 것입니다. CLAUDE.md의 금지 문구는 지침일 뿐이고, 사용자 설정은 정책을 이기지 못합니다.
:::

---
<!-- Slide 23: Super Lab (PDF p23) -->
@type: content
@fit: off

## 45분 동안 팀 스타터 킷을 만든다
SUPER LAB, 팀 스타터 킷 플러그인 + mod

:::html
<div class="fsi fsi-lab">
  <ol class="steps">
    <li><b>TASK 01</b><span>Ch4 Subagent 3종(Ch4 건너뛰면 code-reviewer 1종) + DLP 훅 + 리뷰 스킬 묶기</span><em>Part 1</em></li>
    <li><b>TASK 02</b><span>로컬 디렉터리 마켓플레이스 fsi-local 등록, /plugin install fsi-team-kit@fsi-local</span><em>Part 1</em></li>
    <li><b>TASK 03</b><span>공식 first-mod 붙여 넣기, Claude에게 /tally-reset 추가 요청</span><em>Part 3</em></li>
    <li><b>TASK 05</b><span>allowManagedModsOnly로 사용자 mod 차단 확인, 원복</span><em>Part 3</em></li>
    <li><b>TASK 06</b><span>배포 전 체크리스트 (선택 TASK 04: Bedrock용 idle compaction mod, 12분)</span><em>Part 2</em></li>
  </ol>
  <p class="where">골격은 복사해 붙이고, 나머지는 Claude에게 시킵니다. Hands-on Lab 포털에서 Chapter 5를 엽니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Super Lab 45분, 팀 스타터 킷 플러그인과 mod
• TASK 01 Subagent 3종과 DLP 훅, 리뷰 스킬 묶기, 02 fsi-local 등록과 설치, 03 first-mod와 /tally-reset, 05 사용자 mod 차단과 원복, 06 체크리스트
• 선택 TASK 04는 Bedrock용 idle compaction mod, 12분

{cue: demo}
강의를 마치면 45분 Super Lab을 합니다.
TASK 01에서 Ch4의 Subagent 세 개, Ch4를 건너뛰셨다면 code-reviewer 하나와 Ch3의 DLP 훅, 리뷰 스킬을 fsi-team-kit 하나로 묶고, TASK 02에서 로컬 디렉터리 마켓플레이스 fsi-local을 등록해 /plugin install fsi-team-kit@fsi-local로 설치합니다.
TASK 03은 공식 first-mod를 붙여 넣고 Claude에게 /tally-reset 커맨드를 추가하게 시킵니다. TASK 05는 allowManagedModsOnly로 사용자 mod가 막히는지 확인하고 꼭 원복합니다. 마지막 TASK 06은 배포 전 체크리스트입니다.
시간이 남으면 12분짜리 선택 TASK 04, Bedrock용 idle compaction mod를 해 보세요.
골격은 복사해 붙이고, 나머지는 Claude에게 시키시면 됩니다.

[출처]
• 원본 Ch5 강의자료 p23
:::

---
<!-- Slide 24: Pre-deploy checklist (PDF p24) -->
@type: content
@fit: off

## 올리기 전에 여섯 가지를 확인한다
사내 배포 전 체크리스트, 눌러서 하나씩 확인

:::html
<div class="fsi c5-check" id="c5-check">
  <div class="items">
    <button class="it"><span class="k">VALIDATE</span><span class="t">validate 통과</span><span class="d">hooks, calls 목록을 보안팀과 리뷰</span></button>
    <button class="it"><span class="k">VERSION</span><span class="t">버전 고정</span><span class="d">release channel(stable, latest) 분리</span></button>
    <button class="it"><span class="k">ALLOW LIST</span><span class="t">허용 목록</span><span class="d">strictKnownMarketplaces + disableSideloadFlags</span></button>
    <button class="it"><span class="k">AIR-GAP</span><span class="t">망분리 경로</span><span class="d">필요하면 seed 디렉터리로 배포</span></button>
    <button class="it"><span class="k">MEASURE</span><span class="t">측정</span><span class="d">plugin_loaded 이벤트로 사용 현황 확인</span></button>
    <button class="it"><span class="k">ROLLBACK</span><span class="t">롤백</span><span class="d">enabledPlugins false로 즉시 차단</span></button>
  </div>
  <div class="foot"><span>Super Lab TASK 06에서 같은 목록을 직접 점검합니다.</span><span class="cnt" id="c5-check-cnt">0 / 6</span></div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var root = document.querySelector('.slide-deck #c5-check') || document.getElementById('c5-check');
  var items = Array.prototype.slice.call(root.querySelectorAll('.it'));
  var cnt = root.querySelector('#c5-check-cnt');
  function upd() { cnt.textContent = items.filter(function (x) { return x.classList.contains('done'); }).length + ' / ' + items.length; }
  items.forEach(function (it) { it.addEventListener('click', function () { it.classList.toggle('done'); upd(); }); });
  F.bindKeys(root, {
    down: function () { var n = items.filter(function (x) { return x.classList.contains('done'); }).length; if (n < items.length) { items[n].classList.add('done'); upd(); return true; } return false; },
    up: function () { var d = items.filter(function (x) { return x.classList.contains('done'); }); if (d.length) { d[d.length - 1].classList.remove('done'); upd(); return true; } return false; }
  });
  F.onEnter(root, function () { items.forEach(function (x) { x.classList.remove('done'); }); upd(); });
  upd();
});
:::

:::notes
{timing: 1min}
[요약]
• validate 통과 후 hooks, calls를 보안팀과 리뷰
• 버전 고정과 release channel(stable, latest) 분리
• 허용 목록(strictKnownMarketplaces + disableSideloadFlags), 망분리는 seed 디렉터리
• plugin_loaded로 측정, enabledPlugins false로 롤백

플러그인을 사내 마켓플레이스에 올리기 전 체크리스트입니다. 오늘 Part 1부터 3까지 본 내용이 한 장에 모여 있습니다.
{cue: demo}
카드를 누르거나 아래 화살표로 하나씩 체크하겠습니다. validate를 통과하고 hooks와 calls를 보안팀과 리뷰했는지, 버전을 고정하고 stable과 latest 채널을 나눴는지, 허용 목록과 사이드로드 금지를 걸었는지, 망분리 경로가 필요하면 seed 디렉터리를 준비했는지, plugin_loaded로 측정하는지, 그리고 enabledPlugins를 false로 바꿔 즉시 롤백할 수 있는지입니다.
:::

---
<!-- Slide 25: Deep dive divider (PDF p25, p26 merged into slide 7) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section c5-dd">
  <span class="num">CHAPTER 05 / DEEP DIVE</span>
  <div class="name">더 알아보기</div>
  <p class="what">자주 받는 질문과 세부 설정</p>
  <ol>
    <li><b>01</b>플러그인 폴더 구성 (Part 1 구조 장표)</li>
    <li><b>02</b>마켓플레이스 소스</li>
    <li><b>03</b>조직 배포 설정</li>
    <li><b>04</b>mod 이벤트와 호출</li>
    <li><b>05</b>남이 만든 mod 리뷰</li>
    <li><b>06</b>플러그인 운영 지표</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 더 알아보기 여섯 주제: 폴더 구성, 마켓플레이스 소스, 조직 배포 설정, mod 이벤트와 호출, 남이 만든 mod 리뷰, 운영 지표
• 플러그인 폴더 구성은 본문 Part 1 구조 장표에 합쳐 둠

여기부터는 더 알아보기입니다. 질문이 나오거나 시간이 남으면 펼칩니다. 플러그인 폴더 구성은 앞의 Part 1 구조 장표에 합쳐 두었습니다.
:::

---
<!-- Slide 26: Marketplace sources (PDF p27) -->
@type: content
@fit: off

## 마켓플레이스는 네 곳에서 온다
더 알아보기, /plugin marketplace add로 등록하는 소스

:::html
<div class="fsi c5-pickrow">
  <div class="row4" data-pick="c5-src">
    <button class="pick" data-key="local"><span class="k">로컬 경로</span><span class="t">개발, 테스트</span></button>
    <button class="pick" data-key="gh"><span class="k">GitHub 저장소</span><span class="t">공개, 사내 GitHub</span></button>
    <button class="pick" data-key="git"><span class="k">git URL</span><span class="t">사내 GitLab 등</span></button>
    <button class="pick" data-key="seed"><span class="k">seed 디렉터리</span><span class="t">망분리</span></button>
  </div>
  <div class="panel" data-pick-panel="c5-src">
    <p class="hint">소스를 누르면 예시와 맞는 경우가 나옵니다.</p>
    <div data-for="local"><dl class="kv"><dt>예</dt><dd><code>~/claude-lab/ch5/marketplace</code></dd><dt>맞는 경우</dt><dd>개발, 테스트 (이 랩)</dd></dl></div>
    <div data-for="gh"><dl class="kv"><dt>예</dt><dd><code>owner/repo</code></dd><dt>맞는 경우</dt><dd>공개, 사내 GitHub</dd></dl></div>
    <div data-for="git"><dl class="kv"><dt>예</dt><dd><code>https://git.corp.example/...git</code></dd><dt>맞는 경우</dt><dd>사내 GitLab 등</dd></dl></div>
    <div data-for="seed"><dl class="kv"><dt>예</dt><dd><code>CLAUDE_CODE_PLUGIN_SEED_DIR</code></dd><dt>맞는 경우</dt><dd>망분리, 이미지에 미리 심기 (Part 2)</dd></dl></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-src'); });
:::

:::notes
{timing: 1min}
[요약]
• 로컬 경로: 개발, 테스트 (이 랩)
• GitHub 저장소: owner/repo, 공개 또는 사내 GitHub
• git URL: 사내 GitLab 등
• seed 디렉터리: 망분리, 이미지에 미리 심기

마켓플레이스 소스는 네 가지입니다.
{cue: demo}
로컬 경로는 오늘 랩처럼 개발과 테스트에, GitHub 저장소는 owner/repo 형식으로 공개나 사내 GitHub에, git URL은 사내 GitLab 같은 곳에, seed 디렉터리는 망분리 환경에 씁니다.
:::

---
<!-- Slide 27: Org deploy settings (PDF p28) -->
@type: content
@fit: off

## 사내 git으로 등록하고 강제한다
더 알아보기, 조직 배포 설정과 함께 거는 잠금

:::html
<div class="fsi c5-codelocks">
  <div>
    <p class="path">managed-settings.json</p>
<pre>{
  "extraKnownMarketplaces": {
    "fsi-internal": {
      "source": { "source": "git", "url":
        "https://git.corp.example/claude/marketplace.git" }
    }
  },
  "enabledPlugins": {
    "fsi-team-kit@fsi-internal": true
  }
}</pre>
  </div>
  <div class="locks">
    <div class="lk"><b>strictKnownMarketplaces</b><span>hostPattern으로 사내 git 허용</span></div>
    <div class="lk"><b>disableSideloadFlags</b><span>--plugin-dir 금지</span></div>
    <div class="lk"><b>allowManagedModsOnly</b><span>사용자 mod 차단</span></div>
    <div class="lk warn"><b>문제가 생기면</b><span>enabledPlugins를 false로</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 사내 git URL을 extraKnownMarketplaces로 등록, enabledPlugins true로 강제
• 함께 거는 잠금: strictKnownMarketplaces(hostPattern으로 사내 git 허용), disableSideloadFlags, allowManagedModsOnly
• 문제 시 enabledPlugins를 false로

Part 2의 예시는 GitHub였는데, 사내 git으로 등록하면 이런 모양입니다. extraKnownMarketplaces에 git 소스와 URL을 주고, enabledPlugins로 강제 설치합니다.
오른쪽은 함께 거는 잠금입니다. strictKnownMarketplaces에 hostPattern을 넣어 사내 git을 허용하고, 사이드로드를 금지하고, 사용자 mod를 차단합니다. 그리고 문제가 생기면 enabledPlugins를 false로 바꿔 즉시 막습니다.
:::

---
<!-- Slide 28: Mod events and reviewing others' mods (PDF p29, p30) -->
@type: content
@fit: off

## 남이 만든 mod에는 샌드박스가 없다
더 알아보기, validate 두 줄 읽기와 리뷰 여섯 항목

:::html
<div class="fsi c5-switch">
  <div class="sw" data-pick="c5-review">
    <button class="pick" data-key="read"><span class="t">validate 두 줄 읽기</span></button>
    <button class="pick" data-key="rev"><span class="t">남이 만든 mod 리뷰</span></button>
  </div>
  <div class="panel" data-pick-panel="c5-review">
    <div data-for="read">
      <table>
        <tr><th>항목</th><th>예 (first-mod)</th><th>읽는 법</th></tr>
        <tr><td>hooks:</td><td>session.start, tool.call</td><td>언제 끼어드는가</td></tr>
        <tr><td>hooks:</td><td>command.run{tally}, ui.render{Spinner}</td><td>커맨드, 화면 변경</td></tr>
        <tr><td>calls:</td><td>$.command.register, $.ui.invalidate</td><td>바깥에 하는 일</td></tr>
        <tr class="risk"><td>위험 신호</td><td>프로세스 실행, 네트워크 호출</td><td>calls 줄에 보이면 보안 리뷰</td></tr>
      </table>
    </div>
    <div data-for="rev">
      <table>
        <tr><th>항목</th><th>확인할 것</th></tr>
        <tr><td>출처</td><td>소스 저장소와 작성자 신뢰</td></tr>
        <tr><td>calls</td><td>프로세스, 네트워크, 파일 접근 확인</td></tr>
        <tr><td>버전 고정</td><td>자동 갱신 대신 검토한 버전</td></tr>
        <tr><td>배포 경로</td><td>managed 마켓플레이스로만</td></tr>
        <tr><td>차단 정책</td><td>allowManagedModsOnly</td></tr>
        <tr><td>모니터링</td><td>plugin_loaded 이벤트</td></tr>
      </table>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c5-review', { start: 0 }); });
:::

:::notes
{timing: 1.5min}
[요약]
• validate의 hooks 줄은 언제 끼어드는지, calls 줄은 바깥에 하는 일
• 위험 신호는 프로세스 실행과 네트워크 호출
• 남이 만든 mod 리뷰: 출처, calls, 버전 고정, 배포 경로, 차단 정책, 모니터링

남이 만든 mod에는 샌드박스가 없기 때문에 리뷰가 필수입니다.
{cue: demo}
첫 탭은 validate 출력 읽는 법입니다. first-mod 예시에서 hooks 줄은 session.start, tool.call처럼 언제 끼어드는지, command.run이나 ui.render처럼 커맨드와 화면을 바꾸는지 보여 주고, calls 줄은 바깥에 무엇을 하는지 보여 줍니다. 프로세스 실행이나 네트워크 호출이 보이면 보안 리뷰 대상입니다.
두 번째 탭은 리뷰 여섯 항목입니다. 출처, calls, 버전 고정, 배포 경로, 차단 정책, 모니터링입니다.
:::

---
<!-- Slide 29: Plugin ops metrics (PDF p31) -->
@type: content
@fit: off

## 배포 후에는 네 가지를 본다
더 알아보기, 플러그인 운영 지표

:::html
<div class="fsi c5-metrics">
  <div class="m"><b>plugin_installed</b><span class="src">OTel 이벤트</span><span class="q">누가 설치했나</span></div>
  <div class="m"><b>plugin_loaded</b><span class="src">OTel 이벤트</span><span class="q">실제로 쓰이나</span></div>
  <div class="m"><b>스킬, 에이전트 호출</b><span class="src">skill_activated, subagent_completed 이벤트</span><span class="q">어떤 구성요소가 효과적인가</span></div>
  <div class="m"><b>버전 분포</b><span class="src">설치 캐시, 이벤트 속성</span><span class="q">구버전이 남아 있나</span></div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• plugin_installed: 누가 설치했나
• plugin_loaded: 실제로 쓰이나
• 스킬, 에이전트 호출(skill_activated, subagent_completed 이벤트): 어떤 구성요소가 효과적인가
• 버전 분포(설치 캐시, 이벤트 속성): 구버전 잔존 여부

배포 후에 볼 지표 네 가지입니다.
plugin_installed로 누가 설치했는지, plugin_loaded로 실제로 쓰이는지, skill_activated와 subagent_completed 이벤트로 어떤 스킬과 에이전트가 효과적인지, 그리고 설치 캐시와 이벤트 속성으로 구버전이 남아 있는지 봅니다. OTel 수집 설정은 Ch6에서 다룹니다.
:::

---
<!-- Slide 30: Recap (PDF p32) -->
@type: content
@fit: off

## 팀의 플랫폼을 만드는 여섯 줄
Chapter 5 Key Takeaways

:::html
<div class="fsi fsi-recap">
  <div class="fsi-grid-3">
    <div class="rc"><b>01</b><span>플러그인 = 스킬 + Subagent + 훅 + MCP + mod</span></div>
    <div class="rc"><b>02</b><span>조직 배포 = 허용 목록 + 등록 + 강제 설치 + 사이드로드 금지</span></div>
    <div class="rc"><b>03</b><span>망분리는 <code>CLAUDE_CODE_PLUGIN_SEED_DIR</code></span></div>
    <div class="rc"><b>04</b><span>mod는 Claude Code 안의 JS 핸들러, 화면까지 바꿈</span></div>
    <div class="rc"><b>05</b><span>mod는 샌드박스가 없다. validate와 allowManagedModsOnly</span></div>
    <div class="rc"><b>06</b><span>Bedrock 사용자는 managed settings가 있어야 guard 로드</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 플러그인은 스킬, Subagent, 훅, MCP, mod를 묶은 배포 단위
• 조직 배포는 허용 목록, 등록, 강제 설치, 사이드로드 금지, 망분리는 seed 디렉터리
• mod는 JS 핸들러, 샌드박스가 없으니 validate와 allowManagedModsOnly
• Bedrock 사용자는 managed settings가 있어야 guard 로드

Chapter 5를 여섯 줄로 정리하겠습니다.
{cue: pause}
플러그인은 스킬, Subagent, 훅, MCP, mod를 묶은 배포 단위입니다. 조직 배포는 허용 목록, 등록, 강제 설치, 사이드로드 금지를 함께 걸고, 망분리는 seed 디렉터리로 합니다.
mod는 Claude Code 안에서 도는 JS 핸들러라 화면까지 바꾸지만 샌드박스가 없으니 validate와 allowManagedModsOnly로 통제합니다.
그리고 Bedrock 사용자는 managed settings가 있어야 내장 guard가 로드됩니다.
:::

---
<!-- Slide 31: Thank you (PDF p33) -->
@type: thankyou
@toc: toc.html
@next: 06-ch6-tokens-cost.html
@next-label: Chapter 6
@message: 다음은 점심, 그리고 Chapter 6. 토큰과 비용입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 받습니다.

:::notes
{timing: 0.5min}
[요약]
• 다음은 점심, 이어서 Chapter 6 토큰과 비용
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 이제 Super Lab을 진행하고, 점심 뒤에 Chapter 6 토큰과 비용으로 이어 가겠습니다.
질문은 Slack 워크숍 채널에 언제든 편하게 남겨 주세요.
:::
