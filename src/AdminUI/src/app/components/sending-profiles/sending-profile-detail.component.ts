import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy, ViewChild
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { SendingProfile } from 'src/app/models/sending-profile.model';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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

  profileForm: FormGroup;
  profile: SendingProfile;
  id: number;

  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = [
    'header',
    'value',
    'actions'
  ];

  headerList: MatTableDataSource<CustomHeader>;
  submitted = false;

  /**
   * Constructor.
   */
  constructor(
    private sendingProfileSvc: SendingProfileService,
    private changeDetector: ChangeDetectorRef,
    public dialogRef: MatDialogRef<SendingProfileDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id = data.sendingProfileId;
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
      interfaceType: new FormControl(''),
      from: new FormControl('', [Validators.required, Validators.email]),
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
          this.profile = data as SendingProfile;

          this.f.name.setValue(this.profile.name);
          this.f.interfaceType.setValue(this.profile.interface_type);
          this.f.from.setValue(this.profile.from_address);
          this.f.host.setValue(this.profile.host);
          this.f.username.setValue(this.profile.username);
          this.f.password.setValue(this.profile.password);
          this.f.ignoreCertErrors.setValue(this.profile.ignore_cert_errors);
          this.headerList = new MatTableDataSource<CustomHeader>();
          for (const h of this.profile.headers) {
            const headerListItem = new CustomHeader();
            headerListItem.header = h.key;
            headerListItem.value = h.value;
            this.headerList.data.push(headerListItem);
          }
          this.headerList.sort = this.sort;
        },
        (err) => {
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
    this.headerList.data = this.headerList.data.filter(x => x.header !== headerToDelete.header);
  }

  /**
   *
   */
  onSaveClick() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    const sp = new SendingProfile();
    sp.name = this.f.name.value;
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
          value: ch.value
        };
        sp.headers.push(h);
      }
    }

    if (this.id) {
      sp.id = this.id;
    }

    this.sendingProfileSvc.saveProfile(sp).subscribe(() => {
      this.dialogRef.close();
    });
  }

  /**
   *
   */
  onCancelClick() {
    this.dialogRef.close();
  }
}

export class CustomHeader {
  header: string;
  value: string;
}
