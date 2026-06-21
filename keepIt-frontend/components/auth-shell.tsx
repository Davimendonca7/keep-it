'use client';

import { Wallet } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_30rem_at_50%_-10%,hsl(var(--primary)/0.10),transparent)]"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Wallet className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">KeepIt</h1>
          <p className="text-xs text-muted-foreground">
            Controle financeiro pessoal
          </p>
        </div>
      </div>
      <div className="w-full max-w-sm animate-slide-up">{children}</div>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
