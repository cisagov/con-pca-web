import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class NonhumanService {
  url: string;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
  ) {
    this.url = `${this.settingsService.settings.apiUrl}/api/nonhumans/`;
  }

  public getNonHumanOrgs() {
    return this.http.get(this.url);
  }

  public saveNonHumanOrg(org) {
    return this.http.post(this.url, org);
  }

  public deleteNonHumanOrg(org) {
    return this.http.request('DELETE', this.url, { body: org });
  }
}
