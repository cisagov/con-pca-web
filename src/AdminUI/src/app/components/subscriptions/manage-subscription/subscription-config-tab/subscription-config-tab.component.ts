import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  MatDialogConfig,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer, Contact } from 'src/app/models/customer.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import {
  Subscription,
  Target,
} from 'src/app/models/subscription.model';
import { Guid } from 'guid-typescript';
import { CustomerService } from 'src/app/services/customer.service';
import { XlsxToCsv } from 'src/app/helper/XlsxToCsv';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { CustomerDialogComponent } from '../../../dialogs/customer-dialog/customer-dialog.component';
import { AlertComponent } from '../../../dialogs/alert/alert.component';
import { ConfirmComponent } from '../../../dialogs/confirm/confirm.component';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'subscription-config-tab',
  templateUrl: './subscription-config-tab.component.html',
  styleUrls: ['./subscription-config-tab.component.scss']
})
export class SubscriptionConfigTab implements OnInit, OnDestroy {
  private routeSub: any;
  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  subscribeForm: FormGroup;
  submitted = false;

  actionEDIT = 'edit';
  actionCREATE = 'create';
  action: string = this.actionEDIT;

  // CREATE or EDIT
  pageMode = 'CREATE';

  subscription: Subscription;
  customer: Customer = new Customer();
  primaryContact: Contact = new Contact();
  dhsContacts = [];
  dhsContactUuid: string;

  startAt = new Date();

  sendingProfiles = [];

  // The raw CSV content of the textarea
  csvText: string;
  badCSV = false;

  timelineItems: any[] = [];

  launchSubmitted = false;

  angular_subs = []

  /**
   *
   */
  constructor(
    public subscriptionSvc: SubscriptionService,
    public customerSvc: CustomerService,
    public sendingProfileSvc: SendingProfileService,
    private router: Router,
    public dialog: MatDialog,
    public formBuilder: FormBuilder,
    public layoutSvc: LayoutMainService,
    public settingsService: SettingsService,
    private route: ActivatedRoute,
  ) {
    this.loadDhsContacts();
    this.loadSendingProfiles();
  }
  ngOnDestroy(): void {
    this.angular_subs.forEach(element => {
      element.unsubscribe()
    });
  }

  /**
   * INIT
   */
  ngOnInit(): void {
    // build form
    this.subscribeForm = new FormGroup({
      selectedCustomerUuid: new FormControl('', {
        validators: Validators.required
      }),
      primaryContact: new FormControl(null, {
        validators: Validators.required
      }),
      dhsContact: new FormControl(null, {
        validators: Validators.required
      }),
      startDate: new FormControl(new Date(), {
        validators: Validators.required
      }),
      url: new FormControl('', {}),
      keywords: new FormControl('', {}),
      sendingProfile: new FormControl('', {
        validators: Validators.required
      }),
      csvText: new FormControl('', {
        validators: [Validators.required, this.invalidCsv],
        updateOn: 'blur'
      })
    },
      { updateOn: 'blur' });

    this.onChanges();

    this.pageMode = 'EDIT';

    this.launchSubmitted = false;

    this.subscriptionSvc.subscription = new Subscription();
    this.routeSub = this.route.params.subscribe(params => {
      if (!params.id) {
        this.loadPageForCreate(params);
      } else {
        this.subscriptionSvc.subBehaviorSubject.subscribe(data => {
          if ("gophish_campaign_list" in data) {
            this.loadPageForEdit(data);
          }
        })
      }
    });

  }

  /**
   * Setup handlers for form field updates
   */
  onChanges(): void {
    this.angular_subs.push(this.f.startDate.valueChanges.subscribe(val => {
      this.subscription.start_date = val;
      this.persistChanges();
    }));
    this.angular_subs.push(this.f.url.valueChanges.subscribe(val => {
      this.subscription.url = val;
      this.persistChanges();
    }));
    this.angular_subs.push(this.f.keywords.valueChanges.subscribe(val => {
      this.subscription.keywords = val;
      this.persistChanges();
    }));
    this.angular_subs.push(this.f.sendingProfile.valueChanges.subscribe(val => {
      this.subscription.sending_profile_name = val;
    }));
    this.angular_subs.push(this.f.csvText.valueChanges.subscribe(val => {
      this.evaluateTargetList(false);
      this.persistChanges();
    }));
  }

