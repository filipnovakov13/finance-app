import { describe, it, expect } from 'vitest';
import { formatPrice, formatPercent, formatTick } from '../src/services/financeService';

describe('formatPrice', () => {
  it('formats a number to 2 decimal places', () => {
    expect(formatPrice(1234.5)).toBe('1,234.50');
    expect(formatPrice(0)).toBe('0.00');
    expect(formatPrice(19999.9)).toBe('19,999.90');
  });
});

describe('formatPercent', () => {
  it('prefixes positive values with +', () => {
    expect(formatPercent(1.25)).toBe('+1.25%');
  });
  it('does not add + to negative values', () => {
    expect(formatPercent(-0.5)).toBe('-0.50%');
  });
  it('handles zero', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });
});

describe('formatTick', () => {
  it('formats intraday ISO strings as HH:MM', () => {
    // Use a fixed UTC time so the test is timezone-independent with a known offset
    const iso = '2026-07-13T13:30:00.000Z';
    const result = formatTick(iso, 'day');
    // Accept any HH:MM format — the exact hour depends on local timezone
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('formats daily date strings as Mon DD', () => {
    const result = formatTick('2026-07-13', '7d');
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
