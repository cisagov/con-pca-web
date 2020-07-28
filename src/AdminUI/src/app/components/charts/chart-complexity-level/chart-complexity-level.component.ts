import { Component, Input, OnChanges, OnInit } from '@angular/core';


@Component({
  selector: 'app-chart-complexity-level',
  templateUrl: './chart-complexity-level.component.html',
  styleUrls: ['./chart-complexity-level.component.scss']
})
export class ChartComplexityLevelComponent implements OnInit, OnChanges {

  @Input()
  subscription: any;

  chart: any = {};

  schemeLowMedHigh = {
    domain: ['#FDC010', '#1979a7']
  };

  /**
   *
   */
  constructor() { }

  /**
   *
   */
  ngOnInit(): void {
    // build statistics by level chart
    this.chart.showXAxis = true;
    this.chart.showYAxis = true;
    this.chart.showXAxisLabel = true;
    this.chart.xAxisLabel = '';
    this.chart.showYAxisLabel = true;
    this.chart.yAxisLabel = 'Percent';
    this.chart.showDataLabel = true;
    this.chart.showLegend = true;
    this.chart.legendPosition = 'bottom';
    this.chart.colorScheme = this.schemeLowMedHigh;
  }

  ngOnChanges() {
    if (!!this.subscription) {
      this.chart.chartResults = this.buildObjectForChart(this.subscription);
    }
  }

  yAxisTickFormatting(value) {
    return percentTickFormatting(value);
  }

  /**
   * Pulls the clicked and reported ratios out of every campaign,
   * averaging them by deception level.
   */
  buildObjectForChart(reportResponse: any) {
    const campaignResults = reportResponse.subscription_stats.campaign_results;
    const levels = ['1', '2', '3', '4', '5', '6'];
    const obj = [];

    levels.forEach(l => {
      obj.push({
        name: l.toString(), series: [{
          name: 'Unique Click Rate',
          value: 0
        }, {
          name: 'User Report Rate',
          value: 0
        }]
      });
    });

    campaignResults.forEach(c => {
      const o = obj.find(x => x.name === c.deception_level.toString());

      const uqr = o.series.find(x => x.name === 'Unique Click Rate');
      if (uqr.value === 0) {
        uqr.value = c.ratios.clicked_ratio * 100;
      } else {
        uqr.value = (uqr.value + c.ratios.clicked_ratio * 100) / 2;
      }

      const urr = o.series.find(x => x.name === 'User Report Rate');
      if (urr.value === 0) {
        urr.value = c.ratios.reported_ratio * 100;
      } else {
        urr.value = (uqr.value + c.ratios.reported_ratio * 100) / 2;
      }
    });

    return obj;
  }
}

function percentTickFormatting(val: any) {
  return val.toLocaleString() + '%';
}
