import { useQuery } from '@tanstack/react-query';
import { INDICES } from '../../types';
import { fetchQuote } from '../../services/financeService';
import { fetchHistory } from '../../services/financeService';
import { QuoteCard } from '../../components/QuoteCard/QuoteCard';
import { StockChart } from '../../components/StockChart/StockChart';
import styles from './DayView.module.css';

export function DayView() {
  const quoteQueries = INDICES.map(idx =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['quote', idx.symbol],
      queryFn: () => fetchQuote(idx.symbol),
      refetchInterval: 60_000,
    }),
  );

  const historyQueries = INDICES.map(idx =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['history', idx.symbol, 'day'],
      queryFn: () => fetchHistory(idx.symbol, 'day'),
      refetchInterval: 60_000,
    }),
  );

  const isLoading = quoteQueries.some(q => q.isLoading) || historyQueries.some(q => q.isLoading);
  const isError   = quoteQueries.some(q => q.isError)   || historyQueries.some(q => q.isError);

  const series = INDICES.map((idx, i) => ({
    symbol: idx.symbol,
    label:  idx.label,
    data:   historyQueries[i]?.data ?? [],
    color:  '',
  })).filter(s => s.data.length > 0);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Today — Intraday</h2>

      {isLoading && <p className={styles.status}>Loading market data…</p>}
      {isError   && <p className={styles.error}>Failed to load some data. Check proxy.</p>}

      <div className={styles.cards}>
        {INDICES.map((idx, i) => {
          const q = quoteQueries[i];
          if (!q?.data) return <div key={idx.symbol} className={styles.placeholder}>{idx.label}</div>;
          return <QuoteCard key={idx.symbol} quote={q.data} />;
        })}
      </div>

      {series.length > 0 && (
        <div className={styles.chartWrap}>
          <StockChart series={series} range="day" />
        </div>
      )}
    </div>
  );
}
