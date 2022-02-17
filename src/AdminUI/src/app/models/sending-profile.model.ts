export class SendingProfileModel {
  _id: string;
  name: string;
  interface_type: string = 'SMTP';
  from_address: string;
  headers: SendingProfileHeaderModel[];
  landing_page_domain: string;
  sending_ips: string;
  customers_using: number;

  // SMTP
  smtp_username: string;
  smtp_password: string;
  smtp_host: string;

  // Mailgun
  mailgun_api_key: string;
  mailgun_domain: string;

  public constructor(init?: Partial<SendingProfileModel>) {
    Object.assign(this, init);
  }
}

export class SendingProfileHeaderModel {
  key: string;
  value: string;
}
