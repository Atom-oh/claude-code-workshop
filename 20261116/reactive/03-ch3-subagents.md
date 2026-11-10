---
remarp: true
block: ch3-subagents
---
<!-- Slide 1: Cover (PDF p1) -->
@type: cover
@background: linear-gradient(120deg, var(--surface-1) 0%, var(--surface-2) 70%, var(--surface-3) 100%)

# Chapter 3. Subagent로 일 나눠 맡기기
## 역할별 에이전트로 나누고, 병렬로 맡기기 (Claude Code v2.1.319, 2026-11-08 리허설 검증, Bedrock 기준)
Choi, WooHyung
Prin. Solutions Architect
AWS Korea

:::script
(function(){function css(h){var has=Array.prototype.some.call(document.querySelectorAll('link'),function(x){return x.getAttribute('href')===h;});if(has)return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}css('assets/fsi.css');css('assets/ch4.css');if(!window.__fsiLoaded){window.__fsiLoaded=true;var s=document.createElement('script');s.src='assets/stepviz.js';document.head.appendChild(s);}})();
:::

:::notes
{timing: 0.5min}
[요약]
• Chapter 3은 Subagent로 일 나눠 맡기기, 본 흐름은 지키고 곁가지는 맡기기
• Claude Code v2.1.319 (2026-11-08 리허설 검증), Amazon Bedrock 기준
• 공식 문서 code.claude.com/docs 내용을 반영

Chapter 3, Subagent로 일 나눠 맡기기를 시작하겠습니다.
지금까지는 Claude Code 한 세션이 모든 일을 했다면, 이 챕터에서는 일을 역할별 에이전트에게 나눠 맡기고, 여러 개를 동시에 돌리는 방법을 봅니다.
강의 17분, 랩 40분입니다.
:::

---
<!-- Slide 2: Agenda (PDF p2) -->
@type: content
@fit: off

## 강의 17분, 랩 40분
세 개의 Part와 Lab, 맡기는 방법부터 병렬의 확장까지

:::html
<div class="fsi c4-agenda">
  <div class="fsi-grid-3">
    <div class="pick"><span class="k">PART 01 / 6분</span><span class="t">Subagent란</span><span class="d">네 가지 속성, 정의 파일</span></div>
    <div class="pick"><span class="k">PART 02 / 6분</span><span class="t">호출과 비용</span><span class="d">위임, 비용, 레거시 분석과 claude -p</span></div>
    <div class="pick"><span class="k">PART 03 / 5분</span><span class="t">병렬의 확장</span><span class="d">Agent teams, Workflows, Worktrees</span></div>
  </div>
  <div class="fsi-grid-2">
    <div class="pick lab"><span class="k">LAB / 40분</span><span class="t">첫 Subagent와 권한 격리</span><span class="d">TASK 00부터 04, 선택 05</span></div>
    <div class="pick more"><span class="k">MORE</span><span class="t">더 알아보기</span><span class="d">정의 파일 필드, 내장 Subagent, Subagent vs 스킬, CI, 병렬의 비용</span></div>
  </div>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 강의는 세 Part, 6분 6분 5분으로 17분
• 랩 40분: 첫 Subagent와 권한 격리, TASK 00부터 04, 선택 05
• 더 알아보기는 시간이 남거나 질문이 나올 때

오늘 순서입니다. 첫째, Subagent가 무엇인지 네 가지 속성과 정의 파일로 봅니다. 둘째, 어떻게 맡기고 얼마나 드는지, 셋째, Subagent 다음 단계인 더 큰 병렬화 수단을 봅니다.
강의는 짧게 17분이고, 이어서 40분 동안 첫 Subagent를 직접 만들고 권한 격리를 확인합니다.
:::

---
<!-- Slide 3: Section + pre-survey (PDF p3, p4) -->
@type: content
@fit: off

## 가장 듣고 싶은 주제 1위
사전 설문 기대 주제, 그래서 강의 17분 + 필수 랩 40분

:::html
<div class="fsi c4-survey">
  <div>
    <span class="eyebrow">PRE-SURVEY #1</span>
    <div class="num"><span id="c4-survey-num">84</span><small>표</small></div>
    <p class="lead">기대 주제 1위는 <b>Subagent</b>였습니다.</p>
    <p class="why">가장 많이 듣고 싶어 한 주제라 강의는 17분으로 줄이고 <b>필수 랩 40분</b>을 잡았습니다.</p>
  </div>
  <div class="split" id="c4-split">
    <div class="half"><span>강의 17분</span><span class="tr"><i data-w="17"></i></span></div>
    <div class="half"><span>필수 랩 40분</span><span class="tr"><i class="lab" data-w="40"></i></span></div>
    <p class="cap">막대 길이는 필수 랩 40분을 기준으로 한 상대 길이</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  F.countUp('#c4-survey-num', 84, { decimals: 0 });
  var host = document.getElementById('c4-split');
  var bars = Array.prototype.slice.call(host.querySelectorAll('i'));
  function grow(on) { bars.forEach(function (b) { b.style.width = on ? (b.dataset.w / 40 * 100) + '%' : '0'; }); }
  F.onEnter(host, function () { grow(false); setTimeout(function () { grow(true); }, 80); });
  grow(true);
});
:::

:::notes
{timing: 0.5min}
[요약]
• 사전 설문 기대 주제 1위가 Subagent, 84표
• 그래서 강의 17분 + 필수 랩 40분으로 배정
• 주제는 격리, 위임, 병렬, 비용

사전 설문에서 가장 듣고 싶은 주제를 여쭤봤는데, 1위가 Subagent로 84표였습니다.
그래서 이 챕터는 강의를 17분으로 줄이고 필수 랩을 40분으로 잡았습니다. 오늘 이야기는 격리, 위임, 병렬, 비용 네 단어로 정리됩니다.

[출처]
• 이번 워크숍 사전 설문, 기대 주제 문항
:::

---
<!-- Slide 4: Part 01 divider (PDF p5) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 03 / PART 01</span>
  <div class="name">Subagent란</div>
  <p class="what">본 흐름을 잃지 않고 곁가지를 맡기는 공간</p>
  <ol>
    <li><b>01</b>네 가지 속성</li>
    <li><b>02</b>정의 파일 한 장</li>
    <li><b>03</b>정의 파일이 사는 곳</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 1은 Subagent가 무엇인지
• 네 가지 속성, 정의 파일, 저장 위치 순서

첫 번째 Part입니다. Subagent는 본 흐름을 잃지 않고 곁가지 일을 맡기는 공간입니다.
무엇이 다른지 네 가지 속성으로 보고, 그 속성을 정하는 정의 파일 한 장과 그 파일을 어디에 두는지 보겠습니다.
:::

---
<!-- Slide 5: Four properties (PDF p6) -->
@type: content
@fit: off

## 곁가지는 맡기고, 요약만 받는다
Subagent의 네 가지 속성과 그 효과

