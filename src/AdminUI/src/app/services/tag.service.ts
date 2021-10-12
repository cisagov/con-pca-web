import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TagModel } from 'src/app/models/tags.model';
import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams(),
};

@Injectable()
export class TagService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getAllTags() {
    const url = `${this.settingsService.settings.apiUrl}/api/tags/`;
    return this.http.get<TagModel[]>(url, headers);
  }
}
