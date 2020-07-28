import { Component, OnInit, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { SendingProfile } from 'src/app/models/sending-profile.model';

@Component({
  selector: 'app-sending-profile-detail',
  templateUrl: './sending-profile-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SendingProfileDetailComponent implements OnInit {
  /**
   * NEW or EDIT
   */
  mode = 'new';

  profileForm: FormGroup;
  profile: SendingProfile;
  id: number;
  headers: Map<string, string>;
  submitted = false;


  /**
   * Constructor.
   */
  constructor(
    private sendingProfileSvc: SendingProfileService,
    private changeDetector: ChangeDetectorRef,
    public dialog_ref: MatDialogRef<SendingProfileDetailComponent>,
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
      newHeaderValue: new FormControl('')
    });

    if (!!this.id) {
      this.mode = 'edit';

      this.sendingProfileSvc.getProfile(this.id).subscribe((data: any) => {
        this.profile = data as SendingProfile;

        this.f.name.setValue(this.profile.name);
        this.f.interfaceType.setValue(this.profile.interface_type);
        this.f.from.setValue(this.profile.from_address);
        this.f.host.setValue(this.profile.host);
        this.f.username.setValue(this.profile.username);
        this.f.password.setValue(this.profile.password);
        this.f.ignoreCertErrors.setValue(this.profile.ignore_cert_errors);
        this.headers = new Map<string, string>();
        for (const h of this.profile.headers) {
          this.headers.set(h.key, h.value);
        }
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

    this.headers.set(key, this.f.newHeaderValue.value.trim());
    this.f.newHeaderName.setValue('');
    this.f.newHeaderValue.setValue('');
  }


  /**
   * Deletes a custom email header from the internal list.
   */
  deleteHeader(headerKey: any) {
    this.headers.delete(headerKey);
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
    if (!!this.headers) {
      for (const [key, value] of this.headers) {
        const h = {
          key, value
        };
        sp.headers.push(h);
      }
    }

    if (this.id) {
      sp.id = this.id;
    }

    this.sendingProfileSvc.saveProfile(sp).subscribe(() => {
      this.dialog_ref.close();
    });
  }

  /**
   *
   */
  onCancelClick() {
    this.dialog_ref.close();
  }
}
