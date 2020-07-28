import { Component, OnInit, Inject } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { FormGroup, FormControl } from '@angular/forms';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/services/customer.service';
import { MatTab } from '@angular/material/tabs';
import {
  Contact,
  Customer,
  ICustomerContact
} from 'src/app/models/customer.model';
import { AddContactDialogComponent } from './add-contact-dialog/add-contact-dialog.component';
import { ViewContactDialogComponent } from './view-contact-dialog/view-contact-dialog.component';

@Component({
  selector: '',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  dataSource: MatTableDataSource<ICustomerContact>;

  loading = true;

  displayedColumns = [    
    "first_name",
    "last_name",
    "title",
    "customer_name",
    "active",
    "select"
  ];

  constructor(
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    public customerService: CustomerService
  ) {
    layoutSvc.setTitle('Contacts');
  }

  searchFilter(searchValue: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      this.refresh();
    });
  }

  openViewDialog(row: ICustomerContact): void {
    const dialogRef = this.dialog.open(ViewContactDialogComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(value => {
      this.refresh();
    });
  }

  private refresh(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe((data: any[]) => {
      let customerContacts = this.customerService.getAllContacts(
        data as Customer[]
      );
      this.dataSource.data = customerContacts;
      this.loading = false;
    });
  }

  private setFilterPredicate() {
    this.dataSource.filterPredicate = (
      data: ICustomerContact,
      filter: string
    ) => {
      var words = filter.split(' ');
      let searchData = `${data.first_name.toLowerCase()} ${data.last_name.toLowerCase()} ${data.customer_name.toLowerCase()} ${data.title.toLowerCase()}`;
      for (var i = 0; i < words.length; i++) {
        if (words[i] == null || words[i] == '' || words[i] == ' ') {
          continue;
        }
        var isMatch = searchData.indexOf(words[i].trim().toLowerCase()) > -1;

        if (!isMatch) {
          return false;
        }
      }
      return true;
    };
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.refresh();
    this.setFilterPredicate();
  }
}
