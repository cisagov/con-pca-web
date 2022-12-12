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
    private settingsService: SettingsService,
  ) {}

  public getAllProfiles() {
    const url = `${this.settingsService.settings.apiUrl}/api/sendingprofiles/`;
    return this.http.get<SendingProfileModel[]>(url);
  }

  public getProfile(id: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/sendingprofile/${id}/`;
    return this.http.get(url);
  }

  public saveProfile(sp: SendingProfileModel) {
    if (!sp._id) {
      // if new, post
      const url = `${this.settingsService.settings.apiUrl}/api/sendingprofiles/`;
      return this.http.post(url, sp);
    } else {
      // else patch
      const url = `${this.settingsService.settings.apiUrl}/api/sendingprofile/${sp._id}/`;
      return this.http.put(url, sp);
    }
  }

  public deleteProfile(id: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/sendingprofile/${id}/`;
    return this.http.delete(url);
  }

  sendTestEmail(sp: TestEmailModel) {
    const url = `${this.settingsService.settings.apiUrl}/api/util/send_test_email/`;
    return this.http.post(url, sp);
  }
}
