import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';

@Component({
  selector: 'app-utilities-tab',
  templateUrl: './utilities-tab.component.html',
  styleUrls: ['./utilities-tab.component.scss'],
})
export class UtilitiesTab implements OnInit {
  constructor(
    private utilitiesSvc: UtilitiesService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  dsvToBlob(tsv) {
    var contentType = 'text/tsv';
    var tsvFile = new Blob([tsv], { type: contentType });
    return tsvFile;
  }

  jsonToCSV(json) {
    console.log(json);
    const replacer = (key, value) => (value === null ? 'null' : value);
    console.log(replacer);
    const header = Object.keys(json[0]);
    console.log(header);
    const csv = [
      header.join(','),
      ...json.map((row) =>
        header
          .map((fieldName) =>
            JSON.stringify(row[fieldName], replacer).replace(/\"/g, ''),
          )
          .join(','),
      ),
    ].join('\r\n');
    console.log(csv);
    return csv;
  }

  downloadContactsDSV() {
    if (confirm('Download contact data?')) {
      this.utilitiesSvc.getContacts().subscribe(
        (json) => {
          this.downloadObject(
            `contact_data.dsv`,
            this.dsvToBlob(this.jsonToCSV(json)),
          );
        },
        (error) => {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Error',
              messageText: `An error occured downloading the contact data. Check logs for more detail.`,
            },
          });
        },
      );
    }
  }

  downloadOverdueTasksDSV() {
    if (confirm('Download overdue tasks data?')) {
      this.utilitiesSvc.getOverdueTasks().subscribe(
        (json) => {
          this.downloadObject(
            `overdue_tasks.dsv`,
            this.dsvToBlob(this.jsonToCSV(json)),
          );
        },
        (error) => {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Error',
              messageText: `An error occured downloading the task data. Check logs for more detail.`,
            },
          });
        },
      );
    }
  }

  downloadOverdueSubscriptionsDSV() {
    if (confirm('Download overdue subscriptions data?')) {
      this.utilitiesSvc.getOverdueSubs().subscribe(
        (json) => {
          this.downloadObject(
            `overdue_subscriptions.dsv`,
            this.dsvToBlob(this.jsonToCSV(json)),
          );
        },
        (error) => {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Error',
              messageText: `An error occured downloading the subscription data. Check logs for more detail.`,
            },
          });
        },
      );
    }
  }
}
