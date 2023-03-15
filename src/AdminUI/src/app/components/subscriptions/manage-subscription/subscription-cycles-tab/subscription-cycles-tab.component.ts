import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import * as moment from 'node_modules/moment/moment';
import { DatePipe } from '@angular/common';
import {
  SubscriptionModel,
  TargetModel,
  TimelineItem,
} from 'src/app/models/subscription.model';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  CycleManualReportsModel,
  CycleModel,
} from 'src/app/models/cycle.model';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { CycleService } from 'src/app/services/cycle.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { ConfirmComponent } from 'src/app/components/dialogs/confirm/confirm.component';
import { NONE_TYPE } from '@angular/compiler';
import { now } from 'moment';

@Component({
  selector: 'app-subscription-cycles-tab',
  templateUrl: './subscription-cycles-tab.component.html',
  styleUrls: ['./subscription-cycles-tab.component.scss'],
  providers: [DatePipe],
})
export class SubscriptionStatsTab implements OnInit {
  //   @Input()
  //   subscription: Subscription

  subscription: SubscriptionModel;
  subscription_id: string;
  selectedCycle: CycleModel;
  timelineItems: any[] = [];
  display_timeline = false;
  includeNonhuman = false;

  downloadingCycle = false;
  downloadingSubscription = false;
  downloadingText = 'Downloading Cycle Data';

  allowCycleDownload = false;

  generating = false;
  generatingText = '';

  // Manual reports form
  reportedStatsForm = new FormGroup({ reportedItems: new FormControl('') });
  validationErrors = {
    invalidEmailFormat: '',
    invalidDateFormat: '',
    emailNotATarget: '',
    duplicateEmail: '',
  };
  reportListErrorLineNum = 0;

  // subscription export info
  hourlyRate = 0;
  dailyRate = 0;

  constructor(
    public subscriptionSvc: SubscriptionService,
    public datePipe: DatePipe,
    private router: Router,
    public dialog: MatDialog,
    public cycleSvc: CycleService,
  ) {
    this.subscription = new SubscriptionModel();
  }

  pageRefresh(): void {
    this.router.navigate(['/view-subscription', this.subscription._id], {
      queryParams: {
        tab: 1,
      },
    });
  }

  ngOnInit() {
    this.subscriptionSvc.getSubBehaviorSubject().subscribe((data) => {
      this.subscription = data;
      if (data._id && !this.subscription_id) {
        this.subscription_id = data._id;
      }
      if ('cycles' in data) {
        this.buildSubscriptionTimeline(this.subscription);
        this.subscription = data;
        //@ts-ignore
        let selectedCycleIndex = 0;
        this.selectedCycle = this.subscription.cycles[selectedCycleIndex];
        this.subscriptionSvc.setCycleBehaviorSubject(this.selectedCycle);
        this.setDisplayReportStatus();
        this.reportedStatsForm.controls.reportedItems.setValidators([
          this.reportListValidator(),
        ]);
        this.convertReportsToCSV();
      }
      if (this.subscription.status === 'running') {
        this.subscriptionSvc
          .checkValid(
            this.subscription.cycle_length_minutes,
            this.subscription.target_email_list.length,
          )
          .subscribe((resp: any) => {
            this.hourlyRate = resp.hourly_rate;
            this.dailyRate = resp.daily_rate;
          });
      }
    });
  }

  cycleChange(event) {
    this.subscriptionSvc.setCycleBehaviorSubject(event.value);
    this.convertReportsToCSV();
    this.setDisplayReportStatus();
  }

  showNonHuman(event: MatSlideToggleChange) {
    this.selectedCycle.nonhuman = event.checked;
    this.subscriptionSvc.setCycleBehaviorSubject(this.selectedCycle);
  }

  setDisplayReportStatus() {
    let now = new Date();
    let endDate = new Date(this.selectedCycle.end_date);
    if (now.getTime() > endDate.getTime()) {
      this.allowCycleDownload = true;
    } else {
      this.allowCycleDownload = false;
    }
  }

