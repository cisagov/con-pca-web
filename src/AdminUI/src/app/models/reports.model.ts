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

export class AggregateReportModel {
  customers_enrolled: number;
  customers_active: number;
  status_reports_sent: number;
  cycle_reports_sent: number;
  yearly_reports_sent: number;
  new_subscriptions: number;
  ongoing_subscriptions: number;
  stopped_subscriptions: number;
  email_sending_stats: EmailSendingStatsModel;
  federal_stats: SectorIndustryReportModel;
  state_stats: SectorIndustryReportModel;
  local_stats: SectorIndustryReportModel;
  tribal_stats: SectorIndustryReportModel;
  private_stats: SectorIndustryReportModel;
  all_customer_stats: CycleStatsLevelModel;
}
