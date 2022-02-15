import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MyErrorStateMatcher } from '../../../helper/ErrorStateMatcher';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ContactModel, CustomerModel } from 'src/app/models/customer.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../../dialogs/alert/alert.component';
import { ConfirmComponent } from '../../dialogs/confirm/confirm.component';
import { SubscriptionModel } from 'src/app/models/subscription.model';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCustomerComponent implements OnInit, OnDestroy {
  @Input() inDialog: boolean;

  model: any;
  addContact = false;
  contactDataSource: any = [];
  displayedColumns: string[] = [
    'name',
    'title',
    'email',
    'mobile_phone',
    'office_phone',
    'action',
  ];
  contactError = '';
  orgError = '';
  contacts = new MatTableDataSource<ContactModel>();
  isEdit = false;
  tempEditContact: ContactModel = null;

  matchCustomerName = new MyErrorStateMatcher();
  matchCustomerIdentifier = new MyErrorStateMatcher();
  matchAddress1 = new MyErrorStateMatcher();
  matchCity = new MyErrorStateMatcher();
  matchState = new MyErrorStateMatcher();
  matchZip = new MyErrorStateMatcher();
  matchCustomerType = new MyErrorStateMatcher();

  matchFirstName = new MyErrorStateMatcher();
  matchLastName = new MyErrorStateMatcher();
  matchEmail = new MyErrorStateMatcher();

  customerFormGroup = new FormGroup({
    customerName: new FormControl('', [Validators.required]),
    customerIdentifier: new FormControl('', [Validators.required]),
    address1: new FormControl('', [Validators.required]),
    address2: new FormControl(''),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    zip: new FormControl('', [Validators.required]),
    sector: new FormControl(null),
    industry: new FormControl(null),
    customerType: new FormControl('', [Validators.required]),
    domain: new FormControl('', [Validators.required]),
  });

  contactFormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    title: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    office_phone: new FormControl(''),
    mobile_phone: new FormControl(''),
    contactNotes: new FormControl(''),
  });

  // List of angular subscriptions, unsubscribed to on delete
  angularSubscriptions = Array<Subscription>();
  // Customer_id if not new
  customer_id: string;
  customer: CustomerModel;
  subscriptions = new MatTableDataSource<SubscriptionModel>();
  hasSubs = true;

  sectorList;
  industryList;

  constructor(
    public subscriptionSvc: SubscriptionService,
    public customerSvc: CustomerService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public router: Router,
    public layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('New Customer');
  }

  ngOnInit(): void {
    if (this.dialog.openDialogs.length > 0) {
      this.inDialog = true;
    } else {
      this.inDialog = false;
    }

    this.customerFormGroup
      .get('customerType')
      .valueChanges.subscribe((value) => {
        if (value === 'Private') {
          this.customerFormGroup.controls['sector'].setValidators(
            Validators.required
          );
        } else {
          this.customerFormGroup.controls['sector'].clearValidators();
          this.customerFormGroup.controls['industry'].clearValidators();
          this.customerFormGroup.controls['sector'].reset();
          this.customerFormGroup.controls['industry'].reset();
        }
      });

    this.angularSubscriptions.push(
      this.route.params.subscribe((params) => {
        this.customer_id = params['customerId'];
        if (this.customer_id !== undefined) {
          this.layoutSvc.setTitle('Edit Customer');
          this.getCustomer();
        } else {
          this.getSectorList();
          // Use preset empty form
          // this.hasSubs = true;
        }
      })
    );
  }

  getCustomer() {
    this.customerSvc.getCustomer(this.customer_id).subscribe(
      (data: CustomerModel) => {
        if (data._id != null) {
          this.customer = data as CustomerModel;
          this.setCustomerForm(this.customer);
          this.setContacts(this.customer.contact_list as ContactModel[]);
          this.getSectorList();
          this.subscriptionSvc
            .getSubscriptionsByCustomer(this.customer)
            .subscribe((subscriptionData: SubscriptionModel[]) => {
              this.subscriptions.data = subscriptionData;
              if (this.subscriptions.data.length < 1) {
                this.hasSubs = false;
              } else {
                this.hasSubs = true;
              }
            });
        } else {
          this.orgError = 'Specified customer ID not found';
        }
      },
      (error) => {
        this.orgError = 'Failed To load customer';
      }
    );
  }

  getSectorList() {
    this.customerSvc.getSectorList().subscribe(
      (data: any) => {
        if (data) {
          this.sectorList = data;
          this.setIndustryList();
        } else {
          this.orgError = 'Error retreiving sector/industry list';
        }
      },
      (error) => {
        this.orgError = 'Error retreiving sector/industry list';
      }
    );
  }

  setCustomerForm(customer: CustomerModel) {
    this.customerFormGroup.patchValue({
      customerName: customer.name,
      customerIdentifier: customer.identifier,
      customerType: customer.customer_type,
      address1: customer.address_1,
      address2: customer.address_2,
      city: customer.city,
      state: customer.state,
      zip: customer.zip_code,
      sector: customer.sector,
      industry: customer.industry,
      domain: customer.domain,
    });
  }

  setContacts(contactsList: ContactModel[]) {
    var newContacts = Array<ContactModel>();
    contactsList.forEach((contact) => {
      var contactToAdd: ContactModel = {
        office_phone: contact.office_phone,
        mobile_phone: contact.mobile_phone,
        email: contact.email,
        first_name: contact.first_name,
        last_name: contact.last_name,
        title: contact.title,
        notes: contact.notes,
        active: true,
      };
      newContacts.push(contactToAdd);
      // this.contacts.data.push(contactToAdd)
    });
    this.contacts.data = newContacts;
  }

  isExistingCustomer(): boolean {
    if (this.customer_id) {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.angularSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  createNew() {
    this.clearCustomer();
  }

  checkCustomerType() {
    let customerType = this.customerFormGroup.controls['customerType'].value;
    if (customerType === 'Private') {
      return true;
    }

    return false;
  }

  pushCustomer() {
    if (this.customerFormGroup.valid && this.contacts.data.length > 0) {
      let sector = '';
      let industry = '';
      if (this.checkCustomerType()) {
        sector = this.customerFormGroup.controls['sector'].value;
        industry = this.customerFormGroup.controls['industry'].value;
      }
      const customer: CustomerModel = {
        _id: '',
        name: this.customerFormGroup.controls['customerName'].value,
        identifier: this.customerFormGroup.controls['customerIdentifier'].value,
        address_1: this.customerFormGroup.controls['address1'].value,
        address_2: this.customerFormGroup.controls['address2'].value,
        city: this.customerFormGroup.controls['city'].value,
        state: this.customerFormGroup.controls['state'].value,
        zip_code: this.customerFormGroup.controls['zip'].value,
        sector: sector,
        industry: industry,
        customer_type: this.customerFormGroup.controls['customerType'].value,
        contact_list: this.contacts.data,
        domain: this.customerFormGroup.controls['domain'].value,
      };

      if (this.customer_id != null) {
        // If editing existing customer
        customer._id = this.customer_id;
        this.angularSubscriptions.push(
          this.customerSvc.patchCustomer(customer).subscribe(
            (data: any) => {
              this.router.navigate(['/customers']);
            },
            (error: any) => {
              this.dialog.open(AlertComponent, {
                data: {
                  title: 'Customer Error',
                  messageText: `Error: ${error.error.error}`,
                },
              });
            }
          )
        );
      } else {
        // else creating a new customer
        this.customerSvc.addCustomer(customer).subscribe(
          (data: any) => {
            // if this customer was added inside a dialog, then we are in the
            // middle of a subscription -- selected the customer
            if (this.inDialog) {
              this.customerSvc.selectedCustomer = data._id;
            } else {
              this.cancelCustomer();
            }
            this.dialog.closeAll();
          },
          (error) => {
            console.log(error.error.error);
            this.orgError = error.error.error;
            this.dialog.open(AlertComponent, {
              // Parse error here
              data: {
                title: 'Customer Error',
                messageText: `Error: ${error.error.error}`,
              },
            });
          }
        );
      }
    } else if (!this.customerFormGroup.valid) {
      this.orgError = 'Fix required fields';
    } else if (this.contacts.data.length < 1) {
      this.orgError = 'Please add at least one contact';
    }
  }

  pushContact() {
    if (this.contactFormGroup.valid) {
      let isNotDuplicateEmail = true;
      let duplicateEmailName = '';
      //Check for existing contact with the same email
      this.contacts.data.forEach((element) => {
        if (
          element.email.toLocaleLowerCase() ==
          String(
            this.contactFormGroup.controls['email'].value
          ).toLocaleLowerCase()
        ) {
          isNotDuplicateEmail = false;
          duplicateEmailName = element.first_name + ' ' + element.last_name;
        }
      });
      if (this.isEdit) {
        this.removeContact(this.tempEditContact);
        this.tempEditContact = null;
        this.isEdit = false;
        isNotDuplicateEmail = true;
      }
      if (isNotDuplicateEmail) {
        const contact: ContactModel = {
          office_phone: this.contactFormGroup.controls['office_phone'].value,
          mobile_phone: this.contactFormGroup.controls['mobile_phone'].value,
          email: this.contactFormGroup.controls['email'].value,
          first_name: this.contactFormGroup.controls['firstName'].value,
          last_name: this.contactFormGroup.controls['lastName'].value,
          title: this.contactFormGroup.controls['title'].value,
          notes: this.contactFormGroup.controls['contactNotes'].value,
          active: true,
        };
        const previousContacts = this.contacts.data;

        previousContacts.push(contact);
        this.contacts.data = previousContacts;
        this.clearContact();
      } else {
        this.contactError =
          'A contact with this email already exists : ' + duplicateEmailName;
      }
    } else {
      this.contactError = 'Fix required fields.';
    }
  }

  editContact(contact: ContactModel) {
    this.isEdit = true;
    this.tempEditContact = contact;
    this.contactFormGroup.controls['office_phone'].setValue(
      contact.office_phone
    );
    this.contactFormGroup.controls['mobile_phone'].setValue(
      contact.mobile_phone
    );
    this.contactFormGroup.controls['email'].setValue(contact.email);
    this.contactFormGroup.controls['firstName'].setValue(contact.first_name);
    this.contactFormGroup.controls['lastName'].setValue(contact.last_name);
    this.contactFormGroup.controls['title'].setValue(contact.title);
    this.contactFormGroup.controls['contactNotes'].setValue(contact.notes);
    this.showAddContact(true);
  }

  removeContact(contact: ContactModel) {
    const index = this.contacts.data.findIndex((d) => d === contact);
    this.contacts.data.splice(index, 1);
    const tempContact = this.contacts;
    this.contacts = new MatTableDataSource<ContactModel>(tempContact.data);
  }

  clearCustomer() {
    this.customerFormGroup.reset();
    this.contacts = new MatTableDataSource<ContactModel>();
    this.orgError = '';
  }

  cancelCustomer() {
    if (this.customer_id) {
      this.router.navigate(['/customers']);
    } else {
      this.clearCustomer();
      this.customerSvc.setCustomerInfo(false);
    }
  }

  clearContact() {
    this.contactFormGroup.reset();
    this.contactError = '';
    this.contactFormGroup.markAsUntouched();
  }

  showAddContact(fromEdit) {
    if (fromEdit) {
      this.addContact = true;
    } else {
      this.addContact = this.addContact ? false : true;
      if (!this.addContact) {
        this.isEdit = false;
      }
      if (!this.addContact) {
        this.clearContact();
      }
    }
  }

  checkDataSourceLength() {
    return this.contacts.data.length > 0;
  }

  sectorChange(event) {
    this.setIndustryList();
    this.customerFormGroup.patchValue({
      industry: null,
    });
  }

  setIndustryList() {
    if (this.sectorSelected()) {
      const sector = this.sectorList.filter(
        (x) => x.name === this.customerFormGroup.controls['sector'].value
      );
      this.industryList = sector[0]?.industries;
    }
  }

  sectorSelected() {
    if (this.customerFormGroup.controls['sector'].value != null) {
      return true;
    }
    return false;
  }

  customerValid() {
    return this.customerFormGroup.valid && this.contacts.data.length > 0;
  }

  deleteCustomer() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to delete ${this.customer.name}?`;
    dialogRef.componentInstance.title = 'Confirm Delete';

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.customerSvc.deleteCustomer(this.customer).subscribe(
          (success) => {
            this.dialog.open(AlertComponent, {
              data: {
                title: 'Customer Deleted',
                messageText: 'Your Customer Was Deleted',
              },
            });
            this.router.navigate(['/customers']);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }
}
