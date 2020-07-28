import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Recommendations } from 'src/app/models/recommendations.model';
import { SettingsService } from './settings.service';

const headers = {
    headers: new HttpHeaders().set('Content-Type', 'application/json'),
    params: new HttpParams()
};

@Injectable()
export class RecommendationsService {

    /**
     * Constructor.
     * @param http
     */
    constructor(
        private http: HttpClient,
        private settingsService: SettingsService
    ) { }

    /**
     * GET a list of all recommendations
     * @param retired
     */
    getAllRecommendations(retired: boolean = false) {
        let url = `${this.settingsService.settings.apiUrl}/api/v1/recommendations/`;
        if (retired) {
            url = `${url}?retired=true`;
        }
        return this.http.get(url, headers);
    }

    /**
     * GET a single recommendation using the provided recommendations_uuid
     * @param uuid
     */
    getRecommendation(uuid: string) {
        return this.http.get(`${this.settingsService.settings.apiUrl}/api/v1/recommendations/${uuid}`)
    }

    /**
     * POST a new recommendation
     * @param recommendation
     */
    saveNewRecommendation(recommendation: Recommendations) {
        return this.http.post(
            `${this.settingsService.settings.apiUrl}/api/v1/recommendations/`,
            recommendation
        );
    }

    /**
     * PATCH an existing recommendation with partial data
     * @param recommendation
     */
    updateRecommendation(recommendation: Recommendations) {
        return this.http.patch(
            `${this.settingsService.settings.apiUrl}/api/v1/recommendations/${recommendation.recommendations_uuid}/`,
            recommendation
        )
    }

    /**
     *
     * @param recommendation
     */
    deleteRecommendation(recommendation: Recommendations) {
        return this.http
            .delete(
                `${this.settingsService.settings.apiUrl}/api/v1/recommendations/${recommendation.recommendations_uuid}/`
            )
    }
}
