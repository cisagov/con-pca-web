import { TemplateImageModel } from './template.model';

export class Landing_Page {
  //EMail Data
  landing_page_uuid: string;
  gophish_template_id: number;
  name: string;
  template_type: string;
  //system_path: string;
  image_list: Array<TemplateImageModel>;
  subject: string;
  html: string;
  //DB tracking variables
  created_by?: string;
  cb_timestamp?: Date;
  last_updated_by?: string;
  lub_timestamp?: Date;
  is_default_template: boolean;

  public constructor(init?: Partial<Landing_Page>) {
    Object.assign(this, init);
  }
}
