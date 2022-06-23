import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoggingModel } from 'src/app/models/logging.model';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  selector: 'app-logging-tab',
  templateUrl: './logging-tab.component.html',
})
export class LoggingTab implements OnInit {
  @ViewChild('loggingTable', { read: MatSort, static: true })
  sortLogging: MatSort;
  loading = false;

  // Logging Messages Table
  public loggingSource: MatTableDataSource<LoggingModel>;
  loggingDisplayedColumns = ['timestamp', 'message'];

  constructor(private loggingSvc: LoggingService) {}

  ngOnInit(): void {
    this.loggingSource = new MatTableDataSource();
    this.refresh();
  }

  async refresh() {
    this.loading = true;
    await this.loggingSvc.getLogging().subscribe((logging: LoggingModel[]) => {
      this.loggingSource.sort = this.sortLogging;
      this.loggingSource.data = logging;
      this.loading = false;
    });
  }
}
