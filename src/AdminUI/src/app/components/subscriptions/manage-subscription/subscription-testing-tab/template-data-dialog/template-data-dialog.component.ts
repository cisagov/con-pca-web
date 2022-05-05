import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { range } from 'rxjs';
import { GenericDialogSettings } from 'src/app/models/generic-dialog-settings.model';
import { SubscriptionTestResultsModel } from 'src/app/models/subscription.model';
import { TemplateModel } from 'src/app/models/template.model';

@Component({
  selector: 'app-template-data-dialog',
  templateUrl: './template-data-dialog.component.html',
  styleUrls: ['./template-data-dialog.component.scss'],
})
export class TemplateDataDialogComponent implements OnInit {
  displayData: any[] = [];
  templateTestData: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GenericDialogSettings,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set display data
    Object.keys(this.data).forEach((key) => {
      let value = this.data[key];
      if (typeof value === 'object') {
        value = JSON.stringify(value, null, 4);
      }
      this.displayData.push({ key, value });
      this.templateTestData = this.data;
    });
  }

  test(): void {
    this.displayData = [];
    const numbers = range(1, 300);
    numbers.forEach((num) => {
      this.displayData.push({ key: `something_${num}`, value: 'test' });
    });
  }

  getTimeline(timeline: object): string {
    return JSON.stringify(timeline);
  }

  toTemplateDetails(templateId: string) {
    console.log(templateId);
    this.router.navigate(['/templatemanager', templateId]);
  }
}
