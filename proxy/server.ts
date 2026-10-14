import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const YF_BASE = 'https://query2.finance.yahoo.com/v8/finance/chart';
const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; finance-dashboard/1.0)',
  'Accept': 'application/json',
};

// ─── In-memory cache ────────────────────────────────────────────────────────

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

async function fetchWithCache(url: string, ttlMs: number): Promise<unknown> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && hit.expiresAt > now) return hit.data;

  // Deduplication: if a request for this URL is already in flight, wait for it
  const inflight = inFlight.get(url);
  if (inflight) return inflight;

  const promise = fetch(url, { headers: YF_HEADERS }).then(r => r.json());
  inFlight.set(url, promise);

  try {
    const data = await promise;
    cache.set(url, { data, expiresAt: now + ttlMs });
    return data;
  } finally {
    inFlight.delete(url);
  }
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/quote/:symbol
app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = (req.params['symbol'] ?? '').toUpperCase();
  try {
    const url = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
    const raw = await fetchWithCache(url, 60_000) as { chart: { result: Array<{ meta: Record<string, unknown> }> } };

    const meta = raw.chart.result[0]?.meta;
    if (!meta) { res.status(502).json({ error: 'No data from Yahoo Finance' }); return; }

    const price     = Number(meta['regularMarketPrice']);
    const prevClose = Number(meta['chartPreviousClose']);
    const change    = price - prevClose;

    res.json({
      symbol:                     String(meta['symbol'] ?? symbol),
      name:                       String(meta['longName'] ?? meta['shortName'] ?? symbol),
      regularMarketPrice:         price,
      regularMarketChange:        change,
      regularMarketChangePercent: prevClose !== 0 ? (change / prevClose) * 100 : 0,
      regularMarketVolume:        Number(meta['regularMarketVolume'] ?? 0),
      fiftyTwoWeekHigh:           Number(meta['fiftyTwoWeekHigh'] ?? 0),
      fiftyTwoWeekLow:            Number(meta['fiftyTwoWeekLow'] ?? 0),
      regularMarketTime:          Number(meta['regularMarketTime'] ?? 0),
    });
  } catch (err) {
    console.error(`[quote] ${symbol}`, err);
    res.status(502).json({ error: 'Upstream fetch failed' });
  }
});

// GET /api/history/:symbol?range=day|7d|quarter[&period1=YYYY-MM-DD&period2=YYYY-MM-DD]
app.get('/api/history/:symbol', async (req, res) => {
  const symbol = (req.params['symbol'] ?? '').toUpperCase();
  const range  = String(req.query['range'] ?? 'day');

  try {
    let url: string;
    let ttlMs: number;

    if (range === 'day') {
      // 5-minute intraday candles — preserve full ISO timestamps
      url   = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
      ttlMs = 60_000;
    } else {
      const period1 = String(req.query['period1'] ?? '');
      const period2 = String(req.query['period2'] ?? '');
      const p1 = Math.floor(new Date(period1).getTime() / 1000);
      const p2 = Math.floor(new Date(period2).getTime() / 1000);
      url   = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=1d&period1=${p1}&period2=${p2}`;
      ttlMs = range === '7d' ? 300_000 : 3_600_000;
    }

    const raw = await fetchWithCache(url, ttlMs) as {
      chart: { result: Array<{ timestamp: number[]; indicators: { quote: Array<{ open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }> } }> }
    };

    const result     = raw.chart.result[0];
    if (!result) { res.json([]); return; }

    const timestamps = result.timestamp ?? [];
    const ohlcv      = result.indicators.quote[0];
    if (!ohlcv) { res.json([]); return; }

    const history = timestamps
      .map((t, i) => ({
        date:   range === 'day'
          ? new Date(t * 1000).toISOString()            // full ISO for intraday
          : new Date(t * 1000).toISOString().slice(0, 10), // YYYY-MM-DD for daily
        open:   ohlcv.open[i]   ?? 0,
        high:   ohlcv.high[i]   ?? 0,
        low:    ohlcv.low[i]    ?? 0,
        close:  ohlcv.close[i]  ?? 0,
        volume: ohlcv.volume[i] ?? 0,
      }))
      .filter(p => p.close > 0);

    res.json(history);
  } catch (err) {
    console.error(`[history] ${symbol}`, err);
    res.status(502).json({ error: 'Upstream fetch failed' });
  }
});

// ─── Start ──────────────────────────────────────────────────────────────────

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Finance proxy running on http://localhost:${PORT}`);
});
