import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getUsers() {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/users/`;
    return this.http.get(url);
  }

  deleteUser(username: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/user/${username}/`;
    return this.http.delete(url);
  }

  confirmUser(username: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/v1/user/${username}/confirm/`;
    return this.http.get(url);
  }

  /**
   * Returns the current logged-in user
   */
  getCurrentUser() {
    const user = localStorage.getItem('username');
    if (user) {
      return user;
    }
    return 'Hello';
  }
}
