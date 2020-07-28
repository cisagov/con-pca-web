import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChartsService } from 'src/app/services/charts.service';

@Component({
  selector: 'app-chart-stats-by-level',
  templateUrl: './chart-stats-by-level.component.html',
  styleUrls: ['./chart-stats-by-level.component.scss']
})
export class ChartStatsByLevelComponent implements OnInit, OnChanges {

  @Input()
  subscription: any;

  chart: any = {};

  schemeLowMedHigh = {
    domain: ['#064875', '#fcbf10', '#007bc1']
  };

  /**
   *
   */
  constructor(
    public chartsSvc: ChartsService
  ) { }

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
    this.chart.yAxisLabel = '';
    this.chart.showDataLabel = true;
    this.chart.showLegend = true;
    this.chart.legendPosition = 'bottom';
    this.chart.colorScheme = this.schemeLowMedHigh;
  }

  ngOnChanges() {
    if (!!this.subscription) {
      this.chart.chartResults = this.chartsSvc.formatReportStatsForChart(this.subscription);
    }
  }
}
