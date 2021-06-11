import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Customer, Contact } from '../models/customer.model';
import {
  Cycle,
  Subscription,
  TemplateSelected,
} from '../models/subscription.model';
import { Template } from '../models/template.model';
import { SettingsService } from './settings.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  subscription: Subscription;
  subBehaviorSubject = new BehaviorSubject<Subscription>(new Subscription());
  cycleBehaviorSubject = new BehaviorSubject<Cycle>(new Cycle());
  customer: Customer;
  customers: Array<Customer> = [];
  cameFromSubscription: boolean;
  removeDupeTargets = true;

  /**
   *
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  public getSubBehaviorSubject() {
    return this.subBehaviorSubject;
  }
  public setSubBhaviorSubject(sub) {
    this.subBehaviorSubject.next(sub);
  }
  public clearSubBehaviorSubject() {
    this.subBehaviorSubject = new BehaviorSubject<Subscription>(
      new Subscription()
    );
  }

  public getCycleBehaviorSubject() {
    return this.cycleBehaviorSubject;
  }
  public setCycleBehaviorSubject(cycle) {
    this.cycleBehaviorSubject.next(cycle);
  }
  public clearCycleBehaviorSubject() {
    this.cycleBehaviorSubject = new BehaviorSubject<Cycle>(new Cycle());
  }

  /**
   *
   */
  public getSubscriptions(archived: boolean = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/subscriptions/`;

    if (archived) {
      url = `${url}?archived=true`;
    }

    return this.http.get(url);
  }

  /**
   * Call to search subs for custumer uuid and primary contact.
   */
  public getPrimaryContactSubscriptions(
    customer_uuid: string,
    contact: Contact
  ) {
    const c = { primary_contact: contact };
    let url = `${this.settingsService.settings.apiUrl}/api/v1/subscription/customer/${customer_uuid}/`;
    return this.http.post(url, c);
  }

  /**
   *
   * @param subscription_uuid
   */
  public getSubscription(subscription_uuid: string) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/subscription/${subscription_uuid}/`;
    return this.http.get(url);
  }

  public deleteSubscription(subscription: Subscription) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/v1/subscription/${subscription.subscription_uuid}/`
        )
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  changeTargetCache(subscription: Subscription) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/targetcache/${subscription.subscription_uuid}/`,
      subscription.target_email_list_cached_copy
    );
  }
  /**
   * Sends all information to the API to start a new subscription.
   * @param s
   */
  submitSubscription(subscription: Subscription) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/v1/subscriptions/`,
      subscription
    );
  }

  /**
   * Restarts a subscription
   * @param uuid The uuid of the subscription to restart.
   */
  restartSubscription(uuid: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/restart/${uuid}`
    );
  }

  patchSubscription(subscription: Subscription) {
    // This should be the only data that needs patched
    const data = {
      archived: subscription.archived,
      primary_contact: subscription.primary_contact,
      dhs_contact_uuid: subscription.dhs_contact_uuid,
      start_date: subscription.start_date,
      target_email_list_cached_copy: subscription.target_email_list_cached_copy,
      target_email_list: subscription.target_email_list,
      sending_profile_name: subscription.sending_profile_name,
      target_domain: subscription.target_domain,
      continuous_subscription: subscription.continuous_subscription,
      templates_selected: subscription.templates_selected,
      cycle_length_minutes: subscription.cycle_length_minutes,
      report_length_minutes: subscription.report_length_minutes,
    };

    return this.http.patch(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/${subscription.subscription_uuid}/`,
      data
    );
  }

  /**
   * Patches the subscription with the new primary contact.
   */
  changePrimaryContact(subscriptUuid: string, contact: Contact) {
    const c = { primary_contact: contact };
    return this.http.patch(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/${subscriptUuid}/`,
      c
    );
  }

  /**
   * Gets all subscriptions for a given template.
   * @param dhsContact
   */
  public getSubscriptionsByDnsContact(dhsContact: Contact) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/subscriptions/?dhs_contact=${dhsContact.dhs_contact_uuid}`
    );
  }

  /**
   * Patches the subscription with the new CISA contact.
   */
  changeDhsContact(subscriptUuid: string, contactUuid: string) {
    const c = { dhs_contact_uuid: contactUuid };
    return this.http.patch(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/${subscriptUuid}/`,
      c
    );
  }

  /**
   * Gets all subscriptions for a given template.
   * @param template
   */
  public getSubscriptionsByTemplate(template: Template) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/subscriptions/?template=${template.template_uuid}`
    );
  }

  /**
   * Gets all subscriptions for a given customer.
   * @param template
   */
  public getSubscriptionsByCustomer(customer: Customer) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/customer/${customer.customer_uuid}`
    );
  }

  public stopSubscription(subscription_uuid: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/stop/${subscription_uuid}/`
    );
  }

  public startSubscription(
    subscription_uuid: string,
    continuousSubscription: boolean
  ) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/subscription/restart/${subscription_uuid}?continuous_subscription=${continuousSubscription}`
    );
  }

  /**
   * Gets timeline items for the subscription.
   */
  public getTimelineItems(subscription_uuid) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/subscription/timeline/${subscription_uuid}/`;
    return this.http.get(url);
  }

  /**
   * Returns a list of CISA contacts.
   */
  public getDhsContacts() {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/dhscontacts/`;
    return this.http.get(url);
  }

  /**
   * Posts or patches a CISA contact.
   */
  public saveDhsContact(c: Contact) {
    if (!!c.dhs_contact_uuid) {
      // patch existing contact
      const url = `${this.settingsService.settings.apiUrl}/api/v1/dhscontact/${c.dhs_contact_uuid}/`;
      return this.http.patch(url, c);
    } else {
      // insert new contact
      const url = `${this.settingsService.settings.apiUrl}/api/v1/dhscontacts/`;
      return this.http.post(url, c);
    }
  }

  /**
   * Deletes a CISA contact.
   */
  public deleteDhsContact(c: Contact) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/dhscontact/${c.dhs_contact_uuid}/`;
    return this.http.delete(url);
  }

  public getMonthlyReport(uuid: string, cycleUuid: string): Observable<Blob> {
    const headers = new HttpHeaders().set('Accept', 'application/pdf');
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/${uuid}/pdf/monthly/${cycleUuid}/`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  public getCycleReport(uuid: string, cycleUuid: string) {
    const headers = new HttpHeaders().set('content-type', 'application/pdf');
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/${uuid}/pdf/cycle/${cycleUuid}/`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  public getYearlyReport(uuid: string, cycleUuid: string) {
    const headers = new HttpHeaders().set('content-type', 'application/pdf');
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/${uuid}/pdf/yearly/${cycleUuid}/`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  public sendMonthlyReport(uuid: string, cycleUuid: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/${uuid}/email/monthly/${cycleUuid}/`;
    return this.http.get(url);
  }

  public sendCycleReport(uuid: string, cycleUuid: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/${uuid}/email/cycle/${cycleUuid}/`;
    return this.http.get(url);
  }

  public sendYearlyReport(uuid: string, cycleUuid: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/${uuid}/email/yearly/${cycleUuid}/`;
    return this.http.get(url);
  }

  public getReportValuesForSubscription(subscription_uuid) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/cycleemailreported/${subscription_uuid}/`;
    return this.http.get(url);
  }
  public postReportValuesForSubscription(data, subscription_uuid) {
    console.log(data);
    const url = `${this.settingsService.settings.apiUrl}/api/v1/cycleemailreported/${subscription_uuid}/`;
    return this.http.post(url, data);
  }
  public getSusbcriptionStatusEmailsSent(subscription_uuid) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/reports/subscription_report_emails_sent/${subscription_uuid}/`;
    return this.http.get(url);
  }

  public checkValid(cycleLengthMinutes: number, targetCount: number) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/subscriptions/valid/`;
    const data = {
      target_count: targetCount,
      cycle_minutes: cycleLengthMinutes,
    };
    return this.http.post(url, data);
  }
  public async getTemplatesSelected() {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/templates/select/`;
    return this.http.get<TemplateSelected>(url).toPromise();
  }
}
