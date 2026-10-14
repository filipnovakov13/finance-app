import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHistory, fetchQuote } from '../../services/financeService';
import { QuoteCard } from '../QuoteCard/QuoteCard';
import { StockChart } from '../StockChart/StockChart';
import styles from './UserChart.module.css';

export function UserChart() {
  const [input, setInput]     = useState('');
  const [symbol, setSymbol]   = useState('');

  const quoteQuery = useQuery({
    queryKey: ['quote', symbol],
    queryFn:  () => fetchQuote(symbol),
    enabled:  symbol.length > 0,
    retry:    1,
  });

  const historyQuery = useQuery({
    queryKey: ['history', symbol, 'day'],
    queryFn:  () => fetchHistory(symbol, 'day'),
    enabled:  symbol.length > 0,
    retry:    1,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    if (trimmed) setSymbol(trimmed);
  }

  const series = symbol && historyQuery.data && historyQuery.data.length > 0
    ? [{ symbol, label: quoteQuery.data?.name ?? symbol, data: historyQuery.data, color: '' }]
    : [];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Custom Index / Symbol</h2>
      <p className={styles.description}>
        Enter any Yahoo Finance ticker symbol (e.g. <code>AAPL</code>, <code>^FTSE</code>, <code>BTC-USD</code>)
        to see an intraday chart alongside the existing dashboards.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. AAPL"
          aria-label="Ticker symbol"
          spellCheck={false}
          autoCapitalize="characters"
        />
        <button type="submit" className={styles.button} disabled={!input.trim()}>
          Load
        </button>
      </form>

      {symbol && (
        <div className={styles.result} data-testid="user-chart-result">
          {(quoteQuery.isLoading || historyQuery.isLoading) && (
            <p className={styles.status}>Loading data for <strong>{symbol}</strong>…</p>
          )}

          {(quoteQuery.isError || historyQuery.isError) && (
            <p className={styles.error}>
              Could not load data for <strong>{symbol}</strong>. Check the symbol and try again.
            </p>
          )}

          {quoteQuery.data && !quoteQuery.isLoading && (
            <div className={styles.card}>
              <QuoteCard quote={quoteQuery.data} />
            </div>
          )}

          {series.length > 0 && (
            <div className={styles.chartWrap}>
              <StockChart series={series} range="day" />
            </div>
          )}

          {historyQuery.data && historyQuery.data.length === 0 && !historyQuery.isLoading && !historyQuery.isError && (
            <p className={styles.status}>No intraday data available for <strong>{symbol}</strong>.</p>
          )}
        </div>
      )}
    </div>
  );
}
