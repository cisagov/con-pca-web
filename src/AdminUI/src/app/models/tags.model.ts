export class TagModel {
  tag_definition_uuid: string;
  tag: string;
  description: string;
  data_source: string;
  tag_type: string;

  public constructor(init?: Partial<TagModel>) {
    Object.assign(this, init);
  }
}
