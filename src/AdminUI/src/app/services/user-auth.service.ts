import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  currentAuthUser: any;

  constructor() {
    this.currentAuthUser = localStorage.getItem('username');
  }
}
