export const UserRole = {
  PlatformOwner: "PlatformOwner",
  TenantAdmin: "TenantAdmin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface Role {
  id: string;
  name: UserRole;
}
