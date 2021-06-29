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

  public getReport(
    subscriptionUuid: string,
    cycleUuid: string,
    reportType: string,
    nonhuman = false,
    isHeadless = 'false'
  ) {
    const apiUrl =
      isHeadless === 'false'
        ? this.settingsService.settings.apiUrl
        : this.settingsService.settings.apiUrlHeadless;
    let url = `${apiUrl}/api/v1/reports/${subscriptionUuid}/${reportType}/${cycleUuid}/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    return this.http.get(url);
  }
}
