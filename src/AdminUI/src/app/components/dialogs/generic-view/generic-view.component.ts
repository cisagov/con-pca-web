import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { range } from 'rxjs';
import { GenericDialogSettings } from 'src/app/models/generic-dialog-settings.model';

@Component({
  selector: 'app-generic-view',
  templateUrl: './generic-view.component.html',
  styleUrls: ['./generic-view.component.scss'],
})
export class GenericViewComponent implements OnInit {
  displayData: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: GenericDialogSettings) {}

  ngOnInit(): void {
    // Set display data
    Object.keys(this.data).forEach((key) => {
      let value = this.data[key];
      if (typeof value === 'object') {
        value = JSON.stringify(value, null, 4);
      }
      this.displayData.push({ key, value });
    });
  }

  test(): void {
    this.displayData = [];
    const numbers = range(1, 300);
    numbers.forEach((num) => {
      this.displayData.push({ key: `something_${num}`, value: 'test' });
    });
  }
}
