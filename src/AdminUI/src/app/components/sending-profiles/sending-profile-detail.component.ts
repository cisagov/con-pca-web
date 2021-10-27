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

  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['header', 'value', 'actions'];

  headerList: MatTableDataSource<CustomHeader> =
    new MatTableDataSource<CustomHeader>();
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
      landingPageDomain: new FormControl('', Validators.required),
      interfaceType: new FormControl({ value: 'SMTP', disabled: true }),
      from: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^\\s*([A-Za-z\\d\\s]+?)\\s*<([\\w.!#$%&’*+\\/=?^_`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+)>\\s*$|^\\s*([\\w.!#$%&’*+\\/=?^_`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+)\\s*$'
        ),
      ]),
      host: new FormControl('', Validators.required),
      username: new FormControl(''),
      password: new FormControl(''),
      ignoreCertErrors: new FormControl(false),
      newHeaderName: new FormControl(''),
      newHeaderValue: new FormControl(''),
    });

    if (!!this.id) {
      this.mode = 'edit';
      this.sendingProfileSvc.getProfile(this.id).subscribe(
        (data: any) => {
          this.profile = data as SendingProfileModel;
          this.f.name.setValue(this.profile.name);
          this.f.landingPageDomain.setValue(this.profile.landing_page_domain);
          this.f.interfaceType.setValue(this.profile.interface_type);
          this.f.from.setValue(this.profile.from_address);
          this.f.host.setValue(this.profile.host);
          this.f.username.setValue(this.profile.username);
          this.f.password.setValue(this.profile.password);
          this.f.ignoreCertErrors.setValue(this.profile.ignore_cert_errors);
          this.headerList = new MatTableDataSource<CustomHeader>();
          if (this.profile.headers) {
            for (const h of this.profile.headers) {
              const headerListItem = new CustomHeader();
              headerListItem.header = h.key;
              headerListItem.value = h.value;
              this.headerList.data.push(headerListItem);
            }
          }
          this.headerList.sort = this.sort;
        },
        (err) => {
          console.log('send profile error:');
          console.log(err);
        }
      );
    }
  }

  /**
   * Adds a custom email header to the internal list.
   */
  addHeader() {
    const key = this.f.newHeaderName.value.trim();
    if (key === '') {
      return;
    }

    if (!this.headerList) {
      this.headerList = new MatTableDataSource<CustomHeader>();
    }

    const data = this.headerList.data;
    const newHeader = new CustomHeader();
    newHeader.header = key;
    newHeader.value = this.f.newHeaderValue.value.trim();
    data.push(newHeader);
    this.headerList.data = data;

    this.f.newHeaderName.setValue('');
    this.f.newHeaderValue.setValue('');
  }

  /**
   * Deletes a custom email header from the internal list.
   */
  deleteHeader(headerToDelete: any) {
    this.headerList.data = this.headerList.data.filter(
      (x) => x.header !== headerToDelete.header
    );
  }

  /**
   *
   */
  onSaveClick() {
    let sp: SendingProfileModel;
    this.submitted = true;

    if (this.profileForm.valid) {
      sp = this.save();
      this.sendingProfileSvc.saveProfile(sp).subscribe(() => {
        this.dialogRef.close();
      });
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
    sp.landing_page_domain = this.f.landingPageDomain.value;
    sp.username = this.f.username.value;
    sp.password = this.f.password.value;
    sp.host = this.f.host.value;
    sp.interface_type = this.f.interfaceType.value;
    sp.from_address = this.f.from.value;
    sp.ignore_cert_errors = this.f.ignoreCertErrors.value;
    sp.headers = [];

    if (!!this.headerList.data) {
      for (const ch of this.headerList.data) {
        const h = {
          key: ch.header,
          value: ch.value,
        };
        sp.headers.push(h);
      }
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
        console.log(data);
        Swal.fire(data.message);
      },
      (error) => {
        console.log(
          'Error sending test email: ' +
            (<Error>error).name +
            (<Error>error).message
        );
        console.log(error);
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

export class CustomHeader {
  header: string;
  value: string;
}
