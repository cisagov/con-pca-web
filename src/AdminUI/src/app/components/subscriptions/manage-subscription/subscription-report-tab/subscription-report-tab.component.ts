import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription } from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';

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
  loading = false;

  constructor(
    private subscriptionSvc: SubscriptionService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscriptionSvc.subBehaviorSubject.subscribe((data: Subscription) => {
      if ('subscription_uuid' in data && data.cycles) {
        this.subscription = data;
        this.emailsSent.sort = this.sort;
        const selectedCycleIndex = 0;
        this.selectedCycle = this.subscription.cycles[selectedCycleIndex];
        this.emailsSent.data = data.email_report_history;
      }
    });
  }

  refresh() {}

  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  cycleChange(event) {}

  viewMonthlyReport() {
    this.router.navigate([
      '/reports/monthly',
      this.subscription.subscription_uuid,
      this.selectedCycle.cycle_uuid,
      false,
    ]);
  }

  viewCycleReport() {
    this.router.navigate([
      '/reports/cycle',
      this.subscription.subscription_uuid,
      this.selectedCycle.cycle_uuid,
      false,
    ]);
  }

  viewYearlyReport() {
    this.router.navigate([
      '/reports/yearly',
      this.subscription.subscription_uuid,
      this.selectedCycle.cycle_uuid,
      false,
    ]);
  }

  downloadMonthlyReport() {
    this.loading = true;
    this.subscriptionSvc
      .getMonthlyReport(
        this.subscription.subscription_uuid,
        this.selectedCycle.cycle_uuid
      )
      .subscribe(
        (blob) => {
          this.downloadObject('subscription_status_report.pdf', blob);
          this.loading = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', 'monthly');
        }
      );
  }

  downloadCycleReport() {
    this.loading = true;
    this.subscriptionSvc
      .getCycleReport(
        this.subscription.subscription_uuid,
        this.selectedCycle.cycle_uuid
      )
      .subscribe(
        (blob) => {
          this.downloadObject('subscription_cycle_report.pdf', blob);
          this.loading = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', 'cycle');
        }
      );
  }

  downloadYearlyReport() {
    this.loading = true;
    this.subscriptionSvc
      .getYearlyReport(
        this.subscription.subscription_uuid,
        this.selectedCycle.cycle_uuid
      )
      .subscribe(
        (blob) => {
          this.downloadObject('subscription_yearly_report.pdf', blob);
          this.loading = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', 'yearly');
        }
      );
  }

  sendMonthlyReport() {
    this.loading = true;
    this.subscriptionSvc
      .sendMonthlyReport(
        this.subscription.subscription_uuid,
        this.selectedCycle.cycle_uuid
      )
      .subscribe(
        (data: any) => {
          console.log('Sending monthly report.');
          this.loading = false;
          this.updateReportList(data.subscription_uuid);
        },
        (error) => {
          this.popupReportError(error, 'sending', 'monthly');
        }
      );
  }

  sendCycleReport() {
    this.loading = true;
    this.subscriptionSvc
      .sendCycleReport(
        this.subscription.subscription_uuid,
        this.selectedCycle.cycle_uuid
      )
      .subscribe(
        (data: any) => {
          console.log('Sending cycle report.');
          this.updateReportList(data.subscription_uuid);
          this.loading = false;
        },
        (error) => {
          this.popupReportError(error, 'sending', 'cycle');
        }
      );
  }

  sendYearlyReport() {
    this.loading = true;
    this.subscriptionSvc
      .sendYearlyReport(
        this.subscription.subscription_uuid,
        this.selectedCycle.cycle_uuid
      )
      .subscribe(
        (data: any) => {
          console.log('Sending yearly report.');
          this.updateReportList(data.subscription_uuid);
          this.loading = false;
        },
        (error) => {
          this.popupReportError(error, 'sending', 'yearly');
        }
      );
  }

  popupReportError(error: any, action: string, type: string) {
    this.loading = false;
    this.dialog.open(AlertComponent, {
      data: {
        title: 'Error',
        messageText: `An error occured ${action} the ${type} report. Check logs for more detail.`,
      },
    });
  }

  updateReportList(subscription_uuid) {
    this.subscriptionSvc
      .getSusbcriptionStatusEmailsSent(subscription_uuid)
      .subscribe(
        (data: any) => {
          this.emailsSent.data = data;
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
