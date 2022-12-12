import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { LandingPageManagerService } from 'src/app/services/landing-page-manager.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TemplateModel } from 'src/app/models/template.model';

@Component({
  selector: 'app-restore-template-dialog',
  templateUrl: './restore-templates-dialog.component.html',
  styleUrls: ['../template-manager.component.scss'],
  host: { class: 'd-flex flex-column flex-11a' },
})
export class RestoreTemplatesDialogComponent implements OnInit {
  templates: TemplateModel[];
  canRetire: boolean;

  constructor(
    public dialogRef: MatDialogRef<RestoreTemplatesDialogComponent>,
    public templateSvc: TemplateManagerService,
    public landingSvc: LandingPageManagerService,
    @Inject(MAT_DIALOG_DATA) data: TemplateModel[],
  ) {
    this.templates = data;
  }

  ngOnInit(): void {}

  restore(): void {
    for (let template of this.templates) {
      template.retired = false;
      this.templateSvc.updateTemplate(template).then(
        () => {
          this.dialogRef.close({
            retired: false,
          });
        },
        (error) => {
          this.dialogRef.close({ error: error.error });
        },
      );
    }
  }

  cancel(): void {
    this.dialogRef.close({ retired: false });
  }

  onNoClick(): void {
    this.dialogRef.close({ retired: false });
  }
}
