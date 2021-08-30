import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Customer, Contact } from '../models/customer.model';
import { Subscription, TemplateSelected } from '../models/subscription.model';
import { Template } from '../models/template.model';
import { SettingsService } from './settings.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cycle } from '../models/cycle.model';

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
    let url = `${this.settingsService.settings.apiUrl}/api/subscriptions/`;

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
    let url = `${this.settingsService.settings.apiUrl}/api/subscription/customer/${customer_uuid}/`;
    return this.http.post(url, c);
  }

  /**
   *
   * @param subscription_uuid
   */
  public getSubscription(subscription_uuid: string) {
    let url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscription_uuid}/`;
    return this.http.get(url);
  }

  public deleteSubscription(subscription: Subscription) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/subscription/${subscription.subscription_uuid}/`
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

  /**
   * Sends all information to the API to start a new subscription.
   * @param s
   */
  submitSubscription(subscription: Subscription) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/subscriptions/`,
      subscription
    );
  }

  /**
   * Restarts a subscription
   * @param uuid The uuid of the subscription to restart.
   */
  restartSubscription(uuid: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/subscription/${uuid}/launch/`
    );
  }

  patchSubscription(subscription: Subscription) {
    // This should be the only data that needs patched
    const data = {
      archived: subscription.archived,
      primary_contact: subscription.primary_contact,
      admin_email: subscription.admin_email,
      start_date: subscription.start_date,
      target_email_list: subscription.target_email_list,
      sending_profile_uuid: subscription.sending_profile_uuid,
      target_domain: subscription.target_domain,
      continuous_subscription: subscription.continuous_subscription,
      templates_selected: subscription.templates_selected,
      cycle_length_minutes: subscription.cycle_length_minutes,
      cooldown_minutes: subscription.cooldown_minutes,
      report_frequency_minutes: subscription.report_frequency_minutes,
    };

    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/subscription/${subscription.subscription_uuid}/`,
      data
    );
  }

  /**
   * Patches the subscription with the new primary contact.
   */
  changePrimaryContact(subscriptUuid: string, contact: Contact) {
    const c = { primary_contact: contact };
    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptUuid}/`,
      c
    );
  }

  /**
   * Gets all subscriptions for a given template.
   * @param template
   */
  public getSubscriptionsByTemplate(template: Template) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/subscriptions/?template=${template.template_uuid}`
    );
  }

  /**
   * Gets all subscriptions for a given customer.
   * @param template
   */
  public getSubscriptionsByCustomer(customer: Customer) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/subscription/customer/${customer.customer_uuid}`
    );
  }

  public stopSubscription(subscription_uuid: string) {
    return this.http.delete(
      `${this.settingsService.settings.apiUrl}/api/subscription/${subscription_uuid}/launch/`
    );
  }

  /**
   * Gets timeline items for the subscription.
   */
  public getTimelineItems(subscription_uuid) {
    let url = `${this.settingsService.settings.apiUrl}/api/subscription/timeline/${subscription_uuid}/`;
    return this.http.get(url);
  }

  public downloadReport(
    cycleUuid: string,
    reportType: string,
    nonhuman = false
  ): Observable<Blob> {
    const headers = new HttpHeaders().set('Accept', 'application/pdf');
    let url = `${this.settingsService.settings.apiUrl}/api/cycle/${cycleUuid}/reports/${reportType}/pdf/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  public sendReport(cycleUuid: string, reportType: string, nonhuman = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/cycle/${cycleUuid}/reports/${reportType}/email/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    return this.http.get(url);
  }

  public getSusbcriptionStatusEmailsSent(subscription_uuid) {
    const url = `${this.settingsService.settings.apiUrl}/api/reports/subscription_report_emails_sent/${subscription_uuid}/`;
    return this.http.get(url);
  }

  public checkValid(cycleLengthMinutes: number, targetCount: number) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscriptions/valid/`;
    const data = {
      target_count: targetCount,
      cycle_minutes: cycleLengthMinutes,
    };
    return this.http.post(url, data);
  }
  public async getTemplatesSelected() {
    const url = `${this.settingsService.settings.apiUrl}/api/templates/select/`;
    return this.http.get<TemplateSelected>(url).toPromise();
  }

  public getSubscriptionJSON(subscription_uuid) {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/downloadjson/${subscription_uuid}/`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }
}
