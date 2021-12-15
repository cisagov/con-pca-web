import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { LandingPageManagerService } from 'src/app/services/landing-page-manager.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TemplateModel } from 'src/app/models/template.model';
import { LandingPageModel } from 'src/app/models/landing-page.models';

@Component({
  selector: 'app-retire-template-dialog',
  templateUrl: './retire-template-dialog.component.html',
  styleUrls: ['../template-manager.component.scss'],
  host: { class: 'd-flex flex-column flex-11a' },
})
export class RetireTemplateDialogComponent implements OnInit {
  template: TemplateModel;
  retiredDescription: string;
  canRetire: boolean;

  constructor(
    public dialogRef: MatDialogRef<RetireTemplateDialogComponent>,
    public templateSvc: TemplateManagerService,
    public landingSvc: LandingPageManagerService,
    @Inject(MAT_DIALOG_DATA) data: TemplateModel
  ) {
    this.template = data;
  }

  ngOnInit(): void {}

  updateReason(): void {
    if (this.retiredDescription !== '' && this.retiredDescription != null) {
      this.canRetire = true;
    } else {
      this.canRetire = false;
    }
  }

  retire(): void {
    this.template.retired = true;
    this.template.retired_description = this.retiredDescription;
    this.templateSvc.updateTemplate(this.template).then(
      () => {
        this.dialogRef.close({
          retired: true,
          description: this.retiredDescription,
        });
      },
      (error) => {
        this.dialogRef.close({ error: error.error });
      }
    );
  }

  cancel(): void {
    this.dialogRef.close({ retired: false });
  }

  onNoClick(): void {
    this.dialogRef.close({ retired: false });
  }
}
