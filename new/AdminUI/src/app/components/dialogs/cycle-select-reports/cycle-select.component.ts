import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'cycle-select-reports',
  templateUrl: './cycle-select.component.html',
  // tslint:disable-next-line:use-host-property-decorator
  // host: { class: 'd-flex flex-column flex-11a' },
})
export class CycleSelectReports implements OnInit {
  public title = 'Cycles for subscription - ';
  public confirmMessage: string;
  public cycleList: any = [];
  public reportType = 'monthly';

  public reportTypes = [
    { displayName: 'Monthly', value: 'monthly' },
    { displayName: 'Cycle', value: 'cycle' },
    { displayName: 'Yearly', value: 'yearly' },
  ];

  @ViewChild('cycles') cycleSelectionList: MatSelectionList;

  constructor(
    public dialogRef: MatDialogRef<CycleSelectReports>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      console.log(data);
      this.cycleList = data.cycles;
      this.title += data.sub_name;
    }
  }

  deselectAll() {
    this.cycleSelectionList.deselectAll();
  }
  selectAll() {
    this.cycleSelectionList.selectAll();
  }

  selectCycles() {
    this.dialogRef.close({
      cycles: this.cycleSelectionList.selectedOptions.selected.map(
        (item) => item.value
      ),
      reportType: this.reportType,
    });
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
