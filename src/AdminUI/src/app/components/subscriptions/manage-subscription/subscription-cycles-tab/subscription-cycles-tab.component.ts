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

  downloading = false;
  downloadingText = 'Downloading Cycle Data';

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

  constructor(
    public subscriptionSvc: SubscriptionService,
    public datePipe: DatePipe,
    private router: Router,
    public dialog: MatDialog,
    public cycleSvc: CycleService
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
        this.reportedStatsForm.controls.reportedItems.setValidators([
          this.reportListValidator(
            this.targetListSimple(this.subscription.target_email_list)
          ),
        ]);
        this.convertReportsToCSV();
      }
    });
  }

  cycleChange(event) {
    this.subscriptionSvc.setCycleBehaviorSubject(event.value);
    this.convertReportsToCSV();
  }

  showNonHuman(event: MatSlideToggleChange) {
    this.selectedCycle.nonhuman = event.checked;
    this.subscriptionSvc.setCycleBehaviorSubject(this.selectedCycle);
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
          this.downloadObject(`subscription_${reportType}_report.pdf`, blob);
          this.generating = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', reportType);
          this.generating = false;
        }
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
          this.popupReportError(error, 'sending', reportType);
          this.generating = false;
        }
      );
  }

  popupReportError(error: any, action: string, type: string) {
    this.dialog.open(AlertComponent, {
      data: {
        title: 'Error',
        messageText: `An error occured ${action} the ${type} report. Check logs for more detail.`,
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

  downloadCycleData() {
    this.downloading = true;
    this.cycleSvc.getCycle(this.selectedCycle._id).subscribe((cycle) => {
      this.subscriptionSvc.getSubscription(cycle.subscription_id).subscribe(
        (subscription) => {
          const data = { cycle, subscription };
          const filename = `${subscription.name}_cycle_data.json`;
          const blob = new Blob([JSON.stringify(data)]);
          this.downloadObject(filename, blob);
          this.downloading = false;
        },
        (error) => {
          this.popupReportError(error, 'downloading', 'cycle');
          this.downloading = false;
        }
      );
    });
  }

  convertReportsToCSV() {
    console.log(this.selectedCycle);
    let displayString = '';
    if (this.selectedCycle.manual_reports) {
      this.selectedCycle.manual_reports.forEach((element) => {
        let newDate = '';
        if (element.report_date) {
          newDate = this.datePipe.transform(
            new Date(element.report_date),
            'M/d/yy h:mm a'
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
      const reports = this.convertReportsFromCSV();
      this.cycleSvc
        .saveManualReports(this.selectedCycle._id, reports)
        .subscribe(
          (result) => {
            console.log(result);
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  targetListSimple(list: TargetModel[]) {
    const retVal = [];
    list.forEach((element) => {
      retVal.push(element.email);
    });
    return retVal;
  }

  reportListValidator(targetList: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const exprEmail =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (control.value == '') {
        return null;
      }
      const lines = control.value.split('\n');
      let emails = [];
      let matchFound = false;
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
          for (let i = 0; i < targetList.length; i++) {
            if (targetList[i] == parts[0].trim()) {
              matchFound = true;
            }
          }
          if (!matchFound) {
            return { emailNotATarget: parts[0] };
          }
          matchFound = false;

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
}
