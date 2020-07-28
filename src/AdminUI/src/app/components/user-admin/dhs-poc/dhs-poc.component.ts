import { Component, OnInit, Inject } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DhsPocDetailComponent } from './dhs-poc-detail.component';
import { ConfirmComponent } from '../../dialogs/confirm/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { Contact } from 'src/app/models/customer.model';

@Component({
  selector: 'app-dhs-poc',
  templateUrl: './dhs-poc.component.html'
})
export class DhsPocComponent implements OnInit {

  public dhsContacts = new MatTableDataSource<Contact>();

  public displayedColumns = [
    'name',
    'title',
    'email',
    'active',
    'select'
  ];

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  /**
   *
   */
  constructor(
    private layoutSvc: LayoutMainService,
    private subscriptionSvc: SubscriptionService,
    public dialog: MatDialog
  ) {
    this.layoutSvc.setTitle('DHS Contacts');
  }

  /**
   *
   */
  ngOnInit(): void {
    this.dhsContacts = new MatTableDataSource();
    this.refresh();
  }

  /**
   *
   */
  refresh() {
    this.subscriptionSvc.getDhsContacts().subscribe((data: any[]) => {
      this.dhsContacts.data = data as Contact[];
    });
  }

  /**
   *
   */
  public filterContacts = (value: string) => {
    this.dhsContacts.filter = value.trim().toLocaleLowerCase();
  }

  /**
   *
   */
  editContact(contact) {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '60vw';
    dialogConfig.data = {
      contact
    };
    const dialogRef = this.dialog.open(
      DhsPocDetailComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe(value => {
      this.refresh();
    });
  }

  /**
   * Confirm that they want to delete the contact.
   */
  confirmDeleteContact(row: any): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `This will delete '${row.first_name} ${row.last_name}'.  Do you want to continue?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.deleteContact(row);
      }
      this.dialogRefConfirm = null;
    });
  }

  /**
   *
   */
  deleteContact(c) {
    this.subscriptionSvc.deleteDhsContact(c).subscribe(() => {
      this.refresh();
    });
  }
}