  buildSubscriptionTimeline(s: SubscriptionModel) {
    const items: TimelineItem[] = [];

    items.push({
      title: 'Subscription Started',
      date: moment(s.start_date),
    });
    // now extract a simple timeline based on campaign events
    s.cycles.forEach((c: CycleModel) => {
      items.push({
        title: 'Cycle Start',
        date: moment(c.start_date),
      });
      items.push({
        title: 'Cycle End',
        date: moment(c.end_date),
      });
    });

    // add an item for 'today'
    items.push({
      title: 'Today',
      date: moment(),
    });

    this.timelineItems = items;
    let expectedtimelineItemCount = 5;
    if (this.timelineItems.length >= expectedtimelineItemCount) {
      this.display_timeline = true;
    }
  }

  downloadReport(reportType: string) {
    this.generating = true;
    this.generatingText = 'Downloading Report';
    this.subscriptionSvc
      .downloadReport(this.selectedCycle._id, reportType, this.includeNonhuman)
      .subscribe(
        (blob) => {
          this.downloadObject(
            `CISA_PCA_${reportType.toLocaleUpperCase()}_report_${moment().format(
              'MMDDYYYY',
            )}_${this.selectedCycle._id}.pdf`,
            blob,
          );
          this.generating = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', `${reportType} report`);
          this.generating = false;
        },
      );
  }

  sendReport(reportType: string) {
    this.generating = true;
    this.generatingText = 'Sending Report';
    this.subscriptionSvc
      .sendReport(this.selectedCycle._id, reportType, this.includeNonhuman)
      .subscribe(
        () => {
          this.generating = false;
        },
        (error) => {
          this.popupReportError(error, 'sending', `${reportType} report`);
          this.generating = false;
        },
      );
  }

  popupReportError(error: any, action: string, type: string) {
    this.dialog.open(AlertComponent, {
      data: {
        title: 'Error',
        messageText: `An error occurred ${action} the ${type}. Check logs for more detail.`,
      },
    });
  }

  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  exportSubscriptionData() {
    this.downloadingSubscription = true;
    const bufTimeMinutes = this.subscription.buffer_time_minutes;
    const bufferTime =
      bufTimeMinutes > 1400
        ? `${bufTimeMinutes / 1440} days`
        : `${bufTimeMinutes / 60} hours`;

    let nextCyclesLaunchDay = new Date(this.selectedCycle.end_date);
    let minutes = nextCyclesLaunchDay.getMinutes() + bufferTime;
    nextCyclesLaunchDay.setMinutes(Number(minutes));

    let statusReportDays = 'subscription not active';
    let cycleReportDay = 'subscription not active';

    if (this.subscription.status === 'running') {
      const cycleLength: number = this.subscription.cycle_length_minutes;
      const targetCount: number = this.subscription.target_email_list.length;
      const statusReportTask = this.subscription.tasks.find(
        (t) => t.task_type === 'status_report',
      );
      if (statusReportTask) {
        statusReportDays = `${new Date(
          statusReportTask.scheduled_date,
        ).toDateString()}`;
      } else {
        statusReportDays = 'None';
      }
      const cycleReportTask = this.subscription.tasks.find(
        (t) => t.task_type === 'cycle_report',
      );
      if (cycleReportTask) {
        cycleReportDay = `${new Date(
          cycleReportTask.scheduled_date,
        ).toDateString()}`;
      } else {
        cycleReportDay = 'None';
      }
    }
    if (!this.subscription.start_date) {
      this.subscription.start_date = null;
    }
    if (!this.subscription.primary_contact.email) {
      this.subscription.primary_contact.email = 'None';
    }
    if (!this.subscription.target_email_list) {
      this.subscription.target_email_list = [];
    }
    if (!this.selectedCycle.send_by_date) {
      this.selectedCycle.send_by_date = null;
    }
    if (!this.selectedCycle.end_date) {
      this.selectedCycle.end_date = null;
    }
    if (!this.hourlyRate) {
      this.hourlyRate = 0;
    }
    if (!this.dailyRate) {
      this.dailyRate = 0;
    }
    if (!nextCyclesLaunchDay) {
      nextCyclesLaunchDay = null;
    }

    const data = {
      'Email launch day': new Date(this.subscription.start_date).toDateString(),
      'Primary POC receiving status reports and updates':
        this.subscription.primary_contact.email,
      'Number of participants': this.subscription.target_email_list.length,
      'Status report delivery days': statusReportDays,
      'Cycle report delivery day': cycleReportDay,
      'Emails sent by': new Date(
        this.selectedCycle.send_by_date,
      ).toDateString(),
      'Cycle completed by': new Date(
        this.selectedCycle.end_date,
      ).toDateString(),
      'Hourly email sending rate': this.hourlyRate,
      'Daily email sending rate': this.dailyRate,
      'Buffer days between cycles': bufferTime,
      "Next cycle's email launch day": nextCyclesLaunchDay.toDateString(),
    };
    const blob: Blob = new Blob([this.convertToCSV(data)], {
      type: 'text/csv;charset=utf-8',
    });
    const filename = `${this.subscription.name}_overview_data`;
    this.downloadObject(filename, blob);
    this.downloadingSubscription = false;
  }

