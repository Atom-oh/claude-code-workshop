import { accounts } from "./accounts.js";

export function getAccount(id) {
  return accounts.find((a) => a.id === id);
}

export function getAccountGrade(id) {
  const account = getAccount(id);
  return account.kyc.grade;
}
