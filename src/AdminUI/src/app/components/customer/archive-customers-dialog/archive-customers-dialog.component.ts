import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomerModel } from 'src/app/models/customer.model';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-archive-customer-dialog',
  templateUrl: './archive-customers-dialog.component.html',
  styleUrls: ['./archive-customers-dialog.component.scss'],
  host: { class: 'd-flex flex-column flex-11a' },
})
export class ArchiveCustomersDialogComponent implements OnInit {
  customers: CustomerModel[];
  customer: CustomerModel;
  archivedDescription: string;
  canArchive: boolean;
  hasActiveSubs = false;

  subscriptions = new MatTableDataSource<SubscriptionModel>();

  constructor(
    public dialogRef: MatDialogRef<ArchiveCustomersDialogComponent>,
    public customerSvc: CustomerService,
    public subscriptionSvc: SubscriptionService,
    @Inject(MAT_DIALOG_DATA) data: CustomerModel[]
  ) {
    this.customers = data;
  }

  ngOnInit(): void {}

  updateReason(): void {
    if (this.archivedDescription !== '' && this.archivedDescription != null) {
      this.canArchive = true;
    } else {
      this.canArchive = false;
    }
  }

  archive(): void {
    for (let [i, customer] of this.customers.entries()) {
      this.hasActiveSubs = false;
      this.customerSvc
        .getCustomer(customer._id)
        .subscribe((data: CustomerModel) => {
          if (data._id != null) {
            this.customer = data as CustomerModel;
            this.subscriptionSvc
              .getSubscriptionsByCustomer(this.customer)
              .subscribe((subscriptionData: SubscriptionModel[]) => {
                this.subscriptions.data = subscriptionData;
                this.subscriptions.data.forEach((subscription) => {
                  if (
                    subscription.status == 'running' ||
                    subscription.status == 'queued'
                  ) {
                    this.hasActiveSubs = true;
                  }
                });
                if (!this.hasActiveSubs) {
                  customer.archived = true;
                  customer.archived_description = this.archivedDescription;
                  if (i === this.customers.length - 1) {
                    this.customerSvc.updateCustomer(customer).then(
                      () => {
                        this.dialogRef.close({
                          archived: true,
                          description: this.archivedDescription,
                        });
                      },
                      (error) => {
                        this.dialogRef.close({ error: error.error });
                      }
                    );
                  } else {
                    this.customerSvc.updateCustomer(customer);
                  }
                } else {
                  this.hasActiveSubs = false;
                }
              });
          }
        });
    }
  }

  cancel(): void {
    this.dialogRef.close({ archived: false });
  }

  onNoClick(): void {
    this.dialogRef.close({ archived: false });
  }
}
