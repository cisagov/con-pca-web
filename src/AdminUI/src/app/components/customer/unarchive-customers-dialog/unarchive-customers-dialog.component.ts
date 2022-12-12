import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomerModel } from 'src/app/models/customer.model';

@Component({
  selector: 'app-unarchive-customer-dialog',
  templateUrl: './unarchive-customers-dialog.component.html',
  styleUrls: ['./unarchive-customers-dialog.component.scss'],
  host: { class: 'd-flex flex-column flex-11a' },
})
export class UnarchiveCustomersDialogComponent implements OnInit {
  customers: CustomerModel[];
  canArchive: boolean;

  constructor(
    public dialogRef: MatDialogRef<UnarchiveCustomersDialogComponent>,
    public customerSvc: CustomerService,
    @Inject(MAT_DIALOG_DATA) data: CustomerModel[],
  ) {
    this.customers = data;
  }

  ngOnInit(): void {}

  unarchive(): void {
    for (let customer of this.customers) {
      customer.archived = false;
      this.customerSvc.updateCustomer(customer).then(
        () => {
          this.dialogRef.close({
            archived: false,
          });
        },
        (error) => {
          this.dialogRef.close({ error: error.error });
        },
      );
    }
  }

  cancel(): void {
    this.dialogRef.close({ archived: false });
  }

  onNoClick(): void {
    this.dialogRef.close({ archived: false });
  }
}
