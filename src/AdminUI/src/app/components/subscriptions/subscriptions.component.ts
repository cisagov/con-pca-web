import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerModel } from 'src/app/models/customer.model';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { AppSettings } from 'src/app/AppSettings';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { MatSort } from '@angular/material/sort';

interface ICustomerSubscription {
  customer: CustomerModel;
  subscription: SubscriptionModel;

  // top-level primitives for column sortings
  name: string;
  status: string;
  primaryContact: string;
  customerName: string;
  startDate: Date;
  numberOfTargets: number;
  lastUpdated: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent implements OnInit {
  public dataSource: MatTableDataSource<ICustomerSubscription>;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = [
    'name',
    'status',
    'primaryContact',
    'customerName',
    'appendixADate',
    'startDate',
    'numberOfTargets',
    'targetDomain',
    'lastUpdated',
  ];

  // pagination variables
  subscriptionCount: number = 99;
  page: any = 0;
  subsPerPage: any = 10;
  sortOrder = 'asc';
  sortBy = 'name';
  searchFilterStr = '';
  // sortBy: "name"

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  showArchived = false;

  dateFormat = AppSettings.DATE_FORMAT;

  loading = false;

  constructor(
    private subscriptionSvc: SubscriptionService,
    private customerSvc: CustomerService,
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    private router: Router
  ) {
    layoutSvc.setTitle('Subscriptions');
  }

  ngOnInit(): void {
    this.layoutSvc.setTitle('Subscriptions');
    this.dataSource = new MatTableDataSource();
    this.getPageSize();
    this.refresh();
    this.setFilterPredicate();
  }

  changeSort(sortEvent) {
    console.log(sortEvent);
    this.sortOrder = sortEvent.direction;
    if (sortEvent.direction == '') {
      this.sortOrder = 'asc';
      this.sortBy = 'name';
    } else {
      switch (sortEvent.active) {
        case 'name':
          this.sortBy = 'name';
          break;
        case 'status':
          this.sortBy = 'status';
          break;
        case 'primaryContact':
          this.sortBy = 'contact_full_name';
          break;
        case 'customerName':
          this.sortBy = 'customer';
          break;
        case 'startDate':
          this.sortBy = 'start_date';
          break;
        case 'numberOfTargets':
          this.sortBy = 'target_count';
          break;
        case 'targetDomain':
          this.sortBy = 'target_domain';
          break;
        case 'appendixADate':
          this.sortBy = 'start_date';
          break;
        case 'lastUpdated':
          this.sortBy = 'updated';
          break;
      }
    }
    this.refresh();

    // this.name
  }

  getPageSize() {
    this.subscriptionSvc
      .getSubscriptionCount(this.searchFilterStr, this.showArchived)
      .subscribe(
        (success) => {
          this.subscriptionCount = parseInt(success as any);
        },
        (failure) => {
          console.log('Failed ot get subscription count');
        }
      );
  }

  refresh() {
    this.loading = true;
    this.subscriptionSvc
      .getSubscriptions(
        this.page,
        this.subsPerPage,
        this.sortBy,
        this.sortOrder,
        this.searchFilterStr,
        this.showArchived
      )
      .subscribe((subscriptions: SubscriptionModel[]) => {
        this.customerSvc
          .getCustomers()
          .subscribe((customers: CustomerModel[]) => {
            this.loading = false;
            const customerSubscriptions: ICustomerSubscription[] = [];
            subscriptions.map((s: SubscriptionModel) => {
              const cc = customers.find((o) => o._id === s.customer_id);
              const customerSubscription: ICustomerSubscription = {
                customer: cc,
                subscription: s,
                name: s.name,
                status: s.status,
                primaryContact:
                  s.primary_contact.first_name +
                  ' ' +
                  s.primary_contact.last_name,
                customerName: cc.name,
                startDate: s.start_date,
                numberOfTargets: s.target_email_list.length,
                lastUpdated: s.updated,
              };
              customerSubscriptions.push(customerSubscription);
            });
            if (this.sortOrder == 'desc') {
              var orderedData = customerSubscriptions.reverse();
            } else {
              var orderedData = customerSubscriptions;
            }
            this.dataSource.data = orderedData as ICustomerSubscription[];
            this.dataSource.sort = this.sort;
          });
      });
  }

  paginationChange(event) {
    this.page = event.pageIndex;
    this.subsPerPage = event.pageSize;
    this.refresh();
    console.log(event);
  }

  private setFilterPredicate() {
    this.dataSource.filterPredicate = (
      data: ICustomerSubscription,
      filter: string
    ) => {
      const words = filter.split(' ');
      const searchData = `${data.subscription.name.toLowerCase()} ${data.subscription.status.toLowerCase()} ${data.customer.name.toLowerCase()} ${data.subscription.primary_contact.first_name.toLowerCase()} ${data.subscription.primary_contact.last_name.toLowerCase()}`;
      for (const word of words) {
        if (word === null || word === '' || word === ' ') {
          continue;
        }
        const isMatch = searchData.indexOf(word.trim().toLowerCase()) > -1;
        if (!isMatch) {
          return false;
        }
      }
      return true;
    };
  }

  public getNumberOfTargets(target_list: []) {
    if (!target_list) {
      return 0;
    }

    return target_list.length;
  }

  public searchFilter(searchValue: string): void {
    this.searchFilterStr = searchValue;
    this.page = 0;
    this.refresh();
    this.getPageSize();
    // this.dataSource.filter = searchValue.trim().toLowerCase();
  }

  public onArchiveToggle(): void {
    this.getPageSize();
    this.refresh();
  }

  public editSubscription(row) {
    this.router.navigate(['/view-subscription', row.subscription._id]);
  }
  public createSubscription() {
    this.router.navigate(['/create-subscription']);
  }
}
