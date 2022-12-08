import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LandingDomainModel } from 'src/app/models/landing-domains.model';
import { LandingDomainService } from 'src/app/services/landing-domain.service';
import { AlertComponent } from '../../dialogs/alert/alert.component';

@Component({
  selector: 'app-landing-domain-detail',
  templateUrl: './landing-domain-detail.component.html',
  styleUrls: ['./landing-domain-detail.component.scss'],
})
export class LandingDomainDetailComponent implements OnInit {
  mode = 'new';
  domainForm: FormGroup;
  landingDomain = new LandingDomainModel();

  constructor(
    public dialogRef: MatDialogRef<LandingDomainDetailComponent>,
    public landingDomainSvc: LandingDomainService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data.landingDomain) {
      this.landingDomain = data.landingDomain;
    }
  }

  ngOnInit(): void {
    this.domainForm = new FormGroup({
      domain: new FormControl('', Validators.required),
    });

    if (this.landingDomain._id) {
      this.mode = 'edit';
      this.f.domain.setValue(this.landingDomain.domain);
    }
  }

  get f() {
    return this.domainForm.controls;
  }

  save() {
    if (this.domainForm.valid) {
      const data = new LandingDomainModel();
      this.landingDomain.domain = this.f.domain.value;
      this.landingDomainSvc.saveLandingDomain(this.landingDomain).subscribe(
        () => {
          this.dialogRef.close();
        },
        (error) => {
          console.log(error);
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Save Error',
              messageText: `Error: ${JSON.stringify(error.error)}`,
            },
          });
        },
      );
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
