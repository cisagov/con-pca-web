import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TemplateModel } from 'src/app/models/template.model';
import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams(),
};

@Injectable()
export class TemplateManagerService {
  /**
   * Constructor.
   * @param http
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  /**
   * GET a list of all templates
   * @param retired
   */
  async getAllTemplates(retired: boolean = false, templateUuids = []) {
    let url = `${this.settingsService.settings.apiUrl}/api/templates/`;
    const parameters = [];
    if (retired) {
      parameters.push('retired=true');
    }

    if (templateUuids) {
      parameters.push(`templates=${templateUuids.join(',')}`);
    }

    if (parameters) {
      url = `${url}?${parameters.join('&')}`;
    }

    return this.http.get<TemplateModel[]>(url, headers).toPromise();
  }

  /**
   * GET a single template using the provided temlpate_uuid
   * @param uuid
   */
  getTemplate(uuid: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.settingsService.settings.apiUrl}/api/template/${uuid}`)
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
   * POST a new template
   * @param template
   */
  saveNewTemplate(template: TemplateModel) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/templates/`,
      template
    );
  }

  /**
   * PATCH an existing template with partial data
   * @param template
   */
  updateTemplate(template: TemplateModel) {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${this.settingsService.settings.apiUrl}/api/template/${template.template_uuid}/`,
          template
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
   * @param template
   */
  deleteTemplate(template: TemplateModel) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/template/${template.template_uuid}/`
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
   * @param template
   */
  stopTemplate(template: TemplateModel) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/template/stop/${template.template_uuid}/`
    );
  }

  importEmail(content: string, convertLink: boolean) {
    const url = `${this.settingsService.settings.apiUrl}/api/templates/import/`;
    const data = {
      content,
      convert_link: convertLink,
    };
    return this.http.post(url, data);
  }

  public getTemplatesJSON(showRetired) {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const parameters = [];
    parameters.push(`retired=${showRetired}`);
    const url = `${
      this.settingsService.settings.apiUrl
    }/api/templates/?${parameters.join('&')}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  public getDeceptionLevel(deceptionScore: number) {
    if (deceptionScore < 3) {
      return 'low';
    } else if (deceptionScore < 5) {
      return 'moderate';
    } else {
      return 'high';
    }
  }
}