:::html
<div id="c4-sv-props"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:470,h:410,l:'메인 대화'},{x:560,y:40,w:600,h:410,l:'SUBAGENT',tone:'info'}];
  function M(ctx) { return {id:'m',x:70,y:110,w:370,h:96,t:'메인 세션',s:'본 흐름, 사용자와 대화',c:'accent',ctx:ctx}; }
  var R = {id:'r',x:70,y:300,w:370,h:90,t:'받은 요약',s:'결론과 근거 몇 줄',c:'success'};
  F.stepviz('#c4-sv-props', [
    {kicker:'CONTEXT', title:'자기 컨텍스트: 메인 대화와 분리된 창',
     body:'Subagent는 <b>메인 대화와 분리된 컨텍스트 창</b>에서 일합니다. 그래서 곁가지 작업의 내용이 본 흐름과 <b>섞이지 않습니다</b>.',
     facts:['<b>격리</b> 맥락이 섞이지 않음','메인 대화는 작게 유지','곁가지 작업은 Subagent 창에서'],
     zones:Z,
     nodes:[M(.3),{id:'s',x:620,y:110,w:480,h:96,t:'Subagent 컨텍스트',s:'메인과 분리된 창',c:'info',ctx:.75}],
     hot:['m','s'],
     edges:[{f:'m',t:'s',c:'info',l:'맡길 일',o:0}],
     snip:{hd:'두 개의 창',path:'개념도',lines:['메인 대화      사용자와의 본 흐름','Subagent 창    맡은 일만 담는 별도 창','','# 두 창의 내용은 섞이지 않습니다'],hl:[1,2],note:'게이지는 각 창이 채워지는 정도를 나타낸 <b>설명용 그림</b>입니다.'}},
    {kicker:'PROMPT', title:'전용 지침: 역할에 맞춘 시스템 프롬프트',
     body:'각 Subagent는 <b>역할에 맞춘 시스템 프롬프트</b>를 따로 가집니다. 소비 분석가, 리스크 리뷰어처럼 역할마다 지침이 다릅니다.',
     facts:['역할마다 짧은 전용 지침','정의 파일 본문이 곧 시스템 프롬프트','메인의 긴 지침을 물려받지 않음'],
     zones:Z,
     nodes:[M(.3),{id:'s',x:620,y:110,w:480,h:96,t:'Subagent 컨텍스트',s:'메인과 분리된 창',c:'info',ctx:.75},{id:'p',x:620,y:290,w:480,h:96,t:'전용 시스템 프롬프트',s:'소비 데이터를 읽는 고객 분석가',c:'info'}],
     hot:['s','p'],
     edges:[{f:'p',t:'s',c:'info',l:'역할 지침',o:0}],
     snip:{hd:'정의 파일 본문 (다음 장)',path:'.claude/agents/spending-analyst.md',lines:['---','name: spending-analyst','---','당신은 소비 데이터를 읽는 고객 분석가입니다.','# 분석 순서','1. 대상 고객 그룹을 customers.csv에서 고릅니다.'],hl:[4,5,6],note:'frontmatter 아래 본문이 그 Subagent의 시스템 프롬프트가 됩니다.'}},
    {kicker:'TOOLS', title:'좁힌 도구: 필요한 도구만 허용',
     body:'Subagent에는 <b>필요한 도구만 허용</b>합니다. Edit, Write가 없으면 그 Subagent는 <b>파일을 만들거나 고칠 수 없습니다</b>. 읽기 전용 에이전트가 이렇게 만들어집니다.',
     facts:['<b>보안</b> 읽기 전용 에이전트','허용 목록에 없는 도구는 존재하지 않음','Bash도 없어 명령을 실행할 수 없음'],
     zones:Z,
     nodes:[M(.3),{id:'s',x:620,y:90,w:480,h:90,t:'risk-reviewer',s:'tools: 허용 목록',c:'info'},{id:'t1',x:620,y:240,w:150,h:76,t:'Read',c:'success'},{id:'t2',x:785,y:240,w:150,h:76,t:'Grep',c:'success'},{id:'t3',x:950,y:240,w:150,h:76,t:'Glob',c:'success'},{id:'t4',x:620,y:350,w:480,h:76,t:'Write, Edit, Bash 없음',s:'목록에 없어 쓸 수 없음',c:'danger'}],
     hot:['s','t1','t2','t3','t4'],
     edges:[{f:'s',t:'t1',c:'success',o:0,side:'v'},{f:'s',t:'t2',c:'success',o:1,side:'v'},{f:'s',t:'t3',c:'success',o:2,side:'v'}],
     stagger:0.3,
     snip:{hd:'허용 목록',path:'.claude/agents/risk-reviewer.md',lines:['tools: Read, Grep, Glob','','# Write, Edit가 없으므로 저장도 수정도 할 수 없음','# Bash가 없으므로 명령도 실행할 수 없음'],hl:[1],note:'빨간 상자는 <b>허용 목록에 없어 쓸 수 없는</b> 도구입니다.'}},
    {kicker:'SUMMARY', title:'요약만 반환: 전체 출력은 안에 남습니다',
     body:'Subagent가 읽은 데이터 파일과 중간 출력은 <b>Subagent 안에 남고</b>, 메인에는 <b>요약만</b> 돌아옵니다. 장황한 출력이 메인 대화를 채우지 않습니다.',
     facts:['<b>비용</b> 장황한 출력을 밖에 둠','메인 컨텍스트 절약','<b>재사용</b> 정의 파일은 커밋 자산'],
     zones:Z,
     nodes:[M(.35),R,{id:'s',x:620,y:110,w:480,h:96,t:'Subagent 컨텍스트',s:'데이터 파일, 중간 출력 전체',c:'info',ctx:.9},{id:'o',x:620,y:300,w:480,h:90,t:'전체 출력',s:'메인으로 넘어가지 않음',c:'muted'}],
     hot:['m','r','s'],
     edges:[{f:'m',t:'s',c:'info',l:'맡길 일',o:0},{f:'s',t:'r',c:'success',l:'요약만',o:1},{f:'s',t:'o',c:'muted',dash:true}],
     loop:true, stagger:1,
     snip:{hd:'돌아오는 것',path:'예시 요약 (출력 형식은 정의 파일 본문대로)',lines:['risk-reviewer 결과','근거     PASS  주장마다 pseudo/ 파일과 열 확인','PII 노출  WARN  segments.md:12 ID 형태 값 의심','','# 읽은 파일 전체는 Subagent 안에 남음'],hl:[1,2,3],note:'요약 내용은 <b>설명용 예시</b>입니다.'}}
  ], {legend:[['accent','메인 세션'],['info','Subagent'],['success','허용, 반환'],['danger','허용되지 않음'],['muted','메인으로 넘어가지 않는 출력']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• 자기 컨텍스트: 메인 대화와 분리된 창, 맥락이 섞이지 않음(격리)
• 전용 지침: 역할에 맞춘 시스템 프롬프트
• 좁힌 도구: 필요한 도구만, 읽기 전용 에이전트(보안)
• 요약만 반환: 장황한 출력은 밖에(비용), 정의 파일은 커밋 자산(재사용)

{cue: demo}
Subagent의 네 가지 속성을 단계별로 보겠습니다. 오늘 배울 모든 것의 출발점입니다.
첫째, 자기 컨텍스트. Subagent는 메인 대화와 분리된 창에서 일합니다. 그래서 곁가지 내용이 본 흐름과 섞이지 않습니다.
둘째, 전용 지침. 역할에 맞춘 시스템 프롬프트를 따로 가집니다.
셋째, 좁힌 도구. 랩의 risk-reviewer처럼 Read, Grep, Glob만 주면 Write, Edit가 없어서 파일을 만들거나 고칠 수 없는, 읽기 전용 에이전트가 됩니다. 금융권에서는 이게 보안 장치입니다.
넷째, 요약만 반환. 읽은 데이터 파일과 중간 출력은 Subagent 안에 남고 메인에는 요약만 옵니다. 장황한 출력이 메인 컨텍스트를 채우지 않으니 비용도 아낍니다.
:::

---
<!-- Slide 6: Definition file (PDF p7) -->
@type: content
@fit: off

## frontmatter 몇 줄이면 역할이 된다
정의 파일 한 장, 필드를 누르면 해당 줄이 켜짐

:::html
<div class="fsi c4-def">
  <div class="file">
    <span class="path">.claude/agents/spending-analyst.md</span>
<pre id="c4-def-code"><span data-f="fm">---</span><span data-f="name">name: spending-analyst</span><span data-f="desc">description: |</span><span data-f="desc">  고객 또는 고객 그룹의 소비 패턴과 생애 단계를 추정하는 소비 분석가.</span><span data-f="desc">  월별 카드 소비 요약, 계좌 잔액, 고객 기본 정보를 근거로 삼음.</span><span data-f="desc">  사용 시점: 소비 성향, 선호 카테고리, 연령대별 생애 단계 분석이 필요한 경우.</span><span data-f="tools">tools: Read, Grep, Glob, Bash(python3:*)</span><span data-f="model">model: sonnet</span><span data-f="fm">---</span><span data-f="body">당신은 소비 데이터를 읽는 고객 분석가입니다.</span><span data-f="body"># 분석 순서: 그룹 고르기, python3로 집계, 생애 단계 추정</span><span data-f="body"># 출력 형식: 집계만 보고, 개별 고객 ID와 토큰 값은 쓰지 않음</span></pre>
    <p class="cap">맨 위 --- 사이가 <span class="rp-detail" tabindex="0" data-tip="설정 머리말. 파일 맨 위 --- 두 줄 사이에 적는 key: value 설정">frontmatter</span>이고, 그 아래가 본문입니다. 본문은 줄여서 보여 줍니다.</p>
  </div>
  <div class="side">
    <div class="fsi-stack" data-pick="c4-def">
      <button class="pick" data-key="name"><span class="k">name</span><span class="t">호출 이름</span></button>
      <button class="pick" data-key="desc"><span class="k">description</span><span class="t">자동 위임의 근거</span></button>
      <button class="pick" data-key="tools"><span class="k">tools</span><span class="t">쓸 수 있는 도구 목록</span></button>
      <button class="pick" data-key="model"><span class="k">model</span><span class="t">모델 선택</span></button>
      <button class="pick" data-key="body"><span class="k">본문</span><span class="t">시스템 프롬프트</span></button>
    </div>
    <div class="panel" data-pick-panel="c4-def">
      <p class="hint">필드를 누르면 왼쪽 파일에서 해당 줄이 켜집니다.</p>
      <div data-for="name"><p><b>name</b>은 호출 이름입니다. @ 입력 후 목록에서 고를 때 보이는 이름이라, 역할이 드러나는 짧은 이름이 좋습니다.</p></div>
      <div data-for="desc"><p><b>description</b>은 Claude가 <b>자동으로 맡길지 판단하는 근거</b>입니다. 예시처럼 소비 패턴과 생애 단계 분석이라는 일과, 언제 쓰는지까지 구체적으로 적습니다.</p></div>
      <div data-for="tools"><p><b>tools</b>는 쓸 수 있는 도구 목록입니다. Edit, Write가 없으니 파일을 고칠 수 없고, Bash는 python3으로 시작하는 명령만 허용됩니다.</p></div>
      <div data-for="model"><p><b>model</b>은 sonnet, opus, haiku, fable, 전체 모델 ID, inherit 중에서 고릅니다. 단순 작업은 haiku가 좋습니다.</p></div>
      <div data-for="body"><p>frontmatter 아래 <b>본문이 시스템 프롬프트</b>입니다. 사용할 데이터, 분석 순서, 출력 형식을 명시합니다.</p></div>
    </div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var lines = Array.prototype.slice.call(document.querySelectorAll('#c4-def-code span'));
  F.pick('c4-def', { onShow: function (key) {
    lines.forEach(function (l) { l.classList.toggle('on', l.dataset.f === key); });
  }});
});
:::

:::notes
{timing: 1min}
[요약]
• 정의 파일은 frontmatter 몇 줄 + 본문
• name은 호출 이름, description은 자동 위임의 근거
• tools는 쓸 수 있는 도구 목록(Edit, Write 없음 = 수정 불가, Bash는 python3만)
• model은 sonnet, opus, haiku, fable, 전체 모델 ID, inherit
• 본문이 시스템 프롬프트(사용할 데이터, 분석 순서, 출력 형식)

{cue: demo}
Subagent는 정의 파일 한 장으로 만듭니다. 화면은 오늘 랩 TASK 01에서 만드는 spending-analyst입니다. 오른쪽 필드를 하나씩 눌러 보겠습니다.
name은 호출 이름이고, description은 Claude가 이 에이전트에게 자동으로 맡길지 판단하는 근거입니다. 그래서 무엇을, 언제 쓰는지까지 구체적으로 적습니다.
tools에는 Edit, Write가 없어서 이 에이전트는 파일을 고칠 수 없고, Bash도 python3 집계만 됩니다. model은 sonnet, opus, haiku, fable, 전체 모델 ID, inherit 중에서 고르고, 마지막으로 본문이 시스템 프롬프트입니다.

[약어]
• frontmatter: 파일 맨 위 --- 사이의 설정 머리말
:::

---
<!-- Slide 7: Where definitions live (PDF p8) -->
@type: content
@fit: off

## 두는 곳이 공유 범위를 정한다
정의 파일이 사는 네 곳

:::html
<div class="fsi fsi-split c4-loc">
  <div class="fsi-stack" data-pick="c4-loc">
    <button class="pick" data-key="proj"><span class="k">.claude/agents/</span><span class="t">저장소를 받는 팀 전체</span></button>
    <button class="pick" data-key="user"><span class="k">~/.claude/agents/</span><span class="t">내 PC의 모든 프로젝트</span></button>
    <button class="pick" data-key="plugin"><span class="k">플러그인 agents/</span><span class="t">플러그인 설치자</span></button>
    <button class="pick" data-key="flag"><span class="k">--agents 플래그</span><span class="t">이번 세션</span></button>
  </div>
  <div class="panel" data-pick-panel="c4-loc">
    <p class="hint">위치를 누르면 용도와 배포 방법이 나옵니다.</p>
    <div data-for="proj"><h4>프로젝트 표준 에이전트</h4><p>저장소에 커밋하면 그 저장소를 받는 팀 전체가 같은 에이전트를 씁니다.</p><p><span class="tag ok">배포</span>저장소에 커밋</p></div>
    <div data-for="user"><h4>개인 도구</h4><p>내 PC의 모든 프로젝트에서 쓰는 개인 에이전트입니다. 팀과 공유되지 않습니다.</p><p><span class="tag info">배포</span>개인</p></div>
    <div data-for="plugin"><h4>팀 킷 배포</h4><p>플러그인 안의 agents/ 폴더에 두면, 그 플러그인을 설치한 사용자가 씁니다.</p><p><span class="tag info">Ch4</span>마켓플레이스로 배포</p></div>
    <div data-for="flag"><h4>실험과 CI</h4><p>--agents 플래그로 이번 세션에만 정의합니다. 실험이나 <span class="rp-detail" tabindex="0" data-tip="Continuous Integration. 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인">CI</span>용입니다.</p><p><span class="tag cond">주의</span><span class="rp-detail" tabindex="0" data-tip="회사가 정한 배포 경로를 거치지 않고 정의를 직접 실어 오는 것">사이드로드</span> 금지 대상</p></div>
    <p class="foot c4-foot">/agents (v2.1.198+)는 안내 문구만 출력합니다. 확인은 @ 입력, 생성과 수정은 파일 편집이나 Claude에게 요청합니다.</p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c4-loc'); });
:::

:::notes
{timing: 1min}
[요약]
• .claude/agents/: 팀 전체, 저장소에 커밋하는 프로젝트 표준
• ~/.claude/agents/: 내 PC의 모든 프로젝트, 개인 도구
• 플러그인 agents/: 설치자, Ch4 팀 킷 배포
• --agents 플래그: 이번 세션, 실험과 CI(사이드로드 금지 대상)
• /agents (v2.1.198+)는 안내 문구만, 확인은 @, 생성과 수정은 파일 편집이나 Claude에게

정의 파일은 어디에 두느냐가 공유 범위를 정합니다.
{cue: demo}
.claude/agents/에 두고 커밋하면 저장소를 받는 팀 전체가 쓰는 표준 에이전트가 됩니다. 홈 디렉터리 아래 ~/.claude/agents/는 내 PC의 모든 프로젝트에서 쓰는 개인 도구입니다.
플러그인 안의 agents/는 플러그인 설치자에게 배포되고, 이건 Ch4에서 팀 킷으로 묶습니다. --agents 플래그는 이번 세션에만 쓰는 실험이나 CI용이고, 사이드로드 금지 대상입니다.
참고로 /agents 명령은 v2.1.198부터 안내 문구만 출력합니다. 목록 확인은 @ 입력으로, 만들고 고치는 건 파일 편집이나 Claude에게 요청하시면 됩니다.

[약어]
• CI: Continuous Integration, 코드 변경마다 빌드와 테스트를 자동으로 돌리는 파이프라인
:::

---
<!-- Slide 8: Quick check 1 (PDF p9) -->
@type: content
@fit: off

## 읽기 전용 에이전트가 고치려 하면?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c4-qc-1">
  <p class="q">tools에 Write가 없는 risk-reviewer에게 점검 결과를 파일로 저장하라고 하면?</p>
  <div class="opts">
    <button class="opt"><b>A</b>저장된다</button>
    <button class="opt"><b>B</b>확인을 요청한다</button>
    <button class="opt right"><b>C</b>도구가 없어 저장할 수 없다</button>
    <button class="opt"><b>D</b>스스로 tools에 Write를 추가한다</button>
  </div>
  <p class="ans">정답 C. 허용 목록에 없는 도구는 그 Subagent에 존재하지 않습니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c4-qc-1'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 C, 도구가 없어 저장할 수 없음
• 허용 목록에 없는 도구는 그 Subagent에 존재하지 않음

퀴즈입니다. 손을 들어 답해 주세요. tools에 Write가 없는 risk-reviewer에게 점검 결과를 파일로 저장하라고 하면 어떻게 될까요?
{cue: pause}
정답은 C입니다. 확인을 묻는 것도 아니고 스스로 권한을 늘리는 것도 아닙니다. 허용 목록에 없는 도구는 그 Subagent에 아예 존재하지 않습니다. 랩 TASK 02에서 직접 확인합니다. 메인이 대신 저장하는 경우가 있는데, 그건 메인 세션의 권한으로 한 일입니다.
:::

---
<!-- Slide 9: Part 02 divider (PDF p10) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 03 / PART 02</span>
  <div class="name">호출과 비용</div>
  <p class="what">어떻게 맡기고, 얼마나 드는가</p>
  <ol>
    <li><b>01</b>위임 세 방식</li>
    <li><b>02</b>Subagent와 비용</li>
    <li><b>03</b>레거시 분석과 claude -p</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 2는 어떻게 맡기고 얼마나 드는지
• 위임 세 방식, 비용, 레거시 분석과 대화 없는 실행

두 번째 Part입니다. 만든 에이전트에게 어떻게 일을 맡기는지, 그리고 그때 비용은 어떻게 되는지 보겠습니다.
설문에서 많이 고르신 레거시 현대화와 CLI 파이프라인 활용도 함께 짚겠습니다.
:::

---
<!-- Slide 10: Three ways to delegate (PDF p11) -->
@type: content
@fit: off

## 맡기는 방법이 통제 수준을 정한다
위임 세 방식과 foreground, background

:::html
<div id="c4-sv-deleg"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var Z = [{x:20,y:40,w:1140,h:410,l:'메인 세션'}];
  var U = {id:'u',x:60,y:80,w:300,h:90,t:'사용자 요청',s:'',c:'warning'};
  var M = {id:'m',x:440,y:80,w:300,h:90,t:'메인 Claude',s:'누구에게 맡길지',c:'accent'};
  function S(id, x, t, s) { return {id:id,x:x,y:300,w:300,h:90,t:t,s:s,c:'info'}; }
  F.stepviz('#c4-sv-deleg', [
    {kicker:'1 자동 위임', title:'description을 보고 Claude가 판단',
     body:'사용자가 에이전트를 지목하지 않아도, Claude가 각 정의 파일의 <b>description을 읽고</b> 맞는 에이전트에게 맡깁니다. 그래서 description을 구체적으로 써야 합니다.',
     facts:['판단 주체: 메인 Claude','근거: description','통제 수준: 가장 낮음'],
     zones:Z,
     nodes:[{id:'u',x:60,y:80,w:300,h:90,t:'사용자 요청',s:'IRP 보유 현황 분석해 줘',c:'warning'},M,S('a',60,'spending-analyst','해당 없음'),S('b',440,'portfolio-analyst','description이 맞음'),S('c',820,'risk-reviewer','해당 없음')],
     hot:['u','m','b'],
     edges:[{f:'u',t:'m',c:'warning',o:0},{f:'m',t:'b',c:'info',l:'description 일치',o:1},{f:'m',t:'a',c:'muted',dash:true},{f:'m',t:'c',c:'muted',dash:true}],
     snip:{hd:'자동 위임',path:'랩 TASK 04 패턴 A',lines:['> 40~55세 고소득 고객이 IRP를 얼마나','  갖고 있는지, 노후 준비 격차를 분석해 줘','','# Claude가 description을 보고 판단','portfolio-analyst 에게 위임'],hl:[1,2,5],note:'description이 모호하면 <b>엉뚱한 에이전트</b>에게 가거나, 메인이 직접 처리하고 아무에게도 맡기지 않습니다.'}},
    {kicker:'2 @ 멘션 지목', title:'@ 입력 후 목록에서 에이전트 선택',
     body:'<b>@</b>를 입력하면 등록된 에이전트 목록이 나오고, 골라서 지목합니다. 입력란에는 <b>@"risk-reviewer (agent)"</b>처럼 들어갑니다. 규제 작업처럼 <b>반드시 그 에이전트가 해야 하는 일</b>에 씁니다.',
     facts:['판단 주체: 사용자','@ 입력으로 등록된 에이전트 확인','규제 작업은 명시 호출'],
     zones:Z,
     nodes:[{id:'u',x:60,y:80,w:300,h:90,t:'사용자 요청',s:'@ 입력 후 선택',c:'warning'},M,S('a',60,'spending-analyst',''),S('b',440,'portfolio-analyst',''),S('c',820,'risk-reviewer','지목됨')],
     hot:['u','m','c'],
     edges:[{f:'u',t:'m',c:'warning',o:0},{f:'m',t:'c',c:'warning',l:'@ 멘션',o:1}],
     snip:{hd:'명시 호출',path:'예시 대화',lines:['> @"risk-reviewer (agent)" pseudo/ CSV에','  식별자 형태의 값이 남았는지 점검해 줘','','# 사용자가 지목, 판단 생략','risk-reviewer 실행'],hl:[1,2],note:'랩 패턴 B는 <b>risk-reviewer 에이전트를 사용해서</b>처럼 이름을 적어 지정하고, <b>@agent-portfolio-analyst</b>처럼 쓰는 형태도 봅니다. 누가 했는지가 분명해서 감사 관점에서 설명하기 쉽습니다.'}},
    {kicker:'3 병렬 디스패치', title:'여러 Subagent를 동시에 실행',
     body:'메인이 <b>여러 Subagent를 동시에</b> 실행합니다. 각자 자기 창에서 돌고, 메인에는 요약이 모입니다.',
     facts:['동시에 실행','각자 자기 컨텍스트','결과는 요약으로 모임'],
     zones:Z,
     nodes:[U,M,S('a',60,'spending-analyst','세그먼트 (c) 소비'),S('b',440,'portfolio-analyst','세그먼트 (a)(b) 자산'),S('c',820,'risk-reviewer','근거, PII 점검')],
     hot:['u','m','a','b','c'],
     edges:[{f:'u',t:'m',c:'warning',o:0},{f:'m',t:'a',c:'info',o:1},{f:'m',t:'b',c:'info',o:1},{f:'m',t:'c',c:'info',o:1}],
     stagger:0.7, loop:true,
     snip:{hd:'한 번에 세 개',path:'랩 TASK 04 패턴 C, 요청은 줄임',lines:['> 고객을 세그먼트로 나누는 segments.md를','  작성해 줘. 세 에이전트를 병렬로 진행해 줘','','spending-analyst   실행 중','portfolio-analyst  실행 중','risk-reviewer      실행 중'],hl:[4,5,6],note:'비용은 Part 3 뒤 <b>더 알아보기, 병렬의 비용</b>에서 봅니다.'}},
    {kicker:'FOREGROUND / BACKGROUND', title:'기다릴지, 다른 일을 계속할지',
     body:'<b>foreground</b>는 결과를 기다리고, <b>background</b>는 Subagent가 도는 동안 메인에서 <b>다른 일을 계속</b>합니다.',
     facts:['foreground: 결과를 기다림','background: 다른 일을 계속','어느 쪽이든 요약이 돌아옴'],
     zones:[{x:20,y:40,w:560,h:410,l:'FOREGROUND'},{x:600,y:40,w:560,h:410,l:'BACKGROUND',tone:'info'}],
     nodes:[{id:'f1',x:70,y:100,w:460,h:84,t:'메인: 결과 대기',s:'Subagent가 끝날 때까지',c:'accent'},{id:'f2',x:70,y:300,w:460,h:84,t:'Subagent 실행',s:'',c:'info'},
            {id:'b1',x:650,y:100,w:460,h:84,t:'메인: 다른 일 계속',s:'사용자와 대화 진행',c:'accent'},{id:'b2',x:650,y:300,w:460,h:84,t:'Subagent 실행',s:'뒤에서 진행',c:'info'}],
     edges:[{f:'f1',t:'f2',c:'info',side:'v',curve:-90,o:0,l:'맡김'},{f:'f2',t:'f1',c:'success',side:'v',curve:90,o:1,l:'결과'},{f:'b1',t:'b2',c:'info',side:'v',curve:-90,o:0,l:'맡김'},{f:'b2',t:'b1',c:'success',side:'v',curve:90,o:2,l:'끝나면 요약'}],
     loop:true, stagger:1,
     snip:{hd:'두 가지 실행 방식',path:'',lines:[],hl:[],note:'긴 조사는 background로 돌리고 메인에서 다른 일을 이어 가면 좋습니다.'}},
    {kicker:'요약 반환', title:'어느 방식이든 메인에는 요약만',
     body:'세 방식 모두 결과는 <b>요약으로 반환</b>됩니다. 메인 컨텍스트가 절약되는 이유입니다.',
     facts:['자동 위임: description','@ 멘션: 사용자가 지목','병렬: 동시에, 요약을 모음'],
     zones:Z,
     nodes:[U,M,S('a',60,'spending-analyst','요약'),S('b',440,'portfolio-analyst','요약'),S('c',820,'risk-reviewer','요약'),{id:'r',x:820,y:80,w:300,h:90,t:'종합',s:'메인이 segments.md 작성',c:'success'}],
     hot:['m','a','b','c','r'],
     edges:[{f:'a',t:'m',c:'success',o:0},{f:'b',t:'m',c:'success',o:0},{f:'c',t:'m',c:'success',o:0},{f:'m',t:'r',c:'success',o:1}],
     stagger:0.8, loop:true,
     snip:{hd:'메인에 남는 것',path:'예시',lines:['spending-analyst   (c) 소비 패턴, 생애 단계','portfolio-analyst  (a)(b) 노후 준비 격차','risk-reviewer      근거와 PII 점검 PASS','','# 세 에이전트는 Write가 없어 메인이 파일을 씀'],hl:[1,2,3],note:'요약 내용은 <b>설명용 예시</b>입니다.'}}
  ], {legend:[['warning','사용자'],['accent','메인'],['info','Subagent'],['success','요약 반환']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• 자동 위임: description을 보고 Claude가 판단
• @ 멘션 지목: @ 입력 후 목록에서 선택, @"risk-reviewer (agent)", 규제 작업에 적합
• 병렬 디스패치: 여러 Subagent를 동시에
• foreground는 결과를 기다리고 background는 다른 일을 계속, 결과는 요약 반환

{cue: demo}
맡기는 방법은 세 가지이고, 방법에 따라 통제 수준이 다릅니다.
첫째, 자동 위임입니다. 사용자가 지목하지 않아도 Claude가 description을 읽고 맞는 에이전트에게 맡깁니다. IRP 보유 현황을 물으면 portfolio-analyst가 선택되는 식입니다. 다만 간단한 질문은 메인이 직접 처리하기도 해서, 위임이 보장되지는 않습니다.
둘째, @ 멘션입니다. @를 입력하고 목록에서 에이전트를 고르면 입력란에 따옴표로 묶인 이름이 들어갑니다. 사용자가 직접 지목하니 판단 단계가 없습니다. 금융권 규제 작업처럼 반드시 그 에이전트가 해야 하는 일은 이 방식을 권합니다.
셋째, 병렬 디스패치. 여러 Subagent를 동시에 돌립니다. 랩에서는 세 에이전트를 한 번에 띄우고, Write가 없는 에이전트 대신 메인이 요약을 모아 segments.md를 씁니다.
실행 방식은 결과를 기다리는 foreground와, 그동안 다른 일을 계속하는 background가 있고, 어느 쪽이든 메인에는 요약만 돌아옵니다.
:::

---
<!-- Slide 11: Subagents and cost (PDF p12) -->
@type: content
@fit: off

## 컨텍스트는 아끼고, 요청은 따로 나간다
Subagent와 비용, 모델 상속 시뮬레이터

:::html
<div class="fsi c4-model" id="c4-model">
  <div class="col">
    <h4>아끼는 것</h4>
    <div class="it">테스트 로그, 문서 같은 장황한 출력이 메인 대화에 남지 않음</div>
    <div class="it">메인 컨텍스트가 작게 유지됨</div>
    <div class="it">역할별로 짧은 지침</div>
    <h4 class="cost">드는 것</h4>
    <div class="it">Subagent의 요청도 사용량에 포함</div>
    <div class="it">Bedrock 계정에 Haiku가 활성화돼 있는지 확인</div>
  </div>
  <div class="sim">
    <div class="row main"><span class="nm">메인 세션<small>/model</small></span><span class="md" id="c4-m-main">Sonnet</span></div>
    <div class="row"><span class="nm">상속 에이전트 (예시)<small>model: inherit</small></span><span class="md" id="c4-m-inh">Sonnet</span></div>
    <div class="row"><span class="nm">요약 에이전트 (예시)<small>model: haiku</small></span><span class="md">Haiku</span></div>
    <button class="btn btn-primary" data-cycle>메인 모델 바꾸기</button>
    <p class="msg" id="c4-m-msg"></p>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var st = [
    { main: 'Sonnet', msg: 'inherit 에이전트는 메인 모델을 따라갑니다. 지금은 둘 다 Sonnet입니다.' },
    { main: 'Opus', msg: '메인을 Opus로 바꾸면 상속하는 Subagent도 Opus가 됩니다. 단순 작업은 model: haiku로 고정해 두세요.' }
  ];
  var mm = document.getElementById('c4-m-main'), mi = document.getElementById('c4-m-inh'), msg = document.getElementById('c4-m-msg');
  F.cycle('#c4-model', st.length, function (i) {
    mm.textContent = st[i].main; mi.textContent = st[i].main; msg.textContent = st[i].msg;
    mm.classList.toggle('up', i === 1); mi.classList.toggle('up', i === 1);
  });
});
:::

:::notes
{timing: 1min}
[요약]
• 아끼는 것: 장황한 출력이 메인에 남지 않음, 메인 컨텍스트 작게, 역할별 짧은 지침
• 드는 것: Subagent의 요청도 사용량에 포함
• 메인을 Opus로 바꾸면 상속하는 Subagent도 Opus, 단순 작업은 model: haiku
• Bedrock 계정에 Haiku 활성화 여부 확인

Subagent는 컨텍스트는 아끼지만 요청은 따로 나갑니다.
아끼는 쪽부터 보면, 테스트 로그나 문서 같은 장황한 출력이 메인 대화에 남지 않아서 메인 컨텍스트가 작게 유지됩니다.
드는 쪽은, Subagent의 요청도 사용량에 포함된다는 점입니다.
{cue: demo}
오른쪽 버튼으로 메인 모델을 바꿔 보겠습니다. model이 inherit인 에이전트는 메인을 따라가서, 메인을 Opus로 바꾸면 함께 Opus가 됩니다. 단순 작업은 model: haiku로 고정해 두시고, 이때 Bedrock 계정에 Haiku가 활성화돼 있는지 먼저 확인하셔야 합니다.
:::

---
<!-- Slide 12: Legacy analysis (PDF p13) -->
@type: content
@fit: off

## 레거시는 바꾸기 전에 나눠 읽는다
레거시 현대화를 고른 40명이 가장 먼저 해 볼 방법

:::html
<div class="fsi c4-legacy">
  <div class="fsi-grid-4" data-pick="c4-legacy">
    <button class="pick" data-key="plan"><span class="k">PLAN</span><span class="t">plan 모드로 계획 먼저</span></button>
    <button class="pick" data-key="explore"><span class="k">EXPLORE</span><span class="t">Explore로 넓게 훑기</span></button>
    <button class="pick" data-key="parallel"><span class="k">PARALLEL</span><span class="t">모듈별로 나눠 분석</span></button>
    <button class="pick" data-key="rules"><span class="k">RULES</span><span class="t">규칙은 CLAUDE.md에</span></button>
  </div>
  <div class="panel" data-pick-panel="c4-legacy">
    <p class="hint">카드를 누르면 무엇을 하는지 나옵니다. 왼쪽부터 순서대로 진행하면 됩니다.</p>
    <div data-for="plan"><h4>plan 모드로 계획 먼저</h4><p>계획을 먼저 받고, 승인 전까지 편집은 보류됩니다. 읽기 전용이 필요하면 tools로 제한합니다.</p></div>
    <div data-for="explore"><h4>Explore로 넓게 훑기</h4><p>읽기 전용 내장 에이전트 Explore가 넓게 찾고, 결과는 요약만 메인으로 돌아옵니다.</p></div>
    <div data-for="parallel"><h4>모듈별로 나눠 분석</h4><p>모듈마다 Subagent 하나를 맡기고, 요약을 모아 한 문서로 만듭니다.</p></div>
    <div data-for="rules"><h4>규칙은 CLAUDE.md에</h4><p>이름 규칙, 금지 패턴, 빌드 방법을 CLAUDE.md에 적어 두면 다음 세션도 같은 기준으로 봅니다.</p></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.pick('c4-legacy'); });
