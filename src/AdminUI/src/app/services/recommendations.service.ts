import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecommendationModel } from '../models/recommendations.model';
import { SettingsService } from './settings.service';
import { Observable } from 'rxjs';

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

  getRecommendations(): Observable<RecommendationModel[]> {
    return this.http.get<RecommendationModel[]>(
      `${this.settingsService.settings.apiUrl}/api/recommendations/`
    );
  }

  saveRecommendations(recommendations: RecommendationModel) {
    return this.http.post(
      `${this.settingsService.settings.apiUrl}/api/recommendations/`,
      recommendations
    );
  }

  getRecommendation(id: string): Observable<RecommendationModel> {
    return this.http.get<RecommendationModel>(
      `${this.settingsService.settings.apiUrl}/api/recommendation/${id}/`
    );
  }

  deleteRecommendation(id: string) {
    return this.http.delete(
      `${this.settingsService.settings.apiUrl}/api/recommendations/${id}/`
    );
  }
}
