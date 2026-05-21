import { Role } from "./role.interface";

export interface Profile {
  id: string;
  email: string;
  roleId: string;
  tenantId?: string;
  role?: Role;
}
