import { ContactModel } from './customer.model';
import { CycleModel } from './cycle.model';
import * as moment from 'node_modules/moment/moment';

export class TaskModel {
  task_uuid: string;
  task_type: string;
  scheduled_date: Date;
  executed: boolean;
  executed_date: Date;
  error: string;
}

export class TargetModel {
  first_name: string;
  last_name: string;
  position: string;
  email: string;
}

export class SubscriptionNotificationModel {
  message_type: string;
  sent: Date;
  email_to: string[];
  email_from: string;
}

export class SubscriptionModel {
  _id: string;
  name: string;
  customer_id: string;
  sending_profile_id: string;
  target_domain: string;
  start_date: Date;
  primary_contact: ContactModel;
  admin_email: string;
  status: string;
  target_email_list: TargetModel[] = [];
  templates_selected: string[];
  active: boolean;
  continuous_subscription: boolean;
  cycle_length_minutes: number;
  cooldown_minutes: number;
  report_frequency_minutes: number;
  archived: boolean;
  tasks: TaskModel[];
  notification_history: SubscriptionNotificationModel[];
  phish_header: string;
  reporting_password: string;

  // Helper attributes
  cycles: CycleModel[];

  public constructor(init?: Partial<SubscriptionModel>) {
    Object.assign(this, init);
  }
}

/**
 * A point in time during the life of a subscription.
 */
export class TimelineItem {
  title: string;
  date: moment.Moment;
}
