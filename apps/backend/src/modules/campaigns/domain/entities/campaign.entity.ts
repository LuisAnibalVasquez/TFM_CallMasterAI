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
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalCost: number;
  createdAt: Date;

  constructor(props: ICampaign) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.status = props.status;
    this.environment = props.environment;
    this.csvUrl = props.csvUrl;
    this.totalCalls = props.totalCalls ?? 0;
    this.successfulCalls = props.successfulCalls ?? 0;
    this.failedCalls = props.failedCalls ?? 0;
    this.totalCost = props.totalCost ?? 0;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<
      ICampaign,
      | "id"
      | "createdAt"
      | "status"
      | "totalCalls"
      | "successfulCalls"
      | "failedCalls"
      | "totalCost"
    >,
  ): Campaign {
    return new Campaign({
      ...props,
      id: crypto.randomUUID(),
      status: CampaignStatus.CREATED,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      createdAt: new Date(),
    });
  }
}