:::

:::notes
{timing: 1.5min}
[요약]
• 사전 설문에서 레거시 현대화를 고른 40명을 위한 방법
• plan 모드로 계획 먼저(승인 전까지 편집 보류, 읽기 전용은 tools 제한), Explore로 넓게 훑기
• 모듈마다 Subagent 하나, 요약을 모아 한 문서로
• 규칙은 CLAUDE.md에 적어 다음 세션도 같은 기준

사전 설문에서 레거시 현대화를 고르신 분이 40명이었습니다. 그분들이 가장 먼저 해 볼 수 있는 방법입니다.
{cue: demo}
먼저 plan 모드로 계획부터 받습니다. 승인 전까지 편집은 보류되고, 아예 읽기 전용이 필요하면 tools를 제한합니다. 다음으로 읽기 전용 내장 에이전트인 Explore로 넓게 훑어 요약만 받습니다.
그다음 모듈마다 Subagent를 하나씩 맡겨 나눠 분석하고 요약을 한 문서로 모읍니다. 마지막으로 이름 규칙과 금지 패턴, 빌드 방법을 CLAUDE.md에 적어 두면 다음 세션도 같은 기준으로 봅니다.

[출처]
• 이번 워크숍 사전 설문, 관심 활용 분야 문항
:::

---
<!-- Slide 13: Headless claude -p (PDF p14) -->
@type: content
@fit: off

