import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Accent = 'brand' | 'blue' | 'amber' | 'purple' | 'green';

const accents: Record<Accent, string> = {
  brand: 'bg-brand-50 text-brand-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-emerald-50 text-emerald-600',
};

interface StatTileProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: Accent;
  isLoading?: boolean;
  hint?: string;
}

export function StatTile({ label, value, icon: Icon, accent = 'brand', isLoading, hint }: StatTileProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accents[accent])}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">
        {isLoading ? <Spinner size={22} /> : value}
      </div>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
