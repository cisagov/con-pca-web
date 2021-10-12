import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CycleModel } from '../models/cycle.model';
import { CycleStatsModel } from '../models/stats.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class CycleService {
  constructor(
    private http: HttpClient,
    private SettingsService: SettingsService
  ) {}

  public getSubscriptionCycles(subscriptionId: string) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycles/?subscription_id=${subscriptionId}`;
    return this.http.get<CycleModel[]>(url);
  }

  public getCycle(cycleId: string) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleId}/`;
    return this.http.get<CycleModel>(url);
  }

  public getCycleStats(cycleId: string, nonhuman = false) {
    let url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleId}/stats/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    return this.http.get<CycleStatsModel>(url);
  }
}
