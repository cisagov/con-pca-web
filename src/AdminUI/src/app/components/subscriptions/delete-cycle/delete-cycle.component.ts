import { Component, Inject, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Router } from '@angular/router';
import { CycleService } from 'src/app/services/cycle.service';

export interface DialogData {
  confirmName: string;
  subscription: SubscriptionModel;
}

@Component({
  selector: 'delete-cycle',
  templateUrl: 'delete-cycle.component.html',
  styleUrls: ['delete-cycle.component.scss'],
})
export class DeleteCycle {
  @Input()
  subscription: SubscriptionModel;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public cycleSvc: CycleService,
    private router: Router
  ) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DeleteCycleDialog, {
      width: '450px',
      data: { subscription: this.subscription },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cycleSvc.deleteCycle(this.subscription).subscribe(
          (success) => {
            this.router.navigate(['/subscriptions']);
          },
          (error) => {
            let snackBarRef = this._snackBar.open(
              'Cycle Deletion Failed',
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
  selector: 'delete-cycle-dialog',
  templateUrl: 'delete-cycle-dialog.html',
})
export class DeleteCycleDialog {
  subscription: SubscriptionModel;
  canDelete: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteCycleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.canDelete = false;
    this.subscription = data.subscription;
  }

  confirmValueChange(value) {
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
