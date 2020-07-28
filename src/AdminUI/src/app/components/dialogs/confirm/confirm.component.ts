import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  // tslint:disable-next-line:use-host-property-decorator
  host: { class: 'd-flex flex-column flex-11a' }
})
export class ConfirmComponent implements OnInit {

  public title = 'Please Confirm';
  public confirmMessage: string;

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>) {
  }

  /**
   *
   */
  ngOnInit() {
    if (!!this.dialogRef.componentInstance.title) {
      this.title = this.dialogRef.componentInstance.title;
    }
  }
}
