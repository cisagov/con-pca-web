import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import * as moment from 'node_modules/moment/moment';
import { DatePipe } from '@angular/common';
import { Subscription, TimelineItem } from 'src/app/models/subscription.model';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Cycle } from 'src/app/models/cycle.model';

@Component({
  selector: 'subscription-stats-tab',
  templateUrl: './subscription-stats-tab.component.html',
  styleUrls: ['./subscription-stats-tab.component.scss'],
  providers: [DatePipe],
})
export class SubscriptionStatsTab implements OnInit {
  //   @Input()
  //   subscription: Subscription

  subscription: Subscription;
  subscription_uuid: string;
  selectedCycle: Cycle;
  timelineItems: any[] = [];
  display_timeline = false;

  constructor(
    public subscriptionSvc: SubscriptionService,
    public datePipe: DatePipe,
    private router: Router
  ) {
    this.subscription = new Subscription();
  }

  pageRefresh(): void {
    this.router.navigate(
      ['/view-subscription', this.subscription.subscription_uuid],
      {
        queryParams: {
          tab: 1,
        },
      }
    );
  }

  ngOnInit() {
    this.subscriptionSvc.getSubBehaviorSubject().subscribe((data) => {
      this.subscription = data;
      if (data.subscription_uuid && !this.subscription_uuid) {
        this.subscription_uuid = data.subscription_uuid;
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

  buildSubscriptionTimeline(s: Subscription) {
    const items: TimelineItem[] = [];

    items.push({
      title: 'Subscription Started',
      date: moment(s.start_date),
    });
    // now extract a simple timeline based on campaign events
    s.cycles.forEach((c: Cycle) => {
      items.push({
        title: 'Cycle Start',
        date: moment(c.start_date),
      });
    });

    // add an item for 'today'
    items.push({
      title: 'Today',
      date: moment(),
    });

    items.push({
      title: 'Cycle End',
      date: moment(s.end_date),
    });

    this.timelineItems = items;
    let expectedtimelineItemCount = 5;
    if (this.timelineItems.length >= expectedtimelineItemCount) {
      this.display_timeline = true;
    }
  }
}
