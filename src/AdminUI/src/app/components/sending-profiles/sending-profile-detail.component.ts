import Swal from 'sweetalert2';
import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { SendingProfileModel } from 'src/app/models/sending-profile.model';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TestEmailModel } from 'src/app/models/test-email.model';
import { AlertComponent } from '../dialogs/alert/alert.component';

@Component({
  selector: 'app-sending-profile-detail',
  templateUrl: './sending-profile-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendingProfileDetailComponent implements OnInit {
  /**
   * NEW or EDIT
   */
  mode = 'new';
  testEmail = '';

  profileForm: FormGroup;
  profile: SendingProfileModel;
  id: string;
  submitted = false;

  /**
   * Constructor.
   */
  constructor(
    private sendingProfileSvc: SendingProfileService,
    public dialogRef: MatDialogRef<SendingProfileDetailComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id = data.sending_profile_id;
  }

  /**
   * convenience getter for easy access to form fields
   */
  get f() {
    return this.profileForm.controls;
  }

  /**
   *
   */
  ngOnInit(): void {
    this.profileForm = new FormGroup({
      name: new FormControl('', Validators.required),
      interfaceType: new FormControl('SMTP', Validators.required),
      from: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^\\s*([A-Za-z\\d\\s]+?)\\s*<([\\w.!#$%&’*+\\/=?^_`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+)>\\s*$|^\\s*([\\w.!#$%&’*+\\/=?^_`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+)\\s*$'
        ),
      ]),
      sendingIpAddress: new FormControl(''),
      // SMTP
      host: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl(''),

      // Mailgun
      mailgunApiKey: new FormControl(''),
      mailgunDomain: new FormControl(''),
    });

    if (!!this.id) {
      this.mode = 'edit';
      this.sendingProfileSvc.getProfile(this.id).subscribe(
        (data: any) => {
          this.profile = data as SendingProfileModel;
          this.f.name.setValue(this.profile.name);
          this.f.interfaceType.setValue(this.profile.interface_type);
          this.f.from.setValue(this.profile.from_address);
          this.f.sendingIpAddress.setValue(this.profile.sending_ips);
          if (this.profile.interface_type === 'SMTP') {
            this.f.host.setValue(this.profile.smtp_host);
            this.f.username.setValue(this.profile.smtp_username);
            this.f.password.setValue(this.profile.smtp_password);
          } else if (this.profile.interface_type === 'Mailgun') {
            this.f.mailgunApiKey.setValue(this.profile.mailgun_api_key);
            this.f.mailgunDomain.setValue(this.profile.mailgun_domain);
          }
        },
        (err) => {
          console.log('send profile error:');
          console.log(err);
        }
      );
    }
  }

  /**
   *
   */
  onSaveClick() {
    let sp: SendingProfileModel;
    this.submitted = true;

    if (this.profileForm.valid) {
      sp = this.save();
      this.sendingProfileSvc.saveProfile(sp).subscribe(
        () => {
          this.dialogRef.close();
        },
        (error) => {
          console.log(error.error);
          `An error occurred: ${error.error.error}`;
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Sending Profile Error',
              messageText: `Error: ${error.error.error}`,
            },
          });
        }
      );
    } else {
      //non valid form, collect nonvalid fields and display to user
      const invalid = [];
      const controls = this.profileForm.controls;
      for (var name in controls) {
        if (controls[name].invalid) {
          if (name == 'from') {
            controls[name].hasError('pattern');
            name = 'From as a valid Email';
          }
          invalid.push(this.capitalizeFirstLetter(name));
        }
      }
      this.dialog.open(AlertComponent, {
        data: {
          title: 'Missing Required Information',
          messageText: '',
          invalidData: invalid,
        },
      });
    }
  }

  capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  save() {
    if (this.profileForm.invalid) {
      console.log(this.f.from.errors);
      return;
    }

    const sp = new SendingProfileModel();
    sp.name = this.f.name.value;
    sp.interface_type = this.f.interfaceType.value;
    sp.from_address = this.f.from.value;
    sp.sending_ips = this.f.sendingIpAddress.value;

    if (sp.interface_type === 'SMTP') {
      sp.smtp_username = this.f.username.value;
      sp.smtp_password = this.f.password.value;
      sp.smtp_host = this.f.host.value;
    } else if (sp.interface_type === 'Mailgun') {
      sp.mailgun_api_key = this.f.mailgunApiKey.value;
      sp.mailgun_domain = this.f.mailgunDomain.value;
    }

    if (this.id) {
      sp._id = this.id;
    }
    return sp;
  }

  /**
   *
   */
  onCancelClick() {
    this.dialogRef.close();
  }

  onSendTestClick() {
    let sp: SendingProfileModel;
    sp = this.save();
    sp.from_address = this.getEmailFromBrackets(sp.from_address);
    let email_for_test: TestEmailModel = {
      template: null, //template name to be used in the test
      first_name: 'test',
      last_name: 'test',
      email: this.testEmail,
      position: 'tester',
      url: '',
      smtp: sp,
      customer_id: null,
    };

    this.sendingProfileSvc.sendTestEmail(email_for_test).subscribe(
      (data: any) => {
        Swal.fire('Email Sent.');
      },
      (error) => {
        console.log(error);
        Swal.fire(error);
      }
    );
  }

  getEmailFromBrackets(email_with_brackets: string) {
    var regex = /.+\<(.+@.+)>/g;
    if (regex.test(email_with_brackets)) {
      var match = regex.exec(email_with_brackets);
      return match[0];
    }
    return email_with_brackets;
  }
}
