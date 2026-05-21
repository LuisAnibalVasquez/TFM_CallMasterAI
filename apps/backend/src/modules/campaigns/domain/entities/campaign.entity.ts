import {
  Campaign as ICampaign,
  CampaignStatus,
  CampaignEnvironment,
} from "@callmaster/shared";

export class Campaign implements ICampaign {
  id: string;
  tenantId: string;
  name: string;
  status: CampaignStatus;
  environment: CampaignEnvironment;
  csvUrl: string;
  createdAt: Date;

  constructor(props: ICampaign) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.status = props.status;
    this.environment = props.environment;
    this.csvUrl = props.csvUrl;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ICampaign, "id" | "createdAt" | "status">,
  ): Campaign {
    return new Campaign({
      ...props,
      id: crypto.randomUUID(),
      status: CampaignStatus.CREATED,
      createdAt: new Date(),
    });
  }
}
