import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// Filter React Router v7 future-flag warnings in tests
const warn = console.warn;
beforeAll(() => {
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('React Router Future Flag')) return;
    warn(...(args as any));
  });
});
afterAll(() => (console.warn as any).mockRestore?.());
