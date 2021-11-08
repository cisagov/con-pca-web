import { Component, OnInit } from '@angular/core';
import { AggregateReportModel } from 'src/app/models/reports.model';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SettingsService } from 'src/app/services/settings.service';
import { StatisticsService } from 'src/app/services/statistics.service';

@Component({
  selector: 'app-aggregate-stats',
  templateUrl: './aggregate-stats.component.html',
})
export class AggregateStatsComponent implements OnInit {
  detail: AggregateReportModel;
  avgTimeToClick: string;

  constructor(
    public layoutSvc: LayoutMainService,
    public settingsSvc: SettingsService,
    public statsSvc: StatisticsService
  ) {
    layoutSvc.setTitle('Aggregate Statistics');
  }

  ngOnInit(): void {
    this.statsSvc.getAggregateStats().subscribe(
      (result: AggregateReportModel) => {
        this.detail = result;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
