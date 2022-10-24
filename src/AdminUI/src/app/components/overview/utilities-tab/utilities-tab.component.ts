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
    ) {
    }
    
    ngOnInit(): void {
    }

    downloadObject(filename, blob) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
    }

    downloadContactsJSON() {
        if (confirm('Download contact data?')) {
            this.utilitiesSvc.getContacts().subscribe(
            (blob) => {
                this.downloadObject(`contact_data.json`, blob);
            },
            (error) => {
                this.dialog.open(AlertComponent, {
                data: {
                    title: 'Error',
                    messageText: `An error occured downloading the template data. Check logs for more detail.`,
                },
                });
            }
            );
        }
    }
}