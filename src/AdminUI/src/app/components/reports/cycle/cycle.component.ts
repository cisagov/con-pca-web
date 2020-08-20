import { Component, OnInit } from '@angular/core';
import { NullishCoalescePipe } from 'src/app/pipes/nullish-coalesce.pipe';
import { ReportsService } from 'src/app/services/reports.service';
import { AppSettings } from 'src/app/AppSettings';
import { ActivatedRoute } from '@angular/router';
import { ChartsService } from 'src/app/services/charts.service';
import { listToText } from 'src/app/helper/utilities';

@Component({
  selector: 'app-cycle',
  templateUrl: './cycle.component.html',
  styleUrls: ['./cycle.component.scss'],
})
export class CycleComponent implements OnInit {
  private routeSub: any;
  subscriptionUuid: string;
  reportStartDate: Date;

  detail: any;
  recommendations: any[] = [];
  clickPercentFirstHour = '';
  medianClickTime = '';

  groupLevels = [];


  dateFormat = AppSettings.DATE_FORMAT;


  /**
   *
   */
  constructor(
    public reportsSvc: ReportsService,
    public chartsSvc: ChartsService,
    private route: ActivatedRoute
  ) { }

  /**
   *
   */
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params) => {
      this.subscriptionUuid = params.id;
      const isDate = new Date(params.start_date);
      const isHeadless = params.isHeadless;

      if (isDate.getTime()) {
        this.reportStartDate = isDate;
      } else {
        console.log('Invalid Date time provided, defaulting to now');
        this.reportStartDate = new Date();
      }
      this.reportsSvc
        .getCycleReport(this.subscriptionUuid, this.reportStartDate, isHeadless)
        .subscribe(
          (resp) => {
            this.detail = resp;
            this.renderReport();
          },
          (error) => {
            console.log(this.detail);
            console.log(error);
            this.renderReport();
          }
        );
    });
  }

  /**
   *
   */
  renderReport() {
    if (!!this.detail?.recommendations) {
      this.recommendations = this.detail?.recommendations;
    }

    // percent of all clicks occurring in the first hour
    let pct = 0;
    if (this.detail.metrics.number_of_clicked_emails > 0) {
      pct = Math.round(
        ((this.detail.subscription_stats.clicks_over_time.one_hour ?? 0) / this.detail.metrics.number_of_clicked_emails) * 100
      );
    }

    this.clickPercentFirstHour = pct.toString();
    if (pct > 0) {
      this.clickPercentFirstHour = 'nearly ' + this.clickPercentFirstHour;
    }

    // median time to click
    this.medianClickTime = this.detail.metrics.median_time_to_first_click;

    // figure out sent counts and deception levels
    this.groupLevels.push({ groupNumber: 1, sentCount: 0, levels: [], levelText: '' });
    this.groupLevels.push({ groupNumber: 2, sentCount: 0, levels: [], levelText: '' });
    this.groupLevels.push({ groupNumber: 3, sentCount: 0, levels: [], levelText: '' });

    // paw through the JSON and populate the structure
    for (let i = 0; i < this.detail.templates_by_group.length; i++) {
      const campaignGroup = this.detail.templates_by_group[i];
      campaignGroup.forEach(campaign => {
        this.groupLevels[i].sentCount += campaign.campaign_stats.sent.count;
        if (this.groupLevels[i].levels.indexOf(campaign.deception_level) < 0) {
          this.groupLevels[i].levels.push(campaign.deception_level);
        }
      });
    }

    this.groupLevels.forEach(g => {
      if (g.levels.length > 0) {
        g.levelText = ' and received level' + (g.levels.length > 1 ? 's ' : ' ') + listToText(g.levels);
      }
    });
  }
}
