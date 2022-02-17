import { CycleStatsLevelModel } from './stats.model';

export class SectorIndustryReportModel {
  subscription_count: number;
  cycle_count: number;
}

export class SendingProfileMetricsModel {
  domain: string;
  customers: number;
}

export class AggregateReportModel {
  customers_enrolled: number;
  status_reports_sent: number;
  cycle_reports_sent: number;
  yearly_reports_sent: number;
  new_subscriptions: number;
  ongoing_subscriptions: number;
  stopped_subscriptions: number;
  sending_profile_metrics: SendingProfileMetricsModel;
  federal_stats: SectorIndustryReportModel;
  state_stats: SectorIndustryReportModel;
  local_stats: SectorIndustryReportModel;
  tribal_stats: SectorIndustryReportModel;
  private_stats: SectorIndustryReportModel;
  all_customer_stats: CycleStatsLevelModel;
}
