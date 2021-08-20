import { Contact } from './customer.model';
import * as moment from 'node_modules/moment/moment';
import { Cycle } from './cycle.model';

export class GoPhishCampaignModel {
  campaign_id: Number;
  completed_date?: Date;
  created_date: Date;
  email_template: string;
  groups: any[];
  landing_page_template: string;
  launch_date: Date;
  name: string;
  results: any[];
  send_by_date: Date;
  status: string;
  target_email_list: any[];
  timeline: CampaignTimelineItem[];
}

export class CampaignTimelineItem {
  email: string;
  time: Date;
  message: string;
  details: string;
}

// Use Contact class  defined in customer.model
// export class SubscriptionContactModel{
//     first_name: string;
//     last_name: string;
//     office_phone: string;
// }

export interface SubscriptionClicksModel {}

export class Subscription {
  subscription_uuid: string;
  name: string;
  customer_uuid: string;
  target_domain: string;
  start_date: Date;
  primary_contact: Contact;
  admin_email: string;
  status: string;
  target_email_list: Target[] = [];
  templates_selected: TemplateSelected;
  sending_profile_uuid: string;
  active: boolean;
  continuous_subscription: boolean;
  cycle_length_minutes: number;
  cooldown_minutes: number;
  report_frequency_minutes: number;

  // Helper attributes
  cycles: Cycle[];

  // Old attributes
  archived: boolean;
  lub_timestamp: Date;
  manually_stopped: boolean;
  end_date: Date;
  tasks: Task[] = [];
  templates_selected_uuid_list: string[];
  campaigns: GoPhishCampaignModel[];
  email_report_history: EmailHistory[] = [];
}

export class EmailHistory {
  report_type: string;
  sent: Date;
  email_to: string;
  email_from: string;
  bcc: string;
  manual: boolean;
}

/**
 * An individual being phished.
 */
export class Target {
  first_name: string;
  last_name: string;
  position: string;
  email: string;
}

/**
 * A point in time during the life of a subscription.
 */
export class TimelineItem {
  title: string;
  date: moment.Moment;
}

export class Task {
  task_uuid: string;
  message_type: string;
  scheduled_date: Date;
  executed: boolean;
  executed_date: Date;
  error: string;
}

export class TemplateSelected {
  // These are any arrays, because 2 options need covered
  // ["uuid1", "uuid2"]
  // [template1, template2]
  high: any[] = [];
  moderate: any[] = [];
  low: any[] = [];
}
