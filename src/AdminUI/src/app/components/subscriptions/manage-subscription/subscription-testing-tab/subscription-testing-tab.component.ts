import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { error } from 'protractor';
import { ConfirmComponent } from 'src/app/components/dialogs/confirm/confirm.component';
import { GenericViewComponent } from 'src/app/components/dialogs/generic-view/generic-view.component';
import { ContactModel, CustomerModel } from 'src/app/models/customer.model';
import {
  SubscriptionModel,
  SubscriptionTestResultsModel,
} from 'src/app/models/subscription.model';
import { CustomerService } from 'src/app/services/customer.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

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

  contactColumns = ['email', 'firstName', 'lastName'];

  resultColumns = ['template', 'email', 'sent', 'clicked'];

  constructor(
    public customerSvc: CustomerService,
    public subscriptionSvc: SubscriptionService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptionSvc.subBehaviorSubject.subscribe((data) => {
      if ('_id' in data) {
        this.subscription = data;
        this.customerSvc.getCustomer(data.customer_id).subscribe((c) => {
          this.customer = c;
        });
        this.getResults();
      }
    });
  }

  changeContacts() {
    this.router.navigate(['/customer', this.customer._id]);
  }

  launchTest() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to launch a test for ${this.subscription.name}?`;
    dialogRef.componentInstance.title = 'Confirm Launch Test';
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.launching = true;
        this.subscriptionSvc.testSubscription(this.subscription._id).subscribe(
          (data) => {
            this.testResults = data;
            this.launching = false;
          },
          (error) => {
            console.log(error);
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
    this.dialog.open(GenericViewComponent, {
      data: {
        email: result.email,
        template: result.template.name,
        subject: result.template.subject,
        timeline: result.timeline,
        sent: result.sent,
        sentDate: result.sent_date,
        opened: result.opened,
        clicked: result.clicked,
      },
    });
  }
}