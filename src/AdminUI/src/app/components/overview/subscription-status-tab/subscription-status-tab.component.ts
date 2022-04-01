import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AppSettings } from 'src/app/AppSettings';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { SubscriptionService } from 'src/app/services/subscription.service';

@Component({
  selector: 'app-subscription-status-tab',
  templateUrl: './subscription-status-tab.component.html',
})
export class SubscriptionStatusTab implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  loading = false;

  dateFormat = AppSettings.DATE_FORMAT;

  // Subscriptions Ending Soon Table
  public endingSoonDataSource: MatTableDataSource<SubscriptionModel>;
  endingSoonDisplayedColumns = [
    'name',
    'startDate',
    'isContinuous',
    'lastUpdated',
  ];

  // Subscriptions in Progress Table
  public inProgressDataSource: MatTableDataSource<SubscriptionModel>;
  inProgressDisplayedColumns = [
    'name',
    'startDate',
    'isContinuous',
    'lastUpdated',
  ];

  // Stopped Subscriptions Table
  public stoppedDataSource: MatTableDataSource<SubscriptionModel>;
  stoppedDisplayedColumns = [
    'name',
    'startDate',
    'isContinuous',
    'lastUpdated',
  ];

  constructor(
    private router: Router,
    private subscriptionSvc: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.endingSoonDataSource = new MatTableDataSource();
    this.inProgressDataSource = new MatTableDataSource();
    this.stoppedDataSource = new MatTableDataSource();
    this.refresh();
  }

  async refresh() {
    this.loading = true;
    await this.subscriptionSvc
      .getSubscriptions(false)
      .subscribe((subscriptions: any) => {
        this.loading = false;
        const now = moment();
        this.endingSoonDataSource.data = subscriptions.filter(
          (obj) =>
            obj.status === 'running' &&
            moment().isAfter(
              moment(obj.start_date, 'YYYY-MM-DD').add(
                obj.cycle_length_minutes - 28800,
                'minutes'
              ),
              'day'
            )
        ) as SubscriptionModel[];
        this.inProgressDataSource.data = subscriptions.filter(
          (obj) => obj.status === 'running'
        ) as SubscriptionModel[];
        this.stoppedDataSource.data = subscriptions.filter(
          (obj) => obj.status === 'stopped'
        ) as SubscriptionModel[];
      });
  }

  public editSubscription(row) {
    this.router.navigate(['/view-subscription', row._id]);
  }
}
