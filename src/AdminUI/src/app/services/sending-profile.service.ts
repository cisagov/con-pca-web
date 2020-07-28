import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SendingProfile } from '../models/sending-profile.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class SendingProfileService {
  /**
   * Constructor.
   * @param http
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  /**
   * Returns a promise with all sending profiles.
   */
  public getAllProfiles() {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/sendingprofiles/`;
    return this.http.get(url);
  }

  /**
   *
   * @param id
   */
  public getProfile(id: number) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/sendingprofile/${id}/`;
    return this.http.get(url);
  }

  /**
   * Posts a new Sending Profile
   * -or-
   * patches an existing Sending Profile
   * @param sp
   */
  public saveProfile(sp: SendingProfile) {
    if (!sp.id) {
      // if new, post
      let url = `${this.settingsService.settings.apiUrl}/api/v1/sendingprofiles/`;
      return this.http.post(url, sp);
    } else {
      // else patch
      let url = `${this.settingsService.settings.apiUrl}/api/v1/sendingprofile/${sp.id}/`;
      return this.http.patch(url, sp);
    }
  }

  /**
   *
   * @param sp
   */
  public deleteProfile(spId: number) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/sendingprofile/${spId}`;
    return this.http.delete(url);
  }
}
