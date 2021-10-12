import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  public getReport(cycleId: string, reportType: string, nonhuman = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/cycle/${cycleId}/reports/${reportType}/`;
    if (nonhuman) {
      url += `?nonhuman=${nonhuman}`;
    }
    const headers = new HttpHeaders().set('content-type', 'text/html');
    return this.http.get(url, { headers, responseType: 'text' });
  }
}
