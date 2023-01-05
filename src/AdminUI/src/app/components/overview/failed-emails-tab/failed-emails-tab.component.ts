import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FailedModel, FailedEmailModel } from 'src/app/models/failed.model';
import { FailedEmailsService } from 'src/app/services/failed-emails.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { SettingsService } from 'src/app/services/settings.service';
import { OverviewTabService } from 'src/app/services/overview-tab.service';

@Component({
  selector: 'app-failed-emails-tab',
  templateUrl: './failed-emails-tab.component.html',
  styleUrls: ['./failed-emails-tab.component.scss'],
})
export class FailedEmailsTab implements OnInit {
  @ViewChild('failedTable', { read: MatSort, static: true })
  sortFailed: MatSort;
  loading = false;
  dataLoaded = false;
  success = false;

  search_input = '';

  // Failed Email Selection
  selection = new SelectionModel<FailedEmailModel>(true, []);

  // Failed Emails Table
  public failedSource: MatTableDataSource<FailedEmailModel>;
  failedDisplayedColumns = [
    'select',
    'recipient_address',
    'recipient_domain',
    'sent_time',
    'error_type',
    'reason',
  ];

  constructor(
    private router: Router,
    private failedSvc: FailedEmailsService,
    private settingsService: SettingsService,
    private http: HttpClient,
    public dialog: MatDialog,
    private tabSvc: OverviewTabService,
  ) {}

  ngOnInit(): void {
    this.failedSource = new MatTableDataSource();
    this.tabSvc.failedEmailsClicked.subscribe((val) => {
      if (val && !this.dataLoaded) {
        this.refresh();
        this.dataLoaded = true;
      }
    });
  }

  public filterEmails = (value: string) => {
    this.failedSource.filter = value.trim().toLocaleLowerCase();
  };

  async refresh() {
    this.loading = true;
    this.failedSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'sent_time':
          return new Date(item.sent_time);
        default:
          return item[property];
      }
    };
    await this.failedSvc.getFailedEmails().subscribe((failed: FailedModel) => {
      this.failedSource.sort = this.sortFailed;
      this.failedSource.data = failed.failed_emails as FailedEmailModel[];
      this.success = failed.success;
      this.loading = false;
      this.selection = new SelectionModel<FailedEmailModel>(true, []);
    });
  }

  pageRefresh(): void {
    this.failedSvc.getFailedEmails();
    this.refresh();
  }

  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  public getFailedEmailsJSON() {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const parameters = [];
    parameters.push(`removed=false`);
    const url = `${
      this.settingsService.settings.apiUrl
    }/api/failedemails/?${parameters.join('&')}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  downloadFailedEmailsJSON() {
    if (confirm('Download JSON file of failed emails?')) {
      this.getFailedEmailsJSON().subscribe(
        (blob) => {
          this.downloadObject(`failed_emails_data.json`, blob);
        },
        (error) => {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Error',
              messageText: `An error occured downloading the failed emails data. Check logs for more detail.`,
            },
          });
        },
      );
    }
  }

  removeEmails(): void {
    const emailsToRemove = this.selection.selected;
    for (var email of emailsToRemove) {
      this.failedSvc.deleteFailedEmails(email);
    }
    this.pageRefresh();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.failedSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.failedSource.data.forEach((row) => this.selection.select(row));
  }
}
