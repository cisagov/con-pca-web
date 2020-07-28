import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettings } from 'src/app/AppSettings';
import { ReportsService } from 'src/app/services/reports.service';

@Component({
  selector: 'app-yearly',
  templateUrl: './yearly.component.html',
  styleUrls: ['./yearly.component.scss']
})
export class YearlyComponent implements OnInit {

  private routeSub: any;
  subscriptionUuid: string;
  reportStartDate: Date;
  detail: any;

  improvingTrend = false;
  degradingTrend = false;

  dateFormat = AppSettings.DATE_FORMAT;

  /**
   *
   */
  constructor(
    public reportsSvc: ReportsService,
    private route: ActivatedRoute,
  ) { }

  /**
   *
   */
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.subscriptionUuid = params.id;
      const isDate = new Date(params.start_date);
      const isHeadless = params.isHeadless;

      if (isDate.getTime()) {
        this.reportStartDate = isDate;
      } else {
        console.log('Invalid Date time provided, defaulting to now');
        this.reportStartDate = new Date();
      }
      this.reportsSvc.getYearlyReport(this.subscriptionUuid, this.reportStartDate, isHeadless).subscribe(resp => {
        this.detail = resp;

        this.fake();

        this.renderReport();
      },
        error => {
          console.log(error);


          this.fake();
          this.renderReport();
        });
    });
  }

  /**
   * FAKE
   */
  fake() {
    this.detail = {
      DHS_contact: {
        dhs_contact_uuid: '08b9f554-1918-434c-bd74-f27ae0ddb3e2',
        first_name: 'Andrew',
        last_name: 'Dwyer',
        title: 'Shoeshiner',
        office_phone: '',
        mobile_phone: '',
        email: 'andy@pawnee.govv',
        notes: '',
        active: true,
        created_by: 'dev user',
        cb_timestamp: '2020-07-13T19:16:29.009000Z',
        last_updated_by: 'dev user',
        lub_timestamp: '2020-07-13T19:16:29.009000Z'
      },
      customer: {
        full_name: 'Ice King',
        short_name: 'ICEKING',
        address_1: '200 W. Hiway 70',
        address_2: '',
        identifier: 'ICEKING',
        poc_email: null,
        vulnerabilty_team_lead_name: null,
        vulnerabilty_team_lead_email: null
      },
      dates: {
        start: '2020-07-13T19:24:42.367000Z',
        end: '2020-10-11T19:24:42.367000Z'
      },
      cycles: [{
        start_date: '2020-07-13T19:24:42.367000Z',
        end_date: '2020-10-11T19:24:42.367000Z',
        active: true,
        campaigns_in_cycle: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        phish_results: {
          sent: 0,
          opened: 0,
          clicked: 0,
          submitted: 0,
          reported: 0
        },
        override_total_reported: -1,
        quarter: '2020 - 1'
      }],
      target_year: {
        start_date: '2019-01-31',
        end_date: '2020-01-31'
      },
      primary_contact: {
        first_name: 'Raymond',
        last_name: 'Glaggamorgg'
      },
      primary_contact_email: 'raymond@ggggg.comm',
      dhs_contact_name: 'Andrew Dwyer',
      dhs_contact_office_phone: '000-555-9383',
      dhs_contact_mobile_phone: '000-555-3888',
      dhs_contact_email: 'andrew.dwyer@dhs.govv',

      metrics: {
        total_users_targeted: 1,
        number_of_email_sent_overall: 0,
        number_of_clicked_emails: 0,
        percent_of_clicked_emails: 'N/A',
        percent_of_submits: 'N/A',
        number_of_opened_emails: 0,
        number_of_phished_users_overall: 0,
        percent_report_rate: 'N/A',
        number_of_reports_to_helpdesk: 0,
        reports_to_clicks_ratio: 'N/A',
        avg_time_to_first_click: '',
        avg_time_to_first_report: '',
        most_successful_template: '',
        emails_sent_over_target_count: 0.0,
        customer_clicked_avg: 'N/A',
        national_clicked_avg: 'N/A',
        industry_clicked_avg: 'N/A',
        sector_clicked_avg: 'N/A',
        shortest_time_to_open: '',
        shortest_time_to_report: '',
        median_time_to_report: '',
        longest_time_to_open: ''
      },
      conclusions: [],
    };
  }

  /**
   *
   */
  renderReport() {

  }
}
