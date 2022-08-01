import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  constructor(
    private http: HttpClient,
    private SettingsService: SettingsService
  ) {}

  public getLogging() {
    const url = `${this.SettingsService.settings.apiUrl}/api/logging/`;
    return this.http.get(url);
  }
}
