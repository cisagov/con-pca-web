import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { AppSettings } from 'src/app/AppSettings';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { OverviewTabService } from 'src/app/services/overview-tab.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

interface SubscriptionWithEndDate {
  // top-level primitives for column sorting
  name: string;
  cycle_start_date: Date;
  cycle_end_date: Date;
  appendix_a_date: Date;
  is_continuous: string;
  last_updated: Date;
}

@Component({
  selector: 'app-subscription-status-tab',
  templateUrl: './subscription-status-tab.component.html',
})
export class SubscriptionStatusTab implements OnInit {
  @Input() tabClicked: BehaviorSubject<boolean>;
  clickStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @ViewChild('endingSoonTable', { read: MatSort, static: true })
  sortEndingSoon: MatSort;
  @ViewChild('inProgressTable', { read: MatSort, static: true })
  sortInProgress: MatSort;
  @ViewChild('stoppedTable', { read: MatSort, static: true })
  sortStopped: MatSort;
  loading: boolean = false;
  dataLoaded: boolean = false;

  dateFormat = AppSettings.DATE_FORMAT;

  // Subscriptions Ending Soon Table
  public endingSoonDataSource: MatTableDataSource<SubscriptionWithEndDate>;
  endingSoonDisplayedColumns = [
    'name',
    'startDate',
    'endDate',
    'appendixDate',
    'isContinuous',
    'lastUpdated',
  ];

  // Subscriptions in Progress Table
  public inProgressDataSource: MatTableDataSource<SubscriptionWithEndDate>;
  inProgressDisplayedColumns = [
    'name',
    'startDate',
    'endDate',
    'appendixDate',
    'isContinuous',
    'lastUpdated',
  ];

  // Stopped Subscriptions Table
  public stoppedDataSource: MatTableDataSource<SubscriptionModel>;
  stoppedDisplayedColumns = [
    'name',
    'startDate',
    'appendixDate',
    'isContinuous',
    'lastUpdated',
  ];

  endingSoonMethod = this.subscriptionSvc.getSubStatusEndingSoon

  constructor(
    private router: Router,
    public subscriptionSvc: SubscriptionService,
    private tabSvc: OverviewTabService,
  ) {
    this.clickStatus = this.tabClicked;
  }

  ngOnInit(): void {
    this.endingSoonDataSource = new MatTableDataSource();
    this.inProgressDataSource = new MatTableDataSource();
    this.stoppedDataSource = new MatTableDataSource();
    this.tabSvc.subscriptionStatsClicked.subscribe((val) => {
      if (val && !this.dataLoaded) {
        this.refresh();
        this.dataLoaded = true;
      }
    });
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
              moment(obj.cycle_start_date, 'YYYY-MM-DD').add(
                obj.cycle_length_minutes - 28800,
                'minutes',
              ),
              'day',
            ),
        ) as SubscriptionWithEndDate[];
        this.endingSoonDataSource.sort = this.sortEndingSoon;
        this.sortingDataAccessor(this.endingSoonDataSource);
        this.inProgressDataSource.data = subscriptions.filter(
          (obj) => obj.status === 'running',
        ) as SubscriptionWithEndDate[];
        this.inProgressDataSource.sort = this.sortInProgress;
        this.sortingDataAccessor(this.inProgressDataSource);
        this.stoppedDataSource.data = subscriptions.filter(
          (obj) => obj.status === 'stopped',
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
          return new Date(item.cycle_start_date);
        case 'endDate':
          return new Date(item.cycle_end_date);
        case 'appendixDate':
          return new Date(item.appendix_a_date);
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
