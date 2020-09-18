import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription } from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ReportsService } from 'src/app/services/reports.service';
import { ActivatedRoute, Router } from '@angular/router';
import { input } from 'aws-amplify';

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
  loading = false

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
        let selectedCycleIndex = 0
        this.selectedCycle = this.subscription.cycles[selectedCycleIndex];
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
    // console.log(
    //   'cycle period changed, new Value ready for choosing the correct report'
    // );
    // console.log(event.value);
  }

  viewMonthlyReport() {
    this.router.navigate([
      '/reports/monthly',
      this.subscription.subscription_uuid,
      this.selectedCycle.end_date,
      false,
      this.selectedCycle.cycle_uuid,
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
    this.loading = true
    this.subscriptionSvc.getMonthlyReport(this.subscription.subscription_uuid, this.selectedCycle.end_date, this.selectedCycle.cycle_uuid).subscribe(blob => {
      this.downloadObject('subscription_status_report.pdf', blob);
      this.loading = false
    });
  }

  downloadCycleReport() {
    this.loading = true
    this.subscriptionSvc.getCycleReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(blob => {
      this.downloadObject('subscription_cycle_report.pdf', blob);
      this.loading = false
    });
  }

  downloadYearlyReport() {
    this.loading = true
    this.subscriptionSvc.getYearlyReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(blob => {
      this.downloadObject('subscription_yearly_report.pdf', blob);
      this.loading = false
    });
  }

  sendMonthlyReport() {
    this.loading = true
    this.subscriptionSvc.sendMonthlyReport(this.subscription.subscription_uuid, this.selectedCycle.end_date, this.selectedCycle.cycle_uuid).subscribe(
      (data:any) => {
        console.log('Sending monthly report.');
        this.loading = false
        this.updateReportList(data.subscription_uuid)
    });
  }

  sendCycleReport() {
    this.loading = true
    this.subscriptionSvc.sendCycleReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(
      (data:any) => {
      console.log('Sending cycle report.');
      this.updateReportList(data.subscription_uuid)
      this.loading = false
    });
  }

  sendYearlyReport() {
    this.loading = true
    this.subscriptionSvc.sendYearlyReport(this.subscription.subscription_uuid, this.selectedCycle.start_date).subscribe(
      (data:any) => {
      console.log('Sending yearly report.');
      this.updateReportList(data.subscription_uuid)
      this.loading = false
    });
  }

  updateReportList(subscription_uuid){
    this.subscriptionSvc.getSusbcriptionStatusEmailsSent(subscription_uuid).subscribe(
      (data: any) => {
      this.emailsSent.data = data
    }, (error) => {
      console.log(error)
    });
  }
}
