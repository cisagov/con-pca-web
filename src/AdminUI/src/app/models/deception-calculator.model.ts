/**
 * The components that go into determing the deception rating of a email
 */
export class DeceptionCalculation {
  //ID
  template__uuid: string;

  //template example
  temlpateName?: string;
  templateBody?: string;
  templateSubject?: string;

  //0-2 options
  grammar: number;
  internal: number;
  authoritative: number;

  //0-1 options
  link_domain: number;
  logo_graphics: number;
  external: number;
  organization: number;
  public_news: number;

  //no score options
  fear?: boolean;
  duty_obligation?: boolean;
  curiosity?: boolean;
  greed?: boolean;

  //text entry (May need conversion to array if values are parsed on the front end)
  descriptive_words?: string;

  //calculated fields
  final_deception_score: number;

  public constructor(init?: Partial<DeceptionCalculation>) {
    Object.assign(this, init);
  }
}
