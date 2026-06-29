---
name: chargeback-1cb
description: 분쟁 서류 작성 규칙 (재반박·1CB). draft-writer가 영문 초안을 만들 때 따르는 서류 구조·톤·필수문구·증빙 매핑을 정의한다. 기본(PRIMARY)은 매입사 재반박서(Acquirer Dispute Response/Representment), 보조(SECONDARY)는 발급사 1CB 카드홀더레터. 차지백 분쟁 서류를 작성하거나 검토할 때 사용.
---

# 분쟁 서류 작성 규칙 (재반박·1CB)

> 이 스킬은 분쟁 서류 중 **본문(영문)** 작성 규칙입니다.
> 첫 장(웹시스템 자동생성)·증빙 첨부 자체는 범위 밖이고, **본문 영문 작성 + 증빙 목록 선별**을 다룹니다.
> 방향에 따라 두 모드가 있습니다 — **재반박이 기본(PRIMARY), 1CB가 보조(SECONDARY)**.
> (폴더명은 `chargeback-1cb`지만 내용은 양쪽을 모두 다룹니다.)

| 모드 | 우리 입장 | 화자 | 요청 | 증빙 출처 | 규정 근거 |
|------|-----------|------|------|-----------|-----------|
| **재반박 (Acquirer Dispute Response)** ⭐기본 | 매입사 | 매입사가 가맹점 대리 | 책임 재배정(분쟁 반박) | **가맹점** | 매입사 응답요건 §11.10.2.6, Table 11-94/11-95 |
| 1CB 카드홀더레터 (보조) | 발급사 | 발급사가 카드홀더 대리 | 대금 반환(차지백 청구) | 카드홀더 | 발급사 제출요건 §11.10.2.5 |

---

## 1. 재반박서 구조 (PRIMARY — 이 순서로)

매입사인 하나카드가 **가맹점을 대신해** 카드홀더의 차지백을 반박하는 서류입니다.

1. **Header** — 수신(상대 발급사/VISA), 발신(하나카드 = Acquirer, 가맹점 대리), 케이스/거래 식별자
2. **Summary of the Dispute (사건 요지)** — 카드홀더가 제기한 사유코드·주장을 객관적으로 요약
3. **Acquirer's Defense on Behalf of the Merchant (매입사/가맹점 방어 논거)** — 거래가 정당함, 카드홀더 주장 반박
4. **Regulatory Basis (규정 근거)** — 적용 VISA 사유코드 + **매입사 응답요건(§11.10.2.6, Table 11-94·11-95)** 충족
5. **Compelling Evidence Submitted (제출 증빙 목록)** — 가맹점 자료를 번호로 (운항·탑승 증빙, 3DS 인증기록, 거래 상세 등)
6. **Request (요청)** — 책임 재배정(분쟁 반박)을 명확히 요청

### 재반박 필수 문구 (placeholder — 워크숍에서 실제 양식으로 교체)
- 도입부: `As the Acquirer, on behalf of our merchant, we hereby respond to and dispute the chargeback referenced below.`
- 규정 근거: `This dispute response is submitted under VISA Reason Code [CODE] ([NAME]), and the acquirer-response requirements (Table 11-94/11-95) are met as set out below.`
- 요청: `We respectfully request that liability be reassigned to the Issuer, as the transaction is valid and supported by the compelling evidence enclosed.`
- 마무리: `Compelling evidence is enclosed as listed below.`
- `[TODO: 하나카드 실제 재반박 제출 양식의 정식 머리말/맺음말·법인명·연락처로 교체]`

---

## 2. 1CB 카드홀더레터 구조 (SECONDARY — 아웃바운드 전용)

발급사인 하나카드가 **카드홀더를 대신해** 매입사에 처음 청구하는 서류입니다.

1. **Greeting / Header** — 수신(매입사 측), 발신(카드 발급사), 케이스/거래 식별자
2. **Statement of Facts (사실관계)** — 거래일·가맹점·금액, 무슨 일이 있었는지 (시간순, 객관적으로)
3. **Reason Code & Regulatory Basis (규정 근거)** — 적용 VISA 사유코드 충족
4. **Request (요청)** — 차지백(대금 반환) 요청을 명확히
5. **List of Enclosed Evidence (증빙 목록)** — 카드홀더 제출 증빙을 번호로

### 1CB 필수 문구 (placeholder — 워크숍에서 실제 양식으로 교체)
- 도입부: `On behalf of our cardholder, we are submitting this First Chargeback regarding the transaction detailed below.`
- 규정 근거: `This dispute is filed under VISA Reason Code [CODE] ([NAME]), the conditions of which are met as set out below.`
- 요청: `We hereby request a chargeback in the amount of [AMOUNT] [CURRENCY] for the transaction dated [DATE].`
- 마무리: `Supporting documentation is enclosed as listed below.`
- `[TODO: 하나카드 실제 1CB 제출 양식의 정식 머리말/맺음말·법인명·연락처로 교체]`

---

## 3. 톤 / 문체 (공통)

- **격식 있는 비즈니스 영어.** 1인칭 감정 표현 금지, 사실 중심.
- 짧고 단정한 문장. 모호어("maybe", "I think") 금지.
- 재반박은 **매입사가 가맹점을 대리 진술**, 1CB는 **발급사가 카드홀더를 대리 진술**. 두 화자를 섞지 않습니다.
- 금액·날짜는 정확히. 모르면 지어내지 말고 `[CONFIRM: ...]` placeholder.

## 4. 증빙 매핑 (단일 출처 참조)

- 증빙 매핑은 `rules/visa-rules.md`를 **단일 출처**로 참조한다 (중복 정의 금지).
- 어떤 사유코드·어떤 방향에 어떤 증빙이 필요한지는 이 파일에 다시 적지 않고, **항상 `rules/visa-rules.md`** 를 따른다.
  - 인바운드(재반박) → 해당 코드의 **매입사 응답요건(Table 11-94/11-95) 필수/유리 증빙**
  - 아웃바운드(1CB) → 해당 코드의 **발급사 제출요건 필수서류**
- 증빙은 **필수 항목을 먼저** 채우고, 그다음 "방어/승인 가능성을 높이는" compelling evidence만 선별합니다 (불필요한 자료 남발 금지).
- 케이스에 없는 필수 증빙은 본문에 적되 `[MISSING: ...]` 로 표시해 담당자가 보완하게 합니다.

## 5. 출력 규칙

- **본문은 영문.** 상단/하단 메타(DRAFT 표시, 증빙 체크리스트, 담당자 확인 항목)는 한국어.
- 상단 메타에 **모드·방향·사유코드**를 명시: `모드: [재반박/1CB] · 방향: [인바운드/아웃바운드] · 사유코드: [확정코드]`
- 항상 초안임을 명시: 자동 제출하지 않으며 담당자 승인 후 사용.
- 저장 위치: 재반박 = 해당 케이스 폴더의 `output/representment-draft.md`, 1CB = `output/1cb-draft.md`.
