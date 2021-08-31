import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { NewCustomerModel } from 'src/app/models/customer.model';

@Component({
  selector: 'app-add-customer-dialog',
  templateUrl: './add-customer-dialog.component.html',
  styleUrls: ['./add-customer-dialog.component.scss'],
})
export class AddCustomerDialogComponent implements OnInit {
  formGroup = new FormGroup({
    name: new FormControl(),
    identifier: new FormControl(),
    address_1: new FormControl(),
    address_2: new FormControl(),
    city: new FormControl(),
    state: new FormControl(),
    zip_code: new FormControl(),
  });
  constructor(
    public dialogRef: MatDialogRef<AddCustomerDialogComponent>,
    public customerService: CustomerService
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    const customer: NewCustomerModel = {
      name: this.formGroup.controls.name.value,
      identifier: this.formGroup.controls.identifier.value,
      customer_type: this.formGroup.controls.customer_type.value,
      address_1: this.formGroup.controls.address_1.value,
      address_2: this.formGroup.controls.address_2.value,
      city: this.formGroup.controls.city.value,
      state: this.formGroup.controls.state.value,
      zip_code: this.formGroup.controls.zip_code.value,
      contact_list: [],
    };

    this.customerService.addCustomer(customer).subscribe();

    this.dialogRef.close();
  }
}
