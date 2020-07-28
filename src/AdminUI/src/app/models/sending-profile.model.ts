export class SendingProfile {
  id: number;
  interface_type: string;
  name: string;
  host: string;
  username: string;
  password: string;
  from_address: string;
  ignore_cert_errors: boolean;
  headers: SendingProfileHeader[];
  modified_date: Date;
}

/**
 *
 */
export class SendingProfileHeader {
    key: string;
    value: string;
}
