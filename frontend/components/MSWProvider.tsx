'use client';

import { useEffect } from 'react';

const mockDisabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== 'true';

export default function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (mockDisabled) return;

    let cancelled = false;

    import('../mocks/browser')
      .then(({ worker }) => worker.start())
      .then(() => {
        if (!cancelled) console.log('[MSW] Ready');
      })
      .catch(() => {
        if (!cancelled) console.log('[MSW] Failed to start');
      });

    return () => { cancelled = true; };
  }, []);

  return <>{children}</>;
}
