'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStoredToken } from '@/lib/use-auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TEMPORARIAMENTE DESABILITADO - Remove para testar as páginas
  // return <>{children}</>;

  // CÓDIGO ORIGINAL - DESABILITADO
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      const redirect = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?redirect=${redirect}`);
      return;
    }
    setChecked(true);
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
  
}
