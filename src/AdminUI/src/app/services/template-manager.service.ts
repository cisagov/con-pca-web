import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Template, TagModel } from 'src/app/models/template.model';
import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams()
};

@Injectable()
export class TemplateManagerService {
  public tags: TagModel[];

  /**
   * Constructor.
   * @param http
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    // load the tags collection up front
    this.getAllTags().subscribe((result: TagModel[]) => {
      this.tags = result;
    });
  }

  /**
   * GET a list of all templates
   * @param retired
   */
  getAllTemplates(retired: boolean = false) {
    let url = `${this.settingsService.settings.apiUrl}/api/v1/templates/`;
    if (retired) {
      url = `${url}?retired=true`;
    }
    return this.http.get(url, headers);
  }

  /**
   * GET a single template using the provided temlpate_uuid
   * @param uuid
   */
  getTemplate(uuid: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.settingsService.settings.apiUrl}/api/v1/template/${uuid}`)
        .subscribe(
          success => {
            resolve(success);
          },
          error => {
            reject(error);
          },
          () => {}
        );
    });
  }

  /**
   * POST a new template
   * @param template
   */
  saveNewTemplate(template: Template) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/v1/templates/`,
      template
    );
  }

  /**
   * PATCH an existing template with partial data
   * @param template
   */
  updateTemplate(template: Template) {
    return new Promise((resolve, reject) => {
      this.http
        .patch(
          `${this.settingsService.settings.apiUrl}/api/v1/template/${template.template_uuid}/`,
          template
        )
        .subscribe(
          success => {
            resolve(success);
          },
          error => {
            reject(error);
          },
          () => {}
        );
    });
  }

  /**
   *
   * @param template
   */
  deleteTemplate(template: Template) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/v1/template/${template.template_uuid}/`
        )
        .subscribe(
          success => {
            resolve(success);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  /**
   *
   * @param template
   */
  stopTemplate(template: Template) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/template/stop/${template.template_uuid}/`
    );
  }

  /**
   * Gets a list of all known Tags
   */
  getAllTags() {
    return this.http.get(`${this.settingsService.settings.apiUrl}/api/v1/tags`);
  }
}
