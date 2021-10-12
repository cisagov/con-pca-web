export class TagModel {
  tag: string;
  description: string;
  data_source: string;
  tag_type: string;

  public constructor(init?: Partial<TagModel>) {
    Object.assign(this, init);
  }
}
