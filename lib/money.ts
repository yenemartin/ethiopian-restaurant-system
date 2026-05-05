import type { MoneyBreakdown } from "./types";

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toCents(value: number) {
  return Math.round(roundMoney(value) * 100);
}

export function calculateTotals(subtotal: number, taxRate: number, serviceFee: number): MoneyBreakdown {
  const tax = roundMoney(subtotal * taxRate);
  const fee = roundMoney(serviceFee);
  return {
    subtotal: roundMoney(subtotal),
    tax,
    serviceFee: fee,
    total: roundMoney(subtotal + tax + fee),
  };
}
