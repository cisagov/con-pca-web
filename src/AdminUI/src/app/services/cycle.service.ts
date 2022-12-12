import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CycleModel, CycleManualReportsModel } from '../models/cycle.model';
import { CycleStatsModel } from '../models/stats.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class CycleService {
  constructor(
    private http: HttpClient,
    private SettingsService: SettingsService,
  ) {}

  public getSubscriptionCycles(subscriptionId: string) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycles/?subscription_id=${subscriptionId}`;
    return this.http.get<CycleModel[]>(url);
  }

  public getCycle(cycleId: string) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleId}/`;
    return this.http.get<CycleModel>(url);
  }

  public deleteCycle(cycleId) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleId}/`;
    return this.http.delete(url);
  }

  public getCycleStats(cycleId: string, nonhuman = false) {
    let url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleId}/stats/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    return this.http.get<CycleStatsModel>(url);
  }

  public saveManualReports(
    cycleId: string,
    manualReports: CycleManualReportsModel[],
  ) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleId}/manual_reports/`;
    return this.http.post(url, { manual_reports: manualReports });
  }
}
