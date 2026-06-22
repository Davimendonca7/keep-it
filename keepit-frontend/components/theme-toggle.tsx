'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-9 w-9 rounded-full"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[1.15rem] w-[1.15rem]" />
        ) : (
          <Moon className="h-[1.15rem] w-[1.15rem]" />
        )
      ) : (
        <div className="h-[1.15rem] w-[1.15rem]" />
      )}
    </Button>
  );
}
