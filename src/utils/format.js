/**
 * Format a number as EU-style currency: $ 1.200,00
 * Matches the CLI app's formatting convention.
 */
export function formatCurrency(amount) {
  const fixed = Math.abs(amount).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${amount < 0 ? '-' : ''}${withDots},${decPart}`;
}

/**
 * Format today's date as DD/MM/YYYY
 */
export function todayFormatted() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
