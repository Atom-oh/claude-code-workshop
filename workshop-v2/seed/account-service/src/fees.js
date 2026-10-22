// 이체 수수료 계산 (연습용)
const RATE = { premium: 0.001, basic: 0.003 };

export function calcFee(amount, grade) {
  const rate = RATE[grade];
  return amount * rate;
}
