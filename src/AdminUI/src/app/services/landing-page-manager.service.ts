import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { LandingPageModel } from '../models/landing-page.models';

@Injectable()
export class LandingPageManagerService {
  /**
   * Constructor.
   * @param http
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
  ) {
    // load the tags collection up front
  }

  getAlllandingpages(with_default: boolean = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/landingpages/`;
    if (with_default) {
      url = `${url}?with_default=true`;
    }
    return this.http.get(url);
  }

  getlandingpage(id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.settingsService.settings.apiUrl}/api/landingpage/${id}/`)
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          },
          () => {},
        );
    });
  }

  saveNewlandingpage(landingpage: LandingPageModel) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/landingpages/`,
      landingpage,
    );
  }

  updatelandingpage(landingpage: LandingPageModel) {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${this.settingsService.settings.apiUrl}/api/landingpage/${landingpage._id}/`,
          landingpage,
        )
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          },
          () => {},
        );
    });
  }

  deletelandingpage(landingpage: LandingPageModel) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/landingpage/${landingpage._id}/`,
        )
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          },
        );
    });
  }

  stoplandingpage(landingpage: LandingPageModel) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/landingpage/stop/${landingpage._id}/`,
    );
  }

  getLandingPageTemplates(landingPageId: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/landingpage/${landingPageId}/templates`,
    );
  }
}
