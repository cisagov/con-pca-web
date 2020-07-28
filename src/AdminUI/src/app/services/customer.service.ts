import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Customer,
  Contact,
  NewCustomer,
  ICustomerContact
} from 'src/app/models/customer.model';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable()
export class CustomerService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  showCustomerInfo = false;
  selectedCustomer = '';
  showCustomerInfoStatus: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(this.showCustomerInfo);

  setCustomerInfo(show: boolean) {
    this.showCustomerInfo = show;
    this.showCustomerInfoStatus.next(show);
  }
  getCustomerInfoStatus() {
    return this.showCustomerInfoStatus;
  }
  // Returns observable on http request to get customers
  public getCustomers() {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/customers/`;
    return this.http.get(url);
  }

  public getAllContacts(customers: Customer[]): ICustomerContact[] {
    const customerContacts: ICustomerContact[] = [];
    customers.map((customer: Customer) => {
      customer.contact_list.map((contact: Contact) => {
        const customerContact: ICustomerContact = {
          customer_uuid: customer.customer_uuid,
          customer_name: customer.name,
          first_name: contact.first_name,
          last_name: contact.last_name,
          title: contact.title,
          office_phone: contact.office_phone,
          mobile_phone: contact.mobile_phone,
          email: contact.email,
          notes: contact.notes,
          active: contact.active
        };
        customerContacts.push(customerContact);
      });
    });
    return customerContacts;
  }

  public getCustomer(uuid: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/customer/${uuid}/`;
    return this.http.get(url);
  }

  public getContact(requestData: any) {
    const contact: Contact = {
      first_name: requestData.first_name,
      last_name: requestData.last_name,
      title: requestData.title,
      office_phone: requestData.office_phone,
      mobile_phone: requestData.mobile_phone,
      email: requestData.email,
      notes: requestData.notes,
      active: requestData.active
    };
    return contact;
  }

  /**
   * Returns an array of simple contact
   * names and IDs for the customer.
   */
  public getContactsForCustomer(c: Customer) {
    const a = [];
    c.contact_list.forEach(x => {
      a.push({
        name: x.first_name + ' ' + x.last_name
      });
    });
    return a;
  }

  public setContacts(uuid: string, contacts: Contact[]) {
    const data = {
      contact_list: contacts
    };

    return this.http.patch(
      `${this.settingsService.settings.apiUrl}/api/v1/customer/${uuid}/`,
      data
    );
  }

  public patchCustomer(data: Customer) {
    return this.http.patch(
      `${this.settingsService.settings.apiUrl}/api/v1/customer/${data.customer_uuid}/`,
      data
    );
  }

  public addCustomer(customer: NewCustomer) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/v1/customers/`,
      customer
    );
  }

  public getSectorList() {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/sectorindustry/`;
    return this.http.get(url);
  }
}
