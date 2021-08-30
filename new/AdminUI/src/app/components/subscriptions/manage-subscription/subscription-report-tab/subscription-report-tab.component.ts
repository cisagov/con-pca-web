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
  includeNonhuman = false;

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

  viewReport(reportType: string) {
    this.router.navigate([
      `/reports/${reportType}/${this.selectedCycle.cycle_uuid}`,
    ]);
  }

  downloadReport(reportType: string) {
    this.loading = true;
    this.subscriptionSvc
      .downloadReport(
        this.selectedCycle.cycle_uuid,
        reportType,
        this.includeNonhuman
      )
      .subscribe(
        (blob) => {
          this.downloadObject(`subscription_${reportType}_report.pdf`, blob);
          this.loading = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', reportType);
        }
      );
  }

  sendReport(reportType: string) {
    this.loading = true;
    this.subscriptionSvc
      .sendReport(
        this.selectedCycle.cycle_uuid,
        reportType,
        this.includeNonhuman
      )
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.updateReportList(data.subscription_uuid);
        },
        (error) => {
          this.popupReportError(error, 'sending', reportType);
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
  downloadSubscriptionData() {
    this.subscriptionSvc
      .getSubscriptionJSON(this.subscription.subscription_uuid)
      .subscribe(
        (blob) => {
          this.downloadObject(
            `${this.subscription.name}_subscription_data.json`,
            blob
          );
        },
        (error) => {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Error',
              messageText: `An error occured downloading the subscription JSON data. Check logs for more detail.`,
            },
          });
        }
      );
  }
}
