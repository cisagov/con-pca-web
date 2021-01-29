//this class reflects the gophish api
//note that the template must be saved

import { SendingProfile } from './sending-profile.model';
import { Template } from './template.model';

//before a test email can be sent
export class TestEmail {
    template: Template;
    first_name: string;
    last_name: string;
    email: string;
    position: string;
    url: string;
    smtp: SendingProfile;
  }
