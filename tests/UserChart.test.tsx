import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserChart } from '../src/components/UserChart/UserChart';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('UserChart', () => {
  it('renders the form with a disabled Load button initially', () => {
    renderWithQuery(<UserChart />);
    expect(screen.getByRole('textbox', { name: /ticker symbol/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeDisabled();
  });

  it('enables Load button when input has a value', () => {
    renderWithQuery(<UserChart />);
    const input = screen.getByRole('textbox', { name: /ticker symbol/i });
    fireEvent.change(input, { target: { value: 'AAPL' } });
    expect(screen.getByRole('button', { name: /load/i })).not.toBeDisabled();
  });

  it('shows a quote card after submitting a valid symbol', async () => {
    renderWithQuery(<UserChart />);
    const input = screen.getByRole('textbox', { name: /ticker symbol/i });
    fireEvent.change(input, { target: { value: 'DJI' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      // MSW returns MOCK_QUOTE with name 'Dow Jones Industrial Average'
      expect(screen.getAllByText('Dow Jones Industrial Average').length).toBeGreaterThan(0);
    });
  });
});
