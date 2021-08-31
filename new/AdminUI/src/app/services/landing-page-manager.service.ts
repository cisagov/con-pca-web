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
    private settingsService: SettingsService
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

  /**
   * GET a single landingpage using the provided temlpate_uuid
   * @param uuid
   */
  getlandingpage(uuid: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.settingsService.settings.apiUrl}/api/landingpage/${uuid}`)
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          },
          () => {}
        );
    });
  }

  /**
   * POST a new landingpage
   * @param landingpage
   */
  saveNewlandingpage(landingpage: LandingPageModel) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/landingpages/`,
      landingpage
    );
  }

  /**
   * PATCH an existing landingpage with partial data
   * @param landingpage
   */
  updatelandingpage(landingpage: LandingPageModel) {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${this.settingsService.settings.apiUrl}/api/landingpage/${landingpage.landing_page_uuid}/`,
          landingpage
        )
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          },
          () => {}
        );
    });
  }

  /**
   *
   * @param landingpage
   */
  deletelandingpage(landingpage: LandingPageModel) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/landingpage/${landingpage.landing_page_uuid}/`
        )
        .subscribe(
          (success) => {
            resolve(success);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  /**
   *
   * @param landingpage
   */
  stoplandingpage(landingpage: LandingPageModel) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/landingpage/stop/${landingpage.landing_page_uuid}/`
    );
  }

  getLandingPageTemplates(landingPageUuid: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/templates/?landing_page_uuid=${landingPageUuid}`
    );
  }
}
