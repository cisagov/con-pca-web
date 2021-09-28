export class SendingProfileModel {
  sending_profile_uuid: string;
  name: string;
  username: string;
  password: string;
  host: string;
  interface_type: string = 'SMTP';
  from_address: string;
  ignore_cert_errors: boolean;
  headers: SendingProfileHeaderModel[];

  public constructor(init?: Partial<SendingProfileModel>) {
    Object.assign(this, init);
  }
}

/**
 *
 */
export class SendingProfileHeaderModel {
  key: string;
  value: string;
}
