import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SendingProfileModel } from '../models/sending-profile.model';
import { SettingsService } from './settings.service';
import { TestEmailModel } from '../models/test-email.model';

@Injectable({
  providedIn: 'root',
})
export class SendingProfileService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  public getAllProfiles() {
    const url = `${this.settingsService.settings.apiUrl}/api/sendingprofiles/`;
    return this.http.get(url);
  }

  public getProfile(uuid: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/sendingprofile/${uuid}/`;
    return this.http.get(url);
  }

  public saveProfile(sp: SendingProfileModel) {
    if (!sp.sending_profile_uuid) {
      // if new, post
      const url = `${this.settingsService.settings.apiUrl}/api/sendingprofiles/`;
      return this.http.post(url, sp);
    } else {
      // else patch
      const url = `${this.settingsService.settings.apiUrl}/api/sendingprofile/${sp.sending_profile_uuid}/`;
      return this.http.put(url, sp);
    }
  }

  public deleteProfile(uuid: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/sendingprofile/${uuid}`;
    return this.http.delete(url);
  }

  sendTestEmail(sp: TestEmailModel) {
    const url = `${this.settingsService.settings.apiUrl}/api/util/send_test_email/`;
    return this.http.post(url, sp);
  }
}