  downloadCycleData() {
    this.downloadingCycle = true;
    this.cycleSvc.getCycle(this.selectedCycle._id).subscribe((cycle) => {
      this.subscriptionSvc.getSubscription(cycle.subscription_id).subscribe(
        (subscription) => {
          const data = { cycle, subscription };
          const filename = `${subscription.name}_cycle_data.json`;
          const blob = new Blob([JSON.stringify(data)]);
          this.downloadObject(filename, blob);
          this.downloadingCycle = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', 'cycle report');
          this.downloadingCycle = false;
        },
      );
    });
  }

  convertReportsToCSV() {
    let displayString = '';
    if (this.selectedCycle?.manual_reports) {
      this.selectedCycle.manual_reports.forEach((element) => {
        let newDate = '';
        if (element.report_date) {
          newDate = this.datePipe.transform(
            new Date(element.report_date),
            'M/d/yy h:mm a',
          );
        }
        displayString += `${element.email},${newDate}\n`;
        this.f.reportedItems.setValue(displayString);
      });
    } else {
      this.f.reportedItems.setValue('');
    }
  }

  convertReportsFromCSV() {
    const lines = this.f.reportedItems.value.split('\n');
    const reportVals: CycleManualReportsModel[] = [];
    lines.forEach((element: string) => {
      const reportItems = element.split(',');
      if (reportItems.length === 2) {
        reportVals.push({
          email: reportItems[0].trim(),
          report_date: new Date(reportItems[1].trim()),
        });
      }
    });
    return reportVals;
  }

  saveManualReports() {
    if (this.reportedStatsForm.valid) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        disableClose: false,
      });
      dialogRef.componentInstance.confirmMessage =
        'Are you sure you want to save the reports?';
      dialogRef.componentInstance.title = 'Confirm Save';

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const reports = this.convertReportsFromCSV();
          this.cycleSvc
            .saveManualReports(this.selectedCycle._id, reports)
            .subscribe(
              () => {
                this.dialog.open(AlertComponent, {
                  data: {
                    title: 'Manual Reports Saved',
                    messageText: 'The manual reports list was saved.',
                  },
                });
              },
              (error) => {
                this.dialog.open(AlertComponent, {
                  data: {
                    title: 'Reports Saving Error',
                    messageText: error.error,
                  },
                });
              },
            );
        }
      });
    }
  }

  reportListValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const exprEmail =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (control.value == '') {
        return null;
      }
      const lines = control.value.split('\n');
      let emails = [];
      this.reportListErrorLineNum = 1;
      for (const line of lines) {
        if (line) {
          const parts = line.split(',');
          if (parts.length !== 2) {
            return { invalidTargetCsv: true };
          }

          if (
            !!parts[0] &&
            !exprEmail.test(String(parts[0]).toLowerCase().trim())
          ) {
            return { invalidEmailFormat: parts[0] };
          }
          emails.push(parts[0]);
          if (!!parts[1]) {
            let date = new Date(parts[1]);
            if (isNaN(date.valueOf())) {
              return { invalidDateFormat: parts[1] };
            }
          }
        }
        this.reportListErrorLineNum++;
      }
      for (let i = 0; i < emails.length; i++) {
        for (let h = i; h < emails.length; h++) {
          if (emails[i] == emails[h] && i != h) {
            return { duplicateEmail: true };
          }
        }
      }

      return null;
    };
  }

  get f() {
    return this.reportedStatsForm.controls;
  }

  private convertToCSV(data: object) {
    return Object.entries(data).join('\n');
  }
}