## 대화 없이도 에이전트를 돌린다
claude -p, [CLI]{tip="Command Line Interface. 터미널에서 명령으로 쓰는 방식"} 파이프라인을 고른 42명을 위한 가장 짧은 예

:::html
<div id="c4-sv-headless"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var L = ['claude -p \\','  "portfolio-analyst 에이전트로 segments.md의','  세그먼트 (a)~(c)를 다시 계산해 JSON 배열로" \\','  --allowedTools "Read,Grep,Glob,Bash(python3:*)" \\','  --output-format json > segments.json','','jq -r .result segments.json          # 세그먼트 JSON','jq .total_cost_usd segments.json     # 이번 실행 비용','jq .permission_denials segments.json # 막힌 명령'];
  var N = [{id:'g',x:40,y:200,w:230,h:90,t:'요청 한 줄',s:'portfolio-analyst 지정',c:'muted'},{id:'c',x:330,y:200,w:260,h:90,t:'claude -p',s:'확인 창 없음',c:'accent'},{id:'j',x:650,y:200,w:230,h:90,t:'segments.json',s:'JSON 결과',c:'info'},
           {id:'r',x:940,y:80,w:210,h:76,t:'.result',s:'세그먼트 JSON',c:'success'},{id:'u',x:940,y:207,w:210,h:76,t:'.total_cost_usd',s:'실행 비용',c:'success'},{id:'d',x:940,y:334,w:210,h:76,t:'.permission_denials',s:'막힌 명령',c:'danger'}];
  var Z = [{x:20,y:40,w:1140,h:410,l:'TERMINAL, 대화 없음'}];
  F.stepviz('#c4-sv-headless', [
    {kicker:'STEP 1', title:'요청 한 줄로 에이전트를 부릅니다',
     body:'<b>claude -p</b>는 대화 없이 한 번 실행하고 끝냅니다. 요청에 <b>portfolio-analyst 에이전트로</b>라고 적어 역할을 지정하고, 답은 JSON 배열로만 받습니다.',
     facts:['대화 없이 한 번 실행','요청에서 에이전트 지정','세션 밖 터미널에서 실행'],
     zones:Z, nodes:N, hot:['g','c'],
     edges:[{f:'g',t:'c',c:'muted',o:0}],
     snip:{hd:'가장 짧은 예',path:'Terminal, 요청은 줄임',lines:L,hl:[1,2,3],note:'랩 <b>TASK 05(선택)</b>에서 직접 해 봅니다.'}},
    {kicker:'STEP 2', title:'필요한 도구만 사전 승인',
     body:'헤드리스는 중간에 허락을 물을 수 없어서, 허용 규칙에 없는 명령은 <b>거부</b>됩니다. <b>--allowedTools</b>로 읽기 도구와 python3 집계만 미리 허용합니다.',
     facts:['허용 규칙에 없는 명령은 거부 (헤드리스 기본)','--allowedTools: 사전 승인','--output-format json: 결과와 메타데이터'],
     zones:Z, nodes:N, hot:['c','j'],
     edges:[{f:'c',t:'j',c:'accent',o:0}],
     snip:{hd:'가장 짧은 예',path:'Terminal, 요청은 줄임',lines:L,hl:[4,5],note:'막힌 시도는 결과의 <b>permission_denials</b>에 남습니다.'}},
    {kicker:'STEP 3', title:'결과에서 필요한 값만 꺼냅니다',
     body:'답은 <b>.result 텍스트 하나</b>에 담겨 옵니다. jq(JSON을 거르는 명령줄 도구)로 세그먼트 JSON, <b>이번 실행 비용</b>, 막힌 명령을 꺼냅니다. 구조가 필요하면 <b>--json-schema</b>를 씁니다.',
     facts:['.result: 세그먼트 JSON (텍스트)','.total_cost_usd: 이번 실행 비용','.permission_denials: 막힌 명령'],
     zones:Z, nodes:N, hot:['j','r','u','d'],
     edges:[{f:'j',t:'r',c:'success',o:0},{f:'j',t:'u',c:'success',o:1},{f:'j',t:'d',c:'danger',o:2}],
     stagger:0.4,
     snip:{hd:'가장 짧은 예',path:'Terminal, 요청은 줄임',lines:L,hl:[7,8,9],note:'CI에서 쓰는 형태는 뒤쪽 <b>더 알아보기</b>에 있습니다.'}}
  ], {legend:[['accent','claude -p'],['info','결과 파일'],['success','꺼내는 값'],['danger','막힌 명령']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• claude -p: 대화 없이 한 번 실행, CLI 파이프라인을 고른 42명을 위한 예
• 허용 규칙에 없는 명령은 거부(헤드리스 기본), --allowedTools로 읽기 도구와 python3 집계만 사전 승인
• 결과는 .result 텍스트 하나, 구조가 필요하면 --json-schema
• jq로 .result, .total_cost_usd, .permission_denials, 랩 TASK 05(선택)

설문에서 CLI 파이프라인을 고르신 42명을 위한 가장 짧은 예입니다.
{cue: demo}
claude -p는 대화 없이 한 번 실행하고 끝납니다. 요청에 portfolio-analyst 에이전트로라고 적어 세그먼트를 다시 계산하게 하고, 답은 JSON 배열로만 받습니다.
헤드리스에서는 중간에 허락을 물을 수 없어서 허용 규칙에 없는 명령은 거부됩니다. 그래서 --allowedTools로 Read, Grep, Glob과 python3 집계만 미리 허용합니다.
결과 JSON에서 jq로 세그먼트 JSON, 이번 실행 비용, 막힌 명령을 꺼낼 수 있습니다. 비용이 실행마다 바로 나온다는 점이 운영에서 편합니다. 랩 TASK 05 선택 과제로 직접 해 보실 수 있습니다.

[약어]
• jq: JSON을 걸러 내는 명령줄 도구

[출처]
• 이번 워크숍 사전 설문, 관심 활용 분야 문항 (CLI 파이프라인 42명)
:::

---
<!-- Slide 14: Part 03 divider (PDF p15) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section">
  <span class="num">CHAPTER 03 / PART 03</span>
  <div class="name">병렬의 확장</div>
  <p class="what">Subagent 다음 단계</p>
  <ol>
    <li><b>01</b>더 큰 병렬화 수단</li>
    <li><b>02</b>Bedrock에서 달라지는 점</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• Part 3은 Subagent 다음 단계의 병렬화
• Agent teams, Workflows, Worktrees와 Bedrock 차이

세 번째 Part입니다. Subagent 다음 단계, 더 크게 병렬로 돌리는 수단 세 가지와 Bedrock에서 달라지는 점을 보겠습니다.
:::

---
<!-- Slide 15: Bigger parallelism (PDF p16) -->
@type: content
@fit: off

## 더 크게 나누는 세 가지 수단
세 수단 모두 Bedrock에서 동작

:::html
<div id="c4-sv-scale"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  F.stepviz('#c4-sv-scale', [
    {kicker:'START', title:'출발점: 한 세션 안의 Subagent',
     body:'지금까지 본 Subagent는 <b>한 세션 안</b>에서 메인이 맡기고 요약을 받는 구조입니다. 다음 세 수단은 이것을 더 크게 나눕니다.',
     facts:['Agent teams: 여러 인스턴스의 협업','Workflows: 대규모 오케스트레이션','Worktrees: 브랜치별 병렬'],
     zones:[{x:20,y:40,w:1140,h:410,l:'한 세션'}],
     nodes:[{id:'m',x:440,y:90,w:300,h:90,t:'메인 세션',s:'',c:'accent'},{id:'a',x:100,y:300,w:280,h:84,t:'Subagent',c:'info'},{id:'b',x:450,y:300,w:280,h:84,t:'Subagent',c:'info'},{id:'c',x:800,y:300,w:280,h:84,t:'Subagent',c:'info'}],
     edges:[{f:'m',t:'a',c:'info',o:0},{f:'m',t:'b',c:'info',o:0},{f:'m',t:'c',c:'info',o:0}],
     snip:{hd:'세 수단',path:'',lines:[],hl:[],note:'세 가지 모두 <b>Bedrock에서 동작</b>합니다.'}},
    {kicker:'AGENT TEAMS', title:'각자 컨텍스트를 가진 팀원의 협업',
     body:'<b>여러 Claude Code 인스턴스</b>가 팀원처럼 협업합니다. 팀원마다 자기 컨텍스트를 가집니다. <b>기본 꺼짐</b>인 실험 기능이고 환경 변수로 켭니다.',
     facts:['팀원마다 자기 컨텍스트','기본 꺼짐 (실험 기능, 환경 변수로 켬)','팀원이 plan 모드일 때 일반 세션의 약 7배 토큰'],
     zones:[{x:20,y:40,w:1140,h:410,l:'여러 인스턴스',tone:'warning'}],
     nodes:[{id:'l',x:440,y:80,w:300,h:90,t:'리드',s:'팀을 꾸리고 나눔',c:'accent'},{id:'a',x:100,y:300,w:280,h:90,t:'팀원 A',s:'자기 컨텍스트',c:'warning'},{id:'b',x:450,y:300,w:280,h:90,t:'팀원 B',s:'자기 컨텍스트',c:'warning'},{id:'c',x:800,y:300,w:280,h:90,t:'팀원 C',s:'자기 컨텍스트',c:'warning'}],
     edges:[{f:'l',t:'a',c:'warning',o:0},{f:'l',t:'b',c:'warning',o:0},{f:'l',t:'c',c:'warning',o:0},{f:'a',t:'b',c:'warning',o:1},{f:'b',t:'c',c:'warning',o:1}],
     loop:true, stagger:0.9,
     snip:{hd:'특징',path:'',lines:[],hl:[],note:'강력하지만 <b>토큰이 큽니다</b>. 허용 여부는 정책으로 정합니다.'}},
    {kicker:'WORKFLOWS', title:'Subagent를 많이 띄우는 작업 흐름',
     body:'<b>Workflows</b>는 Subagent를 많이 띄우는 대규모 오케스트레이션입니다. <b>모든 공급자에서</b> 사용할 수 있습니다.',
     facts:['대규모 오케스트레이션','Subagent를 많이 띄움','모든 공급자에서 사용 가능'],
     zones:[{x:20,y:40,w:1140,h:410,l:'WORKFLOW',tone:'success'}],
     nodes:[{id:'w',x:60,y:200,w:260,h:90,t:'작업 흐름',s:'단계와 분기',c:'success'},{id:'a',x:420,y:70,w:250,h:70,t:'Subagent',c:'info'},{id:'b',x:420,y:160,w:250,h:70,t:'Subagent',c:'info'},{id:'c',x:420,y:250,w:250,h:70,t:'Subagent',c:'info'},{id:'d',x:420,y:340,w:250,h:70,t:'Subagent',c:'info'},{id:'r',x:820,y:200,w:280,h:90,t:'결과 종합',c:'success'}],
     edges:[{f:'w',t:'a',c:'success',o:0,side:'h'},{f:'w',t:'b',c:'success',o:0,side:'h'},{f:'w',t:'c',c:'success',o:0,side:'h'},{f:'w',t:'d',c:'success',o:0,side:'h'},{f:'a',t:'r',c:'info',o:1,side:'h'},{f:'b',t:'r',c:'info',o:1,side:'h'},{f:'c',t:'r',c:'info',o:1,side:'h'},{f:'d',t:'r',c:'info',o:1,side:'h'}],
     loop:true, stagger:1,
     snip:{hd:'특징',path:'',lines:[],hl:[],note:'Bedrock 경로에서도 그대로 씁니다.'}},
    {kicker:'WORKTREES', title:'브랜치마다 작업 공간을 나눕니다',
     body:'<b>git worktree</b>(한 저장소에서 작업 폴더를 여러 개 두는 git 기능)로 브랜치별 작업 공간을 분리합니다. 세션마다 다른 폴더에서 일하니 <b>충돌 없이 동시 작업</b>할 수 있습니다.',
     facts:['git worktree로 작업 공간 분리','브랜치별 병렬','충돌 없이 동시 작업'],
     zones:[{x:20,y:40,w:1140,h:410,l:'저장소 하나, 작업 공간 여럿'}],
     nodes:[{id:'repo',x:440,y:80,w:300,h:90,t:'저장소',s:'.git',c:'muted'},{id:'a',x:100,y:300,w:280,h:90,t:'worktree A',s:'feature/login',c:'success'},{id:'b',x:450,y:300,w:280,h:90,t:'worktree B',s:'feature/report',c:'success'},{id:'c',x:800,y:300,w:280,h:90,t:'worktree C',s:'fix/refund',c:'success'}],
     edges:[{f:'repo',t:'a',c:'success',o:0},{f:'repo',t:'b',c:'success',o:0},{f:'repo',t:'c',c:'success',o:0}],
     snip:{hd:'작업 공간 나누기',path:'Terminal, 브랜치 이름은 예시',lines:['git worktree add -b feature/login \\','  ../wt-login','git worktree add -b feature/report \\','  ../wt-report','','# 폴더마다 Claude Code 세션 하나'],hl:[1,2,3,4],note:'같은 파일을 동시에 고쳐 생기는 <b>충돌을 피하는</b> 방법입니다.'}}
  ], {legend:[['accent','메인, 리드'],['info','Subagent'],['warning','Agent teams 팀원'],['success','작업 흐름, 작업 공간']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• Agent teams: 여러 인스턴스의 협업, 기본 꺼짐(실험 기능, 환경 변수로 켬), 팀원이 plan 모드일 때 일반 세션의 약 7배 토큰
• Workflows: Subagent를 많이 띄우는 대규모 오케스트레이션, 모든 공급자에서 사용 가능
• Worktrees: git worktree로 브랜치별 작업 공간 분리, 충돌 없이 동시 작업
• 세 가지 모두 Bedrock에서 동작

{cue: demo}
Subagent 다음 단계, 더 크게 나누는 세 가지 수단입니다. 모두 Bedrock에서 동작합니다.
출발점은 한 세션 안의 Subagent입니다.
Agent teams는 여러 Claude Code 인스턴스가 팀원처럼 협업하는 방식입니다. 팀원마다 자기 컨텍스트를 갖고, 기본으로 꺼진 실험 기능이라 환경 변수로 켭니다. 강력하지만 팀원이 plan 모드일 때 일반 세션의 약 7배 토큰을 씁니다.
Workflows는 Subagent를 많이 띄우는 대규모 작업 흐름이고 모든 공급자에서 쓸 수 있습니다.
Worktrees는 git worktree로 브랜치마다 작업 공간을 나눠서, 여러 세션이 충돌 없이 동시에 일하게 합니다.
:::

---
<!-- Slide 16: Bedrock differences (PDF p17) -->
@type: content
@fit: off

## 같은 기능, Bedrock에서는 다른 기본값
비용 예상과 사전 확인에 반영할 네 가지

:::html
<div class="fsi c4-diff">
  <div class="hd"><span>항목</span><span>Bedrock 동작</span><span>조치</span></div>
  <div class="rw"><span class="a">내장 Explore</span><span class="b">메인 모델을 그대로 씀: 메인이 Opus 5.5면 Explore도 Opus 5.5</span><span class="c">model: haiku 탐색 에이전트를 따로 정의해 절감</span></div>
  <div class="rw"><span class="a">Haiku 지정</span><span class="b">계정과 리전에 활성화돼 있어야 함</span><span class="c">사전 확인</span></div>
  <div class="rw"><span class="a">세션 간 메시지</span><span class="b">같은 머신 안에서만 (v2.1.248+)</span><span class="c">해당 없음</span></div>
  <div class="rw"><span class="a">Agent teams</span><span class="b">동작하지만 기본 꺼짐</span><span class="c">정책으로 허용 여부 결정</span></div>
</div>
:::

:::notes
{timing: 2min}
[요약]
• 내장 Explore: 메인 모델을 그대로 씀(메인이 Opus 5.5면 Explore도 Opus 5.5), model: haiku 탐색 에이전트로 절감
• Haiku 지정: 계정과 리전에 활성화돼 있어야 함, 사전 확인
• 세션 간 메시지: 같은 머신 안에서만(v2.1.248+)
• Agent teams: 동작하지만 기본 꺼짐, 정책으로 허용 여부 결정

같은 기능이라도 Bedrock에서는 기본값이 다른 것이 네 가지 있습니다.
내장 Explore는 메인 모델을 그대로 씁니다. 메인이 Opus 5.5면 Explore도 Opus 5.5로 돕니다. 탐색은 model: haiku로 고정한 탐색 에이전트를 따로 정의하면 비용을 줄일 수 있습니다.
Haiku를 지정하려면 계정과 리전에 활성화돼 있어야 하니 미리 확인하시고, 세션 간 메시지는 같은 머신 안에서만 동작합니다. Agent teams는 동작하지만 기본 꺼짐이라, 회사 정책으로 허용 여부를 정하시면 됩니다.
:::

---
<!-- Slide 17: Next (PDF p18) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-statement">
  <span class="eyebrow">NEXT</span>
  <div class="big">정의 파일은 <em>커밋 가능한</em> 자산입니다</div>
  <p class="lead">오늘 만든 에이전트를 Ch4에서 팀 플러그인으로 묶습니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 정의 파일은 커밋 가능한 자산
• 오늘 만든 에이전트를 Ch4에서 팀 플러그인으로 묶음

{cue: pause}
기억하실 한 문장입니다. 정의 파일은 커밋 가능한 자산입니다.
마크다운 파일 한 장이라 리뷰하고 버전 관리할 수 있습니다. 오늘 랩에서 만든 에이전트를 Ch4에서 팀 플러그인으로 묶어 배포합니다.
:::

---
<!-- Slide 18: Lab (PDF p19, lab guide task minutes) -->
@type: content
@fit: off

## 40분 동안 만들 세 에이전트
LAB, TASK 00부터 04와 선택 05, 첫 Subagent와 권한 격리

:::html
<div class="fsi c4-lab">
  <ol class="steps">
    <li><b>TASK 00</b><span>사전 준비 확인, 작업 폴더와 가명 데이터 연결</span><em>3분</em></li>
    <li><b>TASK 01</b><span>첫 Subagent, spending-analyst 만들기</span><em>10분, 강의 Part 1 연계</em></li>
    <li><b>TASK 02</b><span>도구 권한 격리 체험, 읽기 전용 risk-reviewer</span><em>7분, 강의 Part 1 연계</em></li>
    <li><b>TASK 03</b><span>에이전트 3종 완성, portfolio-analyst 추가</span><em>8분</em></li>
    <li><b>TASK 04</b><span>Task 디스패치 3패턴 (자동, 명시, 병렬), segments.md 완성</span><em>12분, 강의 Part 2 연계</em></li>
    <li class="opt"><b>선택 05</b><span>claude -p로 대화 없이 실행, segments.json</span><em>7분, 강의 Part 2 연계</em></li>
  </ol>
  <p class="where">Hands-on Lab 포털에서 Chapter 3을 열고 TASK 00 사전 준비부터 진행합니다. 가명 데이터 pseudo/만 읽고, 여기서 만든 에이전트 3종과 segments.md를 Ch4에서 씁니다.</p>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• LAB 40분(필수), TASK 00부터 04와 선택 05
• TASK 01 spending-analyst, TASK 02 risk-reviewer로 도구 권한 격리, TASK 03 portfolio-analyst로 3종 완성, TASK 04 디스패치 3패턴과 segments.md
• 만든 에이전트 3종과 segments.md는 Ch4에서 다시 사용

{cue: demo}
이제 40분 랩입니다. Hands-on Lab 포털에서 Chapter 3을 열고 TASK 00 사전 준비부터 시작해 주세요.
고객자산 분석 담당자가 되어 고객 천 명을 세그먼트로 나누는 이야기입니다. TASK 01에서 소비 패턴을 읽는 spending-analyst를 만들고, TASK 02에서 읽기 전용 risk-reviewer로 도구 권한 격리를 체험합니다. TASK 03에서 portfolio-analyst를 더해 세 종류를 완성하고, TASK 04에서 자동, 명시, 병렬 세 가지 디스패치를 비교하며 세그먼트 제안서 segments.md를 완성합니다. 시간이 남으면 선택 TASK 05에서 claude -p로 segments.json을 만들어 보세요.
여기서 만든 에이전트 세 개와 segments.md는 Ch4에서 그대로 씁니다.
:::

---
<!-- Slide 19: Deep dive divider (PDF p20) -->
@type: content
@fit: off

:::html
<div class="fsi fsi-section c4-dd">
  <span class="num">CHAPTER 03 / DEEP DIVE</span>
  <div class="name">더 알아보기</div>
  <p class="what">자주 받는 질문과 세부 설정</p>
  <ol>
    <li><b>01</b>정의 파일 필드</li>
    <li><b>02</b>내장 Subagent</li>
    <li><b>03</b>Subagent vs 스킬</li>
    <li><b>04</b>CI에서 Subagent</li>
    <li><b>05</b>병렬의 비용</li>
  </ol>
</div>
:::

:::notes
{timing: 0.5min}
[요약]
• 시간이 남거나 질문이 나올 때 펼치는 더 알아보기
• 정의 파일 필드, 내장 Subagent, Subagent vs 스킬, CI, 병렬의 비용

여기부터는 더 알아보기입니다. 시간이 남거나 질문이 나오면 펼칩니다. 저장 위치는 앞의 정의 파일 위치 장표에서 함께 다뤘습니다.
:::

---
<!-- Slide 20: Definition fields (PDF p21) -->
@type: content
@fit: off

## 필수는 name과 description 둘뿐
정의 파일 필드와 작성 요령

:::html
<div class="fsi c4-fields">
  <div class="hd"><span>필드</span><span>의미</span><span>작성 요령</span></div>
  <div class="rw req"><span class="a">name</span><span class="b">호출 이름 (필수)</span><span class="c">역할이 드러나는 짧은 이름</span></div>
  <div class="rw req"><span class="a">description</span><span class="b">자동 위임의 판단 근거 (필수)</span><span class="c">언제 쓰는지까지 구체적으로</span></div>
  <div class="rw"><span class="a">tools</span><span class="b">허용 도구 목록</span><span class="c">생략하면 메인의 도구를 상속, 최소 권한으로 명시</span></div>
  <div class="rw"><span class="a">model</span><span class="b">sonnet, opus, haiku, fable, 전체 모델 ID, inherit</span><span class="c">단순 작업은 haiku</span></div>
  <div class="rw"><span class="a">본문</span><span class="b">시스템 프롬프트</span><span class="c">출력 형식과 금지 사항을 명시</span></div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• 필수는 name과 description
• tools를 생략하면 메인의 도구를 상속, 최소 권한으로 명시
• model은 sonnet, opus, haiku, fable, 전체 모델 ID, inherit, 단순 작업은 haiku
• 본문에는 출력 형식과 금지 사항

정의 파일 필드를 다시 정리하면, 필수는 name과 description 둘뿐입니다.
여기서 꼭 기억하실 점은 tools입니다. 생략하면 메인의 도구를 전부 상속합니다. 그래서 금융권에서는 최소 권한으로 명시하시길 권합니다.
본문에는 출력 형식과 금지 사항을 분명히 적어 두면 결과가 일정해집니다.
:::

---
<!-- Slide 21: Built-in subagents (PDF p22) -->
@type: content
@fit: off

## 정의하지 않아도 이미 쓰고 있다
내장 Subagent 세 가지

:::html
<div class="fsi c4-builtin">
  <div class="fsi-grid-3">
    <div class="card3"><span class="k">EXPLORE</span><span class="t">Explore</span><span class="d">읽기 전용 코드 탐색. 넓게 찾고 결론만 반환합니다.</span></div>
    <div class="card3"><span class="k">PLAN</span><span class="t">Plan</span><span class="d">plan 모드에서 조사. 변경 없이 설계 근거를 수집합니다.</span></div>
    <div class="card3"><span class="k">GENERAL</span><span class="t">general-purpose</span><span class="d">여러 단계 작업. 복잡한 검색과 실행을 맡습니다.</span></div>
  </div>
  <p class="cap">Bedrock에서는 Explore가 메인 모델을 그대로 씁니다 (Part 3).</p>
</div>
:::

:::notes
{timing: 1min}
[요약]
• Explore: 읽기 전용 코드 탐색, 넓게 찾고 결론만 반환
• Plan: plan 모드에서 조사, 변경 없이 설계 근거 수집
• general-purpose: 여러 단계 작업, 복잡한 검색과 실행

정의하지 않아도 이미 쓰고 있는 내장 Subagent가 세 가지 있습니다.
Explore는 읽기 전용으로 코드를 넓게 찾고 결론만 돌려줍니다. Plan은 plan 모드에서 변경 없이 설계 근거를 모으고, general-purpose는 여러 단계 작업을 맡습니다.
Bedrock에서는 Explore가 메인 모델을 그대로 쓴다는 점, 앞에서 보신 대로 비용 예상에 반영하시면 됩니다.
:::

---
<!-- Slide 22: Subagent vs skill (PDF p23) -->
@type: content
@fit: off

## 나눌 것은 Subagent, 공유할 것은 스킬
무엇을 나누고 무엇을 공유하나

:::html
<div class="fsi c4-vs" id="c4-vs">
  <div class="side">
    <h4><small>SUBAGENT</small>별도 컨텍스트</h4>
    <div class="pt" data-g="0">별도 컨텍스트, 결과 요약만 반환</div>
    <div class="pt" data-g="1">도구와 모델을 따로 지정</div>
    <div class="pt" data-g="2">장황한 조사, 리뷰, 테스트에 적합</div>
    <div class="pt" data-g="3">요청이 따로 나가 비용은 합산</div>
  </div>
  <div class="side">
    <h4><small>스킬</small>메인 컨텍스트에 불러옴</h4>
    <div class="pt" data-g="0">메인 컨텍스트에 절차를 불러옴</div>
    <div class="pt" data-g="1">도구 권한은 메인과 같음</div>
    <div class="pt" data-g="2">반복 절차, 팀 규칙에 적합</div>
    <div class="pt" data-g="3">이름과 설명만 항상 실리고, 본문은 필요할 때</div>
  </div>
  <div class="ctrl"><button class="btn btn-primary" data-cycle>다음 비교</button><span class="lbl" id="c4-vs-lbl"></span></div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var lbl = ['컨텍스트', '도구와 권한', '잘 맞는 일', '비용과 로드'];
  var pts = Array.prototype.slice.call(document.querySelectorAll('#c4-vs .pt'));
  F.cycle('#c4-vs', lbl.length, function (i) {
    pts.forEach(function (p) { p.classList.toggle('on', +p.dataset.g === i); });
    document.getElementById('c4-vs-lbl').textContent = (i + 1) + ' / ' + lbl.length + ', ' + lbl[i];
  });
});
:::

:::notes
{timing: 1min}
[요약]
• Subagent: 별도 컨텍스트, 도구와 모델 따로, 장황한 조사와 리뷰, 비용 합산
• 스킬: 메인 컨텍스트에 절차를 불러옴, 도구 권한은 메인과 같음, 반복 절차와 팀 규칙
• 스킬은 이름과 설명만 항상 실리고 본문은 필요할 때

자주 받는 질문이 Subagent와 스킬의 차이입니다. 버튼으로 네 가지 기준을 차례로 비교하겠습니다.
{cue: demo}
컨텍스트를 보면 Subagent는 별도 창이고 스킬은 메인 컨텍스트에 절차를 불러옵니다. 도구와 권한은 Subagent가 따로 정할 수 있고, 스킬은 메인과 같습니다.
그래서 장황한 조사나 리뷰는 Subagent에, 반복 절차나 팀 규칙은 스킬에 맞습니다. 비용은 Subagent는 요청이 따로 나가 합산되고, 스킬은 이름과 설명만 항상 실립니다.
:::

---
<!-- Slide 23: CI with subagents (PDF p24) -->
@type: content
@fit: off

## CI에서는 키 없이 OIDC로
GitHub Actions에서 Subagent로 야간 세그먼트 리포트

:::html
<div id="c4-sv-ci"></div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var L1 = ['permissions: { id-token: write,','  contents: read }','  ...','  - uses: aws-actions/configure-aws-credentials@v4','    with:','      role-to-assume: ${{ secrets.AWS_ROLE_ARN }}','      aws-region: us-east-1'];
  var L2 = ['env:','  CLAUDE_CODE_USE_BEDROCK: "1"','  AWS_REGION: us-east-1','steps:','  - uses: actions/checkout@v4','  ...','  - run: npm install -g @anthropic-ai/claude-code','  - run: aws s3 sync s3://YOUR_ANALYSIS_BUCKET/pseudo ./pseudo'];
  var L3 = ['  - name: Evidence + PII check','    run: |','      claude -p "risk-reviewer 에이전트로 segments.json의','        근거와 식별자 노출 여부를 점검해 주세요" \\','        --allowedTools "Read,Grep,Glob" \\','        --output-format json > risk.json'];
  var Z = [{x:20,y:40,w:600,h:410,l:'GITHUB ACTIONS'},{x:660,y:40,w:500,h:410,l:'내 AWS 계정',tone:'info'}];
  var N = [{id:'gh',x:70,y:90,w:500,h:84,t:'야간 워크플로',s:'id-token: write',c:'accent'},{id:'cc',x:70,y:300,w:500,h:90,t:'claude -p',s:'risk-reviewer, 읽기 전용 도구',c:'accent'},
           {id:'role',x:710,y:90,w:400,h:84,t:'IAM 역할 (OIDC)',s:'Bedrock 호출 최소 권한',c:'warning'},{id:'br',x:710,y:300,w:400,h:90,t:'Amazon Bedrock',s:'us-east-1',c:'info'}];
  F.stepviz('#c4-sv-ci', [
    {kicker:'STEP 1', title:'장기 키 대신 OIDC 역할',
     body:'워크플로가 <b>OIDC(OpenID Connect) 토큰</b>으로 IAM(AWS 권한 관리) 역할을 맡습니다. 저장소에 <b>장기 액세스 키를 두지 않습니다</b>.',
     facts:['permissions에 id-token: write','configure-aws-credentials로 역할 맡기','장기 키 대신 OIDC 역할'],
     zones:Z, nodes:N, hot:['gh','role'],
     edges:[{f:'gh',t:'role',c:'warning',l:'OIDC 토큰',o:0}],
     snip:{hd:'.github/workflows/nightly-segments.yml',path:'발췌, ... 은 생략한 줄',lines:L1,hl:[1,4,6],note:'역할에는 <b>Bedrock 호출 최소 권한만</b> 줍니다.'}},
    {kicker:'STEP 2', title:'Bedrock 경로로 Claude Code 실행',
     body:'환경 변수로 <b>Bedrock 경로</b>를 켜고, 저장소를 받은 뒤 Claude Code를 설치합니다. 분석 입력은 S3의 <b>pseudo/ 가명 데이터</b>만 내려받습니다.',
     facts:['CLAUDE_CODE_USE_BEDROCK: "1"','AWS_REGION: us-east-1','claude -p로 대화 없이 실행'],
     zones:Z, nodes:N, hot:['cc','br','role'],
     edges:[{f:'role',t:'br',c:'warning',o:0,l:'임시 자격 증명'},{f:'cc',t:'br',c:'info',o:1,l:'추론 요청'}],
     snip:{hd:'.github/workflows/nightly-segments.yml',path:'발췌, ... 은 생략한 줄',lines:L2,hl:[2,3,8],note:'YOUR_ANALYSIS_BUCKET은 자리 표시입니다. 원본(raw)은 <b>CI에 올리지 않습니다</b>.'}},
    {kicker:'STEP 3', title:'읽기 전용 도구로 제한하고 결과를 남깁니다',
     body:'앞 step에서 portfolio-analyst가 만든 segments.json을 <b>risk-reviewer</b>가 점검합니다. <b>--allowedTools "Read,Grep,Glob"</b>로 읽기 도구만 허용하고, 점검 결과 risk.json도 <b>로그에 남는 데이터</b>로 다룹니다.',
     facts:['--allowedTools로 읽기 도구만 사전 승인','앞 step의 segments.json을 점검','점검 결과도 로그에 남는 데이터'],
     zones:Z, nodes:N.concat([{id:'out',x:70,y:200,w:240,h:70,t:'risk.json',c:'muted'}]), hot:['cc','out'],
     edges:[{f:'cc',t:'out',c:'muted',o:0}],
     snip:{hd:'.github/workflows/nightly-segments.yml',path:'발췌, 보기 좋게 줄바꿈',lines:L3,hl:[3,4,5],note:'금융권 체크: <b>OIDC, 최소 권한 역할, 읽기 전용 도구, 결과 데이터 관리</b>.'}}
  ], {legend:[['accent','CI 작업'],['warning','IAM 역할'],['info','Bedrock'],['muted','남는 결과']]});
});
:::

:::notes
{timing: 1.5min}
[요약]
• GitHub Actions에서 키 없이 OIDC로 Bedrock 호출
• 역할에는 Bedrock 호출 최소 권한만
• CLAUDE_CODE_USE_BEDROCK, AWS_REGION으로 Bedrock 경로
• 입력은 pseudo/ 가명 데이터만, --allowedTools로 읽기 도구만, 점검 결과도 로그에 남는 데이터

CI에서 Subagent를 쓰는 예입니다. 랩 선택 TASK 05의 야간 세그먼트 리포트 워크플로이고, 핵심은 키 없이 OIDC로 Bedrock을 호출한다는 점입니다.
{cue: demo}
첫째, 워크플로가 OIDC 토큰으로 IAM 역할을 맡습니다. 저장소에 장기 키가 없고, 역할에는 Bedrock 호출 최소 권한만 줍니다.
둘째, 환경 변수로 Bedrock 경로를 켜고, 분석 입력은 S3에서 pseudo/ 가명 데이터만 내려받습니다. 원본은 CI에 올리지 않습니다.
셋째, portfolio-analyst가 만든 segments.json을 risk-reviewer가 점검하는데, --allowedTools로 Read, Grep, Glob만 허용합니다. 그리고 점검 결과도 로그에 남는 데이터라는 점을 잊지 마셔야 합니다.

[약어]
• OIDC: OpenID Connect, CI가 장기 키 없이 클라우드 역할을 맡게 하는 표준 인증
• IAM: Identity and Access Management
• CI: Continuous Integration
:::

---
<!-- Slide 24: Cost of parallelism (PDF p25) -->
@type: content
@fit: off

## 시간은 줄고 토큰은 합산된다
병렬의 비용, 순차와 병렬 비교

:::html
<div class="fsi c4-par" id="c4-par">
  <div class="sim">
    <div class="top"><button class="btn btn-primary" data-cycle>순차, 병렬 전환</button><span class="mode" id="c4-par-mode"></span></div>
    <div class="lane"><span class="job" data-d="4" data-s="0">조사 4분</span></div>
    <div class="lane"><span class="job" data-d="6" data-s="4">리뷰 6분</span></div>
    <div class="lane"><span class="job" data-d="3" data-s="10">요약 3분</span></div>
    <div class="axis"><span>0분</span><span>13분</span></div>
    <div class="tot"><div><b id="c4-par-time">13분</b><span>소요 시간</span></div><div><b>3개 합</b><span>토큰 사용량</span></div></div>
    <p class="cap">작업 시간은 설명용 예시입니다.</p>
  </div>
  <div class="cards">
    <div class="cd"><span class="k">PARALLEL</span><span class="t">병렬 3개</span><span class="d">소요 시간은 가장 긴 것 기준, 비용은 세 개의 합</span></div>
    <div class="cd"><span class="k">TEAMS</span><span class="t">Agent teams</span><span class="d">팀원이 plan 모드일 때 일반 세션의 약 7배 토큰</span></div>
    <div class="cd"><span class="k">TIP</span><span class="t">배분</span><span class="d">조사와 요약은 haiku, 판단이 필요한 리뷰만 상위 모델</span></div>
  </div>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) {
  var jobs = Array.prototype.slice.call(document.querySelectorAll('#c4-par .job'));
  var TOTAL = 13;
  F.cycle('#c4-par', 2, function (i) {
    jobs.forEach(function (j) {
      j.style.width = (j.dataset.d / TOTAL * 100) + '%';
      j.style.left = (i === 0 ? j.dataset.s / TOTAL * 100 : 0) + '%';
    });
    document.getElementById('c4-par-mode').textContent = i === 0 ? '순차 실행' : '병렬 실행';
    document.getElementById('c4-par-time').textContent = i === 0 ? '13분' : '6분';
  });
});
:::

