import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialogConfig,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer, Contact } from 'src/app/models/customer.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription, Target } from 'src/app/models/subscription.model';
import { Guid } from 'guid-typescript';
import { CustomerService } from 'src/app/services/customer.service';
import { XlsxToCsv } from 'src/app/helper/XlsxToCsv';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { CustomerDialogComponent } from '../../../dialogs/customer-dialog/customer-dialog.component';
import { AlertComponent } from '../../../dialogs/alert/alert.component';
import { ConfirmComponent } from '../../../dialogs/confirm/confirm.component';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { SettingsService } from 'src/app/services/settings.service';
import { BehaviorSubject } from 'rxjs';
import { filterSendingProfiles } from '../../../../helper/utilities';

@Component({
  selector: 'subscription-config-tab',
  templateUrl: './subscription-config-tab.component.html',
  styleUrls: ['./subscription-config-tab.component.scss'],
})
export class SubscriptionConfigTab implements OnInit, OnDestroy {
  private routeSub: any;
  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  subscribeForm: FormGroup;
  submitted = false;

  processing = false;

  actionEDIT = 'edit';
  actionCREATE = 'create';
  action: string = this.actionEDIT;
  timeRanges = ['Minutes', 'Hours', 'Days'];
  previousTimeUnit: string = 'Minutes';

  // Valid configuration
  isValidConfig = true;
  validConfigMessage = '';

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

