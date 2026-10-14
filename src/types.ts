export interface StockQuote {
  symbol: string;
  name: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketTime: number;
}

export interface HistoryPoint {
  date: string; // ISO string: full for intraday, YYYY-MM-DD for daily
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeRange = 'day' | '7d' | 'quarter';

export const INDICES = [
  { symbol: '^STOXX50E', label: 'Euro Stoxx 50' },
  { symbol: '^GDAXI',    label: 'DAX' },
  { symbol: '^N225',     label: 'Nikkei 225' },
  { symbol: '^DJI',      label: 'Dow Jones' },
  { symbol: 'URTH',      label: 'MSCI World' },
] as const;

export type IndexSymbol = (typeof INDICES)[number]['symbol'];
