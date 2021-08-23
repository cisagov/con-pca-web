import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { toTitleCase } from 'src/app/helper/utilities';
import { Cycle } from '../models/cycle.model';
import { CycleStats } from '../models/stats.model';

@Injectable({
  providedIn: 'root',
})
export class ChartsService {
  /**
   * Constructor.
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  /**
   * Converts the API response into an object that the chart expects.
   * Refactor idea -- this could be done more programatically
   */
  formatStatistics(stats: CycleStats) {
    const chartObject = [
      {
        name: 'Sent',
        series: [
          {
            name: 'Low',
            value: stats.stats.low.sent.count,
            // value: reportResponse.levels.find((x) => x.level_number === 1).sent,
          },
          {
            name: 'Moderate',
            value: stats.stats.moderate.sent.count,
          },
          {
            name: 'High',
            value: stats.stats.high.sent.count,
          },
        ],
      },
      {
        name: 'Opened',
        series: [
          {
            name: 'Low',
            value: stats.stats.low.opened.count,
          },
          {
            name: 'Moderate',
            value: stats.stats.moderate.opened.count,
          },
          {
            name: 'High',
            value: stats.stats.high.opened.count,
          },
        ],
      },
      {
        name: 'Clicked',
        series: [
          {
            name: 'Low',
            value: stats.stats.low.clicked.count,
          },
          {
            name: 'Moderate',
            value: stats.stats.moderate.clicked.count,
          },
          {
            name: 'High',
            value: stats.stats.high.clicked.count,
          },
        ],
      },
    ];

    return chartObject;
  }

  /**
   * Converts the stats_all, stats_[low|mid|high]_deception values into
   * an object that the chart expects.
   */
  formatReportStatsForChart(reportResponse: any) {
    const stats = reportResponse.subscription_stats;
    const levels = ['low', 'mid', 'high'];
    // const groups = ['sent', 'opened', 'clicked', 'reported'];
    const groups = ['sent', 'opened', 'clicked'];
    const obj = [];

    groups.forEach((g) => {
      const g1 = { name: toTitleCase(g), series: [] };
      levels.forEach((l) => {
        const l1 = { name: toTitleCase(l), value: 0 };
        if (l1.name === 'Mid') {
          l1.name = 'Moderate';
        }
        const statObject = stats['stats_' + l + '_deception'];
        if (statObject) {
          l1.value = statObject[g].count ?? 0;
        }
        g1.series.push(l1);
      });
      obj.push(g1);
    });

    return obj;
  }

  /**
   * Returns the percentage of emails sent thus far in the cycle.
   */
  getSentEmailNumbers(cycle: Cycle, stats: CycleStats) {
    return [
      {
        name: '',
        series: [
          {
            name: 'Number Sent',
            value: stats.stats.all.sent.count,
          },
          {
            name: 'Number Not Sent',
            value: cycle.target_count - stats.stats.all.sent.count,
          },
        ],
      },
    ];
  }
}
