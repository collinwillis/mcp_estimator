export function currencyRound(n: number) {
  return parseFloat(
    (Math.round(n * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2)
  );
}