:::notes
{timing: 1min}
[요약]
• 병렬 3개: 소요 시간은 가장 긴 것 기준, 비용은 세 개의 합
• Agent teams: 팀원이 plan 모드일 때 일반 세션의 약 7배 토큰
• 배분: 조사와 요약은 haiku, 판단이 필요한 리뷰만 상위 모델

병렬의 비용입니다. 버튼으로 순차와 병렬을 바꿔 보겠습니다.
{cue: demo}
순차로 돌리면 세 작업 시간을 더한 만큼 걸리고, 병렬로 돌리면 가장 긴 작업 시간만큼 걸립니다. 화면의 분 단위는 설명용 예시입니다. 그런데 토큰은 어느 쪽이든 세 개의 합입니다. 시간은 줄지만 비용은 줄지 않습니다.
Agent teams는 팀원이 plan 모드일 때 일반 세션의 약 7배 토큰을 씁니다. 그래서 조사와 요약은 haiku에, 판단이 필요한 리뷰만 상위 모델에 맡기는 배분을 권합니다.

[출처]
• 원본 강의자료(Ch4 PDF) p25
:::

---
<!-- Slide 25: Quick check 2 (PDF p26) -->
@type: content
@fit: off

## tools를 빼면 무엇을 쓸까?
QUICK CHECK, 손을 들어 답해 주세요

