import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { Subscription } from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { Customer } from 'src/app/models/customer.model';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { AppSettings } from 'src/app/AppSettings';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { MatSort } from '@angular/material/sort';
import { constants } from 'buffer';

interface ICustomerSubscription {
  customer: Customer;
  subscription: Subscription;

  // top-level primitives for column sortings
  name: string;
  status: string;
  primaryContact: string;
  customerName: string;
  startDate: Date;
  lastUpdated: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  public dataSource: MatTableDataSource<ICustomerSubscription>;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = [
    'name',
    'status',
    'primaryContact',
    'customerName',
    'startDate',
    'lastUpdated',
    'select'
  ];


  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  showArchived = false;

  dateFormat = AppSettings.DATE_FORMAT;
  spinnerMap = new Map<string, boolean>();

  loading = false;

  continuousSubscription = true;

  constructor(
    private subscriptionSvc: SubscriptionService,
    private customerSvc: CustomerService,
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    private router: Router,
  ) {
    layoutSvc.setTitle('Subscriptions');
  }

  ngOnInit(): void {
    this.layoutSvc.setTitle('Subscriptions');
    this.dataSource = new MatTableDataSource();
    this.refresh();
    this.setFilterPredicate();
  }

  refresh() {
    this.loading = true;
    this.subscriptionSvc
      .getSubscriptions(this.showArchived)
      .subscribe((subscriptions: Subscription[]) => {
        this.customerSvc.getCustomers().subscribe((customers: Customer[]) => {
            this.loading = false;
            const customerSubscriptions: ICustomerSubscription[] = [];
            subscriptions.map((s: Subscription) => {
            const cc = customers.find(o => o.customer_uuid === s.customer_uuid);
              const customerSubscription: ICustomerSubscription = {
              customer: cc,
                subscription: s,
              name: s.name,
              status: s.status,
              primaryContact: s.primary_contact.first_name + ' ' + s.primary_contact.last_name,
              customerName: cc.name,
              startDate: s.start_date,
              lastUpdated: s.lub_timestamp,
              };
              customerSubscriptions.push(customerSubscription);
            });
          console.log(customerSubscriptions);
          this.dataSource.data = customerSubscriptions as ICustomerSubscription[];
          this.dataSource.sort = this.sort;
          });
      });
  }

  private setFilterPredicate() {
    this.dataSource.filterPredicate = (
      data: ICustomerSubscription,
      filter: string
    ) => {
      const words = filter.split(' ');
      const searchData = `${data.subscription.name.toLowerCase()} ${data.subscription.status.toLowerCase()} ${data.customer.name.toLowerCase()} ${data.subscription.primary_contact.first_name.toLowerCase()} ${data.subscription.primary_contact.last_name.toLowerCase()}`;
      for (var i = 0; i < words.length; i++) {
        if (words[i] === null || words[i] === '' || words[i] === ' ') {
          continue;
        }
        const isMatch = searchData.indexOf(words[i].trim().toLowerCase()) > -1;

        if (!isMatch) {
          return false;
        }
      }
      return true;
    };
  }

  public searchFilter(searchValue: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public onArchiveToggle(): void {
    this.refresh();
  }

  public stopSubscription(row: any) {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, { disableClose: false });
    this.dialogRefConfirm.componentInstance.confirmMessage =
      `This will stop subscription '${row.subscription.name}'.  Do you want to continue?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Stop';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.subscriptionSvc.stopSubscription(row.subscription.subscription_uuid).subscribe((data: any) => {
            this.refresh();
          });
      }
      this.dialogRefConfirm = null;
    });
  }


  public startSubscription(row: any) {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, { disableClose: false });
    this.dialogRefConfirm.componentInstance.confirmMessage =
      `This will start subscription '${row.subscription.name}'. Do you want to continue? Note: This will Enable Continuous Subscription cycles.`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Start';


    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.setSpinner(row.subscription.subscription_uuid, true);
        this.subscriptionSvc.startSubscription(row.subscription.subscription_uuid, this.continuousSubscription).subscribe((data: any) => {
            this.setSpinner(row.subscription.subscription_uuid, false);
            this.refresh();
          });
      }

      this.dialogRefConfirm = null;
    });
  }

  public setSpinner(uuid: string, show: boolean) {
    this.spinnerMap.set(uuid, show);
  }


  public checkSpinner(uuid: string) {
    return this.spinnerMap.get(uuid);
  }

  public checkStopped(status: string) {
    return status.toUpperCase() === 'STOPPED';
  }
  public editSubscription(row) {
    this.router.navigate(['/view-subscription', row.subscription.subscription_uuid]);
  }
  public createSubscription() {
    this.router.navigate(['/create-subscription']);
  }

}
