import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invalid-email-dialog',
  templateUrl: './invalid-email-dialog.component.html',
  styleUrls: ['./invalid-email-dialog.component.scss'],
})
export class InvalidEmailDialogComponent {
  inputData = [];
  panelOpenState = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Object,
    public dialog: MatDialog
  ) {
    let dataAsArray = [];
    if (Array.isArray(data)) {
      dataAsArray = data as Array<Object>;
    }
    dataAsArray.forEach((element) => {
      element['remove'] = false;
    });
    this.inputData = dataAsArray;
  }
  ngOnInit(): void {}
  removeSelected() {
    let indexsToRemove = [];
    this.inputData.forEach((email) => {
      if (email['remove']) {
        indexsToRemove.push(email['index']);
      }
    });
    return indexsToRemove;
  }

  removeAll() {
    let indexsToRemove = [];
    this.inputData.forEach((email) => {
      indexsToRemove.push(email['index']);
    });
    return indexsToRemove;
  }

  close() {
    return [];
  }
}
