import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-time-intervals',
  templateUrl: './chart-time-intervals.component.html',
  styleUrls: ['./chart-time-intervals.component.scss']
})
export class ChartTimeIntervalsComponent implements OnInit, OnChanges {

  @Input()
  subscription: any;

  chart: any = {};

  schemeLowMedHigh = {
    domain: ['#1979A7']
  };

  /**
   *
   */
  constructor() { }

  /**
   *
   */
  ngOnInit(): void {
    this.chart.showXAxis = true;
    this.chart.showYAxis = true;
    this.chart.showXAxisLabel = true;
    this.chart.xAxisLabel = '';
    this.chart.showYAxisLabel = true;
    this.chart.yAxisLabel = 'Percent';
    this.chart.showDataLabel = true;
    this.chart.showLegend = false;
    // this.chart.legendPosition = 'bottom';
    this.chart.colorScheme = this.schemeLowMedHigh;
  }

  /**
   *
   */
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
    const intervals = [
      { label: '1 minute', attrib: 'one_minute' },
      { label: '3 minutes', attrib: 'three_minutes' },
      { label: '5 minutes', attrib: 'five_minutes' },
      { label: '15 minutes', attrib: 'fifteen_minutes' },
      { label: '30 minutes', attrib: 'thirty_minutes' },
      { label: '60 minutes', attrib: 'one_hour' },
      { label: '2 hours', attrib: 'two_hours' },
      { label: '3 hours', attrib: 'three_hours' },
      { label: '4 hours', attrib: 'four_hours' },
      { label: '1 day', attrib: 'one_day' }
    ];

    const obj = [];

    intervals.forEach(i => {
      obj.push({
        name: i.label,
        value: reportResponse.subscription_stats[i.attrib] ?? 0
      });
    });

    return obj;
  }
}


function percentTickFormatting(val: any) {
  return val.toLocaleString() + '%';
}
