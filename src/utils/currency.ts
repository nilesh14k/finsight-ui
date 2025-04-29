// src/utils/currency.ts
export function formatCurrency(
    value: number,
    currency: string = "USD",
    locale: string = navigator.language
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  }