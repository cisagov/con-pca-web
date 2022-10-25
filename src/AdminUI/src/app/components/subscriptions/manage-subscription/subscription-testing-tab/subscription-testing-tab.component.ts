import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { ConfirmComponent } from 'src/app/components/dialogs/confirm/confirm.component';
import { ContactModel, CustomerModel } from 'src/app/models/customer.model';
import {
  SubscriptionModel,
  SubscriptionTestResultsModel,
} from 'src/app/models/subscription.model';
import { AlertsService } from 'src/app/services/alerts.service';
import { CustomerService } from 'src/app/services/customer.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { TemplateDataDialogComponent } from './template-data-dialog/template-data-dialog.component';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-subscription-testing-tab',
  templateUrl: './subscription-testing-tab.component.html',
  styleUrls: ['./subscription-testing-tab.component.scss'],
})
export class SubscriptionTestingTabComponent implements OnInit {
  subscription: SubscriptionModel;
  contacts: ContactModel[];
  customer: CustomerModel;
  testResults: SubscriptionTestResultsModel[];
  launching = false;
  launchingText = 'Test Launch in Progress';

  contactColumns = ['select', 'email', 'firstName', 'lastName'];

  resultColumns = ['template', 'email', 'sent', 'clicked'];

  contactList: ContactModel[];

  n = 0;

  // Contact selection
  selection = new SelectionModel<ContactModel>(true, []);

  // Appendix A Date
  appendixADate = new Date();
  startBeforeAppendixDate = false;

  constructor(
    public alertsService: AlertsService,
    public customerSvc: CustomerService,
    public subscriptionSvc: SubscriptionService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.subscriptionSvc.subBehaviorSubject.subscribe((data) => {
      if ('_id' in data) {
        this.subscription = data;
        this.customerSvc.getCustomer(data.customer_id).subscribe((c) => {
          this.customer = c;
          this.contactList = this.customer.contact_list;
          if (this.subscription.admin_email) {
            const adminName = this.subscription.admin_email
              .split('@')[0]
              .split('.');
            this.contactList.push({
              email: this.subscription.admin_email,
              first_name: adminName[0],
              last_name: adminName[1],
            } as ContactModel);
          }
          if (this.subscription.operator_email) {
            const operatorName = this.subscription.operator_email
              .split('@')[0]
              .split('.');
            this.contactList.push({
              email: this.subscription.operator_email,
              first_name: operatorName[0],
              last_name: operatorName[1],
            } as ContactModel);
          }
          this.isStartDateBeforeAADate();
        });
        this.getResults();
      }
    });
  }

  changeContacts() {
    this.router.navigate(['/customer', this.customer._id]);
  }

  launchTest() {
    if (this.selection.selected.length < 1) {
      this.dialog.open(AlertComponent, {
        data: {
          title: 'Select Contacts',
          messageText: 'At least a single contact needs to be selected',
        },
      });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to launch a test for ${this.subscription.name}?`;
    dialogRef.componentInstance.title = 'Confirm Launch Test';
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.launching = true;
        this.subscriptionSvc
          .testSubscription(this.subscription._id, this.selection.selected)
          .subscribe(
            (data) => {
              this.testResults = data;
              this.launching = false;
            },
            (error) => {
              console.log(error);
              this.alertsService.alert(error.error);
              this.launching = false;
            }
          );
      }
    });
  }

  getResults() {
    this.subscriptionSvc
      .getTestResults(this.subscription._id)
      .subscribe((data) => {
        this.testResults = data;
      });
  }

  detailResults(result: SubscriptionTestResultsModel) {
    this.dialog.open(TemplateDataDialogComponent, {
      data: {
        template: result.template,
        email: result.email,
        name: result.template.name,
        subject: result.template.subject,
        timeline: result.timeline,
        sent: result.sent,
        sentDate: result.sent_date,
        opened: result.opened,
        clicked: result.clicked,
      },
    });
  }

  toTemplateDetails(result: SubscriptionTestResultsModel) {
    this.router.navigate(['/templatemanager', result.template._id]);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.customer.contact_list.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.customer.contact_list.forEach((row) => this.selection.select(row));
  }

  // Start Date is before Appendix A Date
  isStartDateBeforeAADate() {
    this.appendixADate = new Date(this.customer.appendix_a_date);
    if (this.subscription.start_date < this.appendixADate) {
      console.log('Start Date can not be before the Appendix A Date');
      this.startBeforeAppendixDate = true;
      return;
    }
    this.startBeforeAppendixDate = false;
  }

  public overload() {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/subscription/${this.subscription._id}/test/?overload=true&number_of_tasks=${this.n}`,
      ''
    );
  }

  taskOverloadTest() {
    this.overload().subscribe(
      () => {},
      (error) => {
        console.log(error.error);
      }
    );
  }
}
