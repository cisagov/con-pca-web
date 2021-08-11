import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { RegisterUser } from 'src/app/models/registered-user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getUsers() {
    const url = `${this.settingsService.settings.apiUrl}/api/users/`;
    return this.http.get(url);
  }

  deleteUser(username: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/user/${username}/`;
    return this.http.delete(url);
  }

  confirmUser(username: string) {
    const url = `${this.settingsService.settings.apiUrl}/api/user/${username}/confirm/`;
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

  postCreateUser(user: RegisterUser): Observable<any> {
    const url = `${this.settingsService.settings.apiUrl}/auth/register/`;
    return this.http.post(url, user).pipe(share());
  }
}
