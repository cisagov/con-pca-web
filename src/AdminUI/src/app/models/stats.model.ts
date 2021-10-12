import { TemplateModel } from './template.model';

export class CycleStatsEventMetricsModel {
  count: number;
  average: number;
  minimum: number;
  maximum: number;
  median: number;
  ratio: number;
  rank: number;
}

export class CycleStatsEventsModel {
  sent = new CycleStatsEventMetricsModel();
  opened = new CycleStatsEventMetricsModel();
  clicked = new CycleStatsEventMetricsModel();
}

export class CycleStatsLevelModel {
  high = new CycleStatsEventsModel();
  moderate = new CycleStatsEventsModel();
  low = new CycleStatsEventsModel();
  all = new CycleStatsEventsModel();
}

export class TemplateStatsModel extends CycleStatsLevelModel {
  template_id: string;
  template: TemplateModel;
  deception_level: string;
  clicked: CycleStatsEventMetricsModel;
  opened: CycleStatsEventMetricsModel;
  sent: CycleStatsEventMetricsModel;
}

export class MaxmindStatsModel {
  asn_org: string;
  is_nonhuman: boolean;
  ips: string[];
  cities: string[];
  opens: number;
  clicks: number;
}

export class CycleStatsModel {
  stats = new CycleStatsLevelModel();
  template_stats: TemplateStatsModel[] = [];
  maxmind_stats: MaxmindStatsModel[] = [];
}
