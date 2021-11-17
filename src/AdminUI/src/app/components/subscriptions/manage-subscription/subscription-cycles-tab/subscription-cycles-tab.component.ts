import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import * as moment from 'node_modules/moment/moment';
import { DatePipe } from '@angular/common';
import {
  SubscriptionModel,
  TimelineItem,
} from 'src/app/models/subscription.model';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CycleModel } from 'src/app/models/cycle.model';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { CycleService } from 'src/app/services/cycle.service';
import { CycleSelectReports } from 'src/app/components/dialogs/cycle-select-reports/cycle-select-reports.component';

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
      }
    });
  }

  cycleChange(event) {
    this.subscriptionSvc.setCycleBehaviorSubject(event.value);
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
      .downloadReport(
        [this.selectedCycle._id],
        reportType,
        this.includeNonhuman
      )
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
      .sendReport([this.selectedCycle._id], reportType, this.includeNonhuman)
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

  openCycleSelectionDialog() {
    const dialogOptions = {
      cycles: this.subscription.cycles,
      sub_name: this.subscription.name,
    };

    const dialogRef = this.dialog.open(CycleSelectReports, {
      data: dialogOptions,
    });

    dialogRef.afterClosed().subscribe((val) => {
      if (val) {
        const cycleIds = val.cycles;
        const reportType = val.reportType;
        if (cycleIds.length > 0) {
          this.generating = true;
          this.subscriptionSvc.downloadReport(cycleIds, reportType).subscribe(
            (success) => {
              this.generatingText = 'Downloading Multi-Cycle Report';
              this.downloadObject(`subscription_cycleset_report.pdf`, success);
              this.generating = false;
            },
            (error) => {
              this.popupReportError(error, 'downloading', reportType);
              this.generating = false;
            }
          );
        }
      }
    });
  }
}
