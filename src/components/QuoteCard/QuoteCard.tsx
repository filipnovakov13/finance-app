import type { StockQuote } from '../../types';
import { formatPercent, formatPrice } from '../../services/financeService';
import styles from './QuoteCard.module.css';

interface Props {
  quote: StockQuote;
}

export function QuoteCard({ quote }: Props) {
  const isPositive = quote.regularMarketChange >= 0;

  return (
    <div className={`${styles.card} ${isPositive ? styles.positive : styles.negative}`}>
      <div className={styles.header}>
        <span className={styles.symbol}>{quote.symbol}</span>
        <span className={styles.name}>{quote.name}</span>
      </div>
      <div className={styles.price}>{formatPrice(quote.regularMarketPrice)}</div>
      <div className={styles.change}>
        <span>{formatPrice(Math.abs(quote.regularMarketChange))}</span>
        <span>{formatPercent(quote.regularMarketChangePercent)}</span>
      </div>
      <div className={styles.meta}>
        <span>52W H: {formatPrice(quote.fiftyTwoWeekHigh)}</span>
        <span>52W L: {formatPrice(quote.fiftyTwoWeekLow)}</span>
      </div>
    </div>
  );
}
