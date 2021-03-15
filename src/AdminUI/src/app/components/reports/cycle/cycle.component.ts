import { Component, OnInit } from '@angular/core';
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
  subscriptionUuid: string;

  detail: any;
  recommendations: any[] = [];
  clickPercentFirstHour = '';
  medianClickTime = '';

  groupLevels = [];


  dateFormat = AppSettings.DATE_FORMAT;

  constructor(
    public reportsSvc: ReportsService,
    public chartsSvc: ChartsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.subscriptionUuid = params.id;
      const isHeadless = params.isHeadless;
      const cycleUuid = params.cycle_uuid;

      this.reportsSvc
        .getCycleReport(this.subscriptionUuid, cycleUuid, isHeadless)
        .subscribe(
          (resp) => {
            this.detail = resp;
            this.detail.cycles = this.detail.cycles.sort((a, b) => (a.increment > b.increment) ? 1 : -1);
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

  renderReport() {
    if (!!this.detail?.recommendations) {
      this.recommendations = this.detail?.recommendations;
    }

    // percent of all clicks occurring in the first hour
    let pct = 0;
    let one_hour_clicks = this.detail.subscription_stats.clicks_over_time.one_hour
    if(one_hour_clicks){
      one_hour_clicks = one_hour_clicks * 100
    }
    pct = Math.round(
      this.detail.subscription_stats.clicks_over_time.one_hour ?? 0
    );
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
        this.groupLevels[i].sentCount += campaign.sent.count;
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
