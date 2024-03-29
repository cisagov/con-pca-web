import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { ContactModel, CustomerModel } from 'src/app/models/customer.model';

interface ICustomer {
  customer_id: string;
  customer_name: string;
  contact_list: ContactModel[];
}

@Component({
  selector: 'app-add-contact-dialog',
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['../contacts.component.scss'],
})
export class AddContactDialogComponent implements OnInit {
  form_group = new FormGroup({
    customer_id: new FormControl(),
    first_name: new FormControl(),
    last_name: new FormControl(),
    title: new FormControl(),
    office_phone: new FormControl(),
    mobile_phone: new FormControl(),
    email: new FormControl(),
    notes: new FormControl(),
  });
  customers: CustomerModel[];

  constructor(
    public dialog_ref: MatDialogRef<AddContactDialogComponent>,
    public customer_service: CustomerService,
  ) {}

  ngOnInit(): void {
    this.customer_service.getCustomers().subscribe((data: any[]) => {
      this.customers = data as CustomerModel[];
    });
  }

  onNoClick(): void {
    this.dialog_ref.close();
  }

  onCancelClick(): void {
    this.dialog_ref.close();
  }

  onSaveClick(): void {
    let id = this.getIdFromForm();
    let contact = this.getContactFromForm();
    let contacts = this.getContactsFromId(id);
    contacts.push(contact);
    this.customer_service.setContacts(id, contacts).subscribe();
    this.dialog_ref.close();
  }

  getIdFromForm(): string {
    return this.form_group.controls['customer_id'].value;
  }

  getContactFromForm(): ContactModel {
    let contact: ContactModel = {
      first_name: this.form_group.controls['first_name'].value,
      last_name: this.form_group.controls['last_name'].value,
      title: this.form_group.controls['title'].value,
      office_phone: this.form_group.controls['office_phone'].value,
      mobile_phone: this.form_group.controls['mobile_phone'].value,
      email: this.form_group.controls['email'].value,
      notes: this.form_group.controls['notes'].value,
      active: true,
    };
    return contact;
  }

  getContactsFromId(id: string) {
    let contacts: ContactModel[] = [];
    this.customers.map((customer: CustomerModel) => {
      if (customer._id == id) {
        contacts = customer.contact_list;
      }
    });
    return contacts;
  }
}
