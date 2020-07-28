import { Component, OnInit, ViewChild } from '@angular/core';
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

interface ICustomerSubscription {
  customer: Customer;
  subscription: Subscription;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  public data_source: MatTableDataSource<ICustomerSubscription>;

  displayed_columns = [
    'name',
    'status',
    'primary_contact',
    'customer',
    'start_date',
    'last_updated',
    'select'
  ];
  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  showArchived: boolean = false;

  dateFormat = AppSettings.DATE_FORMAT;
  spinnerMap = new Map<string, boolean>();

  loading = false;


  constructor(
    private subscription_service: SubscriptionService,
    private customer_service: CustomerService,
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    private router: Router,
  ) {
    layoutSvc.setTitle('Subscriptions');
  }

  ngOnInit(): void {
    this.layoutSvc.setTitle('Subscriptions');
    this.data_source = new MatTableDataSource();
    this.refresh();
    this.setFilterPredicate();
  }

  refresh() {
    this.loading = true;
    this.subscription_service
      .getSubscriptions(this.showArchived)
      .subscribe((subscriptions: Subscription[]) => {
        this.customer_service.getCustomers().subscribe((customers: Customer[]) => {
          this.loading = false;
          const customerSubscriptions: ICustomerSubscription[] = [];
          subscriptions.map((s: Subscription) => {
            const customerSubscription: ICustomerSubscription = {
              customer: customers.find(o => o.customer_uuid === s.customer_uuid),
              subscription: s
            };
            customerSubscriptions.push(customerSubscription);
          });
          this.data_source.data = customerSubscriptions;
        });
      });
  }

  private setFilterPredicate() {
    this.data_source.filterPredicate = (
      data: ICustomerSubscription,
      filter: string
    ) => {
      var words = filter.split(' ');
      let searchData = `${data.subscription.name.toLowerCase()} ${data.subscription.status.toLowerCase()} ${data.customer.name.toLowerCase()} ${data.subscription.primary_contact.first_name.toLowerCase()} ${data.subscription.primary_contact.last_name.toLowerCase()}`;
      for (var i = 0; i < words.length; i++) {
        if (words[i] == null || words[i] == '' || words[i] == ' ') {
          continue;
        }
        var isMatch = searchData.indexOf(words[i].trim().toLowerCase()) > -1;

        if (!isMatch) {
          return false;
        }
      }
      return true;
    };
  }

  public searchFilter(searchValue: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data_source.filter = filterValue.trim().toLowerCase();
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
        this.subscription_service.stopSubscription(row.subscription.subscription_uuid).subscribe((data: any) => {
          this.refresh();
        });
      }
      this.dialogRefConfirm = null;
    });
  }


  public startSubscription(row: any) {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, { disableClose: false });
    this.dialogRefConfirm.componentInstance.confirmMessage =
      `This will start subscription '${row.subscription.name}'.  Do you want to continue?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Start';


    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.setSpinner(row.subscription.subscription_uuid, true);
        this.subscription_service.startSubscription(row.subscription.subscription_uuid).subscribe((data: any) => {
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
  
}
