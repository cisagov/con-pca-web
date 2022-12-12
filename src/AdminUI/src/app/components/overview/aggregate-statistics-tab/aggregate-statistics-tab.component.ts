import { Component, OnInit } from '@angular/core';
import { AggregateReportModel } from 'src/app/models/reports.model';
import { StatisticsService } from 'src/app/services/statistics.service';

@Component({
  selector: 'app-aggregate-statistics-tab',
  templateUrl: './aggregate-statistics-tab.component.html',
})
export class AggregateStatisticsTab implements OnInit {
  detail: AggregateReportModel;
  loading: boolean = true;

  constructor(public statsSvc: StatisticsService) {}

  ngOnInit(): void {
    this.statsSvc.getAggregateStats().subscribe(
      (result: AggregateReportModel) => {
        this.detail = result;
        this.loading = false;
      },
      (error) => {
        console.log(error);
        this.loading = false;
      },
    );
  }
}
