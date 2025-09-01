// src/test/setup.ts
import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

const originalWarn = console.warn;

const FILTERS = [
  'React Router Future Flag',   
  'v7_startTransition',        
  'v7_relativeSplatPath',      
];

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const first = String(args[0] ?? '');
    if (FILTERS.some((s) => first.includes(s))) return;

    originalWarn(...(args as Parameters<typeof originalWarn>));
  });
});

afterAll(() => {
  warnSpy.mockRestore();
});
