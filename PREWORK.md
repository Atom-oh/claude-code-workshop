# 사전준비 (Pre-work) — Claude Code 설치 + Amazon Bedrock 연결

> 하나카드 차지백 AI 워크숍 참가자용 **사전준비 안내서**입니다.
> 이메일로 받으신 HTML 브로셔와 동일한 내용을, 저장소(repo) 안에서 바로 따라 할 수 있도록 정리한 **마크다운 동반 문서**입니다.
> 이 문서의 모든 명령어·환경변수 이름·모델 ID는 사전에 검증된 값을 그대로 사용합니다.

---

## 1. 개요

- **언제까지:** 워크숍 **전날(D-1)까지** 아래를 모두 완료해 주세요. 당일 10:00에는 **환경이 이미 준비되어 있다고 전제**하며, **Lab 0에서는 점검만** 합니다.
- **무엇을:** ① Claude Code 설치 → ② 고객(본인) AWS 계정에서 Amazon Bedrock 연결까지.
- **기기 권장:** **맥북(macOS) 권장** — 설치가 가장 간단하고, 셸 관련 주의사항이 적습니다. **Windows PC도 가능**하며 두 가지 경로(네이티브 / WSL2)를 아래에 모두 안내합니다.
- **PII 금지:** 실제 고객 개인정보(실명·주민번호·실 카드번호)는 어떤 단계에서도 입력하지 마세요. API 키 등 비밀 값은 저장소에 커밋하지 마세요.

---

## 2. 설치 — macOS (권장)

### 방법 A. npm 글로벌 설치 (크로스 플랫폼)

먼저 **Node.js LTS**(Node.js 18 이상)를 설치한 뒤:

```bash
npm install -g @anthropic-ai/claude-code
```

- ⚠️ **`sudo npm install -g` 사용 금지** — 권한/보안 문제가 발생합니다.
- 나중에 업그레이드할 때는 `npm install -g @anthropic-ai/claude-code@latest` 를 사용하세요 (`npm update -g` 은 피합니다).

### 방법 B. 네이티브 설치 스크립트 (macOS 권장 — 자동 업데이트)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

- npm 글로벌 설치와 **동일한 네이티브 바이너리**이며, 자동 업데이트를 지원합니다.

> 둘 중 하나만 하면 됩니다. 잘 모르겠으면 **방법 B(네이티브 스크립트)** 를 권장합니다.

---

## 3. 설치 — Windows PC

Windows에서는 두 가지 경로가 있습니다. **둘 중 하나**만 선택하면 됩니다.

### (a) 네이티브 Windows (Windows 10 1809+)

아래 세 가지 중 **하나**를 선택해 설치합니다.

```powershell
# PowerShell 설치 스크립트
irm https://claude.ai/install.ps1 | iex
```

```powershell
# WinGet
winget install Anthropic.ClaudeCode
```

```powershell
# npm (Node.js 18 이상 필요)
npm install -g @anthropic-ai/claude-code
```

