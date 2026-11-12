import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types';

type Tone = 'slate' | 'brand' | 'green' | 'amber' | 'red' | 'blue' | 'purple';

const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = 'slate', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusTone: Record<AppointmentStatus, Tone> = {
  BOOKED: 'blue',
  CHECKED_IN: 'brand',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabel: Record<AppointmentStatus, string> = {
  BOOKED: 'Booked',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={statusTone[status] ?? 'slate'}>{statusLabel[status] ?? status}</Badge>;
}

const roleTone: Record<string, Tone> = {
  TENANT_ADMIN: 'purple',
  DOCTOR: 'brand',
  NURSE: 'blue',
  RECEPTIONIST: 'amber',
  PATIENT: 'slate',
};

export function RoleBadge({ role }: { role: string }) {
  const label = role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge tone={roleTone[role] ?? 'slate'}>{label}</Badge>;
}
