export function formatCurrency(amount: number): string {
  if (amount < 1_000) {
    return `RS ${amount.toString()}`;
  }

  const units = ["", "K", "M", "B", "T"];
  const order = Math.floor(Math.log10(amount) / 3); // Determine the magnitude (thousands, millions, etc.)
  const formattedAmount = (amount / Math.pow(1000, order)).toFixed(1); // Format the number with 1 decimal place
  return `RS ${formattedAmount}${units[order]}`;
}