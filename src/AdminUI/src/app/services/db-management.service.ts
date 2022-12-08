// Angular Imports
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

@Injectable()
export class DBManagementService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
  ) {}

  dumpDatabaseData() {
    const url = `${this.settingsService.settings.apiUrl}/api/X3zdf0_3wl1-s3c9r1/`;
    return this.http.get(url, { responseType: 'blob' });
  }

  loadDatabaseData(data) {
    const url = `${this.settingsService.settings.apiUrl}/api/X3zdf0_3wl1-s3c9r1/`;
    return this.http.post(url, data);
  }
}
