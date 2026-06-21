'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/use-auth';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getStoredToken() ? '/dashboard' : '/login');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}