  /**
   * Sends the model to the API if the subscription is in edit mode.
   */
  persistChanges() {
    if (this.subscribeForm.invalid || !this.subscribeForm.dirty) {
      return;
    }

    // patch the subscription in real time if in edit mode
    if (!this.subscribeForm.errors && this.pageMode.toLowerCase() === 'edit') {
      this.subscriptionSvc.patchSubscription(this.subscription).subscribe();
    }
  }

  /**
   * convenience getter for easy access to form fields
   */
  get f() {
    return this.subscribeForm.controls;
  }

  /**
   * CREATE mode
   */
  loadPageForCreate(params: any) {
    this.pageMode = 'CREATE';
    this.action = this.actionCREATE;
    this.subscription = new Subscription();
    this.subscription.subscription_uuid = Guid.create().toString();
    this.enableDisableFields();
  }

  /**
   * EDIT mode
   */
  loadPageForEdit(s: Subscription) {
    const sub = this.subscriptionSvc.subscription;
    this.subscription = s as Subscription;
    this.subscriptionSvc.subscription = this.subscription;
    this.f.selectedCustomerUuid.setValue(s.subscription_uuid);
    this.f.primaryContact.setValue(s.primary_contact?.email);
    this.f.dhsContact.setValue(s.dhs_contact_uuid);
    this.f.startDate.setValue(s.start_date);
    this.f.url.setValue(s.url);
    this.f.keywords.setValue(s.keywords);
    this.f.csvText.setValue(this.formatTargetsToCSV(s.target_email_list));
    this.f.sendingProfile.setValue(s.sending_profile_name);

    this.enableDisableFields();


    this.customerSvc
      .getCustomer(s.customer_uuid)
      .subscribe((c: Customer) => {
        this.customer = c;
      });
  }

  /**
   *
   */
  setCustomer() {
    if (this.customerSvc.selectedCustomer.length > 0) {
      this.subscribeForm.patchValue({
        selectedCustomerUuid: this.customerSvc.selectedCustomer
      });
      this.customerSvc
        .getCustomer(this.customerSvc.selectedCustomer)
        .subscribe((data: Customer) => {
          this.customer = data;
          this.customer.contact_list = this.customer.contact_list.filter(
            contact => contact.active === true
          );
          this.f.selectedCustomerUuid.setValue(this.customer.customer_uuid);
        });
    }
  }

  /**
   * Gets all known DHS contacts from the API.
   */
  loadDhsContacts() {
    this.subscriptionSvc.getDhsContacts().subscribe((data: any) => {
      this.dhsContacts = data;
    });
  }

  /**
   *
   */
  loadContactsForCustomer(customerUuid: string) {
    // get the customer and contacts from the API
    this.customerSvc.getCustomer(customerUuid).subscribe((c: Customer) => {
      this.customer = c;

      this.customer.contact_list = this.customerSvc.getContactsForCustomer(c);
      this.primaryContact = this.customer.contact_list[0];
    });
  }

  /**
   *
   */
  loadSendingProfiles() {
    // get the customer and contacts from the API
    this.sendingProfileSvc.getAllProfiles().subscribe((data: any) => {
      this.sendingProfiles = data;
    });
  }

