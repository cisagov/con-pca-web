import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomerModel } from 'src/app/models/customer.model';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { MatSort } from '@angular/material/sort';
import { NavigateAwayComponent } from '../dialogs/navigate-away/navigate-away.component';
import { ArchiveCustomersDialogComponent } from '../customer/archive-customers-dialog/archive-customers-dialog.component';
import { UnarchiveCustomersDialogComponent } from '../customer/unarchive-customers-dialog/unarchive-customers-dialog.component';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  @Input() insideDialog: boolean;

  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  showArchived: boolean = false;

  displayed_columns = [
    'select',
    'name',
    'identifier',
    'stakeholder_shortname',
    'address_1',
    'address_2',
    'city',
    'state',
    'zip_code',
    'edit',
  ];
  // pagination variables
  customerCount: number = 99;
  customersPerPage: any = 10;
  page: any = 0;
  sortOrder = 'asc';
  sortBy = 'name';
  searchFilterStr = '';

  customersData = new MatTableDataSource<CustomerModel>();
  subscriptions = new MatTableDataSource<SubscriptionModel>();
  search_input = '';
  dialogRefArchive: MatDialogRef<ArchiveCustomersDialogComponent>;
  dialogRefUnarchive: MatDialogRef<UnarchiveCustomersDialogComponent>;

  // Customer Selection
  selection = new SelectionModel<CustomerModel>(true, []);

  constructor(
    private layout_service: LayoutMainService,
    public subscriptionSvc: SubscriptionService,
    public customerSvc: CustomerService,
    public alertsService: AlertsService,
    public dialog: MatDialog,
    private router: Router,
  ) {
    this.customerSvc.setCustomerInfo(false);
    this.customerSvc.setIsSubPage(false);
  }

  getPageSize() {
    this.customerSvc
      .getCustomerCount(this.searchFilterStr, this.showArchived)
      .subscribe(
        (success) => {
          this.customerCount = parseInt(success as any);
          console.log(this.customerCount);
        },
        (failure) => {
          console.log('Failed ot get subscription count');
        },
      );
  }

  paginationChange(event) {
    this.page = event.pageIndex;
    this.customersPerPage = event.pageSize;
    this.refresh();
  }
  public searchFilter(searchValue: string): void {
    console.log(searchValue);
    this.searchFilterStr = searchValue;
    this.page = 0;
    this.refresh();
    this.getPageSize();
    // this.dataSource.filter = searchValue.trim().toLowerCase();
  }
  changeSort(sortEvent) {
    this.sortOrder = sortEvent.direction;
    if (sortEvent.direction == '') {
      this.sortOrder = 'asc';
      this.sortBy = 'name';
    } else {
      switch (sortEvent.active) {
        case 'name':
          this.sortBy = 'name_lower';
          break;
        case 'identifier':
          this.sortBy = 'identifier_lower';
          break;
        case 'stakeholder_shortname':
          this.sortBy = 'stakeholder_shortname_lower';
          break;
        case 'address_1':
          this.sortBy = 'address_1_lower';
          break;
        case 'address_2':
          this.sortBy = 'address_2_lower';
          break;
        case 'city':
          this.sortBy = 'city_lower';
          break;
        case 'state':
          this.sortBy = 'state';
          break;
        case 'zip_code':
          this.sortBy = 'zip_code';
          break;
      }
    }
    this.refresh();

    // this.name
  }

  ngOnInit(): void {
    if (!this.insideDialog) {
      this.layout_service.setTitle('Customers');
    } else {
      this.displayed_columns.splice(8, 1);
      this.displayed_columns.splice(0, 1);
    }

    this.getPageSize();

    this.customersData = new MatTableDataSource();
    this.customerSvc.getCustomerInfoStatus().subscribe((status) => {
      if (status === false) {
        this.refresh();
      }
    });
  }

  public filterCustomers = (value: string) => {
    this.customersData.filter = value.trim().toLocaleLowerCase();
  };

  private refresh(): void {
    if (!this.insideDialog) {
      // if(this.customerSvc.setTitle){
      this.layout_service.setTitle('Customers');
    }
    this.loading = true;
    this.selection = new SelectionModel<CustomerModel>(true, []);
    this.customerSvc
      .getCustomersPaged(
        this.page,
        this.customersPerPage,
        this.sortBy,
        this.sortOrder,
        this.searchFilterStr,
        this.showArchived,
      )
      .subscribe(
        (success) => {
          this.customersData.data = success as CustomerModel[];
          this.loading = false;
        },
        (failure) => {
          console.log(failure);
        },
      );
  }

  public canDeactivate(): Promise<boolean> {
    return this.isNavigationAllowed();
  }

  private isNavigationAllowed(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.customerSvc.showCustomerInfo) {
        const dialogRef = this.dialog.open(NavigateAwayComponent);
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'save') {
            resolve(true);
          } else if (result === 'discard') {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  public setCustomer(id) {
    this.customerSvc.selectedCustomer = id;
    this.dialog.closeAll();
  }
  public editCustomer(customer_id) {
    if (!this.insideDialog) this.router.navigate(['/customer', customer_id]);
    else this.setCustomer(customer_id);
  }

  onArchivedToggle() {
    if (this.displayed_columns.includes('archived')) {
      this.displayed_columns.pop();
    } else {
      this.displayed_columns.push('archived');
    }
    this.refresh();
  }

  archiveCustomers() {
    const customersToArchive = this.selection.selected;

    this.dialogRefArchive = this.dialog.open(ArchiveCustomersDialogComponent, {
      disableClose: false,
      data: customersToArchive,
    });
    this.dialogRefArchive.afterClosed().subscribe(() => {
      this.refresh();
    });
    this.refresh();
  }

  unarchiveCustomers() {
    const customersToUnarchive = this.selection.selected;

    this.dialogRefUnarchive = this.dialog.open(
      UnarchiveCustomersDialogComponent,
      {
        disableClose: false,
        data: customersToUnarchive,
      },
    );
    this.dialogRefUnarchive.afterClosed().subscribe((result) => {
      if (!result.archived) {
        this.refresh();
      } else if (result.error) {
        this.alertsService.alert(
          `Error unarchiving customer. ${result.error.error}`,
        );
      }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.customersData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.customersData.data.forEach((row) => this.selection.select(row));
  }
}
