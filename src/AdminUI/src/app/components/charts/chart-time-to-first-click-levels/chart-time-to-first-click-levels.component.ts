import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { humanTiming, secondsToHHMMSS } from 'src/app/helper/utilities';

@Component({
  selector: 'app-chart-time-to-first-click-levels',
  templateUrl: './chart-time-to-first-click-levels.component.html',
  styleUrls: ['./chart-time-to-first-click-levels.component.scss']
})
export class ChartTimeToFirstClickLevelsComponent implements OnInit, OnChanges {

  @Input()
  subscription: any;

  chart: any = {};

  scheme = {
    domain: ['#1979A7']
  };

  constructor() { }

  ngOnInit(): void {
    this.chart.showXAxis = true;
    this.chart.showYAxis = true;
    this.chart.showXAxisLabel = true;
    this.chart.xAxisLabel = 'Complexity Level';
    this.chart.showYAxisLabel = true;
    this.chart.yAxisLabel = 'Elapsed Time (HH:MM:SS)';
    this.chart.showDataLabel = true;
    this.chart.showLegend = false;
    // this.chart.legendPosition = 'bottom';
    this.chart.colorScheme = this.scheme;
  }

  /**
   *
   */
  ngOnChanges() {
    if (!!this.subscription) {
      this.chart.chartResults = this.buildObjectForChart(this.subscription);
    }
  }

  /**
   * Find the lowest clicked response time for all campaigns in each deception level.
   */
  buildObjectForChart(reportResponse: any) {
    const firstClicks = [
      { name: '1', value: 0 },
      { name: '2', value: 0 },
      { name: '3', value: 0 },
      { name: '4', value: 0 },
      { name: '5', value: 0 },
      { name: '6', value: 0 }
    ];

    const campaigns = reportResponse.subscription_stats.campaign_results;
    campaigns.forEach(c => {
      const targetLevel = firstClicks.find(x => x.name === c.deception_score.toString());

      if (!!c.clicked) {
        if ((c.clicked.minimum < targetLevel.value && targetLevel.value !== 0)
        || targetLevel.value === 0) {
          targetLevel.value = c.clicked.minimum;
        }
      }
    });

    return firstClicks;
  }

  /**
   *
   */
  yAxisTickFormatting(value) {
    return secondsToHHMMSS(value);
  }

  /**
   *
   */
  dataLabelFormatting(value) {
    // return timeTickFormatting(value);
    return secondsToHHMMSS(value);
  }
}
