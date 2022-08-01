import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LandingDomainModel } from '../models/landing-domains.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class LandingDomainService {
  url: string;

  constructor(private http: HttpClient, private settingsSvc: SettingsService) {
    this.url = `${this.settingsSvc.settings.apiUrl}/api/landingdomain/`;
  }

  public getLandingDomains() {
    return this.http.get<LandingDomainModel[]>(`${this.url}s/`);
  }

  public getLandingDomain(id: string) {
    return this.http.get<LandingDomainModel>(`${this.url}/${id}/`);
  }

  public deleteLandingDomain(id: string) {
    return this.http.delete(`${this.url}/${id}/`);
  }

  public saveLandingDomain(landingDomain: LandingDomainModel) {
    if (landingDomain._id) {
      return this.http.put(`${this.url}/${landingDomain._id}/`, landingDomain);
    } else {
      return this.http.post(`${this.url}s/`, landingDomain);
    }
  }
}
