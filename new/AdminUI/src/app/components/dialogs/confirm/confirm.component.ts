import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  // tslint:disable-next-line:use-host-property-decorator
  host: { class: 'd-flex flex-column flex-11a' },
})
export class ConfirmComponent implements OnInit {
  public title = 'Please Confirm';
  public confirmMessage: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Object
  ) {
    if (data) {
      this.title = data['title'];
      this.confirmMessage = data['confirmMessage'];
    }
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
