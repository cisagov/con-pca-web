import { Component, Inject, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'src/app/models/subscription.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Router } from '@angular/router';

export interface DialogData {
  confirmName: string;
  subscription: Subscription;
}

@Component({
  selector: 'delete-subscription',
  templateUrl: 'delete-subscription.component.html',
  styleUrls: ['delete-subscription.component.scss']
})
export class DeleteSubscription {
  @Input()
  subscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public subscriptionsrv: SubscriptionService,
    private router: Router
  ) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DeleteSubscriptionDialog, {
      width: '450px',
      data: { subscription: this.subscription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subscriptionsrv.deleteSubscription(this.subscription).then(
          success => {
            this.router.navigate(['/subscriptions']);
          },
          error => {
            let snackBarRef = this._snackBar.open(
              'Subscription Deletion Failed',
              'Dismiss',
              { duration: 5000 }
            );
          }
        );
      }
    });
  }
}

@Component({
  selector: 'delete-subscription-dialog',
  templateUrl: 'delete-subscription-dialog.html'
})
export class DeleteSubscriptionDialog {
  subscription: Subscription;
  canDelete: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteSubscriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.canDelete = false;
    this.subscription = data.subscription;
  }

  confirmValueVhange(value) {
    if (value === this.subscription.name) {
      this.canDelete = true;
    } else {
      this.canDelete = false;
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
