import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FailedModel, FailedEmailModel } from 'src/app/models/failed.model';
import { FailedEmailsService } from 'src/app/services/failed-emails.service';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-failed-emails-tab',
  templateUrl: './failed-emails-tab.component.html',
  styleUrls: ['./failed-emails-tab.component.scss'],
})
export class FailedEmailsTab implements OnInit {
  @ViewChild('failedTable', { read: MatSort, static: true })
  sortFailed: MatSort;
  loading = false;
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

  constructor(private router: Router, private failedSvc: FailedEmailsService) {}

  ngOnInit(): void {
    this.failedSource = new MatTableDataSource();
    this.refresh();
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
