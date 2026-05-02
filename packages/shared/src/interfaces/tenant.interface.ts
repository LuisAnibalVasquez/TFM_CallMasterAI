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
  logoUrl?: string;
  status: TenantStatus;
  sandboxConfig: AIProviderConfig;
  productionConfig: AIProviderConfig;
}
