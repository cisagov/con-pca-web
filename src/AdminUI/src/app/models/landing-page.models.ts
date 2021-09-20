export class LandingPageModel {
  landing_page_uuid: string;
  name: string;
  is_default_template: boolean;
  html: string;

  public constructor(init?: Partial<LandingPageModel>) {
    Object.assign(this, init);
  }
}
