'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
}
