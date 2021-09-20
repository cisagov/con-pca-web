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

export class TemplateIndicatorsModel {
  appearance: TemplateAppearanceModel;
  sender: TemplateSenderModel;
  relevancy: TemplateRelevancyModel;
  behavior: TemplateBehaviorModel;
}

export class TemplateModel {
  template_uuid: string;
  name: string;
  landing_page_uuid: string;
  sending_profile_uuid: string;
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
