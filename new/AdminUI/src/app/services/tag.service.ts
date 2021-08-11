import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Tags } from 'src/app/models/tags.model';
import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams(),
};

@Injectable()
export class TagService {
  /**
   * Constructor.
   * @param http
   */
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  /**
   * GET a list of all tags
   * @param retired
   */
  getAllTags() {
    let url = `${this.settingsService.settings.apiUrl}/api/tags/`;
    return this.http.get(url, headers);
  }

  /**
   * GET a single recommendation using the provided tag_definition_uuid
   * @param uuid
   */
  getTag(uuid: string) {
    return this.http.get(
      `${this.settingsService.settings.apiUrl}/api/tag/${uuid}`
    );
  }

  /**
   * POST a new tag
   * @param tag
   */
  saveNewTag(tag: Tags) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/tags/`,
      tag
    );
  }

  /**
   * PATCH an existing tag with partial data
   * @param tag
   */
  updateTag(tag: Tags) {
    return this.http.put(
      `${this.settingsService.settings.apiUrl}/api/tag/${tag.tag_definition_uuid}/`,
      tag
    );
  }

  /**
   *
   * @param tag
   */
  deleteTag(tag: Tags) {
    return this.http.delete(
      `${this.settingsService.settings.apiUrl}/api/tag/${tag.tag_definition_uuid}/`
    );
  }
}
