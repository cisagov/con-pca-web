import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { humanTiming, secondsToHHMMSS } from 'src/app/helper/utilities';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'yearly-click-rate-vs-report-rate',
  templateUrl: './yearly-clickrate-vs-reportedrate.component.html',
  styleUrls: ['./yearly-clickrate-vs-reportedrate.component.scss'],
  providers: [DatePipe],
})
export class YearlyClickRateVsReportRateComponent implements OnInit, OnChanges {
  @Input()
  data: any;

  chart: any = {};

  colorScheme = {
    domain: ['#3977a6', '#f4c145', '#bfbfbf', '#f0d87a', '#85b0ce', '#91ad5c'],
  };

  // line, area
  autoScale = true;

  scheme = {
    domain: ['#3977a6', '#f4c145', '#bfbfbf', '#f0d87a', '#85b0ce', '#91ad5c'],
  };

  constructor(private datePipe: DatePipe) {}

  onSelect(event) {
    console.log(event);
  }
  ngOnInit(): void {
    this.chart.showXAxis = true;
    this.chart.showYAxis = true;
    this.chart.gradient = false;
    this.chart.showLegend = true;
    this.chart.showXAxisLabel = true;
    this.chart.legendPosition = 'below';
    this.chart.xAxisLabel = 'Cycle Start Date';
    this.chart.showYAxisLabel = true;
    this.chart.yAxisLabel = 'Percentage';
    this.chart.timeline = true;
    this.chart.colorScheme = this.scheme;
  }

  public dateTickFormatting(val: any): string {
    let date = new Date(val);
    return new DatePipe('en_US').transform(date, 'yyyy-MMM');
  }

  /**
   *
   */
  ngOnChanges() {
    if (!!this.data) {
      // this.chart.chartResults = this.buildObjectForChart(this.data);
      this.chart.chartResults = this.data;
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
      { name: '6', value: 0 },
    ];

    const campaigns = reportResponse.subscription_stats.campaign_results;
    campaigns.forEach((c) => {
      const targetLevel = firstClicks.find(
        (x) => x.name === c.deception_level.toString()
      );

      if (!!c.campaign_stats.clicked) {
        if (
          (c.campaign_stats.clicked.minimum < targetLevel.value &&
            targetLevel.value !== 0) ||
          targetLevel.value === 0
        ) {
          targetLevel.value = c.campaign_stats.clicked.minimum;
        }
      }
    });

    return firstClicks;
  }
}
