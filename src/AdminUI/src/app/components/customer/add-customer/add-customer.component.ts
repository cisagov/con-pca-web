import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MyErrorStateMatcher } from '../../../helper/ErrorStateMatcher';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ContactModel, CustomerModel } from 'src/app/models/customer.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../../dialogs/alert/alert.component';
import { AlertsService } from 'src/app/services/alerts.service';
import { ConfirmComponent } from '../../dialogs/confirm/confirm.component';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { CanComponentDeactivate } from 'src/app/guards/unsaved-changes.guard';
import { UnsavedComponent } from '../../dialogs/unsaved/unsaved.component';
import { ArchiveCustomersDialogComponent } from '../archive-customers-dialog/archive-customers-dialog.component';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCustomerComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  @Input() inDialog: boolean;

  model: any;
  dialogRefArchive: MatDialogRef<ArchiveCustomersDialogComponent>;
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

  startAt = new Date();

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
    appendixADate: new FormControl(new Date(), [Validators.required]),
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

  // List of US states
  states: Array<object> = [
    { name: 'AL - Alabama', value: 'AL' },
    { name: 'AK - Alaska', value: 'AK' },
    { name: 'AS - American Samoa', value: 'AS' },
    { name: 'AZ - Arizona', value: 'AZ' },
    { name: 'AR - Arkansas', value: 'AR' },
    { name: 'CA - California', value: 'CA' },
    { name: 'CO - Colorado', value: 'CO' },
    { name: 'CT - Connecticut', value: 'CT' },
    { name: 'DE - Delaware', value: '' },
    { name: 'DC - District of Columbia', value: 'DC' },
    { name: 'FL - Florida', value: 'FL' },
    { name: 'GA - Georgia', value: 'GA' },
    { name: 'GU - Guam', value: 'GU' },
    { name: 'HI - Hawaii', value: 'HI' },
    { name: 'ID - Idaho', value: 'ID' },
    { name: 'IL - Illinois', value: 'IL' },
    { name: 'IN - Indiana', value: 'IN' },
    { name: 'IA - Iowa', value: 'IA' },
    { name: 'KS - Kansas', value: 'KS' },
    { name: 'KY - Kentucky', value: 'KY' },
    { name: 'LA - Louisiana', value: 'LA' },
    { name: 'ME - Maine', value: 'ME' },
    { name: 'MD - Maryland', value: 'MD' },
    { name: 'MA - Massachusetts', value: 'MA' },
    { name: 'MI - Michigan', value: 'MI' },
    { name: 'MN - Minnesota', value: 'MN' },
    { name: 'MS - Mississippi', value: 'MS' },
    { name: 'MO - Missouri', value: 'MO' },
    { name: 'MT - Montana', value: 'MT' },
    { name: 'NE - Nebraska', value: '' },
    { name: 'NV - Nevada', value: '' },
    { name: 'NH - New Hampshire', value: 'NH' },
    { name: 'NJ - New Jersey', value: 'NJ' },
    { name: 'NM - New Mexico', value: 'NM' },
    { name: 'NY - New York', value: 'NY' },
    { name: 'NC - North Carolina', value: 'NC' },
    { name: 'ND - North Dakota', value: 'ND' },
    { name: 'OH - Ohio', value: 'OH' },
    { name: 'OK - Oklahoma', value: 'OK' },
    { name: 'OR - Oregon', value: 'OR' },
    { name: 'PA - Pennsylvania', value: 'PA' },
    { name: 'PR - Puerto Rico', value: 'PR' },
    { name: 'RI - Rhode Island', value: 'RI' },
    { name: 'SC - South Carolina', value: 'SC' },
    { name: 'SD - South Dakota', value: 'SD' },
    { name: 'TN - Tennessee', value: 'TN' },
    { name: 'TX - Texas', value: 'TX' },
    { name: 'UT - Utah', value: 'UT' },
    { name: 'VT - Vermont', value: 'VT' },
    { name: 'VA - Virginia', value: 'VA' },
    { name: 'VI - Virgin Islands', value: 'VI' },
    { name: 'WA - Washington', value: 'WA' },
    { name: 'WV - West Virginia', value: 'WV' },
    { name: 'WI - Wisconsin', value: 'WI' },
    { name: 'WY - Wyoming', value: 'WY' },
  ];

  // List of angular subscriptions, unsubscribed to on delete
  angularSubscriptions = Array<Subscription>();
  // Customer_id if not new
  customer_id: string;
  archived = false;
  archived_description = '';
  customer: CustomerModel;
  subscriptions = new MatTableDataSource<SubscriptionModel>();
  hasSubs = true;
  hasActiveSubs = false;

  sectorList;
  industryList;

  constructor(
    public subscriptionSvc: SubscriptionService,
    public customerSvc: CustomerService,
    public alertsService: AlertsService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public router: Router,
    public layoutSvc: LayoutMainService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.layoutSvc.setTitle('New Customer');
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
    this.changeDetectorRef.detectChanges();
  }

  getCustomer() {
    this.customerSvc.getCustomer(this.customer_id).subscribe(
      (data: CustomerModel) => {
        if (data._id != null) {
          this.customer = data as CustomerModel;
          this.archived = this.customer.archived;
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
                this.subscriptions.data.forEach((subscription) => {
                  if (
                    subscription.status == 'queued' ||
                    subscription.status == 'running'
                  ) {
                    this.hasActiveSubs = true;
                  }
                });
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

  // Choose state using select dropdown
  changeState(e) {
    this.customerFormGroup.setValue(e.value, {
      onlySelf: true,
    });
  }

  getSectorList() {
    this.customerSvc.getSectorList().subscribe(
      (data: any) => {
        if (data) {
          this.sectorList = data;
          this.setIndustryList();
        } else {
          this.orgError = 'Error retrieving sector/industry list';
        }
      },
      (error) => {
        this.orgError = 'Error retrieving sector/industry list';
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
      appendixADate: customer.appendix_a_date,
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

  isArchived(): boolean {
    if (this.archived) {
      return true;
    }
    return false;
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
        appendix_a_date: this.customerFormGroup.controls['appendixADate'].value,
        archived: false,
        archived_description: '',
      };

      if (this.customer_id != null) {
        // If editing existing customer
        customer._id = this.customer_id;
        this.archived = this.customer.archived;
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
    this.contactFormGroup.markAsDirty();
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
    this.contactFormGroup.markAsDirty();
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

  changeSector(event) {
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

  openUnarchiveCustomerDialog() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to unarchive ${this.customer.name}? Initial Reason for Archiving - ${this.customer.archived_description}`;
    dialogRef.componentInstance.title = 'Confirm Unarchive';

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.archived = false;
        this.customer.archived = false;
        this.customer.archived_description = '';
        this.pushCustomer();
      }
    });
  }

  openArchiveCustomerDialog() {
    this.dialogRefArchive = this.dialog.open(ArchiveCustomersDialogComponent, {
      disableClose: false,
      data: [this.customer],
    });

    this.dialogRefArchive.afterClosed().subscribe((result) => {
      if (result.archived) {
        this.archived = true;
        this.customer.archived = true;
        this.customer.archived_description = result.description;
        this.router.navigate(['/customers']);
      } else if (result.error) {
        this.alertsService.alert(
          `Error archiving customer. ${result.error.error}`
        );
      }
    });
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

  public canDeactivate(): Promise<boolean> {
    return this.isNavigationAllowed();
  }

  private isNavigationAllowed(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.customerFormGroup.dirty || this.contactFormGroup.dirty) {
        const dialogRef = this.dialog.open(UnsavedComponent);
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'save') {
            this.pushCustomer();
            resolve(true);
          } else if (result === 'discard') {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(true);
      }
    });
  }
}