:::html
<div class="fsi qc" id="c4-qc-2">
  <p class="q">tools를 지정하지 않은 Subagent는?</p>
  <div class="opts three">
    <button class="opt"><b>A</b>읽기 도구만 쓴다</button>
    <button class="opt right"><b>B</b>메인 세션의 도구를 모두 상속한다</button>
    <button class="opt"><b>C</b>도구 없이 답만 한다</button>
  </div>
  <p class="ans">정답 B. 최소 권한을 원하면 tools를 명시합니다.</p>
</div>
:::

:::script
(window.__fsiq = window.__fsiq || []).push(function (F) { F.quickCheck('#c4-qc-2'); });
:::

:::notes
{timing: 0.5min}
{cue: poll}
[요약]
• 정답 B, 메인 세션의 도구를 모두 상속
• 최소 권한을 원하면 tools를 명시

마지막 퀴즈입니다. tools를 지정하지 않은 Subagent는 어떤 도구를 쓸까요?
{cue: pause}
정답은 B, 메인 세션의 도구를 모두 상속합니다. 읽기 전용이 기본이 아니라는 점이 함정입니다. 최소 권한을 원하시면 tools를 꼭 명시하세요.
:::

---
<!-- Slide 26: Recap (PDF p27) -->
@type: content
@fit: off

