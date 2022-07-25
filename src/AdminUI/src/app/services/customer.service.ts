import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  ContactModel,
  NewCustomerModel,
  ICustomerContact,
  CustomerModel,
} from 'src/app/models/customer.model';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams(),
};

@Injectable()
export class CustomerService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  showCustomerInfo = false;
  selectedCustomer = '';
  showCustomerInfoStatus: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(this.showCustomerInfo);

  setCustomerInfo(show: boolean) {
    this.showCustomerInfo = show;
    this.showCustomerInfoStatus.next(show);
  }
  getCustomerInfoStatus() {
    return this.showCustomerInfoStatus;
  }
  // Returns observable on http request to get customers
  public getCustomers(retired: boolean = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/customers/`;
    const parameters = [];
    if (retired) {
      parameters.push('archived=true');
    }
    if (parameters) {
      url = `${url}?${parameters.join('&')}`;
    }
    return this.http.get<CustomerModel[]>(url, headers);
  }

  public getAllContacts(customers: CustomerModel[]): ICustomerContact[] {
    const customerContacts: ICustomerContact[] = [];
    customers.map((customer: CustomerModel) => {
      customer.contact_list.map((contact: ContactModel) => {
        const customerContact: ICustomerContact = {
          customer_id: customer._id,
          customer_name: customer.name,
          first_name: contact.first_name,
          last_name: contact.last_name,
          title: contact.title,
          office_phone: contact.office_phone,
          mobile_phone: contact.mobile_phone,
          email: contact.email,
          notes: contact.notes,
          active: contact.active,
        };
        customerContacts.push(customerContact);
      });
    });
    return customerContacts;
  }

  public getCustomer(id: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/customer/${id}/`;
    return this.http.get<CustomerModel>(url);
  }

  public getContact(requestData: any) {
    const contact: ContactModel = {
      first_name: requestData.first_name,
      last_name: requestData.last_name,
      title: requestData.title,
      office_phone: requestData.office_phone,
      mobile_phone: requestData.mobile_phone,
      email: requestData.email,
      notes: requestData.notes,
      active: requestData.active,
    };
    return contact;
  }

  /**
   * Returns an array of simple contact
   * names and IDs for the customer.
   */
  public getContactsForCustomer(c: CustomerModel) {
    const a = [];
    c.contact_list.forEach((x) => {
      a.push({
        name: x.first_name + ' ' + x.last_name,
      });
    });
    return a;
  }

  public setContacts(id: string, contacts: ContactModel[]) {
    const data = {
      contact_list: contacts,
    };

    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/customer/${id}/`,
      data
    );
  }

  public patchCustomer(data: CustomerModel) {
    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/customer/${data._id}/`,
      data
    );
  }

  public updateCustomer(data: CustomerModel) {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${this.settingsService.settings.apiUrl}/api/customer/${data._id}/`,
          data
        )
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          },
          () => {}
        );
    });
  }

  public addCustomer(customer: NewCustomerModel) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/customers/`,
      customer
    );
  }

  public getSectorList() {
    const url = `${this.settingsService.settings.apiUrl}/api/sectorindustry/`;
    return this.http.get(url);
  }

  public deleteCustomer(data: CustomerModel) {
    return this.http.delete(
      `${this.settingsService.settings.apiUrl}/api/customer/${data._id}/`
    );
  }
}
