import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DayView } from './views/DayView/DayView';
import { WeekView } from './views/WeekView/WeekView';
import { QuarterView } from './views/QuarterView/QuarterView';
import { UserChart } from './components/UserChart/UserChart';
import styles from './App.module.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

type Tab = 'day' | '7d' | 'quarter' | 'custom';

const TABS: { id: Tab; label: string }[] = [
  { id: 'day',     label: 'Today' },
  { id: '7d',      label: 'Last 7 Days' },
  { id: 'quarter', label: 'Last Quarter' },
  { id: 'custom',  label: '🔍 Custom Symbol' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('day');

  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.logo}>📈 Finance Dashboard</h1>
          <nav className={styles.nav}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main className={styles.main}>
          {activeTab === 'day'     && <DayView />}
          {activeTab === '7d'      && <WeekView />}
          {activeTab === 'quarter' && <QuarterView />}
          {activeTab === 'custom'  && <UserChart />}
        </main>
      </div>
    </QueryClientProvider>
  );
}
