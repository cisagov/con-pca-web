import { CycleStatsLevelModel } from './stats.model';

export class SectorIndustryReportModel {
  subscription_count: number;
  cycle_count: number;
}

export class EmailSendingStatsModel {
  emails_sent_24_hours: number;
  emails_scheduled_24_hours: number;
  emails_sent_on_time_24_hours_ratio: number;
  emails_clicked_24_hours: number;
  emails_sent_7_days: number;
  emails_scheduled_7_days: number;
  emails_sent_on_time_7_days_ratio: number;
  emails_clicked_7_days: number;
  emails_sent_30_days: number;
  emails_scheduled_30_days: number;
  emails_sent_on_time_30_days_ratio: number;
  emails_clicked_30_days: number;
}

export class TaskStatsModel {
  tasks_succeeded_24_hours: number;
  tasks_scheduled_24_hours: number;
  tasks_succeeded_24_hours_ratio: number;
  tasks_succeeded_7_days: number;
  tasks_scheduled_7_days: number;
  tasks_succeeded_7_days_ratio: number;
  tasks_succeeded_30_days: number;
  tasks_scheduled_30_days: number;
  tasks_succeeded_30_days_ratio: number;
}

export class AllCustomerStatsReportModel {
  customers_active: number;
  customers_archived: number;
  customers_archived_active: number;
  customers_archived_never_active: number;
  customers_enrolled: number;
  customers_inactive: number;
  customers_total: number;
}

export class AllSubscriptionStatsReportModel {
  subscriptions_archived: number;
  subscriptions_new: number;
  subscriptions_ongoing: number;
  subscriptions_stopped: number;
  subscriptions_total: number;
}

export class AggregateReportModel {
  customer_stats: AllCustomerStatsReportModel;
  subscription_stats: AllSubscriptionStatsReportModel;
  status_reports_sent: number;
  cycle_reports_sent: number;
  yearly_reports_sent: number;
  email_sending_stats: EmailSendingStatsModel;
  task_stats: TaskStatsModel;
  federal_stats: SectorIndustryReportModel;
  state_stats: SectorIndustryReportModel;
  local_stats: SectorIndustryReportModel;
  tribal_stats: SectorIndustryReportModel;
  private_stats: SectorIndustryReportModel;
  all_customer_stats: CycleStatsLevelModel;
}
