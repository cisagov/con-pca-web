import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {}

  /**
   * Returns the current logged-in user
   */
  getCurrentUser() {
    let user = localStorage.getItem("username");
    if (user)
       return user;
    return "Hello"
  }
}
