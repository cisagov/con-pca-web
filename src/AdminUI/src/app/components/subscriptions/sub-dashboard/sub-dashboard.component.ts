import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ChartsService } from 'src/app/services/charts.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { CycleModel } from 'src/app/models/cycle.model';
import { CycleService } from 'src/app/services/cycle.service';
import { CycleStatsModel } from 'src/app/models/stats.model';

@Component({
  selector: 'app-sub-dashboard',
  templateUrl: './sub-dashboard.component.html',
  styleUrls: ['./sub-dashboard.component.scss'],
})
export class SubDashboardComponent implements OnInit, OnDestroy {
  @Input()
  subscriptionUuid: string;
  dataAvailable = false;
  cycle_selected = false;
  cycleStats = new CycleStatsModel();

  chart: any = {};
  chartSent: any = {};

  // average time to first click
  avgTTFC: number;

  //Total stats
  aggregateCounts = {
    sent: { count: null },
    opened: { count: null },
    clicked: { count: null },
    submitted: { count: null },
    reported: { count: null },
  };
  campaignsDetails;

  schemeLowMedHigh = {
    domain: ['#064875', '#fcbf10', '#007bc1'],
  };

  schemeSent = {
    domain: ['#336600', '#eeeeee'],
  };
  selected_cycle: CycleModel;

  temp_angular_subs = [];
  templatePerformanceByMetric = [];
  performanceMetricUsed = 'clicked';

  /**
   *
   */
  constructor(
    public cycleSvc: CycleService,
    public chartsSvc: ChartsService,
    private subscriptionSvc: SubscriptionService
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.chart = {};
    this.chartSent = {};
    this.temp_angular_subs.push(
      this.subscriptionSvc.getSubBehaviorSubject().subscribe((data) => {
        if ('subscription_uuid' in data && !this.subscriptionUuid) {
          this.subscriptionUuid = data.subscription_uuid;
          this.dataAvailable = true;
        }
      })
    );
    this.temp_angular_subs.push(
      this.subscriptionSvc
        .getCycleBehaviorSubject()
        .subscribe((data: CycleModel) => {
          this.selected_cycle = data;
          if (Object.keys(data).length > 0) {
            this.cycle_selected = true;
          }
          this.drawGraphs();
        })
    );
  }
  ngOnDestroy(): void {
    this.temp_angular_subs.forEach((element) => {
      element.unsubscribe();
    });

    this.chart = {};
    this.chartSent = {};
    this.dataAvailable = false;
    this.cycle_selected = false;
    this.subscriptionUuid = null;
  }

  /**
   * Gathers statistics and renders information for two graphs,
   * chart and chartSent.  Chart shows the various statistics for
   * how the targets have responded to the phishing emails.
   * ChartSent indicates how many emails have been sent thus far.
   */
  drawGraphs() {
    if (this.dataAvailable && this.cycle_selected) {
      // vertical bar chart groups for stats by template level
      this.chart.showXAxis = true;
      this.chart.showYAxis = true;
      this.chart.showXAxisLabel = true;
      this.chart.xAxisLabel = '';
      this.chart.showYAxisLabel = true;
      this.chart.yAxisLabel = '';
      this.chart.showDataLabel = true;
      this.chart.showLegend = true;
      this.chart.legendPosition = 'right';
      this.chart.colorScheme = this.schemeLowMedHigh;

      // stacked horizontal bar chart for number of emails sent vs scheduled
      this.chartSent.showXAxis = true;
      this.chartSent.showYAxis = true;
      this.chartSent.showXAxisLabel = true;
      this.chartSent.xAxisLabel = '';
      this.chartSent.showYAxisLabel = true;
      this.chartSent.yAxisLabel = '';
      this.chartSent.showDataLabel = true;
      this.chartSent.view = [500, 100];
      this.chartSent.colorScheme = this.schemeSent;

      // get content
      this.cycleSvc
        .getCycleStats(
          this.selected_cycle.cycle_uuid,
          this.selected_cycle.nonhuman
        )
        .subscribe((stats: CycleStatsModel) => {
          this.cycleStats = stats;
          this.chartSent.chartResults = this.chartsSvc.getSentEmailNumbers(
            this.selected_cycle,
            stats
          );

          this.chart.chartResults = this.chartsSvc.formatStatistics(stats);

          this.avgTTFC = stats.stats.all.clicked.average;
          this.selectTemplatePerformanceMetric();
          if (!this.avgTTFC) {
            this.avgTTFC = 0;
          }

          this.aggregateCounts = stats['aggregate_stats'];
        });
    }
  }

  /**
   * Prevents decimal ticks from being displayed
   */
  axisFormat(val) {
    if (val % 1 === 0 || val === 0) {
      return val.toLocaleString();
    } else {
      return '';
    }
  }

  selectTemplatePerformanceMetric(metric = 'clicked') {
    this.performanceMetricUsed = metric;
    this.templatePerformanceByMetric = this.cycleStats.template_stats.sort(
      (first, second) => 0 - (first[metric].rank > second[metric].rank ? -1 : 1)
    );
  }
  styleSelectedMetric(metric) {
    if (this.performanceMetricUsed == metric) {
      return 'solid 2px #D6C0C5';
    }
  }
  getRatio(templateStat) {
    return templateStat[this.performanceMetricUsed]['ratio'];
  }
}
