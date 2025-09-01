vi.mock('@/lib/firebase', () => ({ db: {} as any }));

import { renderHook, act } from '@testing-library/react';
import * as AuthCtx from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';

// Mock auth so the hook runs in "logged out" (local only) mode.
vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
  user: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
} as any);

beforeEach(() => localStorage.clear());

it('adds / removes ids and persists to localStorage', () => {
  const { result } = renderHook(() => useWatchlist());

  act(() => result.current.add(42));
  expect(result.current.has(42)).toBe(true);
  expect(JSON.parse(localStorage.getItem('moviemuse_watchlist') || '[]')).toEqual([42]);

  act(() => result.current.remove(42));
  expect(result.current.has(42)).toBe(false);
  expect(JSON.parse(localStorage.getItem('moviemuse_watchlist') || '[]')).toEqual([]);
});
