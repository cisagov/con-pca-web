export class LandingPageModel {
  _id: string;
  name: string;
  is_default_template: boolean;
  html: string;

  public constructor(init?: Partial<LandingPageModel>) {
    Object.assign(this, init);
  }
}
