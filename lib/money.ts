export function normalizeUsdcAmount(input: string) {
  const trimmed = input.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    throw new Error("Amount must be a positive USDC value with up to 6 decimals.");
  }

  const [whole, fraction = ""] = trimmed.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  return fraction.length > 0 ? `${normalizedWhole}.${fraction}` : normalizedWhole;
}

export function decimalToUsdcMicros(input: string) {
  const normalized = normalizeUsdcAmount(input);
  const [whole, fraction = ""] = normalized.split(".");
  const paddedFraction = fraction.padEnd(6, "0");
  return BigInt(whole) * 1_000_000n + BigInt(paddedFraction);
}

export function formatUsdc(input: string) {
  const normalized = normalizeUsdcAmount(input);
  return `${normalized} USDC`;
}
