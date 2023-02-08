import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
})
export class CustomerDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CustomerDialogComponent>,
    public customerSvc: CustomerService,
  ) {}

  ngOnInit(): void {
    this.customerSvc.setIsSubPage(true);
  }

  /**
   *
   */
  onCancelClick() {
    this.customerSvc.setIsSubPage(false);
    this.dialogRef.close();
  }

  onClose() {}
}
