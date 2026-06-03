'use client';

import { useEffect, useState } from 'react';

const isServer = typeof window === 'undefined';
const mockDisabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== 'true';
const skipMSW = isServer || mockDisabled;

export default function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(skipMSW);

  useEffect(() => {
    if (skipMSW) return;

    let cancelled = false;

    import('../mocks/browser')
      .then(({ worker }) => worker.start())
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => { cancelled = true; };
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
