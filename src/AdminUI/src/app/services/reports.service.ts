import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  /**
   * Returns a promise with the Yearly report for the specified subscription and date.
   */
  public getYearlyReport(
    subscriptionUuid: string,
    cycleUuid: string,
    isHeadless: any
  ) {
    const urlRoot =
      isHeadless === 'false'
        ? this.settingsService.settings.apiUrl
        : this.settingsService.settings.apiUrlHeadless;
    const url = `${urlRoot}/api/v1/reports/${subscriptionUuid}/yearly/${cycleUuid}/`;
    return this.http.get(url);
  }

  /**
   * Returns a promise with the Cycle report for the specified subscription and date.
   */
  public getCycleReport(
    subscriptionUuid: string,
    cycleUuid: string,
    isHeadless: any
  ) {
    const urlRoot =
      isHeadless === 'false'
        ? this.settingsService.settings.apiUrl
        : this.settingsService.settings.apiUrlHeadless;
    const url = `${urlRoot}/api/v1/reports/${subscriptionUuid}/cycle/${cycleUuid}/`;
    return this.http.get(url);
  }

  /**
   * Returns a promise with the Monthly report for the specified subscription and date.
   */
  public getMonthlyReport(
    subscriptionUuid: string,
    cycleUuid: string,
    isHeadless: any
  ) {
    const urlRoot =
      isHeadless === 'false'
        ? this.settingsService.settings.apiUrl
        : this.settingsService.settings.apiUrlHeadless;

    const url = `${urlRoot}/api/v1/reports/${subscriptionUuid}/monthly/${cycleUuid}/`;
    return this.http.get(url);
  }
}
