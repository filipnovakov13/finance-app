import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { HistoryPoint, TimeRange } from '../../types';
import { formatPrice, formatTick } from '../../services/financeService';

interface Series {
  symbol: string;
  label: string;
  data: HistoryPoint[];
  color: string;
}

interface Props {
  series: Series[];
  range: TimeRange;
  height?: number;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];

export function StockChart({ series, range, height = 320 }: Props) {
  // Merge all series into one array keyed by date for Recharts
  const dateMap = new Map<string, Record<string, number>>();

  for (const s of series) {
    for (const point of s.data) {
      if (!dateMap.has(point.date)) dateMap.set(point.date, { date: point.date as unknown as number });
      const entry = dateMap.get(point.date)!;
      entry[s.symbol] = point.close;
    }
  }

  const chartData = Array.from(dateMap.values()).sort((a, b) =>
    String(a['date']) < String(b['date']) ? -1 : 1,
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatTick(String(v), range)}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => formatPrice(Number(v))}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          width={80}
        />
        <Tooltip
          formatter={(value) => [formatPrice(Number(value)), '']}
          labelFormatter={(label) => formatTick(String(label), range)}
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
        {series.map((s, i) => (
          <Line
            key={s.symbol}
            type="monotone"
            dataKey={s.symbol}
            name={s.label}
            stroke={COLORS[i % COLORS.length]}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
