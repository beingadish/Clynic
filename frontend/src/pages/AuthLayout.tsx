import type { ReactNode } from 'react';
import { HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <HeartPulse size={22} />
          </span>
          <span className="text-lg font-semibold">Clynic 2.0</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Modern care, for humans and animals alike.
          </h2>
          <p className="mt-4 text-brand-100">
            A multi-tenant hospital platform for patient registries, scheduling, and clinical
            operations — built for teams of every size.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-brand-50">
            <li className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-brand-200" />
              Secure, tenant-isolated data
            </li>
            <li className="flex items-center gap-3">
              <Stethoscope size={18} className="text-brand-200" />
              Human & veterinary care modes
            </li>
            <li className="flex items-center gap-3">
              <HeartPulse size={18} className="text-brand-200" />
              Real-time patient & appointment management
            </li>
          </ul>
        </div>

        <p className="text-xs text-brand-200">© {new Date().getFullYear()} Clynic. All rights reserved.</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-16 h-56 w-56 rounded-full bg-brand-400/20 blur-2xl" />
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <HeartPulse size={20} />
            </span>
            <span className="text-lg font-semibold text-slate-900">Clynic 2.0</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
