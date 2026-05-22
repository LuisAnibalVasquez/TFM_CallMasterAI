export interface Call {
  id: string;
  campaignId: string;
  customerName: string;
  phone: string;
  language: string;
  age: number;
  duration?: number;
  status: string;
  cost: number;
  voiceflowTranscriptId?: string;
  createdAt: Date;
}
