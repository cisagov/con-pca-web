import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CustomerModel, ContactModel } from '../models/customer.model';
import {
  SubscriptionModel,
  SubscriptionTestResultsModel,
} from '../models/subscription.model';
import { TemplateModel } from '../models/template.model';
import { SettingsService } from './settings.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { CycleModel } from '../models/cycle.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  subscription: SubscriptionModel;
  subBehaviorSubject = new BehaviorSubject<SubscriptionModel>(
    new SubscriptionModel()
  );
  cycleBehaviorSubject = new BehaviorSubject<CycleModel>(new CycleModel());
  customer: CustomerModel;
  customers: Array<CustomerModel> = [];
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
    this.subBehaviorSubject = new BehaviorSubject<SubscriptionModel>(
      new SubscriptionModel()
    );
  }

  public getCycleBehaviorSubject() {
    return this.cycleBehaviorSubject;
  }
  public setCycleBehaviorSubject(cycle) {
    this.cycleBehaviorSubject.next(cycle);
  }
  public clearCycleBehaviorSubject() {
    this.cycleBehaviorSubject = new BehaviorSubject<CycleModel>(
      new CycleModel()
    );
  }

  public getSubscriptions(archived = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/subscriptions/`;

    if (archived) {
      url = `${url}?archived=true`;
    }
    return this.http.get(url);
  }

  public getPrimaryContactSubscriptions(
    customerId: string,
    contact: ContactModel
  ) {
    const c = { primary_contact: contact };
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/customer/${customerId}/`;
    return this.http.post(url, c);
  }

  public getSubscription(subscriptionId: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/`;
    return this.http.get<SubscriptionModel>(url);
  }

  public deleteSubscription(subscription: SubscriptionModel) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscription._id}/`;
    return this.http.delete(url);
  }

  submitSubscription(subscription: SubscriptionModel) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscriptions/`;
    return this.http.post(url, subscription);
  }

  restartSubscription(id: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${id}/launch/`;
    return this.http.get(url);
  }

  patchSubscription(subscription: SubscriptionModel) {
    // This should be the only data that needs patched
    const data = {
      archived: subscription.archived,
      primary_contact: subscription.primary_contact,
      admin_email: subscription.admin_email,
      start_date: subscription.start_date,
      target_email_list: subscription.target_email_list,
      sending_profile_id: subscription.sending_profile_id,
      target_domain: subscription.target_domain,
      continuous_subscription: subscription.continuous_subscription,
      templates_selected: subscription.templates_selected,
      buffer_time_minutes: subscription.buffer_time_minutes,
      cycle_length_minutes: subscription.cycle_length_minutes,
      cooldown_minutes: subscription.cooldown_minutes,
      report_frequency_minutes: subscription.report_frequency_minutes,
      reporting_password: subscription.reporting_password,
      landing_page_url: subscription.landing_page_url,
      landing_domain: subscription.landing_domain,
    };

    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/subscription/${subscription._id}/`,
      data
    );
  }

  changePrimaryContact(subscriptionId: string, contact: ContactModel) {
    const c = { primary_contact: contact };
    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/`,
      c
    );
  }

  public getSubscriptionsByTemplate(template: TemplateModel) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/subscriptions/?template=${template._id}`
    );
  }

  public getSubscriptionsWithEndDate() {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/subscriptions/?overview=true`
    );
  }

  public getSubscriptionsByCustomer(customer: CustomerModel) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/subscriptions/?customer_id=${customer._id}`
    );
  }

  public stopSubscription(subscriptionId: string) {
    return this.http.delete(
      `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/launch/`
    );
  }

  public downloadReport(
    cycleId: string,
    reportType: string,
    nonhuman = false
  ): Observable<Blob> {
    const headers = new HttpHeaders().set('Accept', 'application/pdf');
    let url = `${this.settingsService.settings.apiUrl}/api/cycle/${cycleId}/reports/${reportType}/pdf/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  public sendReport(cycleId: string, reportType: string, nonhuman = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/cycle/${cycleId}/reports/${reportType}/email/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
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
    return this.http.get<string[]>(url).toPromise();
  }

  public rotateHeader(subscriptionId) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/header/`;
    return this.http.get<SubscriptionModel>(url);
  }

  public testSubscription(subscriptionId: string, contacts: ContactModel[]) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/test/`;
    return this.http.post<SubscriptionTestResultsModel[]>(url, { contacts });
  }

  public getTestResults(subscriptionId: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/test/`;
    return this.http.get<SubscriptionTestResultsModel[]>(url);
  }

  public exportSafelist(
    subscriptionId: string,
    phishHeader: string,
    domains: any[],
    ips: any[],
    simulationURL: string,
    templates: TemplateModel[],
    password: string
  ): Observable<Blob> {
    const headers = new HttpHeaders().set(
      'Accept',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const url = `${this.settingsService.settings.apiUrl}/api/subscription/${subscriptionId}/safelist/export/`;
    return this.http.post(
      url,
      {
        phish_header: phishHeader,
        domains: domains,
        ips: ips,
        simulation_url: simulationURL,
        templates: templates,
        password: password,
      },
      { headers, responseType: 'blob' }
    );
  }

  public getRandomPassword() {
    const url = `${this.settingsService.settings.apiUrl}/api/util/randompassword/`;
    return this.http.get(url);
  }
}
