'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { monthNames } from '@/lib/formatters';

export function MonthYearSelector({
  month,
  year,
  onChange,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}) {
  const goPrev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };
  const goNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const years = Array.from({ length: 5 }, (_, i) => year - 2 + i).filter(
    (y) => y >= 2020
  );
  if (!years.includes(year)) years.push(year);

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={goPrev}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5">
        <Select
          value={String(month)}
          onValueChange={(v) => onChange(Number(v), year)}
        >
          <SelectTrigger className="h-9 w-[8.5rem] gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthNames.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(year)}
          onValueChange={(v) => onChange(month, Number(v))}
        >
          <SelectTrigger className="h-9 w-[5.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years
              .sort((a, b) => a - b)
              .map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={goNext}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
