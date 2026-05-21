export enum TenantStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

export interface AIProviderConfig {
  apiUrl: string;
  encryptedKey: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  contactEmail: string;
  contactPerson?: string;
  logoUrl?: string;
  status: TenantStatus;
  campaignCount: number;
  sandboxConfig: AIProviderConfig;
  productionConfig: AIProviderConfig;
}

export interface AIConfigInput {
  apiUrl: string;
  apiKey: string;
}

export interface CreateTenantInput {
  name: string;
  contactEmail: string;
  phone?: string;
  contactPerson?: string;
  logoUrl?: string;
  sandboxConfig: AIConfigInput;
  productionConfig: AIConfigInput;
}

export interface UpdateTenantInput {
  status?: TenantStatus;
  name?: string;
  phone?: string;
  contactEmail?: string;
  contactPerson?: string;
  logoUrl?: string;
  sandboxConfig?: AIConfigInput;
  productionConfig?: AIConfigInput;
}
