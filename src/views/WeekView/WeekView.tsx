import { useQuery } from '@tanstack/react-query';
import { INDICES } from '../../types';
import { fetchHistory } from '../../services/financeService';
import { StockChart } from '../../components/StockChart/StockChart';
import styles from './WeekView.module.css';

export function WeekView() {
  const queries = INDICES.map(idx =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['history', idx.symbol, '7d'],
      queryFn: () => fetchHistory(idx.symbol, '7d'),
      refetchInterval: 300_000,
    }),
  );

  const isLoading = queries.some(q => q.isLoading);
  const isError   = queries.some(q => q.isError);

  const series = INDICES.map((idx, i) => ({
    symbol: idx.symbol,
    label:  idx.label,
    data:   queries[i]?.data ?? [],
    color:  '',
  })).filter(s => s.data.length > 0);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Last 7 Days — Trend Comparison</h2>

      {isLoading && <p className={styles.status}>Loading…</p>}
      {isError   && <p className={styles.error}>Failed to load some data.</p>}

      {series.length > 0 && (
        <div className={styles.chartWrap}>
          <StockChart series={series} range="7d" height={380} />
        </div>
      )}
    </div>
  );
}
