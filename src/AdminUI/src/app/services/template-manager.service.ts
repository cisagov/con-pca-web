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
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  async getAllTemplates(retired: boolean = false, templateIds = []) {
    let url = `${this.settingsService.settings.apiUrl}/api/templates/`;
    const parameters = [];
    if (retired) {
      parameters.push('retired=true');
    }

    if (templateIds) {
      parameters.push(`templates=${templateIds.join(',')}`);
    }

    if (parameters) {
      url = `${url}?${parameters.join('&')}`;
    }

    return this.http.get<TemplateModel[]>(url, headers).toPromise();
  }

  getTemplate(id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.settingsService.settings.apiUrl}/api/template/${id}`)
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

  saveNewTemplate(template: TemplateModel) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/templates/`,
      template
    );
  }

  updateTemplate(template: TemplateModel) {
    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${this.settingsService.settings.apiUrl}/api/template/${template._id}/`,
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

  deleteTemplate(template: TemplateModel) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(
          `${this.settingsService.settings.apiUrl}/api/template/${template._id}/`
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

  stopTemplate(template: TemplateModel) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/template/stop/${template._id}/`
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

  duplicateTemplate(id: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/template/${id}/duplicate/`
    );
  }
}
