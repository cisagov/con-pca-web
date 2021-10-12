export class TemplateAppearanceModel {
  grammar: any;
  link_domain: any;
  logo_graphics: any;
}

export class TemplateSenderModel {
  external: any;
  internal: any;
  authoritative: any;
}

export class TemplateRelevancyModel {
  organization: any;
  public_news: any;
}

export class TemplateBehaviorModel {
  fear: any;
  duty_obligation: any;
  curiosity: any;
  greed: any;
}

export class TemplateImageModel {
  file_name: string;
  file_url: string;
}

export class TemplateIndicatorsModel {
  appearance: TemplateAppearanceModel;
  sender: TemplateSenderModel;
  relevancy: TemplateRelevancyModel;
  behavior: TemplateBehaviorModel;
}

export class TemplateModel {
  _id: string;
  name: string;
  landing_page_id: string;
  sending_profile_id: string;
  deception_score: number;
  from_address: string;
  retired: boolean;
  retired_description: string;
  subject: string;
  text: string;
  html: string;
  indicators: TemplateIndicatorsModel;

  public constructor(init?: Partial<TemplateModel>) {
    Object.assign(this, init);
  }
}
