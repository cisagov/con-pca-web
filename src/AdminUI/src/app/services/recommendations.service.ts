import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecommendationsModel } from '../models/recommendations.model';

import { SettingsService } from './settings.service';

const headers = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
  params: new HttpParams(),
};

@Injectable()
export class RecommendationsService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  url = `${this.settingsService.settings.apiUrl}/api/recommendations/`;

  getRecommendations() {
    return this.http.get<RecommendationsModel>(this.url);
  }

  saveRecommendations(recommendations: RecommendationsModel) {
    return this.http.post(this.url, recommendations);
  }
}
