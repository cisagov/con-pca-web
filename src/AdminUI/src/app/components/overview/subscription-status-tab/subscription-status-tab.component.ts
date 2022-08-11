import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AppSettings } from 'src/app/AppSettings';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { SubscriptionService } from 'src/app/services/subscription.service';

interface SubscriptionWithEndDate {
  // top-level primitives for column sorting
  name: string;
  start_date: Date;
  end_date: Date;
  is_continuous: string;
  last_updated: Date;
}

@Component({
  selector: 'app-subscription-status-tab',
  templateUrl: './subscription-status-tab.component.html',
})
export class SubscriptionStatusTab implements OnInit {
  @ViewChild('endingSoonTable', { read: MatSort, static: true })
  sortEndingSoon: MatSort;
  @ViewChild('inProgressTable', { read: MatSort, static: true })
  sortInProgress: MatSort;
  @ViewChild('stoppedTable', { read: MatSort, static: true })
  sortStopped: MatSort;
  loading: boolean = false;

  dateFormat = AppSettings.DATE_FORMAT;

  // Subscriptions Ending Soon Table
  public endingSoonDataSource: MatTableDataSource<SubscriptionWithEndDate>;
  endingSoonDisplayedColumns = [
    'name',
    'startDate',
    'endDate',
    'isContinuous',
    'lastUpdated',
  ];

  // Subscriptions in Progress Table
  public inProgressDataSource: MatTableDataSource<SubscriptionWithEndDate>;
  inProgressDisplayedColumns = [
    'name',
    'startDate',
    'endDate',
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
      .getSubscriptionsWithEndDate()
      .subscribe((subscriptions: any) => {
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
        ) as SubscriptionWithEndDate[];
        this.endingSoonDataSource.sort = this.sortEndingSoon;
        this.sortingDataAccessor(this.endingSoonDataSource);
        this.inProgressDataSource.data = subscriptions.filter(
          (obj) => obj.status === 'running'
        ) as SubscriptionWithEndDate[];
        this.inProgressDataSource.sort = this.sortInProgress;
        this.sortingDataAccessor(this.inProgressDataSource);
        this.stoppedDataSource.data = subscriptions.filter(
          (obj) => obj.status === 'stopped'
        ) as SubscriptionModel[];
        this.stoppedDataSource.sort = this.sortStopped;
        this.sortingDataAccessor(this.stoppedDataSource);
      });
    this.loading = false;
  }

  private sortingDataAccessor(callBack: any) {
    callBack.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'startDate':
          return new Date(item.start_date);
        case 'endDate':
          return new Date(item.end_date);
        case 'isContinuous':
          return item.continuous_subscription ? 1 : 0;
        case 'lastUpdated':
          return new Date(item.updated);
        default:
          return item[property];
      }
    };
  }

  public editSubscription(row) {
    this.router.navigate(['/view-subscription', row._id]);
  }
}
