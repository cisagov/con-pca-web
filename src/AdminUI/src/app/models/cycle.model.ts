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
  target_uuid: string;
  template_uuid: string;
  deception_level: string;
  send_date: Date;
  sent: boolean;
  sent_date: Date;
  error: string;
  timeline: CycleTargetTimelineModel[];
}

export class CycleModel {
  cycle_uuid: string;
  subscription_uuid: string;
  template_uuids: string[];
  start_date: Date;
  end_date: Date;
  send_by_date: Date;
  active: boolean;
  target_count: number;
  targets: CycleTargetModel[];
  processing: boolean;

  // Helper Attributes
  nonhuman: boolean;

  public constructor(init?: Partial<CycleModel>) {
    Object.assign(this, init);
  }
}
