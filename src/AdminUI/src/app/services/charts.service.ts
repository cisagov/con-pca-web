import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { report } from 'process';
import { toTitleCase } from 'src/app/helper/utilities';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  /**
   * Constructor.
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
  }

  /**
   * Gets the subscriptions's statistics
   */
  getStatisticsReport(subscriptionUuid: string, start_date: string) {
    const url = `${this.settingsService.settings.apiUrl}/reports/${subscriptionUuid}/subscription-stats-page/${start_date}/`;
    return this.http.get(url);
  }

  /**
   * Converts the API response into an object that the chart expects.
   * Refactor idea -- this could be done more programatically
   */
  formatStatistics(reportResponse: any) {
    const chartObject = [
      {
        name: 'Sent',
        series: [
          {
            name: 'Low',
            value: reportResponse.levels.find(x => x.level_number === 1).sent
          },
          {
            name: 'Moderate',
            value: reportResponse.levels.find(x => x.level_number === 2).sent
          },
          {
            name: 'High',
            value: reportResponse.levels.find(x => x.level_number === 3).sent
          }
        ]
      },
      {
        name: 'Opened',
        series: [
          {
            name: 'Low',
            value: reportResponse.levels.find(x => x.level_number === 1).opened
          },
          {
            name: 'Moderate',
            value: reportResponse.levels.find(x => x.level_number === 2).opened
          },
          {
            name: 'High',
            value: reportResponse.levels.find(x => x.level_number === 3).opened
          }
        ]
      },
      {
        name: 'Clicked',
        series: [
          {
            name: 'Low',
            value: reportResponse.levels.find(x => x.level_number === 1).clicked
          },
          {
            name: 'Moderate',
            value: reportResponse.levels.find(x => x.level_number === 2).clicked
          },
          {
            name: 'High',
            value: reportResponse.levels.find(x => x.level_number === 3).clicked
          }
        ]
      }
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
    const groups = ['sent', 'opened', 'clicked', 'submitted', 'reported'];
    const obj = [];

    groups.forEach(g => {
      const g1 = { name: toTitleCase(g), series: [] };
      levels.forEach(l => {
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
  getSentEmailNumbers(reportResponse: any) {
    return [
      {
        name: '',
        series: [
          {
            name: 'Number Sent',
            value: reportResponse.sent
          },
          {
            name: 'Number Not Sent',
            value: reportResponse.target_count - reportResponse.sent
          }
        ]
      }
    ];
  }
}
