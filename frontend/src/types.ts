/**
 * Shared API model types for the Clynic 2.0 platform.
 * These mirror the JSON contracts exposed through the API gateway.
 */

// ---------------------------------------------------------------------------
// Auth & identity
// ---------------------------------------------------------------------------

export type Role =
  | 'TENANT_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'PATIENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  roles: Role[];
}

export type CareMode = 'HUMAN' | 'VETERINARY';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  tenantSlug: string;
  tenantName: string;
  careMode: CareMode;
}

export interface RefreshRequest {
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

export type PlanTier = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | string;
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | string;

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  careMode: CareMode;
  planTier: PlanTier;
  status: TenantStatus;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
}

export interface CreateFacilityRequest {
  name: string;
  type: string;
  address: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export type SubjectType = 'HUMAN' | 'ANIMAL';

export interface PatientResponse {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string; // yyyy-mm-dd
  address: string;
  phone: string;
  subjectType: SubjectType;
  registeredDate: string;
}

export interface PatientRequest {
  name: string;
  email: string;
  dateOfBirth: string; // yyyy-mm-dd
  address: string;
  phone: string;
  subjectType: SubjectType;
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'CANCELLED'
  | 'COMPLETED';

export interface AppointmentResponse {
  id: string;
  patientId: string;
  practitionerId: string;
  departmentId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  reason: string;
  status: AppointmentStatus;
}

export interface AppointmentRequest {
  patientId: string;
  practitionerId: string;
  departmentId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  reason: string;
}
