import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DayView } from '../src/views/DayView/DayView';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('DayView', () => {
  it('renders the Intraday heading', () => {
    renderWithQuery(<DayView />);
    expect(screen.getByText(/Intraday/i)).toBeInTheDocument();
  });

  it('renders quote cards once data loads', async () => {
    renderWithQuery(<DayView />);
    await waitFor(() => {
      // The mock returns the same ^DJI quote for all 5 indices — getAllByText handles multiples
      const cards = screen.getAllByText('Dow Jones Industrial Average');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
