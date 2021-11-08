export class ConfigModel {
  REPORTING_FROM_ADDRESS: string;
  REPORTING_INTERFACE_TYPE: string;

  // Reporting SMTP Fields
  REPORTING_SMTP_HOST: string;
  REPORTING_SMTP_USERNAME: string;
  REPORTING_SMTP_PASSWORD: string;

  // Reporting Mailgun Fields
  REPORTING_MAILGUN_API_KEY: string;
  REPORTING_MAILGUN_DOMAIN: string;

  // Reporting SES Fields
  REPORTING_SES_ARN: string;
}
