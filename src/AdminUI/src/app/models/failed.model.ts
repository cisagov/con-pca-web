export class FailedEmailModel {
  _id: string;
  recipient: string;
  sent_time: string;
  reason: string;
  delivery_status: string;
  removed: boolean;
}

export class FailedModel {
  success: boolean;
  failed_emails: FailedEmailModel[];
}
