import {
  Tenant as ITenant,
  TenantStatus,
  AIProviderConfig,
} from "@callmaster/shared";

export class Tenant implements ITenant {
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

  constructor(props: ITenant & { contactPerson?: string }) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.contactEmail = props.contactEmail;
    this.contactPerson = props.contactPerson;
    this.logoUrl = props.logoUrl;
    this.status = props.status;
    this.campaignCount = props.campaignCount ?? 0;
    this.sandboxConfig = props.sandboxConfig;
    this.productionConfig = props.productionConfig;
  }

  /**
   * Determines whether the tenant can be safely deleted.
   * A tenant can only be deleted if it has zero campaigns.
   * The campaign count is resolved by the use-case, not the entity.
   */
  canBeDeleted(campaignCount: number): boolean {
    return campaignCount === 0;
  }

  /**
   * Toggles the tenant status between active and suspended.
   * Returns the new status.
   */
  toggleStatus(): TenantStatus {
    if (this.status === TenantStatus.ACTIVE) {
      this.status = TenantStatus.SUSPENDED;
    } else {
      this.status = TenantStatus.ACTIVE;
    }
    return this.status;
  }
}
