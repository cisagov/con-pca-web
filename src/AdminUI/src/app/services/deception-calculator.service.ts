import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Template } from 'src/app/models/template.model';
import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams()
};

@Injectable()
export class DeceptionCalculatorService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  //GET single template for use in the deception calculator
  getDeception(templateUUID: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/v1/template/${templateUUID}`,
      headers
    );
  }

  //PATCH an updated deception calculation using the Template model
  saveDeception(template: Template) {
    return new Promise((resolve, reject) => {
      this.http
        .patch(
          `${this.settingsService.settings.apiUrl}/api/v1/template/${template.template_uuid}/`,
          template
        )
        .subscribe(
          success => {
            resolve('Template Saved');
          },
          error => {},
          () => {}
        );
    });
  }
}
