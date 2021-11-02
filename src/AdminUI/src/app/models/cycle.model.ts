export class TimelineDetailsModel {
  user_agent: string;
  ip: string;
  asn_org: string;
}

export class CycleTargetTimelineModel {
  time: Date;
  message: string;
  details: TimelineDetailsModel;
}

export class CycleTargetModel {
  _id: string;
  template_id: string;
  deception_level: string;
  send_date: Date;
  sent: boolean;
  sent_date: Date;
  error: string;
  timeline: CycleTargetTimelineModel[];
}

export class CycleModel {
  _id: string;
  subscription_id: string;
  template_ids: string[];
  start_date: Date;
  end_date: Date;
  send_by_date: Date;
  active: boolean;
  target_count: number;
  targets: CycleTargetModel[];
  processing: boolean;
  phish_header: string;

  // Helper Attributes
  nonhuman: boolean;

  public constructor(init?: Partial<CycleModel>) {
    Object.assign(this, init);
  }
}
