import { SendingProfileModel } from './sending-profile.model';
import { TemplateModel } from './template.model';

//before a test email can be sent
export class TestEmailModel {
  template: TemplateModel;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  url: string;
  smtp: SendingProfileModel;
  customer_id: string;
}
