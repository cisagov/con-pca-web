import { TemplateShort } from './template.model';

export class Customer {
  customer_uuid: string;
  name: string;
  identifier: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string;
  sector: string;
  industry: string;
  customer_type: string;
  contact_list: Contact[];

  public constructor(init?: Partial<TemplateShort>) {
    Object.assign(this, init);
  }
}

export class NewCustomer {
  name: string;
  identifier: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string;
  customer_type: string;
  contact_list: Contact[];
}

export class Contact {
  first_name: string;
  last_name: string;
  title: string;
  office_phone: string;
  mobile_phone: string;
  email: string;
  notes: string;
  active: boolean;

  public constructor(init?: Partial<TemplateShort>) {
    Object.assign(this, init);
  }
}

export interface ICustomerContact {
  customer_uuid: string;
  customer_name: string;
  first_name: string;
  last_name: string;
  title: string;
  office_phone: string;
  mobile_phone: string;
  email: string;
  notes: string;
  active: boolean;
}
