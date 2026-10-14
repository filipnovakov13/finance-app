import { http, HttpResponse } from 'msw';
import type { StockQuote, HistoryPoint } from '../../src/types';

const MOCK_QUOTE: StockQuote = {
  symbol: '^DJI',
  name: 'Dow Jones Industrial Average',
  regularMarketPrice: 39_000,
  regularMarketChange: 120,
  regularMarketChangePercent: 0.31,
  regularMarketVolume: 280_000_000,
  fiftyTwoWeekHigh: 41_000,
  fiftyTwoWeekLow: 32_000,
  regularMarketTime: 1720000000,
};

const MOCK_HISTORY: HistoryPoint[] = [
  { date: '2026-07-07T13:30:00.000Z', open: 38_900, high: 39_100, low: 38_800, close: 39_000, volume: 10_000 },
  { date: '2026-07-07T13:35:00.000Z', open: 39_000, high: 39_200, low: 38_950, close: 39_100, volume: 12_000 },
  { date: '2026-07-07T13:40:00.000Z', open: 39_100, high: 39_300, low: 39_050, close: 39_200, volume: 9_500 },
];

export const handlers = [
  http.get('/api/quote/:symbol', () => {
    return HttpResponse.json(MOCK_QUOTE);
  }),

  http.get('/api/history/:symbol', () => {
    return HttpResponse.json(MOCK_HISTORY);
  }),
];
