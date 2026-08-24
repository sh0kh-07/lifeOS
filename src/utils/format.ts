import { Currency } from '../types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  UZS: 'UZS',
  EUR: '€',
  RUB: '₽',
};

export function formatMoney(amount: number, currency: Currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  
  if (currency === 'UZS') {
    return `${new Intl.NumberFormat('ru-RU').format(Math.round(amount))} сум`;
  }
  
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency === 'USD') return `$${formatted}`;
  if (currency === 'EUR') return `€${formatted}`;
  if (currency === 'RUB') return `${formatted} ₽`;
  return `${formatted} ${symbol}`;
}

export function formatPercentage(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
