import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  /**
   *
   */
  public getAggregateStats() {
    console.log('getAggregateStats');
    const url = `${this.settingsService.settings.apiUrl}`
      + `/reports/aggregate`;
    return this.http.get(url);
  }
}
