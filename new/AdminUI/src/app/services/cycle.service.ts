import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cycle } from '../models/cycle.model';
import { CycleStats } from '../models/stats.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class CycleService {
  constructor(
    private http: HttpClient,
    private SettingsService: SettingsService
  ) {}

  public getSubscriptionCycles(subscriptionUuid: string) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycles/?subscription_uuid=${subscriptionUuid}`;
    return this.http.get<Cycle[]>(url);
  }

  public getCycle(cycleUuid: string) {
    const url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleUuid}/`;
    return this.http.get<Cycle>(url);
  }

  public getCycleStats(cycleUuid: string, nonhuman = false) {
    let url = `${this.SettingsService.settings.apiUrl}/api/cycle/${cycleUuid}/stats/`;
    if (nonhuman) {
      url += `?nonhuman${nonhuman}`;
    }
    return this.http.get<CycleStats>(url);
  }
}
