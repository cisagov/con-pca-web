import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ChartsService } from 'src/app/services/charts.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { humanTiming } from 'src/app/helper/utilities';

@Component({
  selector: 'app-sub-dashboard',
  templateUrl: './sub-dashboard.component.html'
})
export class SubDashboardComponent implements OnInit, OnDestroy {
  @Input()
  subscriptionUuid: string;
  dataAvailable = false;
  cycle_selected = false;

  chart: any = {};
  chartSent: any = {};

  numberTemplatesInUse = 0;

  // average time to first click
  avgTTFC: string;
  // average time to first report
  avgTTFR: string;

  //Total stats
  aggregateCounts = {
    "sent": {"count":null},
    "opened": {"count":null},
    "clicked": {"count":null},
    "submitted": {"count":null},
    "reported": {"count":null}
  };
  campaignsDetails;

  schemeLowMedHigh = {
    domain: ['#064875', '#fcbf10', '#007bc1']
  };

  schemeSent = {
    domain: ['#336600', '#eeeeee']
  };
  selected_cycle = {}

  temp_angular_subs = []


  /**
   *
   */
  constructor(
    public chartsSvc: ChartsService,
    private subscriptionSvc: SubscriptionService
  ) { }

  /**
   *
   */
  ngOnInit(): void {
    this.chart = {};
    this.chartSent = {};
    this.temp_angular_subs.push(
      this.subscriptionSvc.getSubBehaviorSubject().subscribe(data => {
        if ('subscription_uuid' in data && !this.subscriptionUuid) {
          this.subscriptionUuid = data.subscription_uuid;
          this.dataAvailable = true;
          this.drawGraphs();
        }
      }) 
    );
    this.temp_angular_subs.push(
      this.subscriptionSvc.getCycleBehaviorSubject().subscribe(data => {
        this.selected_cycle = data
        if(Object.keys(data).length > 0){
          this.cycle_selected = true
        }
        this.drawGraphs();
      })
    )
  }
  ngOnDestroy(): void{
    this.temp_angular_subs.forEach(element => {
      element.unsubscribe();
    });

    this.chart = {};
    this.chartSent = {};
    this.dataAvailable = false;
    this.cycle_selected = false;
    this.subscriptionUuid = null
  }


  /**
   * Gathers statistics and renders information for two graphs,
   * chart and chartSent.  Chart shows the various statistics for
   * how the targets have responded to the phishing emails.
   * ChartSent indicates how many emails have been sent thus far.
   */
  drawGraphs() {
    if(this.dataAvailable && this.cycle_selected){
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
      this.chartsSvc.getStatisticsReport(this.subscriptionUuid,this.selected_cycle["start_date"])
        .subscribe((stats: any) => {
            this.chart.chartResults = this.chartsSvc.formatStatistics(stats);
            this.chartSent.chartResults = this.chartsSvc.getSentEmailNumbers(stats);

            for (const k in stats.templates) {
              if (stats.templates.hasOwnProperty(k)) {
                ++this.numberTemplatesInUse;
              }
            }

            this.avgTTFC = stats.avg_time_to_first_click;
            if (!this.avgTTFC) {
              this.avgTTFC = '(no emails clicked yet)';
            }
            
            this.avgTTFR = stats.avg_time_to_first_report;
            if (!this.avgTTFR) {
              this.avgTTFR = '(no emails reported yet)';
            }
            this.aggregateCounts = stats["aggregate_stats"]
            this.campaignsDetails = stats["campaign_details"]
            console.log(this.campaignsDetails)

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
}
