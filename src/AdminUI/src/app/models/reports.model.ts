export class SectorIndustryReportModel {
  subscription_count: number;
  cycle_count: number;
}

export class AggregateReportModel {
  customers_enrolled: number;
  status_reports_sent: number;
  cycle_reports_sent: number;
  yearly_reports_sent: number;
  federal_stats: SectorIndustryReportModel;
  state_stats: SectorIndustryReportModel;
  local_stats: SectorIndustryReportModel;
  tribal_stats: SectorIndustryReportModel;
  private_stats: SectorIndustryReportModel;
  click_rate_across_all_customers: number;
  average_time_to_click_all_customers: string;
}
