import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class FailedEmailsService {
  constructor(
    private http: HttpClient,
    private SettingsService: SettingsService
  ) {}

  public getFailedEmails() {
    const url = `${this.SettingsService.settings.apiUrl}/api/failedemails/?retired=false`;
    return this.http.get(url);
  }
}
