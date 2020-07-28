import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SendingProfile } from 'src/app/models/sending-profile.model';
import { SendingProfileService } from 'src/app/services/sending-profile.service';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';
import { SendingProfileDetailComponent } from './sending-profile-detail.component';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { LayoutMainService } from 'src/app/services/layout-main.service';

@Component({
  selector: 'app-sending-profiles',
  templateUrl: './sending-profiles.component.html'
})
export class SendingProfilesComponent implements OnInit {
  displayedColumns = ['name', 'interface_type', 'modified_date', 'action'];
  sendingProfilesData = new MatTableDataSource<SendingProfile>();

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  loading = false;

  constructor(
    private sendingProfileSvc: SendingProfileService,
    public dialog: MatDialog,
    public layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Sending Profiles');
  }

  /**
   *
   */
  ngOnInit(): void {
    this.refresh();
  }

  /**
   * Refreshes the page display.
   */
  refresh() {
    this.loading = true;
    this.sendingProfileSvc.getAllProfiles().subscribe((data: any) => {
      this.sendingProfilesData.data = data as SendingProfile[];
      this.loading = false;
    });
  }

  /**
   * Confirm that they want to delete the profile.
   * @param row
   */
  confirmDeleteProfile(row: any): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `This will delete sending profile '${row.name}'.  Do you want to continue?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProfile(row);
      }
      this.dialogRefConfirm = null;
    });
  }

  /**
   *
   * @param row
   */
  deleteProfile(row: any) {
    this.sendingProfileSvc.deleteProfile(row.id).subscribe(() => {
      this.refresh();
    });
  }

  /**
   * Open the detail dialog and pass the ID of the clicked row, or 0 if they clicked 'new'.
   */
  openProfileDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '60vw';
    dialogConfig.data = {
      sendingProfileId: row.id
    };
    const dialogRef = this.dialog.open(
      SendingProfileDetailComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe(value => {
      this.refresh();
    });
  }
}
