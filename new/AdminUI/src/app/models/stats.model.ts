import { Template } from './template.model';

export class CycleStatsEventMetrics {
  count: number;
  average: number;
  minimum: number;
  maximum: number;
  median: number;
  ratio: number;
  rank: number;
}

export class CycleStatsEvents {
  sent = new CycleStatsEventMetrics();
  opened = new CycleStatsEventMetrics();
  clicked = new CycleStatsEventMetrics();
}

export class CycleStatsLevel {
  high = new CycleStatsEvents();
  moderate = new CycleStatsEvents();
  low = new CycleStatsEvents();
  all = new CycleStatsEvents();
}

export class TemplateStats extends CycleStatsLevel {
  template_uuid: string;
  template: Template;
  deception_level: string;
}

export class CycleStats {
  stats = new CycleStatsLevel();
  template_stats: TemplateStats[] = [];

  // old
  avg_time_to_first_click: string;
  avg_time_to_first_report: string;
  sent: number;
  campaign_details: any;
  aggregate_stats: any;
  template_breakdown: any;
  levels: any;
  asn_stats: any;
}
