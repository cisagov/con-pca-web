import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  SimpleChanges,
} from '@angular/core';
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
import { CustomerModel, ContactModel } from 'src/app/models/customer.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import {
  SubscriptionModel,
  TargetModel,
} from 'src/app/models/subscription.model';
import { Guid } from 'guid-typescript';
import { CustomerService } from 'src/app/services/customer.service';
import { XlsxToCsv } from 'src/app/helper/XlsxToCsv';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { CustomerDialogComponent } from '../../../dialogs/customer-dialog/customer-dialog.component';
import { AlertComponent } from '../../../dialogs/alert/alert.component';
import { ConfirmComponent } from '../../../dialogs/confirm/confirm.component';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { SettingsService } from 'src/app/services/settings.service';
import { BehaviorSubject, from } from 'rxjs';
import { TemplateSelectDialogComponent } from 'src/app/components/subscriptions/manage-subscription/template-select-dialog/template-select-dialog.component';
import { InvalidEmailDialogComponent } from 'src/app/components/subscriptions/invalid-email-dialog/invalid-email-dialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CanComponentDeactivate } from 'src/app/guards/unsaved-changes.guard';
import { UnsavedComponent } from 'src/app/components/dialogs/unsaved/unsaved.component';
import { UserService } from 'src/app/services/user.service';
import { UserModel } from 'src/app/models/user.model';
import { TemplateModel } from 'src/app/models/template.model';
import { SendingProfileModel } from 'src/app/models/sending-profile.model';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: 'subscription-config-tab',
  templateUrl: './subscription-config-tab.component.html',
  styleUrls: ['./subscription-config-tab.component.scss'],
})
export class SubscriptionConfigTab
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  private routeSub: any;
  dialogRefConfirm: MatDialogRef<any>;

  subscribeForm: FormGroup;

  processing = false;
  saving = false;

  actionEDIT = 'edit';
  actionCREATE = 'create';
  action: string = this.actionEDIT;
  timeRanges = ['Minutes', 'Hours', 'Days'];
  subscriptionPreviousTimeUnit = 'Minutes';
  reportPeriodPreviousTimeUnit = 'Minutes';
  cooldownPreviousTimeUnit = 'Minutes';
  bufferPreviousTimeUnit = 'Minutes';
  templatesSelected = [];
  templatesAvailable = [];
  dailyRate = '';
  hourlyRate = '';
  currentDailyRate = '';

  // Valid configuration
  isValidConfig = true;
  ignoreConfigError = false;
  validConfigMessage = '';

  // CREATE or EDIT
  pageMode = 'CREATE';

  subscription: SubscriptionModel;
  customer: CustomerModel = new CustomerModel();
  primaryContact: ContactModel = new ContactModel();
  adminEmails = [];

  startAt = new Date();
  sendBy = new Date();
  endDate = new Date();
  appendixADate = new Date();
  startBeforeAppendixDate = false;

  sendingProfiles = [];

  // The raw CSV content of the textarea
  csvText: string;
  badCSV = false;

  timelineItems: any[] = [];

  angular_subs = [];
  target_email_domain = new BehaviorSubject(null);
  validationErrors = {
    emailDoesntMatchDomain: '',
  };

  loading = true;
  loadingText = 'Loading Subscription';

  hideReportingPassword = true;

  // Safelisting Attributes
  sendingProfileDomains = new Set();
  sendingProfileIps = new Set();

  @Input() showLoading: boolean;
  ngOnChanges(changes: SimpleChanges) {
    if (changes.showLoading) {
      this.loading = changes.showLoading.currentValue;
    }
  }

  submitted = false;

  exprEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  /**
   *
   */
  constructor(
    public subscriptionSvc: SubscriptionService,
    public customerSvc: CustomerService,
    public sendingProfileSvc: SendingProfileService,
    private router: Router,
    public dialog: MatDialog,
    public alertsService: AlertsService,
    public formBuilder: FormBuilder,
    private layoutSvc: LayoutMainService,
    public settingsService: SettingsService,
    private route: ActivatedRoute,
    public templateSvc: TemplateManagerService,
    private userSvc: UserService
  ) {
    this.loadAdminEmails();
    this.loadSendingProfiles();

    this.route.params.subscribe((params) => {
      if (!params.id) {
        this.layoutSvc.setTitle('New Subscription');
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
        selectedCustomerId: new FormControl('', {
          validators: Validators.required,
        }),
        primaryContact: new FormControl(null, {
          validators: Validators.required,
        }),
        adminEmail: new FormControl(null, {
          validators: Validators.required,
        }),
        operatorEmail: new FormControl('', {}),
        startDate: new FormControl(new Date(), {
          validators: Validators.required,
        }),
        sendingProfile: new FormControl('', {
          validators: Validators.required,
        }),
        targetDomain: new FormControl('', {
          validators: [Validators.required, this.validDomain],
        }),
        csvText: new FormControl('', {
          validators: [this.invalidCsv(), this.domainListValidator()],
          updateOn: 'blur',
        }),
        bufferTime: new FormControl(21600),
        bufferDisplayTime: new FormControl(21600),
        bufferTimeUnit: new FormControl('Minutes'),
        cycle_length_minutes: new FormControl(86400, {
          validators: [Validators.required],
        }),
        subTimeUnit: new FormControl('Minutes'),
        subDisplayTime: new FormControl(86400),
        cooldown_minutes: new FormControl(43200, {
          validators: [Validators.required],
        }),
        cooldownTimeUnit: new FormControl('Minutes'),
        cooldownDisplayTime: new FormControl(43200),
        report_frequency_minutes: new FormControl(43200, {
          validators: [Validators.required],
        }),
        reportTimeUnit: new FormControl('Minutes'),
        reportDisplayTime: new FormControl(43200),
        continuousSubscription: new FormControl(false, {}),
        reportingPassword: new FormControl(''),
        landingPageURL: new FormControl(''),
        landingPageDomain: new FormControl(''),
      },
      { updateOn: 'blur' }
    );

    this.onChanges();

    this.pageMode = 'EDIT';

    this.subscriptionSvc.subscription = new SubscriptionModel();
    this.routeSub = this.route.params.subscribe((params) => {
      if (!params.id) {
        this.loadPageForCreate(params);
      } else {
        this.subscriptionSvc.subBehaviorSubject.subscribe((data) => {
          if (data._id) {
            this.loadPageForEdit(data);
          }
        });
      }
    });
  }

  public canDeactivate(): Promise<boolean> {
    return this.isNavigationAllowed();
  }

  private isNavigationAllowed(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.subscribeForm.dirty && !this.saving) {
        this.dialogRefConfirm = this.dialog.open(UnsavedComponent);
        this.dialogRefConfirm.afterClosed().subscribe((result) => {
          if (result === 'save') {
            this.save();
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

  /**
   * Setup handlers for form field updates
   */
  onChanges(): void {
    // On changes to start date
    this.angular_subs.push(
      this.f.startDate.valueChanges.subscribe((val) => {
        const startDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate >= today) {
          const now = new Date();
          startDate.setMinutes(now.getMinutes());
          startDate.setHours(now.getHours());
        }
        this.subscription.start_date = startDate;
        this.setEndTimes();

        // // Check if Start Date is before Appendix A Date
        this.isStartDateBeforeAADate();
      })
    );

    // On changes to sending profile
    this.angular_subs.push(
      this.f.sendingProfile.valueChanges.subscribe((val) => {
        this.subscription.sending_profile_id = val;
      })
    );

    // On changes to targets
    this.angular_subs.push(
      this.f.csvText.valueChanges.subscribe((val) => {
        this.evaluateTargetList(false);
        this.getValidationMessage();
        this.checkValid();
      })
    );

    // On changes to target domain field
    this.angular_subs.push(
      this.f.targetDomain.valueChanges.subscribe((val) => {
        this.subscription.target_domain = val;
        this.target_email_domain.next(val);
        this.f.csvText.updateValueAndValidity({ emitEvent: false });
      })
    );

    // On changes to continuous subscription checkbox
    this.angular_subs.push(
      this.f.continuousSubscription.valueChanges.subscribe((val) => {
        this.subscription.continuous_subscription = val;
      })
    );

    // On changes to reporting password
    this.angular_subs.push(
      this.f.reportingPassword.valueChanges.subscribe((val) => {
        this.subscription.reporting_password = val;
      })
    );

    // On changes to landing page url
    this.angular_subs.push(
      this.f.landingPageURL.valueChanges.subscribe((val) => {
        this.subscription.landing_page_url = val;
      })
    );

    // On changes to landing page domain
    this.angular_subs.push(
      this.f.landingPageDomain.valueChanges.subscribe((val) => {
        this.subscription.landing_domain = val;
      })
    );

    // On changes to cycle length time unit
    this.angular_subs.push(
      this.f.subTimeUnit.valueChanges.subscribe((val) => {
        this.subscriptionPreviousTimeUnit = this.onTimeUnitChanges(
          this.f.subDisplayTime,
          this.subscriptionPreviousTimeUnit,
          val
        );
      })
    );

    // On changes to cycle length time
    this.angular_subs.push(
      this.f.subDisplayTime.valueChanges.subscribe((val) => {
        this.subscription.cycle_length_minutes = this.onDisplayTimeChanges(
          this.f.cycle_length_minutes,
          this.f.subDisplayTime,
          this.subscriptionPreviousTimeUnit
        );
        this.checkValid();
      })
    );

    // On changes to buffer time
    this.angular_subs.push(
      this.f.bufferDisplayTime.valueChanges.subscribe((val) => {
        this.subscription.buffer_time_minutes = this.onDisplayTimeChanges(
          this.f.bufferTime,
          this.f.bufferDisplayTime,
          this.bufferPreviousTimeUnit
        );
      })
    );

    // On changes to buffer time unit
    this.angular_subs.push(
      this.f.bufferTimeUnit.valueChanges.subscribe((val) => {
        this.bufferPreviousTimeUnit = this.onTimeUnitChanges(
          this.f.bufferDisplayTime,
          this.bufferPreviousTimeUnit,
          val
        );
      })
    );

    // On changes to cooldown time unit
    this.angular_subs.push(
      this.f.cooldownTimeUnit.valueChanges.subscribe((val) => {
        this.cooldownPreviousTimeUnit = this.onTimeUnitChanges(
          this.f.cooldownDisplayTime,
          this.cooldownPreviousTimeUnit,
          val
        );
      })
    );

    // On changes to cooldown time
    this.angular_subs.push(
      this.f.cooldownDisplayTime.valueChanges.subscribe((val) => {
        this.subscription.cooldown_minutes = this.onDisplayTimeChanges(
          this.f.cooldown_minutes,
          this.f.cooldownDisplayTime,
          this.cooldownPreviousTimeUnit
        );
        this.checkValid();
      })
    );

    // On changes to reporting time unit
    this.angular_subs.push(
      this.f.reportTimeUnit.valueChanges.subscribe((val) => {
        this.reportPeriodPreviousTimeUnit = this.onTimeUnitChanges(
          this.f.reportDisplayTime,
          this.reportPeriodPreviousTimeUnit,
          val
        );
      })
    );

    // On changes to reporting frequency time
    this.angular_subs.push(
      this.f.reportDisplayTime.valueChanges.subscribe((val) => {
        this.subscription.report_frequency_minutes = this.onDisplayTimeChanges(
          this.f.report_frequency_minutes,
          this.f.reportDisplayTime,
          this.reportPeriodPreviousTimeUnit
        );
        this.checkValid();
      })
    );
  }

  setDefaultTimeUnit() {
    if (this.f.subDisplayTime.value > 1440) {
      this.f.subTimeUnit.setValue('Days');
    }
    if (this.f.cooldownDisplayTime.value > 1440) {
      this.f.cooldownTimeUnit.setValue('Days');
    }
    if (this.f.reportDisplayTime.value > 1440) {
      this.f.reportTimeUnit.setValue('Days');
    }
    if (this.f.bufferDisplayTime.value > 1440) {
      this.f.bufferTimeUnit.setValue('Days');
    }
  }

  onTimeUnitChanges(
    displayFormControl: AbstractControl,
    previousTimeUnit: string,
    timeUnit: string
  ) {
    displayFormControl.setValue(
      this.convertTime(previousTimeUnit, timeUnit, displayFormControl.value),
      { emitEvent: false }
    );
    return timeUnit;
  }

  onDisplayTimeChanges(
    valueFormControl: AbstractControl,
    displayFormControl: AbstractControl,
    previousTimeUnit: string
  ) {
    let convertedVal = this.convertTime(
      previousTimeUnit,
      'Minutes',
      displayFormControl.value
    );
    if (convertedVal < 15) {
      convertedVal = 15;
    } else if (convertedVal > 518400) {
      convertedVal = 518400;
    }
    displayFormControl.setValue(
      this.convertTime('Minutes', previousTimeUnit, convertedVal),
      { emitEvent: false }
    );
    valueFormControl.setValue(convertedVal);
    this.setEndTimes();

    return valueFormControl.value;
  }

  setEndTimes() {
    // Calculate send by and end date
    let start = this.subscription.start_date;
    if (typeof start === 'string') {
      start = new Date(this.subscription.start_date);
    }
    const cycleLength: number = +this.f.cycle_length_minutes.value;
    const cooldownLength: number = +this.f.cooldown_minutes.value;
    this.sendBy = new Date(start);
    this.sendBy.setMinutes(this.sendBy.getMinutes() + cycleLength);
    this.endDate = new Date(start);
    this.endDate.setMinutes(
      this.endDate.getMinutes() + cycleLength + cooldownLength
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
  async loadPageForCreate(params: any) {
    this.pageMode = 'CREATE';
    this.action = this.actionCREATE;
    this.subscription = new SubscriptionModel();
    this.subscription.templates_selected = this.templatesSelected;
    this.subscription._id = Guid.create().toString();
    this.enableDisableFields();
    this.getRandomTemplates();
    this.setDefaultTimeUnit();
    this.setEndTimes();
    this.loading = false;
  }
  async getRandomTemplates() {
    //  Get Templates Selected
    this.subscription.templates_selected =
      await this.subscriptionSvc.getTemplatesSelected();
    this.templatesSelected = await this.templateSvc.getAllTemplates(
      false,
      this.subscription.templates_selected
    );
    this.getTemplates();
  }

  /**
   * EDIT mode
   */
  async loadPageForEdit(s: SubscriptionModel) {
    this.subscription = s as SubscriptionModel;
    this.getTemplates();
    this.subscriptionSvc.subscription = this.subscription;
    this.f.selectedCustomerId.setValue(s.customer_id);
    this.f.primaryContact.setValue(s.primary_contact?.email);
    this.f.adminEmail.setValue(s.admin_email);
    this.f.operatorEmail.setValue(s.operator_email);
    this.f.startDate.setValue(s.start_date);
    this.f.csvText.setValue(this.formatTargetsToCSV(s.target_email_list), {
      emitEvent: false,
    });

    this.f.sendingProfile.setValue(s.sending_profile_id);
    this.f.targetDomain.setValue(s?.target_domain);
    this.f.cycle_length_minutes.setValue(s.cycle_length_minutes, {
      emitEvent: false,
    });
    this.f.cooldown_minutes.setValue(s.cooldown_minutes, {
      emitEvent: false,
    });
    this.f.report_frequency_minutes.setValue(s.report_frequency_minutes, {
      emitEvent: false,
    });
    this.f.bufferTime.setValue(s.buffer_time_minutes, { emitEvent: false });
    this.f.bufferDisplayTime.setValue(s.buffer_time_minutes, {
      emitEvent: false,
    });
    this.f.subDisplayTime.setValue(s.cycle_length_minutes, {
      emitEvent: false,
    });
    this.f.cooldownDisplayTime.setValue(s.cooldown_minutes, {
      emitEvent: false,
    });
    this.f.reportDisplayTime.setValue(s.report_frequency_minutes, {
      emitEvent: false,
    });
    this.f.continuousSubscription.setValue(s.continuous_subscription);
    this.f.reportingPassword.setValue(s.reporting_password);

    this.f.landingPageURL.setValue(s.landing_page_url);
    this.f.landingPageDomain.setValue(s.landing_domain);
    this.enableDisableFields();

    this.customerSvc
      .getCustomer(s.customer_id)
      .subscribe((c: CustomerModel) => {
        this.customer = c;
        this.changePrimaryContact({ value: s.primary_contact?.email });
      });

    this.templatesSelected = await this.templateSvc.getAllTemplates(
      false,
      s.templates_selected
    );
    this.setDefaultTimeUnit();
    this.setEndTimes();
    this.checkValid(false);
  }

  /**
   *
   */
  setCustomer() {
    if (this.customerSvc.selectedCustomer.length > 0) {
      this.subscribeForm.patchValue({
        selectedCustomerId: this.customerSvc.selectedCustomer,
      });
      this.customerSvc
        .getCustomer(this.customerSvc.selectedCustomer)
        .subscribe((data: CustomerModel) => {
          this.customer = data;
          this.customer.contact_list = this.customer.contact_list.filter(
            (contact) => contact.active === true
          );
          this.f.selectedCustomerId.setValue(this.customer._id);
          this.appendixADate = new Date(data.appendix_a_date);
          this.isStartDateBeforeAADate();
        });
    }
  }

  /**
   * Gets all known CISA contacts from the API.
   */
  loadAdminEmails() {
    this.userSvc.getUsers().subscribe((data: UserModel[]) => {
      data.forEach((user) => {
        this.adminEmails.push(user.email);
      });
    });
  }

  loadContactsForCustomer(customerId: string) {
    // get the customer and contacts from the API
    this.customerSvc.getCustomer(customerId).subscribe((c: CustomerModel) => {
      this.customer = c;

      this.customer.contact_list = this.customerSvc.getContactsForCustomer(c);
      this.primaryContact = this.customer.contact_list[0];
    });
  }

  loadSendingProfiles() {
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

  changePrimaryContact(e: any) {
    if (!this.customer) {
      return;
    }
    this.primaryContact = this.customer.contact_list.find(
      (x) => x.email === e.value
    );
    this.subscription.primary_contact = this.primaryContact;
    this.subscriptionSvc.subscription.primary_contact = this.primaryContact;
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

  targetsChanged(e: any) {
    this.csvText = e.target.value;
    this.f.csvText.setValue(e.target.value);
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
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to launch ${this.subscription.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Launch';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.loadingText = 'Starting subscription';
        this.processing = true;
        this.setTemplatesSelected();
        this.subscription.target_email_list =
          this.subscription.target_email_list;
        // persist any changes before restart
        this.subscriptionSvc
          .patchSubscription(this.subscription)
          .subscribe((x) => {
            // restart
            this.subscriptionSvc
              .restartSubscription(this.subscription._id)
              .subscribe(
                () => {
                  this.subscriptionSvc
                    .getSubscription(this.subscription._id)
                    .subscribe((resp: SubscriptionModel) => {
                      this.subscription = resp;
                    });
                  this.enableDisableFields();
                  this.processing = false;
                  this.loading = false;
                  this.dialog.open(AlertComponent, {
                    data: {
                      title: '',
                      messageText: `Subscription ${this.subscription.name} was launched.`,
                    },
                  });
                },
                (error) => {
                  this.processing = false;
                  this.loading = false;
                  this.dialog.open(AlertComponent, {
                    data: {
                      title: 'Error',
                      messageText:
                        'An error occurred launching the subscription: ' +
                        JSON.stringify(error.error),
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
        this.loading = true;
        this.loadingText = 'Stopping subscription';
        this.processing = true;
        this.subscriptionSvc.stopSubscription(this.subscription._id).subscribe(
          () => {
            this.subscriptionSvc
              .getSubscription(this.subscription._id)
              .subscribe((resp: SubscriptionModel) => {
                this.subscription = resp;
              });
            this.enableDisableFields();
            this.processing = false;
            this.loading = false;
            this.dialog.open(AlertComponent, {
              data: {
                title: '',
                messageText: `Subscription ${this.subscription.name} was stopped`,
              },
            });
          },
          (error) => {
            this.processing = false;
            this.loading = false;
            this.dialog.open(AlertComponent, {
              data: {
                title: 'Error',
                messageText:
                  'An error occurred stopping the subscription: ' +
                  JSON.stringify(error.error),
              },
            });
          }
        );
      }
    });
  }

  /**
   * Submits the form to create or save a Subscription.
   */
  save() {
    if (!this.subValid()) {
      return;
    }

    if (this.startBeforeAppendixDate) {
      return;
    }

    this.saving = true;
    this.loading = true;
    this.loadingText = 'Saving subscription';

    const sub = this.subscriptionSvc.subscription;

    sub.customer_id = this.customer._id;
    sub.primary_contact = this.primaryContact;
    sub.admin_email = this.f.adminEmail.value;
    sub.operator_email = this.f.operatorEmail.value;
    sub.active = true;

    if (typeof this.f.startDate.value === 'string') {
      this.f.startDate.setValue(new Date(this.f.startDate.value));
    }
    sub.start_date = this.f.startDate.value;

    // set the target list
    const csv = this.f.csvText.value;
    sub.target_email_list = this.buildTargetsFromCSV(csv);

    if (this.pageMode === 'CREATE') {
      sub.target_email_list = sub.target_email_list;
    }
    sub.target_domain = this.target_email_domain.value;
    sub.sending_profile_id = this.f.sendingProfile.value;

    sub.continuous_subscription = this.f.continuousSubscription.value;
    sub.reporting_password = this.f.reportingPassword.value;
    sub.landing_page_url = this.f.landingPageURL.value;
    sub.landing_domain = this.f.landingPageDomain.value;
    const cycleLength: number = +this.f.cycle_length_minutes.value;
    const cooldownLength: number = +this.f.cooldown_minutes.value;
    const reportLength: number = +this.f.report_frequency_minutes.value;
    const bufferTimeLength: number = +this.f.bufferTime.value;
    sub.cycle_length_minutes = cycleLength;
    sub.report_frequency_minutes = reportLength;
    sub.cooldown_minutes = cooldownLength;
    sub.buffer_time_minutes = bufferTimeLength;
    this.setTemplatesSelected();
    sub.templates_selected = this.subscription.templates_selected;

    // call service with everything needed to start the subscription
    this.processing = true;
    if (this.pageMode === 'CREATE') {
      this.createSubscription(sub);
    } else if (this.pageMode === 'EDIT') {
      this.updateSubscription(sub);
    }
  }

  createSubscription(sub: SubscriptionModel) {
    this.subscriptionSvc.submitSubscription(sub).subscribe(
      (resp: any) => {
        this.loading = false;
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
        this.loading = false;
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Error',
            messageText:
              'An error occurred submitting the subscription: ' +
              JSON.stringify(error.error),
          },
        });
      }
    );
  }

  updateSubscription(sub: SubscriptionModel) {
    this.subscriptionSvc.patchSubscription(sub).subscribe(
      (resp: any) => {
        this.loading = false;
        this.dialog.open(AlertComponent, {
          data: {
            title: '',
            messageText: 'Your subscription has been saved',
          },
        });
        this.processing = false;
      },
      (error) => {
        this.processing = false;
        this.loading = false;
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Error',
            messageText:
              'An error occurred submitting the subscription: ' +
              JSON.stringify(error.error),
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
    if (status === 'running') {
      this.f.startDate.disable();
      this.f.sendingProfile.disable();
      this.f.targetDomain.disable();
      this.f.subDisplayTime.disable();
      this.f.subTimeUnit.disable();
      this.f.cooldownDisplayTime.disable();
      this.f.cooldownTimeUnit.disable();
      this.f.reportDisplayTime.disable();
      this.f.reportTimeUnit.disable();
      //this.f.csvText.disable();
    } else {
      this.f.startDate.enable();
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
    this.subscription.target_email_list = this.buildTargetsFromCSV(
      this.f.csvText.value
    );

    if (removeDupes) {
      const uniqueArray: TargetModel[] =
        this.subscription.target_email_list.filter((t1, index) => {
          return (
            index ===
            this.subscription.target_email_list.findIndex((t2) => {
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
  public buildTargetsFromCSV(csv: string): TargetModel[] {
    const targetList: TargetModel[] = [];
    if (!csv) {
      return [];
    }

    const lines = csv.trim().split('\n');
    lines.forEach((line: string) => {
      const parts = line.split(',');
      while (parts.length < 4) {
        parts.push('');
      }

      const t = new TargetModel();
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
  formatTargetsToCSV(targetList: TargetModel[]) {
    if (!targetList) {
      return '';
    }
    let output = '';
    targetList.forEach((t: TargetModel) => {
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
  invalidCsv(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const lines = control.value.split('\n');
      if (lines[0] === '') {
        return null;
      }
      const domains = this.getDomains();
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length !== 4) {
          return { invalidTargetCsv: true };
        }

        if (parts[0].trim() === '') {
          return { invalidTargetCsv: true };
        }

        const validEmailResp = this.validateEmail(parts[0], domains);
        if (validEmailResp) {
          return { invalidEmailFormat: true };
        }
      }

      return null;
    };
  }

  isStartDateBeforeAADate() {
    if (this.customer) {
      this.appendixADate = new Date(this.customer.appendix_a_date);
    }
    if (this.appendixADate && this.f.startDate.value < this.appendixADate) {
      console.log('Start Date can not be before the Appendix A Date');
      this.startBeforeAppendixDate = true;
      return;
    }
    this.startBeforeAppendixDate = false;
  }

  validDomain(control: FormControl) {
    const exprEmail =
      /^@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // const lines = control.value.split('\n');
    if (control.value) {
      const parts = control.value.split(',');
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!exprEmail.test(trimmedPart.toLowerCase())) {
          return { invalidDomain: true };
        }
      }

      const value = control.value;
      if (value == null) {
        return null;
      }
    }

    return null;
  }

  domainListValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const domains = this.getDomains();

      const lines = control.value.split('\n');
      if (lines[0] === '') {
        return null;
      }
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length !== 4) {
          return { invalidTargetCsv: true };
        }
        if (parts[0].trim() === '') {
          return { invalidTargetCsv: true };
        }

        if (domains.length === 0) {
          return { noTargetDomain: true };
        }

        const validEmailResp = this.validateEmail(parts[0], domains);
        if (validEmailResp) {
          return validEmailResp;
        }
      }

      return null;
    };
  }

  getDomains() {
    const domains = [];
    const sub = this.target_email_domain.subscribe((val: string) => {
      if (val) {
        const splitDomains = val.split(',');
        for (const d of splitDomains) {
          domains.push(d.trim());
        }
      }
    });
    sub.unsubscribe();
    return domains;
  }

  validateEmail(email, domains: string[]) {
    const exprEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!!email && !exprEmail.test(email.toLowerCase())) {
      return { invalidEmailFormat: true };
    }
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return { invalidEmailFormat: true };
    }

    let domainNotFound = true;
    for (const domain of domains) {
      if ('@' + emailParts[1].toLowerCase() === domain.toLowerCase()) {
        domainNotFound = false;
        break;
      }
    }
    if (domainNotFound) {
      return { emailDoesntMatchDomain: email };
    }

    return false;
  }

  getValidationMessage() {
    // const errors = this.reportedStatsForm.controls[control].errors;
    Object.keys(this.subscribeForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.subscribeForm.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((element) => {
          this.validationErrors[element] = controlErrors[element];
        });
      }
    });
  }

  checkValid(setError = true) {
    const cycleLength: number = +this.f.cycle_length_minutes.value;
    const targetCount = this.f.csvText.value.trim().split('\n').length;
    const status = this.subscription?.status?.toLowerCase();
    this.subscriptionSvc
      .checkValid(cycleLength, targetCount)
      .subscribe((resp: any) => {
        this.hourlyRate = resp.hourly_rate;
        this.dailyRate = resp.daily_rate;
        this.currentDailyRate = resp.current_daily_rate;
        if (setError) {
          if (resp.success) {
            this.isValidConfig = true;
          } else {
            console.log(resp.message);
            if (status !== 'running') {
              this.isValidConfig = false;
              this.validConfigMessage = resp.message;
            }
          }
        }
      });
  }

  setIgnoreConfigError(event: MatCheckboxChange) {
    this.ignoreConfigError = event.checked;
  }

  changeTemplate(template = null) {
    const templateData = {
      selected: this.templatesSelected,
      available: this.templatesAvailable,
      template: template,
    };

    const dialogRef = this.dialog.open(TemplateSelectDialogComponent, {
      data: templateData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.setTemplatesSelected();
    });
  }
  async randomizeTemplates() {
    await this.getRandomTemplates();
    this.setTemplatesSelected();
  }

  async getTemplates() {
    this.templatesAvailable = await this.templateSvc.getAllTemplates();
    this.removeSelectedFromAvailable();
  }

  removeSelectedFromAvailable() {
    this.templatesSelected.forEach((selec) => {
      for (let i = 0; i < this.templatesAvailable.length; i++) {
        if (this.templatesAvailable[i]._id === selec._id) {
          this.templatesAvailable.splice(i, 1);
          i = this.templatesAvailable.length;
        }
      }
    });
  }

  setTemplatesSelected() {
    // Loop through keys in templatesSelected
    this.templatesSelected.forEach(() => {
      this.subscription.templates_selected = this.templatesSelected.map(
        (item: any) => item._id
      );
    });
  }

  removeInvalidEmails() {
    const textInput = this.f.csvText.value;
    const invalidEmails = [];
    const domains = this.getDomains();
    const lines = textInput.split('\n');
    let index = 0;
    for (const line of lines) {
      const parts = line.split(',');
      if (this.validateEmail(parts[0], domains)) {
        invalidEmails.push({
          val: parts[0],
          index,
        });
      }
      index += 1;
    }

    const dialogRef = this.dialog.open(InvalidEmailDialogComponent, {
      data: invalidEmails,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (Array.isArray(result)) {
        if (result.length > 0) {
          let newCSVText = '';
          index = 0;
          for (const line of lines) {
            if (result.indexOf(index) === -1) {
              newCSVText += `${line} \n`;
            }
            index += 1;
          }
          this.f.csvText.setValue(newCSVText);
          this.f.csvText.updateValueAndValidity();
        }
      }
    });
  }

  getSendingProfileDomains() {
    const sendingProfileIds = this.templatesSelected.map(
      (t) => t.sending_profile_id
    );
    sendingProfileIds.push(this.f.sendingProfile.value);
    const profiles = this.sendingProfiles;
    this.sendingProfileDomains = new Set(
      profiles.map((p) => p.from_address.split('@')[1])
    );
    return this.sendingProfileDomains;
  }

  getSendingProfileIps() {
    const sendingProfileIds = this.templatesSelected.map(
      (t) => t.sending_profile_id
    );
    sendingProfileIds.push(this.f.sendingProfile.value);
    const profiles = this.sendingProfiles.filter((s) =>
      sendingProfileIds.includes(s._id)
    );
    const ips = new Set();
    profiles.forEach((p) => {
      if (p.sending_ips) {
        p.sending_ips.split(',').forEach((i) => {
          ips.add(i);
        });
      }
    });
    this.sendingProfileIps = ips;
    return ips;
  }

  rotateHeader() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to rotate the header?<br /><br />Note: This will not affect currently running cycles, but you will need to provide the new value to the customer for future cycles.`;
    dialogRef.componentInstance.title = `Rotate Header`;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subscriptionSvc
          .rotateHeader(this.subscription._id)
          .subscribe((data) => {
            this.subscription.phish_header = data.phish_header;
          });
      }
    });
  }

  getTemplateFromAddress(template: TemplateModel) {
    const fromAddress = template.from_address;
    let sendingProfile = null;
    if (template.sending_profile_id) {
      const profiles = this.sendingProfiles.filter(
        (s: SendingProfileModel) => s._id == template.sending_profile_id
      );
      if (profiles.length > 0) {
        sendingProfile = profiles[0];
      }
    } else {
      const profiles = this.sendingProfiles.filter(
        (s: SendingProfileModel) => s._id == this.f.sendingProfile.value
      );
      if (profiles.length > 0) {
        sendingProfile = profiles[0];
      }
    }

    if (!sendingProfile) {
      return fromAddress;
    } else {
      const fromArray = sendingProfile.from_address.split('@');
      const domain = fromArray[fromArray.length - 1].replace('>', '');
      return fromAddress.replace('@domain.com', `@${domain}`);
    }
  }

  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  exportSafelist() {
    this.subscriptionSvc
      .exportSafelist(
        this.subscription._id,
        this.subscription.phish_header,
        Array.from(this.sendingProfileDomains),
        Array.from(this.sendingProfileIps),
        this.subscription.landing_domain,
        this.templatesSelected,
        this.subscription.reporting_password
      )
      .subscribe(
        (blob) => {
          this.downloadObject(
            `${this.subscription.name}_safelist_export.xlsx`,
            blob
          );
        },
        (error) => {
          console.log(error);
        }
      );
  }

  sendSafelist() {
    this.subscriptionSvc.sendSafelist(this.subscription._id).subscribe(
      () => {
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Email Sent',
            messageText: 'Safelisting notification email has been sent.',
          },
        });
      },
      (error) => {
        console.log(error);
        this.alertsService.alert('Error: Email failed to send.');
      }
    );
  }

  randomizePassword() {
    this.subscriptionSvc.getRandomPassword().subscribe((resp: any) => {
      this.f.reportingPassword.setValue(resp.password);
      this.hideReportingPassword = false;
    });
  }
}
