import { Currency } from '../types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  UZS: 'сум',
};

/**
 * Formats a raw number or string with spaces as thousand separators: e.g. 50000 -> "50 000"
 */
export function formatNumberWithSpaces(value: number | string): string {
  if (value === '' || value === undefined || value === null) return '';
  const str = String(value).trim().replace(/\s+/g, '');
  if (!str) return '';
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
}

/**
 * Cleans spaced string back to standard numeric string/number
 */
export function parseFormattedNumber(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/\s+/g, '').replace(/,/g, '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats monetary amounts strictly in UZS with space separator: e.g. "50 000 сум"
 */
export function formatMoney(amount: number, _currency: Currency = 'UZS'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 сум';
  }
  const rounded = Math.round(amount);
  const formatted = formatNumberWithSpaces(rounded);
  return `${formatted} сум`;
}

/**
 * Formats Uzbek phone numbers consistently into +998 XX XXX-XX-XX format
 */
export function formatUzbekPhone(value: string): string {
  if (!value) return '+998 ';
  // Extract all digits
  let digits = value.replace(/\D/g, '');

  // If digits start with 998, strip it for uniform processing
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  // Limit to 9 national digits (e.g. 90 123 45 67)
  digits = digits.slice(0, 9);

  let formatted = '+998';
  if (digits.length > 0) {
    formatted += ` ${digits.slice(0, 2)}`;
  }
  if (digits.length >= 3) {
    formatted += ` ${digits.slice(2, 5)}`;
  }
  if (digits.length >= 6) {
    formatted += `-${digits.slice(5, 7)}`;
  }
  if (digits.length >= 8) {
    formatted += `-${digits.slice(7, 9)}`;
  }

  return formatted;
}

export function formatPercentage(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