  angular_subs = [];
  target_email_domain = new BehaviorSubject(null);
  validationErrors = {
    emailDoesntMatchDomain: '',
  };

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
    private layoutSvc: LayoutMainService,
    public settingsService: SettingsService,
    private route: ActivatedRoute
  ) {
    this.loadDhsContacts();
    this.loadSendingProfiles();

    this.route.params.subscribe((params) => {
      if (!params.id) {
        layoutSvc.setTitle('New Subscription');
      }
    });
  }
  ngOnDestroy(): void {
    this.angular_subs.forEach((element) => {
      element.unsubscribe();
    });
  }

  /**
   * INIT
   */
  ngOnInit(): void {
    // build form
    this.subscribeForm = new FormGroup(
      {
        selectedCustomerUuid: new FormControl('', {
          validators: Validators.required,
        }),
        primaryContact: new FormControl(null, {
          validators: Validators.required,
        }),
        dhsContact: new FormControl(null, {
          validators: Validators.required,
        }),
        startDate: new FormControl(new Date(), {
          validators: Validators.required,
        }),
        url: new FormControl('', {}),
        keywords: new FormControl('', {}),
        sendingProfile: new FormControl('', {
          validators: Validators.required,
        }),
        targetDomain: new FormControl('', {
          validators: [Validators.required, this.validDomain],
        }),
        csvText: new FormControl('', {
          validators: [
            Validators.required,
            this.invalidCsv,
            this.domainListValidator(this.target_email_domain),
          ],
          updateOn: 'blur',
        }),
        cycle_length_minutes: new FormControl(129600, {
          validators: [Validators.required],
        }),
        timeUnit: new FormControl('Minutes'),
        displayTime: new FormControl(129600),
        staggerEmails: new FormControl(true, {}),
        continuousSubscription: new FormControl(true, {}),
      },
      { updateOn: 'blur' }
    );

    this.onChanges();

    this.pageMode = 'EDIT';

    this.launchSubmitted = false;

    this.subscriptionSvc.subscription = new Subscription();
    this.routeSub = this.route.params.subscribe((params) => {
      if (!params.id) {
        this.loadPageForCreate(params);
      } else {
        this.subscriptionSvc.subBehaviorSubject.subscribe((data) => {
          this.loadPageForEdit(data);
        });
      }
    });
  }

  /**
   * Setup handlers for form field updates
   */
  onChanges(): void {
    this.angular_subs.push(
      this.f.startDate.valueChanges.subscribe((val) => {
        this.subscription.start_date = val;
        this.persistChanges();
      })
    );
    this.angular_subs.push(
      this.f.url.valueChanges.subscribe((val) => {
        this.subscription.url = val;
        this.persistChanges();
      })
    );
    this.angular_subs.push(
      this.f.keywords.valueChanges.subscribe((val) => {
        this.subscription.keywords = val;
        this.persistChanges();
      })
    );
    this.angular_subs.push(
      this.f.sendingProfile.valueChanges.subscribe((val) => {
        this.subscription.sending_profile_name = val;
      })
    );
    this.angular_subs.push(
      this.f.csvText.valueChanges.subscribe((val) => {
        this.evaluateTargetList(false);
        this.getValidationMessage();
        this.persistChanges();
        this.checkValid();
      })
    );
    this.angular_subs.push(
      this.f.targetDomain.valueChanges.subscribe((val) => {
        // if(val == ""){
        //   this.f.targetDomain.setValue(null)
        //   val = null
        // }
        this.subscription.target_domain = val;
        this.target_email_domain.next(val);
        this.f.csvText.updateValueAndValidity({ emitEvent: false });
        this.persistChanges();
      })
    );
    this.angular_subs.push(
      this.f.staggerEmails.valueChanges.subscribe((val) => {
        this.subscription.stagger_emails = val;
        this.persistChanges();
      })
    );
    this.angular_subs.push(
      this.f.continuousSubscription.valueChanges.subscribe((val) => {
        this.subscription.continuous_subscription = val;
        this.persistChanges();
      })
    );
    this.angular_subs.push(
      this.f.timeUnit.valueChanges.subscribe((val) => {
        this.f.displayTime.setValue(
          this.convertTime(
            this.previousTimeUnit,
            val,
            this.f.displayTime.value
          ),
          { emitEvent: false }
        );
        this.previousTimeUnit = val;
      })
    );
    this.angular_subs.push(
      this.f.displayTime.valueChanges.subscribe((val) => {
        let convertedVal = this.convertTime(
          this.previousTimeUnit,
          'Minutes',
          this.f.displayTime.value
        );
        if (convertedVal < 15) {
          convertedVal = 15;
        } else if (convertedVal > 518400) {
          convertedVal = 518400;
        }
        this.f.displayTime.setValue(
          this.convertTime('Minutes', this.previousTimeUnit, convertedVal),
          { emitEvent: false }
        );
        this.f.cycle_length_minutes.setValue(convertedVal);
        this.subscription.cycle_length_minutes = this.f.cycle_length_minutes.value;
        this.checkValid();
      })
    );
  }

  convertTime(previousSpan, newSpan, val) {
    if (previousSpan == 'Minutes') {
      if (newSpan == 'Hours') {
        return val / 60;
      }
      if (newSpan == 'Days') {
        return val / 1440;
      }
    }
    if (previousSpan == 'Hours') {
      if (newSpan == 'Minutes') {
        return val * 60;
      }
      if (newSpan == 'Days') {
        return val / 24;
      }
    }
    if (previousSpan == 'Days') {
      if (newSpan == 'Minutes') {
        return val * 1440;
      }
      if (newSpan == 'Hours') {
        return val * 24;
      }
    }
    return val;
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
    this.subscription = s as Subscription;
    this.subscriptionSvc.subscription = this.subscription;
    this.f.selectedCustomerUuid.setValue(s.subscription_uuid);
    this.f.primaryContact.setValue(s.primary_contact?.email);
    this.f.dhsContact.setValue(s.dhs_contact_uuid);
    this.f.startDate.setValue(s.start_date);
    this.f.url.setValue(s.url);
    this.f.keywords.setValue(s.keywords);
    this.f.csvText.setValue(
      this.formatTargetsToCSV(s.target_email_list_cached_copy),
      { emitEvent: false }
    );

    this.f.sendingProfile.setValue(s.sending_profile_name);
    this.f.targetDomain.setValue(s?.target_domain);
    this.f.staggerEmails.setValue(s.stagger_emails);
    this.f.cycle_length_minutes.setValue(s.cycle_length_minutes, {
      emitEvent: false,
    });
    this.f.displayTime.setValue(s.cycle_length_minutes, { emitEvent: false });
    this.f.continuousSubscription.setValue(s.continuous_subscription);
    this.enableDisableFields();

    this.customerSvc.getCustomer(s.customer_uuid).subscribe((c: Customer) => {
      this.customer = c;
    });
  }

  /**
   *
   */
  setCustomer() {
    if (this.customerSvc.selectedCustomer.length > 0) {
      this.subscribeForm.patchValue({
        selectedCustomerUuid: this.customerSvc.selectedCustomer,
      });
      this.customerSvc
        .getCustomer(this.customerSvc.selectedCustomer)
        .subscribe((data: Customer) => {
          this.customer = data;
          this.customer.contact_list = this.customer.contact_list.filter(
            (contact) => contact.active === true
          );
          this.f.selectedCustomerUuid.setValue(this.customer.customer_uuid);
        });
    }
  }

  /**
   * Gets all known CISA contacts from the API.
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
    this.sendingProfileSvc.getAllProfiles().subscribe((data: any) => {
      this.sendingProfiles = filterSendingProfiles(data);
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

    dialogRef.afterClosed().subscribe((value) => {
      this.setCustomer();
    });
  }

  /**
   * Shows Dialog for archiving a subscription
   */
  public archiveSubscription(): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Archive '${this.subscription.name}?'`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Archive';
    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.subscription.archived = true;
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe(() => {});
        this.enableDisableFields();
      }
    });
  }

  /**
   * Shows Dialog for unarchiving a subscription
   */
  public unarchiveSubscription(): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Unarchive '${this.subscription.name}?'`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm unarchive';
    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.subscription.archived = false;
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe(() => {});
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
      (x) => x.email === e.value
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
    const contact = this.dhsContacts.find(
      (x) => x.dhs_contact_uuid === e.value
    );
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
    if (this.submitted) {
      this.subscriptionSvc.changeTargetCache(this.subscription).subscribe();
    }
  }

  targetsChanged(e: any) {
    this.csvText = e.target.value;
    this.f.csvText.setValue(e.target.value);
    if (this.submitted) {
      this.subscriptionSvc.changeTargetCache(this.subscription).subscribe();
    }
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
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to restart ${this.subscription.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Restart';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.processing = true;
        this.subscription.target_email_list = this.subscription.target_email_list_cached_copy;
        if (typeof this.f.startDate.value === 'string') {
          this.f.startDate.setValue(new Date(this.f.startDate.value));
        }
        if (this.f.startDate.value.getHours() === 0) {
          this.f.startDate.value.setHours(10);
        }
        // persist any changes before restart
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe((x) => {
            // restart
            this.subscriptionSvc
              .restartSubscription(this.subscription.subscription_uuid)
              .subscribe(
                () => {
                  this.subscriptionSvc
                    .getSubscription(this.subscription.subscription_uuid)
                    .subscribe((resp: Subscription) => {
                      this.subscription = resp;
                    });
                  this.enableDisableFields();
                  this.processing = false;
                  this.dialog.open(AlertComponent, {
                    data: {
                      title: '',
                      messageText: `Subscription ${this.subscription.name} was restarted.`,
                    },
                  });
                },
                (error) => {
                  this.submitted = false;
                  this.processing = false;
                  this.dialog.open(AlertComponent, {
                    data: {
                      title: 'Error',
                      messageText:
                        'An error occurred restarting the subscription: ' +
                        error.error,
                    },
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
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to stop ${this.subscription.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Stop';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.processing = true;
        this.subscriptionSvc
          .stopSubscription(this.subscription.subscription_uuid)
          .subscribe(
            () => {
              this.subscriptionSvc
                .getSubscription(this.subscription.subscription_uuid)
                .subscribe((resp: Subscription) => {
                  this.subscription = resp;
                });
              this.enableDisableFields();
              this.processing = false;
              this.dialog.open(AlertComponent, {
                data: {
                  title: '',
                  messageText: `Subscription ${this.subscription.name} was stopped`,
                },
              });
            },
            (error) => {
              this.processing = false;
              this.dialog.open(AlertComponent, {
                data: {
                  title: 'Error',
                  messageText:
                    'An error occurred stopping the subscription: ' +
                    error.error,
                },
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
    if (typeof this.f.startDate.value === 'string') {
      this.f.startDate.setValue(new Date(this.f.startDate.value));
    }
    if (this.f.startDate.value.getHours() === 0) {
      this.f.startDate.value.setHours(10);
    }
    sub.start_date = this.f.startDate.value;
    sub.status = 'Queued';

    sub.url = this.f.url.value;

    // keywords
    sub.keywords = this.f.keywords.value;

    // set the target list
    const csv = this.f.csvText.value;
    sub.target_email_list_cached_copy = this.buildTargetsFromCSV(csv);
    sub.target_email_list = sub.target_email_list_cached_copy;
    sub.target_domain = this.target_email_domain.value;
    sub.sending_profile_name = this.f.sendingProfile.value;

    sub.stagger_emails = this.f.staggerEmails.value;
    sub.continuous_subscription = this.f.continuousSubscription.value;
    const cycleLength: number = +this.f.cycle_length_minutes.value;
    sub.cycle_length_minutes = cycleLength;

    // call service with everything needed to start the subscription
    this.processing = true;
    this.subscriptionSvc.submitSubscription(sub).subscribe(
      (resp: any) => {
        this.dialog.open(AlertComponent, {
          data: {
            title: '',
            messageText: 'Your subscription was created as ' + resp.name,
          },
        });
        this.processing = false;
        this.router.navigate(['subscriptions']);
      },
      (error) => {
        this.processing = false;
        this.launchSubmitted = false;
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Error',
            messageText:
              'An error occurred submitting the subscription: ' + error.error,
          },
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
      this.f.targetDomain.disable();
      //this.f.csvText.disable();
    } else {
      this.f.startDate.enable();
      this.f.url.enable();
      this.f.keywords.enable();
      this.f.sendingProfile.enable();
      this.f.targetDomain.enable();
      //this.f.csvText.enable();
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
    this.subscription.target_email_list_cached_copy = this.buildTargetsFromCSV(
      this.f.csvText.value
    );

    if (removeDupes) {
      const uniqueArray: Target[] = this.subscription.target_email_list_cached_copy.filter(
        (t1, index) => {
          return (
            index ===
            this.subscription.target_email_list_cached_copy.findIndex((t2) => {
              return t2.email.toLowerCase() === t1.email.toLowerCase();
            })
          );
        }
      );
      this.subscription.target_email_list_cached_copy = uniqueArray;
    }

    this.f.csvText.setValue(
      this.formatTargetsToCSV(this.subscription.target_email_list_cached_copy),
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

      if (parts[0].trim() === '') {
        return { invalidTargetCsv: true };
      }

      if (!!parts[0] && !exprEmail.test(String(parts[0]).toLowerCase())) {
        return { invalidEmailFormat: true };
      }
    }

    return null;
  }
  validDomain(control: FormControl) {
    const exprEmail = /^@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // const lines = control.value.split('\n');
    if (control.value) {
      const parts = control.value.split(',');
      for (const part of parts) {
        let trimmedPart = part.trim();
        if (!exprEmail.test(trimmedPart.toLowerCase())) {
          return { invalidDomain: true };
        }
      }

      let value = control.value;
      if (value == null) {
        return null;
      }
    }

    return null;
  }

  domainListValidator(domain: BehaviorSubject<string>): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const exprEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let domain_targets = [];
      let BS_sub = domain.subscribe((val) => {
        if (val) {
          let vals = val.split(',');
          for (const value of vals) {
            domain_targets.push(value.trim());
          }
        }
      });
      BS_sub.unsubscribe();

      const lines = control.value.split('\n');
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length !== 4) {
          return { invalidTargetCsv: true };
        }
        if (parts[0].trim() == '') {
          return { invalidTargetCsv: true };
        }

        if (!!parts[0] && !exprEmail.test(String(parts[0]).toLowerCase())) {
          return { invalidEmailFormat: true };
        }
        if (domain_targets.length == 0) {
          return { noTargetDomain: true };
        }
        let line_domain = parts[0].split('@');
        if (line_domain.length != 2) {
          return { invalidEmailFormat: true };
        }
        let val_not_found = true;
        for (const domain_target of domain_targets) {
          if ('@' + line_domain[1] == domain_target) {
            val_not_found = false;
          }
        }

        if (val_not_found) {
          return { emailDoesntMatchDomain: parts[0] };
        }
      }

      return null;
    };
  }

  getValidationMessage() {
    // const errors = this.reportedStatsForm.controls[control].errors;
    Object.keys(this.subscribeForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.subscribeForm.get(key)
        .errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((element) => {
          this.validationErrors[element] = controlErrors[element];
        });
      }
    });
  }

  checkValid() {
    const cycleLength: number = +this.f.cycle_length_minutes.value;
    const targetCount = this.f.csvText.value.trim().split('\n').length;
    this.subscriptionSvc.checkValid(cycleLength, targetCount).subscribe(
      () => {
        this.isValidConfig = true;
      },
      (error) => {
        this.isValidConfig = false;
        this.validConfigMessage = error.error;
      }
    );
  }
}
