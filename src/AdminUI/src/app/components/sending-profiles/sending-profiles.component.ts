import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SendingProfileModel } from 'src/app/models/sending-profile.model';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { SendingProfileDetailComponent } from './sending-profile-detail.component';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-sending-profiles',
  templateUrl: './sending-profiles.component.html',
  styleUrls: ['./sending-profiles.component.scss'],
})
export class SendingProfilesComponent implements OnInit {
  displayedColumns = [
    'name',
    'interface_type',
    'customers_using',
    'modified_date',
    'action',
  ];
  sendingProfilesData = new MatTableDataSource<SendingProfileModel>();

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  @ViewChild(MatSort) sort: MatSort;
  loading = false;

  constructor(
    private sendingProfileSvc: SendingProfileService,
    public dialog: MatDialog,
    public layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Sending Profiles');
  }

  ngOnInit(): void {
    this.refresh();
  }

  /**
   * Refreshes the page display.
   */
  refresh() {
    this.loading = true;
    this.sendingProfileSvc.getAllProfiles().subscribe((data: any) => {
      this.sendingProfilesData.data = data as SendingProfileModel[];
      this.sendingProfilesData.data = this.sendingProfilesData.data;
      this.sendingProfilesData.sort = this.sort;
      this.loading = false;
    });
  }

  confirmDeleteProfile(row: SendingProfileModel): void {
    if (this.dialog.openDialogs.length === 0) {
      this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
        disableClose: false,
      });
      this.dialogRefConfirm.componentInstance.confirmMessage = `This will delete sending profile '${row.name}'.  Do you want to continue?`;
      this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

      this.dialogRefConfirm.afterClosed().subscribe((result) => {
        if (result) {
          this.deleteProfile(row);
        }
        this.dialogRefConfirm = null;
      });
    }
  }

  deleteProfile(row: SendingProfileModel) {
    this.sendingProfileSvc.deleteProfile(row._id).subscribe(
      () => {
        this.refresh();
      },
      (failure) => {
        let l = null;
        let t = '';
        if (failure.error.subscriptions) {
          l = failure.error.subscriptions;
          t = 'Subscriptions currently using:';
        } else if (failure.error.templates) {
          l = failure.error.templates;
          t = 'Templates currently using:';
        }
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Error Trying To Delete',
            messageText:
              'An error occurred deleting the Sending Profile: ' +
              failure.error.error,
            list: l,
            listTitle: t,
          },
        });
      }
    );
  }

  /**
   * Open the detail dialog and pass the ID of the clicked row, or 0 if they clicked 'new'.
   */
  openProfileDialog(row: any): void {
    if (this.dialog.openDialogs.length === 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '60vw';
      dialogConfig.data = {
        sending_profile_id: row._id,
      };
      const dialogRef = this.dialog.open(
        SendingProfileDetailComponent,
        dialogConfig
      );

      dialogRef.afterClosed().subscribe((value) => {
        this.refresh();
      });
    }
  }
}
