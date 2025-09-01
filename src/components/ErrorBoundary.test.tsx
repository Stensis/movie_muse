import React, { type FC } from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Boom: FC = () => {
  throw new Error('boom');
};

describe('<ErrorBoundary />', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => consoleSpy.mockRestore());

  it('renders fallback when child throws', async () => {
    expect(() =>
      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      )
    ).not.toThrow();

    await screen.findByText(/something went wrong/i);
  });
});
