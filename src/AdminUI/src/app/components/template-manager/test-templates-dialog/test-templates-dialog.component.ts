import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerModel } from 'src/app/models/customer.model';
import { SendingProfileModel } from 'src/app/models/sending-profile.model';
import { TemplateModel } from 'src/app/models/template.model';
import { TestEmailModel } from 'src/app/models/test-email.model';
import { AlertsService } from 'src/app/services/alerts.service';
import { CustomerService } from 'src/app/services/customer.service';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';

@Component({
  selector: 'app-test-templates-dialog',
  templateUrl: './test-templates-dialog.component.html',
  styleUrls: ['./test-templates-dialog.component.scss'],
})
export class TestTemplatesDialogComponent implements OnInit {
  templates: TemplateModel[];
  sendingProfiles: SendingProfileModel[];
  customers: CustomerModel[];

  // Form Data
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  sendingProfile: SendingProfileModel;
  customer: CustomerModel;

  constructor(
    public dialogRef: MatDialogRef<TestTemplatesDialogComponent>,
    public templateSvc: TemplateManagerService,
    public sendingProfileSvc: SendingProfileService,
    public customerSvc: CustomerService,
    public alertsSvc: AlertsService,
    @Inject(MAT_DIALOG_DATA) data: TemplateModel[]
  ) {
    this.templates = data;
  }

  ngOnInit(): void {
    this.customerSvc.getCustomers().subscribe((data) => {
      this.customers = data;
    });
    this.sendingProfileSvc.getAllProfiles().subscribe((data) => {
      this.sendingProfiles = data;
    });
  }

  test() {
    for (const template of this.templates) {
      const testEmail: TestEmailModel = {
        template,
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        position: this.position,
        url: '',
        smtp: this.sendingProfile,
        customer_id: this.customer._id,
      };

      this.sendingProfileSvc.sendTestEmail(testEmail).subscribe(
        () => {},
        (error) => {
          this.alertsSvc.alert(error);
          console.log(error);
        }
      );
    }
    this.alertsSvc.alert('Emails sent for testing.');
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
