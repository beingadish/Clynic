import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Empty = everyone authenticated. */
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    roles: [],
  },
  {
    label: 'Patients',
    to: '/patients',
    icon: Users,
    roles: ['TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  },
  {
    label: 'Appointments',
    to: '/appointments',
    icon: CalendarDays,
    roles: ['TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'],
  },
  {
    label: 'Organization',
    to: '/organization',
    icon: Building2,
    roles: ['TENANT_ADMIN'],
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: UserCircle,
    roles: [],
  },
];

/** Filter nav items to those visible for the given roles. */
export function visibleNav(userRoles: Role[]): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || item.roles.some((r) => userRoles.includes(r)),
  );
}
