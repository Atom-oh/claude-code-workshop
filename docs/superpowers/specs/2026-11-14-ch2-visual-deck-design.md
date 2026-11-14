# Ch2 deck: visual rebuild for an L100 audience

Date: 2026-11-14. Deck source: `20261116/reactive/02-ch2-bedrock-safe.md`
(Remarp, built by `20261116/reactive/build.sh`). Read
`20261116/reactive/README.md` before editing; its house style applies.

## Why

Ch2 ("Bedrock 위에서 안전하게 쓰기") is a 50-minute lecture. The current deck
has 25 slides whose notes add up to 50 minutes, but in a real run-through the
presenter finished in about 25 minutes. Most slides are static lists of
settings; the audience has nothing to watch while the presenter talks, and
several slides assume Bedrock knowledge the audience does not have.

The audience (survey, 153 answers per question, 158 responses):
- mostly developers (88: app 57, data/ML 31), then platform/infra (25),
  managers and planners (19), security and compliance (15);
- half use Claude Code at an intermediate level (75), 61 are beginners;
- only 17 (about 11%) use Claude Code through Amazon Bedrock today. Most use
  personal plans (74) or are still evaluating (48). They do not know what a
  model ID, inference profile, ARN, VPC endpoint or IAM role is, so a slide
  like "팀별 비용의 기준, 프로필 ARN" lands with no foundation.

The presenter wants every slide to be easy to understand by watching it,
in the style of the existing step-through pages
`~/Documents/ClaudeCodeWorkshop/ClaudeCode_Ch3_Admin_Visual.html` and
`ClaudeCode_Ch2_Orchestration_Visual.html` (not the 3D
`ClaudeCode_Ch2_SDD_Visual.html`, which belongs to Ch3): a "STEP N" label, a
headline, one diagram whose nodes and edges change per step with packets
moving along live edges, a legend, two or three takeaways, and the real
config or command on the right with the relevant lines lit.

## Goals

1. A 50-minute talk that holds 50 minutes because each slide has something to
   step through, not because the presenter reads more text.
2. An L100 developer or infra engineer can follow every slide without knowing
   Bedrock beforehand. Concepts appear as a picture first; the real string
   (ARN, JSON key, env var) appears after the picture has made sense.
3. Restore the substance cut when two decks were merged into one (see
   "Content"), especially PrivateLink, guardrails and DLP.
4. Open like the other chapters: cover, survey results on slide 2, agenda.
5. Line-art animated figures drawn with the github.com/JDhruv14/line-art-animation
   library for the story moments.

## Non-goals

- No new lab steps; the labs (`ClaudeCode_Ch2_HandsOnLab.html`,
  `ClaudeCode_Ch2_Guardrails_HandsOnLab.html`) are not changed.
- Cost optimisation is not taught here. Ch2 is about using Claude Code
  safely. The survey's "Bedrock is expensive vs a subscription" worry gets one
  line on the closing slide pointing to Ch5 and Ch6.
- No change to other chapters' decks, eDM times or session length.
- No line-art outside the five story scenes.
- No 3D or WebGL visuals.

## Anti-goals (failure even if it technically works)

