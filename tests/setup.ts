/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Recharts ResponsiveContainer uses ResizeObserver — jsdom doesn't implement it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
