//this class reflects the gophish api
//note that the template must be saved

import { Customer } from './customer.model';
import { SendingProfile } from './sending-profile.model';

//before a test email can be sent
export class TestEmail {
  template: any; // Accepts either GophishTemplateModel or TemplateModel
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  url: string;
  smtp: SendingProfile;
  customer_uuid: string;
}
