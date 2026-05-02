export type UserRole = "PlatformOwner" | "TenantAdmin";

export interface Role {
  id: string;
  name: UserRole;
}