## 맡기는 기술 여섯 가지
Chapter 3 Key Takeaways

:::html
<div class="fsi c4-recap">
  <div class="fsi-grid-3">
    <div class="rc"><b>01</b><span>Subagent = 자기 컨텍스트 + 전용 지침 + 좁힌 도구 + 요약 반환</span></div>
    <div class="rc"><b>02</b><span>description이 자동 위임을 결정</span></div>
    <div class="rc"><b>03</b><span>tools 허용 목록으로 읽기 전용 에이전트</span></div>
    <div class="rc"><b>04</b><span>규제 작업은 @ 멘션으로 명시 호출</span></div>
    <div class="rc"><b>05</b><span>장황한 작업은 격리, 단순 작업은 haiku</span></div>
    <div class="rc"><b>06</b><span>Agent teams는 강력하지만 토큰이 큼</span></div>
  </div>
</div>
:::

:::notes
{timing: 1min}
[요약]
• Subagent = 자기 컨텍스트, 전용 지침, 좁힌 도구, 요약 반환
• description이 자동 위임, tools로 읽기 전용, 규제 작업은 @ 멘션
• 장황한 작업은 격리, 단순 작업은 haiku, Agent teams는 토큰이 큼

Chapter 3을 여섯 줄로 정리합니다.
Subagent는 자기 컨텍스트, 전용 지침, 좁힌 도구, 요약 반환 네 가지로 이뤄집니다. description이 자동 위임을 결정하고, tools 허용 목록으로 읽기 전용 에이전트를 만듭니다.
규제 작업은 @ 멘션으로 명시 호출하시고, 장황한 작업은 격리, 단순 작업은 haiku로. Agent teams는 강력하지만 토큰이 크다는 점을 기억해 주세요.
:::

---
<!-- Slide 27: Thank you (PDF p28) -->
@type: thankyou
@toc: toc.html
@next: 04-ch4-extending.html
@next-label: Chapter 4 (Capstone 이후)
@message: 다음은 Capstone Round 1입니다. 질문은 Slack #20261116-claude-code-workshop-for-fsi 채널에서 언제든 편하게 남겨 주세요.

:::notes
{timing: 0.5min}
[요약]
• 다음은 Capstone Round 1
• 질문은 Slack #20261116-claude-code-workshop-for-fsi

감사합니다. 랩을 마치면 Capstone Round 1로 이어집니다.
궁금한 점은 Slack 워크숍 채널에 언제든 편하게 남겨 주세요.
:::
