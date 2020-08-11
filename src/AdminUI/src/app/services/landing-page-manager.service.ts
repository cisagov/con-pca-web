import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Landing_Page } from '../models/landing-page.models';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams(),
};

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

  /**
   * GET a list of all landingpagess
   * @param retired
   */
  getAlllandingpages(retired: boolean = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/landingpages/`;
    if (retired) {
      url = `${url}?retired=true`;
    }
    return this.http.get(url, headers);
  }

  /**
   * GET a single landingpages using the provided temlpate_uuid
   * @param uuid
   */
  getlandingpages(uuid: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.settingsService.settings.apiUrl}/api/v1/landingpages/${uuid}`)
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
   * POST a new landingpages
   * @param landingpages
   */
  saveNewlandingpages(landingpages: Landing_Page) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/v1/landingpagess/`,
      landingpages
    );
  }

  /**
   * PATCH an existing landingpages with partial data
   * @param landingpages
   */
  updatelandingpages(landingpages: Landing_Page) {
    return new Promise((resolve, reject) => {
      this.http
        .patch(
          `${this.settingsService.settings.apiUrl}/api/v1/landingpages/${landingpages.landing_page_uuid}/`,
          landingpages
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
   * @param landingpages
   */
  deletelandingpages(landingpages: Landing_Page) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/v1/landingpages/${landingpages.landing_page_uuid}/`
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
   * @param landingpages
   */
  stoplandingpages(landingpages: Landing_Page) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/landingpages/stop/${landingpages.landing_page_uuid}/`
    );
  }

}
