export class TemplateShort {
  template_uuid: string;
  name: string;
  descriptive_words: Array<string>;

  public constructor(init?: Partial<TemplateShort>) {
    Object.assign(this, init);
  }
}

export class Template {
  //EMail Data
  template_uuid: string;
  gophish_template_id: number;
  name: string;
  template_type: string;
  //system_path: string;
  deception_score: number;
  descriptive_words: string;
  description: string;
  image_list: Array<TemplateImageModel>;
  from_address: string;
  //display_link: string;
  retired: boolean;
  retired_description: string;
  subject: string;
  text: string;
  html: string;
  topic_list: Array<string>;

  //Deception Score
  appearance: TemplateAppearanceModel;
  grammar: number;
  link_domain: number;
  logo_graphics: number;

  sender: TemplateSenderModel;
  external: number;
  internal: number;
  authoritative: number;

  relevancy: TemplateRelevancyModel;
  organization: number;
  public_news: number;

  behavior: TemplateBehaviorModel;
  fear: number;
  duty_obligation: number;
  curiosity: number;
  greed: number;

  //DB tracking variables
  created_by?: string;
  cb_timestamp?: Date;
  last_updated_by?: string;
  lub_timestamp?: Date;

  public constructor(init?: Partial<Template>) {
    Object.assign(this, init);
  }
}

export class TemplateAppearanceModel {
  grammar: number;
  link_domain: number;
  logo_graphics: number;
}

export class TemplateSenderModel {
  external: number;
  internal: number;
  authoritative: number;
}

export class TemplateRelevancyModel {
  organization: number;
  public_news: number;
}

export class TemplateBehaviorModel {
  fear: number;
  duty_obligation: number;
  curiosity: number;
  greed: number;
}

export class TemplateImageModel {
  file_name: string;
  file_url: string;
}

/**
 * An instance of a "Tag", a substitution token in a Template.
 */
export class TagModel {
  tag: string;
  description: string;
  data_source: string;
  tag_type: string;
}
