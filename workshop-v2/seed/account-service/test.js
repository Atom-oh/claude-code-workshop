import { getAccountGrade } from "./src/accountService.js";
import { calcFee } from "./src/fees.js";

let failed = 0;
function check(name, fn, expected) {
  let actual;
  try { actual = fn(); } catch (e) { actual = `throws ${e.constructor.name}`; }
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${name}: ${ok ? "PASS" : `FAIL (got ${actual})`}`);
}

check("Test 1 - premium 등급 계좌", () => getAccountGrade(1), "premium");
check("Test 2 - basic 등급 계좌", () => getAccountGrade(2), "basic");
check("Test 3 - kyc 없는 계좌", () => getAccountGrade(3), "unknown");
check("Test 4 - premium 수수료 100000원", () => calcFee(100000, "premium"), 100);
process.exit(failed ? 1 : 0);
