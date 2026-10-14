import type { HistoryPoint, StockQuote, TimeRange } from '../types';

export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const res = await fetch(`/api/quote/${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`Failed to fetch quote for ${symbol}: ${res.status}`);
  return res.json() as Promise<StockQuote>;
}

export async function fetchHistory(
  symbol: string,
  range: TimeRange,
): Promise<HistoryPoint[]> {
  const params = buildHistoryParams(range);
  const url = `/api/history/${encodeURIComponent(symbol)}?range=${range}${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}: ${res.status}`);
  return res.json() as Promise<HistoryPoint[]>;
}

function buildHistoryParams(range: TimeRange): string {
  if (range === 'day') return '';

  const now = new Date();
  const period2 = toDateStr(now);

  let period1: string;
  if (range === '7d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    period1 = toDateStr(d);
  } else {
    // quarter = ~90 days
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    period1 = toDateStr(d);
  }

  return `&period1=${period1}&period2=${period2}`;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Format a price number for display */
export function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format a change percent */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** Format a tick label for a chart axis */
export function formatTick(isoStr: string, range: TimeRange): string {
  if (range === 'day') {
    // intraday: show HH:MM
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  // daily: show MMM DD
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
