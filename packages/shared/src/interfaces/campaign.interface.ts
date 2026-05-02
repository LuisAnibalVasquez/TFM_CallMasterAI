export enum CampaignStatus {
  CREATED = "Created",
  IN_PROGRESS = "In-Progress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum CampaignEnvironment {
  SANDBOX = "Sandbox",
  PRODUCTION = "Production",
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  status: CampaignStatus;
  environment: CampaignEnvironment;
  csvUrl: string;
  createdAt: Date;
}
