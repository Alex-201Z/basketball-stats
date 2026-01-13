'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LeagueType } from '@/types';

interface LeagueSelectorProps {
  value: LeagueType;
  onChange: (value: LeagueType) => void;
}

export function LeagueSelector({ value, onChange }: LeagueSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeagueType)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner une ligue" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les ligues</SelectItem>
        <SelectItem value="nba">NBA</SelectItem>
        <SelectItem value="local">Ligue locale</SelectItem>
      </SelectContent>
    </Select>
  );
}
