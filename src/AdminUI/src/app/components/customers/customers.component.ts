import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { AddCustomerDialogComponent } from './add-customer-dialog/add-customer-dialog.component';
import { Customer } from 'src/app/models/customer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  @Input() insideDialog: boolean;

  loading = false;

  displayed_columns = [
    'name',
    'identifier',
    'address_1',
    'address_2',
    'city',
    'state',
    'zip_code',
    'select'
  ];
  customersData = new MatTableDataSource<Customer>();
  search_input = '';

  /**
   *
   */
  constructor(
    private layout_service: LayoutMainService,
    public customerSvc: CustomerService,
    public dialog: MatDialog,
    private router: Router,
  ) {
    this.customerSvc.setCustomerInfo(false);
  }

  /**
   * 
   */
  ngOnInit(): void {
    if (!this.insideDialog) {
      this.layout_service.setTitle('Customers');
    }

    this.customersData = new MatTableDataSource();
    this.customerSvc.getCustomerInfoStatus().subscribe(status => {
      if (status === false) {
        this.refresh();
      }
    });
  }

  /**
   *
   */
  public filterCustomers = (value: string) => {
    this.customersData.filter = value.trim().toLocaleLowerCase();
  }

  /**
   *
   */
  private refresh(): void {
    this.loading = true;
    this.customerSvc.getCustomers().subscribe((data: any) => {
      this.customersData.data = data as Customer[];
      this.loading = false;
    });
  }

  /**
   *
   */
  public open_add_customer_dialog(): void {
    const dialog_config = new MatDialogConfig();
    dialog_config.data = {
      insideDialog: this.insideDialog
    };
    const dialog_ref = this.dialog.open(AddCustomerDialogComponent, dialog_config);
  }

  /**
   *
   */
  public setCustomer(uuid) {
    this.customerSvc.selectedCustomer = uuid;
    this.dialog.closeAll();
  }
  public editCustomer(customer_uuid) {
    if(!this.insideDialog)
      this.router.navigate(['/customer', customer_uuid]);
    else
      this.setCustomer(customer_uuid)
  }
}
