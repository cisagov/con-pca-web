import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription } from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ReportsService } from 'src/app/services/reports.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'subscription-report-tab',
  templateUrl: './subscription-report-tab.component.html',
  styleUrls: ['./subscription-report-tab.component.scss'],
})
export class SubscriptionReportTab implements OnInit {
  subscription: Subscription;
  selectedCycle: any;
  emailsSent = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['report', 'sent', 'to', 'from', 'bcc', 'manual'];

  constructor(
    private subscriptionSvc: SubscriptionService,
    private reportSvc: ReportsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscriptionSvc.subBehaviorSubject.subscribe((data) => {
      if ('subscription_uuid' in data) {
        this.subscription = data;
        this.emailsSent.sort = this.sort;
        //@ts-ignore
        this.selectedCycle = this.subscription.cycles[0];
        if ('email_report_history' in data) {
          //@ts-ignore
          this.emailsSent.data = data.email_report_history;
        }
      }
    });
  }

  refresh() {
    // this.subscriptionSvc.getEmailsSentBySubId(this.subscription.subscription_uuid).subscribe((data: any[]) => {
    //   this.emailsSent.data = data;
    //   this.emailsSent.sort = this.sort;
    // });
  }

  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  cycleChange(event) {
    console.log(
      'cycle period changed, new Value ready for choosing the correct report'
    );
    console.log(event.value);
  }

  viewMonthlyReport() {
    this.router.navigate([
      '/reports/monthly',
      this.subscription.subscription_uuid,
      new Date().toISOString(),
      false,
    ]);
  }

  viewCycleReport() {
    this.router.navigate([
      '/reports/cycle',
      this.subscription.subscription_uuid,
      this.selectedCycle.start_date,
      false,
    ]);
  }

  viewYearlyReport() {
    this.router.navigate([
      '/reports/yearly',
      this.subscription.subscription_uuid,
      this.selectedCycle.start_date,
      false,
    ]);
  }

  downloadMonthlyReport() {
    this.subscriptionSvc.getMonthlyReport(this.subscription.subscription_uuid, new Date().toISOString()).subscribe(blob => {
      this.downloadObject('subscription_status_report.pdf', blob);
    });
  }

  downloadCycleReport() {
    this.subscriptionSvc.getCycleReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(blob => {
      this.downloadObject('subscription_cycle_report.pdf', blob);
    });
  }

  downloadYearlyReport() {
    this.subscriptionSvc.getYearlyReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(blob => {
      this.downloadObject('subscription_yearly_report.pdf', blob);
    });
  }

  sendMonthlyReport() {
    this.subscriptionSvc.sendMonthlyReport(this.subscription.subscription_uuid, new Date().toISOString()).subscribe(() => {
      console.log('Sending monthly report.');
    });
  }

  sendCycleReport() {
    this.subscriptionSvc.sendMonthlyReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(() => {
      console.log('Sending cycle report.');
    });
  }

  sendYearlyReport() {
    this.subscriptionSvc.sendYearlyReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(() => {
      console.log('Sending yearly report.');
    });
  }
}
