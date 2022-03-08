export class CustomerModel {
  _id: string;
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
  contact_list: ContactModel[];
  domain: string;
  appendix_a_date: Date;

  public constructor(init?: Partial<CustomerModel>) {
    Object.assign(this, init);
  }
}

export class NewCustomerModel {
  name: string;
  identifier: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string;
  customer_type: string;
  contact_list: ContactModel[];

  public constructor(init?: Partial<NewCustomerModel>) {
    Object.assign(this, init);
  }
}

export class ContactModel {
  first_name: string;
  last_name: string;
  title: string;
  office_phone: string;
  mobile_phone: string;
  email: string;
  notes: string;
  active: boolean;

  public constructor(init?: Partial<ContactModel>) {
    Object.assign(this, init);
  }
}

export interface ICustomerContact {
  customer_id: string;
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