- Slides that are animated but no easier to understand ("motion for its own
  sake"). Every animation must show a cause and effect the presenter talks
  about.
- A deck that only reads well when stepped: the PDF export captures each
  slide as it first appears, so the default view of every slide must be the
  complete picture.
- Generic, same-looking figures on every slide ("AI slop"). Figures appear
  only in story scenes, and each scene has its own action.
- Facts that disagree with code.claude.com/docs for the version on the cover
  (Claude Code v2.1.319) or with the labs.

## Structure (decided)

Target 36 to 40 slides, notes `{timing}` summing to 50 minutes (presenter
metadata only; no time is shown on any slide or said in the script).

1. **Cover** (with the 1분 미리보기 video button, as now).
2. **Survey results** (new position; replaces the Part 3 survey slide
   "138명 중 51명이 고른 주제", which is removed). Base: confirmed attendees who
   answered, 139 (survey responses matched to the confirmed list of 142):
   - "망분리·보안: 폐쇄망 환경 운영, 소스코드 유출 방지(DLP), 감사 로그" 51;
   - "팀 표준화: 설정 스코프, 권한 규칙, Hooks, MCP" 60;
   - "규제·감사 대응: 코드 리뷰 가드레일, 변경관리 증적 자동화" 45;
   - "Admin Setup: 플릿 배포, Bedrock IAM/SSO, 관리형 정책" 28;
   - context: "Amazon Bedrock을 통해 사용 중" 17.
   Count-up bars; the slide shows no times. The last step says this chapter
   answers these questions, leading into the agenda. Source: OneDrive workbook
   `ClaudeCodeWorkshop Nomination.xlsx`, sheets `설문응답` and `최종고객명단`
   (only aggregates go in the deck; no names, emails or company names).
3. **Agenda** with the three parts (no minutes or clock times: since
   2026-11-14 session times appear only in the eDM).
4. **Part 1. Bedrock에 안전하게 연결 (about 17 min)**
   - Bedrock 101 (new): a line-art scene. A developer at a laptop runs
     Claude Code; the request leaves the laptop and goes to the company's own
     AWS account, where Bedrock answers. An infra engineer stands by the
     account and holds the keys to it. Steps add the pieces in order: the
     account, IAM role (who may call), the model name tag (model ID or
     inference profile), the answer coming back.
   - 금융권이 Bedrock을 고르는 이유 (existing), extended with PrivateLink.
     The presenter requires PrivateLink on this early slide. Show traffic
     staying inside the company network: laptop to VPC endpoint to Bedrock,
     with a crossed-out path to the internet. Restore the eight 망분리
     checks from the original slide "인터넷 없이 Bedrock만 열려 있다면"
     (VPC endpoint, SSO/STS endpoints, HTTPS_PROXY/NO_PROXY,
     NODE_EXTRA_CA_CERTS, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC,
     in-house install with DISABLE_AUTOUPDATER, in-house git marketplace,
     WebFetch limits) as steps or as the follow-on slide.
   - 환경변수 두 개로 연결 (existing).
   - IAM 권한: 호출, 조회, Marketplace (restored).
   - 다섯 가지 중 권장은 하나; 만료 시 자동 재로그인 (existing). A short
     line-art "key leak" scene belongs here: a long-lived key copied into a
     chat message and spreading, versus SSO credentials that expire.
   - 고정하지 않으면 무엇이 도는가?; 여러 사용자에게 배포하면 반드시 고정
     (existing).
   - 팀별 프로필 ARN (existing), reframed for safety and attribution
     ("which team's calls went through which profile"), reusing the Bedrock
     101 picture: each team gets its own name tag, and the record shows whose
     call it was. The ARN string appears only in the last step. Cost
     arithmetic stays in Ch6.
5. **Part 2. 정책을 파일로 배포 (about 12 min)**
   - 콘솔 대신 파일과 MDM; 키 충돌 시 상위 우선 (existing).
   - Lab에서 배포할 정책 한 장; JSON이 깨지면 어떻게 될까? (restored).
   - 조직이 거는 잠금 스위치 (restored, drawn like the Admin page's
     "STEP 3 잠금 키" with the managed-settings.json keys lighting up).
   - 배포 이후가 진짜 시작 (existing).
6. **Part 3. 가드레일과 DLP (about 16 min)**
   - A short bridge back to slide 2's 망분리·보안 and 감사 answers.
   - deny 절대 우선; user allow, managed deny라면? (existing).
   - 권한 규칙이 첫 문, 분류기가 둘째 문; 설정하지 않아도 막는 네 가지
     (restored).
   - 앞 층이 놓친 것은 다음 층에서 (existing), drawn like the
     Orchestration page: one request travels through the layers and is caught
     at a specific one. A line-art scene: the developer asks Claude to run
     `rm -rf`, and the request is stopped at the gate.
   - 차단은 exit 2뿐; jq 없이 exit 127이면? (existing). A line-art DLP
     scene: a prompt containing a resident registration number is caught by
     the UserPromptSubmit hook before it reaches the model.
   - 훅은 정책으로 강제한다; MCP 서버 하나가 통로 하나 (restored).
   - 감사 근거가 남는 네 곳 (existing).
7. **Close**: 더 깊은 내용은 실습에서; 기억할 줄 (update the count to match);
   thank-you slide (`@toc`, `@next`, `@next-label`, `@message`). One line on
   cost pointing to Ch5 and Ch6.

Restored slides come from the decks before the merge:
`git show 1b03ca2:20261116/reactive/02-ch2-bedrock-policy.md` (33 slides) and
`git show 1b03ca2:20261116/reactive/03-ch3-guardrails-dlp.md` (43 slides).
Re-check every restored fact against the current labs and
code.claude.com/docs before using it; those decks predate several fixes.

## Visual system (decided)

- Build on the deck's existing helper `20261116/reactive/assets/stepviz.js`
  (`F.stepviz`, `F.bindKeys`, `F.onEnter`, `F.pick`, the chapter-local
  `__c3codepick`). It is already a port of the Admin page: steps redraw zones,
  nodes and edges in SVG, send packets along hot edges, and light code lines.
  ↓ and ↑ step; the default view is the complete picture.
- Step order follows reading order (top to bottom, left to right, or the
  printed numbers), per the README.
- Colours are theme tokens only. Every page opens dark; check light mode
  (`?theme=light`, projector mode) at 7:1 text, 4.5:1 accent text, about 3:1
  borders.
- New CSS goes in `assets/ch2.css`.

## Line-art figures (decided)

- Use the library itself: github.com/JDhruv14/line-art-animation (MIT). Vendor
  its four dependency-free modules `lib/ink.ts`, `lib/gait.ts`, `lib/motion.ts`
  and `lib/daynight.ts` into `20261116/reactive/assets/lineart/` as browser ES
  modules. Read all four files in full before vendoring (they are fetched as
  text through the GitHub API, pinned to one commit SHA). Convert them with
  Node's built-in type stripping (`module.stripTypeScriptTypes`), so there is no
  npm install, no bundler and no CDN. Keep the MIT licence text and the source
  URL and commit SHA in `assets/lineart/LICENSE` and a short `README.md`. Do not
  run the repo's npm scripts or capture tools. Read `SKILL.md` and
  `references/style.md`, `motion.md` and `scenes.md` and follow their rules
  (figure space about 95 units tall with feet on y = 120, `place()` into the
  slide SVG, `gait()` for walking, springs or keyed poses for gestures, ink as
  `currentColor`, paper fills with the `pp` class mapped to theme tokens).
- The deck loads the modules from the scene slides' `:::script` with a dynamic
  `import('assets/lineart/ink.js')`. The library's `run()` loop must start on
  slide enter and stop on slide leave, and honour `prefers-reduced-motion`
  by drawing the resting pose only.
- Two recurring characters: a developer and an infra engineer. Each story
  scene gives them a distinct action. Scenes: Bedrock 101, key leak versus
  expiring SSO credentials, PrivateLink (traffic stays inside), the `rm -rf`
  request stopped at a layer, the DLP hook catching a resident registration
  number.
- Motion must look intentional (springs or keyed poses, not free sine bobbing)
  and must respect `prefers-reduced-motion`. A figure's resting pose must read
  correctly in the PDF.
- Build the Bedrock 101 scene first and show it to the presenter (local
  preview screenshots in dark and light) for approval before building the
  other figures. The STEP diagrams of the other slides may be built while
  waiting; figures are slotted in afterwards.

## Constraints

- House style (README section 4): titles are short noun phrases (28
  characters or fewer), no em dash and no middle dot in new text, Korean
  learner text, every slide has `:::notes` with `{timing}`, `[요약]`, script,
  optional cues and `[출처]`.
- Deadline: the deck is presented on 2026-11-16 (Monday), with all five
  figure scenes. It is the live Ch2 deck linked from eDM and the portal.
- After the deck changes: run `build.sh`, update `toc.html` (title, tagline,
  slide count), re-export `slides/ClaudeCode_FSI_Ch2_20261116.pdf` (image-only,
  one screenshot per slide), and keep times consistent with `eDM.html`.
- Copies outside the repo are refreshed too: the SharePoint
  `FSI_202611/01_강의자료/` Ch2 PDF (and PPTX if that folder keeps one; the
  SharePoint sync is done by the session that owns that folder), and the
  cover's 1분 미리보기 video `20261116/media/chapters/ch2-preview.mp4`,
  re-rendered from the new slides through the existing `04_Video` pipeline.
- Fake data only (synthetic MyData). No real keys, account IDs or names.
- Validation per AGENTS.md and docs/review.md; the content-review gate
  (score 85 or more, 0 Critical, 3 Warnings or fewer) before merge.

## Left to the builder

- Exact slide count within 36 to 40 and the per-slide minute split, as long as
  the parts stay near 17/12/16 and the total is 50.
- Whether each restored topic becomes its own slide or a step of a
  neighbouring slide.
- Diagram layouts, node names and step wording, within the rules above.
- The figures' drawing details after the Bedrock 101 scene is approved.
