import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerModel } from 'src/app/models/customer.model';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { NavigateAwayComponent } from '../dialogs/navigate-away/navigate-away.component';

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
    'address_1',
    'address_2',
    'city',
    'state',
    'zip_code',
    'edit',
  ];
  customersData = new MatTableDataSource<CustomerModel>();
  search_input = '';

  // Customer Selection
  selection = new SelectionModel<CustomerModel>(true, []);

  constructor(
    private layout_service: LayoutMainService,
    public customerSvc: CustomerService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.customerSvc.setCustomerInfo(false);
  }

  ngOnInit(): void {
    if (!this.insideDialog) {
      this.layout_service.setTitle('Customers');
    }

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
      this.layout_service.setTitle('Customers');
    }
    this.loading = true;
    this.customerSvc.getCustomers(this.showArchived).subscribe((data: any) => {
      this.customersData.data = data as CustomerModel[];
      this.customersData.sort = this.sort;
      this.loading = false;
    });
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
