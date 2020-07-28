import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { NewCustomer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-add-customer-dialog',
  templateUrl: './add-customer-dialog.component.html',
  styleUrls: ['./add-customer-dialog.component.scss']
})
export class AddCustomerDialogComponent implements OnInit {
  form_group = new FormGroup({
    name: new FormControl(),
    identifier: new FormControl(),
    address_1: new FormControl(),
    address_2: new FormControl(),
    city: new FormControl(),
    state: new FormControl(),
    zip_code: new FormControl()
  });
  constructor(
    public dialog_ref: MatDialogRef<AddCustomerDialogComponent>,
    public customer_service: CustomerService
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialog_ref.close();
  }

  onCancelClick(): void {
    this.dialog_ref.close();
  }

  onSaveClick(): void {
    let customer: NewCustomer = {
      name: this.form_group.controls['name'].value,
      identifier: this.form_group.controls['identifier'].value,
      customer_type: this.form_group.controls['customer_type'].value,
      address_1: this.form_group.controls['address_1'].value,
      address_2: this.form_group.controls['address_2'].value,
      city: this.form_group.controls['city'].value,
      state: this.form_group.controls['state'].value,
      zip_code: this.form_group.controls['zip_code'].value,
      contact_list: []
    };

    this.customer_service.addCustomer(customer).subscribe();

    this.dialog_ref.close();
  }
}