  /**
   * Presents a customer page to select or create a new customer for
   * this subscription.
   */
  public showCustomerDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.data = {};
    const dialogRef = this.dialog.open(CustomerDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      this.setCustomer();
    });
  }

  /**
   * Shows Dialog for archiving a subscription
   */
  public archiveSubscription(): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Archive '${this.subscription.name}?'`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Archive';
    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.subscription.archived = true;
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe(() => { });
        this.enableDisableFields();
      }
    });
  }

  /**
   * Shows Dialog for unarchiving a subscription
   */
  public unarchiveSubscription(): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Unarchive '${this.subscription.name}?'`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm unarchive';
    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.subscription.archived = false;
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe(() => { });
        this.enableDisableFields();
      }
    });
  }

  /**
   *
   */
  changePrimaryContact(e: any) {
    if (!this.customer) {
      return;
    }
    this.primaryContact = this.customer.contact_list.find(
      x => x.email === e.value
    );
    this.subscription.primary_contact = this.primaryContact;
    this.subscriptionSvc.subscription.primary_contact = this.primaryContact;

    // patch the subscription in real time if in edit mode
    if (this.pageMode === 'EDIT') {
      this.subscriptionSvc
        .changePrimaryContact(
          this.subscription.subscription_uuid,
          this.primaryContact
        )
        .subscribe();
    }
  }

  /**
   *
   */
  changeDhsContact(e: any) {
    const contact = this.dhsContacts.find(x => x.dhs_contact_uuid === e.value);
    if (contact) {
      this.dhsContactUuid = contact.dhs_contact_uuid;
      this.subscription.dhs_contact_uuid = this.dhsContactUuid;

      // patch the subscription in real time if in edit mode
      if (this.pageMode === 'EDIT') {
        this.subscriptionSvc
          .changeDhsContact(
            this.subscription.subscription_uuid,
            this.dhsContactUuid
          )
          .subscribe();
      }
    }
  }

  /**
   * Programatically clicks the corresponding file upload element.
   */
  openFileBrowser(event: any) {
    event.preventDefault();
    const element: HTMLElement = document.getElementById(
      'csvUpload'
    ) as HTMLElement;
    element.click();
  }

  /**
   * Reads the contents of the event's file and puts them into csvText.
   * @param e The 'file' event
   */
  fileSelect(e: any) {
    const file: any = e.target.files[0];

    const x = new XlsxToCsv();
    x.convert(file).then((xyz: string) => {
      this.csvText = xyz;
      this.f.csvText.setValue(xyz);
    });
  }

  /**
   * Tests the form for validity.
   */
  subValid() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.subscribeForm.invalid) {
      return false;
    }

    return true;
  }

  /**
   * Restart a stopped subscription.
   */
  startSubscription() {
    if (!this.subValid()) {
      return;
    }

    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to restart ${this.subscription.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Restart';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        // persist any changes before restart
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe(x => {
            // restart
            this.subscriptionSvc
              .restartSubscription(this.subscription.subscription_uuid)
              .subscribe(
                (resp: Subscription) => {
                  this.subscription = resp;
                  this.enableDisableFields();
                  this.dialog.open(AlertComponent, {
                    data: {
                      title: '',
                      messageText: `Subscription ${this.subscription.name} was restarted.`
                    }
                  });
                },
                error => {
                  this.dialog.open(AlertComponent, {
                    data: {
                      title: 'Error',
                      messageText:
                        'An error occurred restarting the subscription: ' +
                        error.error
                    }
                  });
                }
              );
          });
      }
    });
  }

  /**
   * Stop a running subscription.
   */
  stopSubscription() {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to stop ${this.subscription.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Stop';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.subscriptionSvc
          .stopSubscription(this.subscription.subscription_uuid)
          .subscribe(
            (resp: Subscription) => {
              this.subscription = resp;
              this.enableDisableFields();
              this.dialog.open(AlertComponent, {
                data: {
                  title: '',
                  messageText: `Subscription ${this.subscription.name} was stopped`
                }
              });
            },
            error => {
              this.dialog.open(AlertComponent, {
                data: {
                  title: 'Error',
                  messageText:
                    'An error occurred stopping the subscription: ' +
                    error.error
                }
              });
            }
          );
      }
    });
  }

  /**
   * Set page title
   */


  /**
   * Submits the form to create a new Subscription.
   */
  onSubmit() {
    if (!this.subValid()) {
      return;
    }

    this.launchSubmitted = true;

    const sub = this.subscriptionSvc.subscription;

    sub.customer_uuid = this.customer.customer_uuid;
    sub.primary_contact = this.primaryContact;
    sub.dhs_contact_uuid = this.dhsContactUuid;
    sub.active = true;

    sub.lub_timestamp = new Date();
    sub.start_date = this.f.startDate.value;
    sub.status = 'New Not Started';

    sub.url = this.f.url.value;

    // keywords
    sub.keywords = this.f.keywords.value;

    // set the target list
    const csv = this.f.csvText.value;
    sub.target_email_list = this.buildTargetsFromCSV(csv);

    sub.sending_profile_name = this.f.sendingProfile.value;

    // call service with everything needed to start the subscription
    this.subscriptionSvc.submitSubscription(sub).subscribe(
      (resp: any) => {
        this.dialog.open(AlertComponent, {
          data: {
            title: '',
            messageText: 'Your subscription was created as ' + resp.name
          }
        });

        this.router.navigate(['subscriptions']);
      },
      error => {
        this.launchSubmitted = false;
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Error',
            messageText:
              'An error occurred submitting the subscription: ' + error.error
          }
        });
      }
    );
  }

  /**
   * Enables and disabled fields based on the subscription status.
   */
  enableDisableFields() {
    const status = this.subscription?.status?.toLowerCase();
    if (status === 'in progress') {
      this.f.startDate.disable();
      this.f.url.disable();
      this.f.keywords.disable();
      this.f.sendingProfile.disable();
      this.f.csvText.disable();
    } else {
      this.f.startDate.enable();
      this.f.url.enable();
      this.f.keywords.enable();
      this.f.sendingProfile.enable();
      this.f.csvText.enable();
    }
  }

  /**
   *
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Parses the text into a list of targets.
   * Optionally removes lines with duplicate email addresses.
   * Formats the targets back into CSV text and refreshes the field.
   */
  evaluateTargetList(removeDupes: boolean) {
    this.subscription.target_email_list = this.buildTargetsFromCSV(
      this.f.csvText.value
    );

    if (removeDupes) {
      const uniqueArray: Target[] = this.subscription.target_email_list.filter((t1, index) => {
        return (
          index ===
          this.subscription.target_email_list.findIndex(t2 => {
            return t2.email.toLowerCase() === t1.email.toLowerCase();
          })
        );
      });
      this.subscription.target_email_list = uniqueArray;
    }

    this.f.csvText.setValue(
      this.formatTargetsToCSV(this.subscription.target_email_list),
      { emitEvent: false }
    );
  }

  /**
   * Converts a string with CSV lines into Targets.
   * Format: email, firstname, lastname, position
   * @param csv A comma-separated string with linefeed delimiters
   */
  public buildTargetsFromCSV(csv: string): Target[] {
    const targetList: Target[] = [];
    if (!csv) {
      return;
    }

    const lines = csv.trim().split('\n');
    lines.forEach((line: string) => {
      const parts = line.split(',');
      while (parts.length < 4) {
        parts.push('');
      }

      const t = new Target();
      t.email = parts[0].trim();
      t.first_name = parts[1].trim();
      t.last_name = parts[2].trim();
      t.position = parts[3].trim();
      targetList.push(t);
    });

    return targetList;
  }

  /**
   * Formats Targets for display in the form.
   */
  formatTargetsToCSV(targetList: Target[]) {
    if (!targetList) {
      return '';
    }
    let output = '';
    targetList.forEach((t: Target) => {
      output += `${t.email}, ${t.first_name}, ${t.last_name}, ${t.position}\n`;
    });

    if (output.length > 0) {
      output = output.substring(0, output.length - 1);
    }

    return output;
  }

  /**
   * A validator that requires the csv field to contain certain elements on each row
   */
  invalidCsv(control: FormControl) {
    const exprEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const lines = control.value.split('\n');
    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length !== 4) {
        return { invalidTargetCsv: true };
      }

      for (const part of parts) {
        if (part.trim() === '') {
          return { invalidTargetCsv: true };
        }
      }

      if (!!parts[0] && !exprEmail.test(String(parts[0]).toLowerCase())) {
        return { invalidEmailFormat: true };
      }
    }

    return null;
  }

  /**
   *
   */

}