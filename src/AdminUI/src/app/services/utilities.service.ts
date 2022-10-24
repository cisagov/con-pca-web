import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class UtilitiesService {
  constructor(
    private http: HttpClient,
    private SettingsService: SettingsService
  ) {}

  public getContacts() {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const url = `${this.SettingsService.settings.apiUrl}/api/customers/contacts/`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }
}