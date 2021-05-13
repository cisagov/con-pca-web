import { Contact } from './customer.model';
import * as moment from 'node_modules/moment/moment';

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
  active: boolean;
  archived: boolean;
  customer_uuid: string;
  cycles: Cycle[];
  keywords: string;
  lub_timestamp: Date;
  manually_stopped: boolean;
  name: string;
  primary_contact: Contact;
  dhs_contact_uuid: string;
  start_date: Date;
  end_date: Date;
  status: string;
  subscription_uuid: string;
  tasks: Task[] = [];
  templates_selected_uuid_list: string[];
  url: string;
  target_email_list: Target[] = [];
  target_email_list_cached_copy: Target[] = [];
  campaigns: GoPhishCampaignModel[];
  sending_profile_name: string;
  target_domain: string;
  stagger_emails: boolean;
  continuous_subscription: boolean;
  email_report_history: EmailHistory[] = [];
  cycle_length_minutes: number;
  templates_selected: TemplateSelected;
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

export class Cycle {
  cycle_uuid: string;
  start_date: Date;
  end_date: Date;
  active: boolean;
  campaigns_in_cycle: string[];
  phish_results: any[];
  phish_results_dirty: boolean;
  override_total_reported: Number;
  total_targets: Number;
}

export class TemplateSelected {
  // These are any arrays, because 2 options need covered
  // ["uuid1", "uuid2"]
  // [template1, template2]
  high: any[] = [];
  moderate: any[] = [];
  low: any[] = [];
}
