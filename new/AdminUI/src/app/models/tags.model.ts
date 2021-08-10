export class Tags {
  tag_definition_uuid: string;
  tag: string;
  description: string;
  data_source: string;
  tag_type: string;

  // Database tracking variables
  created_by?: string;
  cb_timestamp?: Date;
  last_updated_by?: string;
  lub_timestamp?: Date;
}
