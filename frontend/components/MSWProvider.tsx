'use client';

import { useEffect, useState } from 'react';

export default function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isWorkerReady, setIsWorkerReady] = useState(() => {
    if (typeof window === 'undefined') return true;
    return process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== 'true';
  });

  useEffect(() => {
    if (isWorkerReady) return;

    let cancelled = false;

    import('../mocks/browser')
      .then(({ worker }) => worker.start())
      .then(() => {
        if (!cancelled) setIsWorkerReady(true);
      })
      .catch(() => {
        if (!cancelled) setIsWorkerReady(true);
      });

    return () => { cancelled = true; };
  }, [isWorkerReady]);

  if (!isWorkerReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Initializing API mocks...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
