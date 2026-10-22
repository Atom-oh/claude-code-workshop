// 계좌 데이터 저장소 (가상 데이터, 실제 고객정보 아님)
// 주의: 일부 계좌는 kyc 필드가 없음 (KYC 마이그레이션 미수행 상황)
export const accounts = [
  { id: 1, name: "Kim", kyc: { grade: "premium" } },
  { id: 2, name: "Lee", kyc: { grade: "basic" } },
  { id: 3, name: "Park" },
];
