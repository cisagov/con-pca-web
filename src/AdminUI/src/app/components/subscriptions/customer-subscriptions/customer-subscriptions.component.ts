import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription } from 'src/app/models/subscription.model';
import { Customer } from 'src/app/models/customer.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AppSettings } from 'src/app/AppSettings';

@Component({
  selector: 'customer-subscriptions',
  templateUrl: './customer-subscriptions.component.html',
  styleUrls: ['./customer-subscriptions.component.scss']
})
export class CustomerSubscriptionsComponent implements OnInit {


  private _customer;

  dateFormat = AppSettings.DATE_FORMAT;

  @Input() set customer(value) {
    this._customer = value;
    if (this._customer !== undefined) {
      this.refresh();
    }
  }


  @ViewChild(MatSort) sort: MatSort;

  subscriptions = new MatTableDataSource<Subscription>();

  displayedColumns = [
    'name',
    'status',
    'active',
    'start_date',
    'lub_timestamp',
    'inspect',
  ];

  constructor(
    public subscriptionSvc: SubscriptionService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.sort = this.sort;
  }

  refresh() {
    this.subscriptionSvc.getSubscriptionsByCustomer(this._customer).subscribe((data: any[]) => {
      this.subscriptions.data = data as Subscription[];
      this.subscriptions.sort = this.sort;
    });
  }

  checkDataSourceLength(): boolean {
    if (this.subscriptions.data.length < 1) {
      return false;
    }
    return true;
  }
}
