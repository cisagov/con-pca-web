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

export interface SubscriptionClicksModel { }

export class Subscription {
  active: boolean;
  archived: boolean;
  customer_uuid: string;
  cycles: []
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
  url: string;
  target_email_list: Target[] = [];
  gophish_campaign_list: GoPhishCampaignModel[];
  sending_profile_name: string;
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