- **Git for Windows 설치 권장:** Claude Code의 **Bash 도구**를 쓰려면 [Git for Windows](https://git-scm.com/download/win)를 설치하세요. 설치하지 않으면 Claude Code는 PowerShell 도구를 사용합니다.
- **샌드박스(sandboxing) 미지원**: 네이티브 Windows에서는 샌드박스가 지원되지 않습니다.
- **한 줄 장단점:** 설치가 가장 빠르지만, 샌드박스가 없고 셸 관련 주의사항이 있습니다.

### (b) WSL2 (Linux 툴체인 / 샌드박스 필요 시)

[WSL2](https://learn.microsoft.com/windows/wsl/install)를 설치한 뒤, **WSL 터미널 안에서** 다음을 실행합니다.

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

- **샌드박스 지원**, Linux 툴체인을 그대로 사용할 수 있습니다. WSL 환경에서는 **Git for Windows가 필요 없습니다.**
- **한 줄 장단점:** Linux 도구·샌드박스를 다 쓸 수 있어 가장 완전하지만, WSL2 초기 설정에 시간이 조금 더 듭니다.

> Bedrock 환경변수/자격증명은 **두 경로 모두 동일하게** 적용됩니다. `claude` 를 실행하는 셸에서 설정하거나, 설정 파일의 `env` 블록에 넣으면 됩니다.

---

## 4. Amazon Bedrock 연결 (고객 계정)

> 본인(고객)의 **AWS 계정**에서 진행합니다. 노트북에서 `aws configure` / SSO 없이, **Bedrock API Key** 가 자격증명을 대신합니다. 실행 리전 기준은 **ap-northeast-2 (서울)** 입니다.

### (a) Anthropic 모델 액세스 활성화

AWS 계정마다 **최초 1회**, 모델을 호출하기 전에:

1. [Amazon Bedrock 콘솔](https://console.aws.amazon.com/bedrock/) 로그인 (우측 상단 리전 선택을 **ap-northeast-2 / 서울**로).
2. 좌측 메뉴 → **Model catalog**(이전 콘솔 라벨: **Model access**) → **Anthropic** 모델(예: Claude Sonnet) 선택.
3. **use case form**(사용 사례 양식) 작성 → 제출 후 **즉시 액세스 허용**됩니다.
4. **AWS Organizations** 사용 시: 관리 계정에서 `PutUseCaseForModelAccess` API로 **한 번만** 제출하면 자식 계정에 자동 적용됩니다(참가자별 재제출 불필요).

> 모델 액세스는 **리전별**로 부여됩니다. 서울에서 활성화했더라도 US 리전에서 실행할 거라면 그 US 리전에서도 활성화하세요.

### (b) Inference Profile 확인

Bedrock은 보통 **inference profile** ID/ARN을 모델 ID로 요구합니다(맨 모델 ID를 쓰면 *"on-demand throughput isn't supported"* 오류). 본인 계정에서 사용 가능한 프로파일을 확인합니다.

```bash
aws bedrock list-inference-profiles --region ap-northeast-2
# (us.* 가용성 확인은 US 리전으로, 예: --region us-east-1)
```

> ⚠️ **prefix는 계정마다 다릅니다.** 반환되는 `inferenceProfileId` 의 접두어는 계정에 따라 **`global.` / `apac.` / `us.`** 등으로 다를 수 있습니다. 어떤 prefix를 쓸지 **추측하지 말고 반드시 `list-inference-profiles` 결과로 확인**하세요.
> - 계정에 `global.` 프로파일이 노출되면 **서울에서 가장 단순한 선택**입니다.
> - 없으면 `apac.`(서울) 또는 `us.`(US 리전 + US `AWS_REGION`)로 대체합니다.
>
> 이 문서의 아래 예시는 **`global.anthropic.claude-sonnet-4-5-20250929-v1:0`** 를 사용하지만, **본인 계정의 `list-inference-profiles` 출력값으로 교체**하세요.

### (c) Bedrock API Key 생성

API Key는 전체 AWS 자격증명 **대신** Bedrock 호출을 인증하는 **bearer token** 입니다(별도 `aws configure` 불필요). 키 생성 시 IAM 사용자가 자동 생성되며, 기본적으로 AWS 관리형 정책 **`AmazonBedrockLimitedAccess`** 가 연결됩니다 — 바로 시작하기에 충분합니다.

**콘솔 단계 (장기(long-term) 키 — 비개발자에게 가장 간단):**

1. Amazon Bedrock 콘솔 → 리전 선택을 대상 리전(서울이면 **ap-northeast-2**)으로.
2. 좌측 메뉴 → **API keys**.
3. **Long-term API keys** 탭 → **Generate long-term API keys** → **만료일(expiration)** 선택 → (필요 시 **Advanced permissions** 에서 추가 정책 연결) → **Generate**.
4. **키 값을 지금 복사**하세요. 이 값이 곧 **`AWS_BEARER_TOKEN_BEDROCK`** 입니다. 비밀로 취급하고 저장소에 커밋하지 마세요.

### (d) Claude Code 연결

#### 1순위 — `/setup-bedrock` 마법사 (권장)

환경변수를 직접 export 하지 않고 마법사로 설정합니다.

1. 터미널에서 `claude` 실행.
2. 로그인 화면 → **3rd-party platform → Amazon Bedrock** 선택.
3. 인증 방식에서 **Bedrock API key** 선택 후 (c)에서 복사한 키 붙여넣기. 마법사가 리전을 감지하고, 계정에서 호출 가능한 Claude 모델을 확인해 **핀(pin)** 한 뒤 사용자 설정 파일에 저장합니다.
4. 키/리전/모델을 바꾸려면 언제든 `/setup-bedrock` 을 다시 실행하세요.

#### 2순위 — 환경변수 수동 설정

직접 설정해야 하는 경우:

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=ap-northeast-2
export AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-5-20250929-v1:0'
# (선택) 백그라운드 작업(세션 제목 등)용 소형·고속 모델 핀
export ANTHROPIC_DEFAULT_HAIKU_MODEL='global.anthropic.claude-haiku-4-5-20251001-v1:0'
```

- **영속화(persist):**
  - **macOS / WSL2:** 위 `export` 줄을 `~/.bashrc` 또는 `~/.zshrc` 에 추가.
  - **Windows(네이티브):** GUI **환경 변수(Environment Variables)** 편집기 사용.
- `ANTHROPIC_MODEL` 값은 (b)의 `list-inference-profiles` 결과에 맞춰 **본인 계정의 프로파일 ID(또는 application inference profile ARN)** 로 교체하세요.
- `ANTHROPIC_DEFAULT_HAIKU_MODEL` 은 **선택**입니다(없어도 동작). Bedrock에서는 옛 `ANTHROPIC_SMALL_FAST_MODEL` 대신 이 변수를 쓰며, 계정에 Haiku 모델 액세스가 켜져 있을 때만 설정하세요. `/setup-bedrock` 마법사를 쓰면 자동으로 핀됩니다.

#### 동작 확인

`claude` 를 실행한 뒤, 세션 안에서 `/cost` 를 입력합니다. Bedrock 활성화 시 과금이 **`API Usage Billing`** 으로 표시되면 정상입니다.

---

## 5. 사전점검 체크리스트 (zero → working)

워크숍 **전날(D-1)까지** 아래를 모두 체크하세요.

- [ ] Claude Code 설치 완료 — `claude --version` 실행 시 버전 출력 (예: `2.1.187 (Claude Code)`)
- [ ] (Windows 네이티브에서 Bash 도구가 필요하면) Git for Windows 설치 완료
- [ ] Amazon Bedrock 콘솔에서 **Anthropic 모델 액세스** 활성화 완료
- [ ] `aws bedrock list-inference-profiles --region ap-northeast-2` 로 사용 가능한 inference profile **prefix 확인** (`global.` / `apac.` / `us.`)
- [ ] Bedrock **API Key** 생성 및 키 값 안전하게 보관
- [ ] Claude Code에 Bedrock 연결 완료 (`/setup-bedrock` 마법사 또는 환경변수 수동 설정)
- [ ] hello 테스트 — `claude` 실행 후 간단한 질문에 응답 확인, `/cost` 에서 `API Usage Billing` 표시 확인

---

## 6. 문의 / 헬프데스크

설치·연결 중 막히면 아래로 문의하세요.

- **워크숍 사전준비 헬프데스크:** _(담당자/채널 — 추후 기입)_
- **문의 채널:** _(이메일/메신저 — 추후 기입)_

> 당일 현장에서도 강사가 환경 점검을 도와드립니다. 사전에 해결이 어려우면 미리 알려주세요.
