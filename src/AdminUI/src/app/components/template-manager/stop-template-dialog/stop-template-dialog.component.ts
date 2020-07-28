import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { Template } from 'src/app/models/template.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription } from 'src/app/models/subscription.model';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { ConfirmComponent } from '../../dialogs/confirm/confirm.component';

@Component({
  selector: 'app-stop-template-dialog',
  templateUrl: './stop-template-dialog.component.html',
  styleUrls: ['../template-manager.component.scss']
})
export class StopTemplateDialogComponent implements OnInit {
  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  template: Template;
  subscriptions: Subscription[];

  displayedColumns = ['subscription_name'];
  constructor(
    public dialogRef: MatDialogRef<StopTemplateDialogComponent>,
    public subscriptionSvc: SubscriptionService,
    public templateSvc: TemplateManagerService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: Template
  ) {
    this.template = data;
  }

  ngOnInit(): void {
    this.subscriptionSvc
      .getSubscriptionsByTemplate(this.template)
      .subscribe((data: any[]) => {
        this.subscriptions = data as Subscription[];
      });
  }

  confirm(): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage =
      'Are you sure you want to stop the subscriptions?';
    this.dialogRefConfirm.componentInstance.title =
      'Confirm Stop Subscriptions';
    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.templateSvc.stopTemplate(this.template).subscribe();
      }

      this.dialogRefConfirm = null;
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
