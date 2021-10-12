import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import * as moment from 'node_modules/moment/moment';
import { DatePipe } from '@angular/common';
import {
  SubscriptionModel,
  TimelineItem,
} from 'src/app/models/subscription.model';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CycleModel } from 'src/app/models/cycle.model';

@Component({
  selector: 'subscription-stats-tab',
  templateUrl: './subscription-stats-tab.component.html',
  styleUrls: ['./subscription-stats-tab.component.scss'],
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

  constructor(
    public subscriptionSvc: SubscriptionService,
    public datePipe: DatePipe,
    private router: Router
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
}
