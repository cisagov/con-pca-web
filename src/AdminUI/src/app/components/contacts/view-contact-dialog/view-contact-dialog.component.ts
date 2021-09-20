import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import {
  ICustomerContact,
  CustomerModel,
  ContactModel,
} from 'src/app/models/customer.model';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { AlertComponent } from '../../dialogs/alert/alert.component';

@Component({
  selector: 'app-view-contact-dialog',
  templateUrl: './view-contact-dialog.component.html',
  styleUrls: ['../contacts.component.scss'],
})
export class ViewContactDialogComponent implements OnInit {
  form_group = new FormGroup({
    first_name: new FormControl(),
    last_name: new FormControl(),
    title: new FormControl(),
    office_phone: new FormControl(),
    mobile_phone: new FormControl(),
    primary_contact: new FormControl(),
    phone: new FormControl(),
    email: new FormControl(),
    notes: new FormControl(),
    active: new FormControl(),
  });
  contactSubs: SubscriptionModel[];
  customer: CustomerModel;
  subscription: SubscriptionModel;
  initial: ICustomerContact;
  data: ICustomerContact;

  constructor(
    public dialog_ref: MatDialogRef<ViewContactDialogComponent>,
    public customer_service: CustomerService,
    private subscription_service: SubscriptionService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.data = data;
    this.initial = Object.assign({}, data);
  }

  ngOnInit(): void {
    this.customer_service
      .getCustomer(this.data.customer_uuid)
      .subscribe((data: any) => {
        this.customer = data as CustomerModel;
      });
  }

  onSaveExitClick(): void {
    const index = this.getContactIndex();
    const old_contact = this.customer.contact_list[index];
    this.removeContact();
    const updated_contact = {
      first_name: this.data.first_name,
      last_name: this.data.last_name,
      title: this.data.title,
      office_phone: this.data.office_phone,
      mobile_phone: this.data.mobile_phone,
      email: this.data.email,
      notes: this.data.notes,
      active: this.data.active,
    };
    this.customer.contact_list.push(updated_contact);
    this.updateSubsContact(old_contact, updated_contact);

    this.saveContacts();
    this.dialog_ref.close();
  }

  onDeleteClick(): void {
    // check if there are any sub with contact as primary, if so, dont delete
    const index = this.getContactIndex();

    this.subscription_service
      .getPrimaryContactSubscriptions(
        this.customer.customer_uuid,
        this.customer.contact_list[index]
      )
      .subscribe((subscriptions: any[]) => {
        this.contactSubs = subscriptions as SubscriptionModel[];
        if (this.contactSubs.length > 0) {
          // this contact had subs, dont delete
          const invalid = [];
          for (const sub in this.contactSubs) {
            invalid.push(this.contactSubs[sub].name + ' update');
          }
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Cannot Delete Contact',
              messageText:
                'This Contact is currently the primary contact for the following subscriptions. Please update the subscriptions to a new contact before deletion.',
              invalidData: invalid,
            },
          });
        } else {
          // free and clear, delete away
          this.removeContact();
          this.saveContacts();
        }
      });
    this.dialog_ref.close();
  }

  removeContact(): void {
    const index = this.getContactIndex();

    if (index > -1) {
      this.customer.contact_list.splice(index, 1);
    }
  }

  updateSubsContact(
    old_contact: ContactModel,
    updated_contact: ContactModel
  ): void {
    // Get all subs of the contact then update
    this.subscription_service
      .getPrimaryContactSubscriptions(this.customer.customer_uuid, old_contact)
      .subscribe((subscriptions: SubscriptionModel[]) => {
        this.contactSubs = subscriptions as SubscriptionModel[];
        if (this.contactSubs.length > 0) {
          // Check if there are any subs with contact, if so, remove them from the sub.
          for (let index in this.contactSubs) {
            let contsub: SubscriptionModel = this.contactSubs[index];
            this.subscription_service
              .changePrimaryContact(contsub.subscription_uuid, updated_contact)
              .subscribe();
          }
        }
      });
  }

  onCancelExitClick(): void {
    this.dialog_ref.close();
  }

  saveContacts(): void {
    this.customer_service
      .setContacts(this.customer.customer_uuid, this.customer.contact_list)
      .subscribe();
  }

  getContactIndex(): number {
    for (var i = 0; i < this.customer.contact_list.length; i++) {
      var contact: ContactModel = this.customer.contact_list[i];
      if (
        contact.first_name == this.initial.first_name &&
        contact.last_name == this.initial.last_name &&
        contact.email == this.initial.email &&
        contact.notes == this.initial.notes &&
        contact.title == this.initial.title
      ) {
        return i;
      }
    }
  }
}
