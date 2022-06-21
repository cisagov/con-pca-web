import { Component, Inject, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CycleService } from 'src/app/services/cycle.service';
import { CycleModel } from 'src/app/models/cycle.model';

export interface DialogData {
  confirmName: string;
  cycle: CycleModel;
}

@Component({
  selector: 'delete-cycle',
  templateUrl: 'delete-cycle.component.html',
  styleUrls: ['delete-cycle.component.scss'],
})
export class DeleteCycle {
  @Input()
  cycle: CycleModel;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public cycleSvc: CycleService,
    private router: Router
  ) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DeleteCycleDialog, {
      width: '500px',
      data: { cycle: this.cycle },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cycleSvc.deleteCycle(this.cycle._id).subscribe(
          () => {
            this._snackBar.open('Success: Cycle has been deleted.', 'Dismiss', {
              duration: 5000,
            });
            this.router.navigate([
              '/view-subscription',
              this.cycle.subscription_id,
            ]);
          },
          () => {
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
  cycle: CycleModel;
  canDelete: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteCycleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.canDelete = false;
    this.cycle = data.cycle;
  }

  confirmValueChange(value) {
    if (value === this.cycle._id) {
      this.canDelete = true;
    } else {
      this.canDelete = false;
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
