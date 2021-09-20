import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettings } from 'src/app/AppSettings';
import { ReportsService } from 'src/app/services/reports.service';

@Component({
  selector: 'app-yearly',
  templateUrl: './yearly.component.html',
  styleUrls: ['./yearly.component.scss'],
})
export class YearlyComponent implements OnInit {
  subscriptionUuid: string;
  detail: any;

  improvingTrend = false;
  degradingTrend = false;

  dateFormat = AppSettings.DATE_FORMAT;

  constructor(
    public reportsSvc: ReportsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.subscriptionUuid = params.id;
      this.reportsSvc.getReport(params.cycle_uuid, 'yearly').subscribe(
        (resp) => {
          this.detail = resp;
          this.detail.cycles = this.detail.cycles.sort((a, b) =>
            a.increment > b.increment ? 1 : -1
          );
          this.renderReport();
        },
        (error) => {
          console.log(error);
          this.renderReport();
        }
      );
    });
  }

  renderReport() {}
}
