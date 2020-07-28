import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify'
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  currentAuthUser: any;
  public currentAuthUserSubject: BehaviorSubject<string> = new BehaviorSubject<string>('Not Authorized');

  constructor(
    private router: Router
  ) {
    this.currentAuthUserSubject.subscribe((value) => {
      this.currentAuthUser = value;
    });
    this.userIsAuthenticated().then().catch(error => console.log(error));
  }

  // Handles amplify authentification notfications from Hub
  handleAuthNotification(data) {
    //   if(data['channel'] === 'auth'){
    //     if(data['payload']['event'] === 'signIn'){
    //     }
    //   }
  }



  signOut() {
    console.log('Authorize?');
    console.log(environment.authorize);
    Auth.signOut();
  }

  redirectToSignIn() {
    Auth.federatedSignIn();
  }

  // Check Authentication, refreshing if possible. Redirecting to sign in if not authenticated
  userIsAuthenticated() {
    if (environment.authorize) {
      return new Promise((resolve, reject) => {
        Auth.currentAuthenticatedUser()
          .then((success) => {
            this._setUserName(success);
            resolve(true);
          })
          .catch((error) => {
            console.log(error);
            this.signOut();
            this.redirectToSignIn();
            reject(error);
          });
      });
    } else if (!environment.authorize) {
      return new Promise((resolve, reject) => {
        console.log('Environment not set to authorize');
        resolve(true);
      });
    }
  }

  _setUserName(succesfulAuthObject) {
    if (succesfulAuthObject['signInUserSession']['idToken']['payload']['name'] != undefined) {
      this.currentAuthUserSubject.next(String(succesfulAuthObject['signInUserSession']['idToken']['payload']['name']))
    } else {
      this.currentAuthUserSubject.next(succesfulAuthObject['username'])
    }
  }

  getUserNameBehaviorSubject(): Observable<any> {
    return this.currentAuthUserSubject;
  }


  getUserTokens() {

    if (environment.authorize) {
      return new Promise((resolve, reject) => {
        Auth.currentAuthenticatedUser()
          .then((success) => {
            this._setUserName(success);
            resolve({
              idToken: success.signInUserSession.accessToken.jwtToken,
              accessToken: success.signInUserSession.idToken.jwtToken
            });
          })
          .catch((error) => {
            reject(error);
            this.redirectToSignIn();
          });
      });
    } else if (!environment.authorize) {
      return new Promise((resolve, reject) => {
        resolve({
          idToken: 'Angular not set to authorize',
          accessToken: 'Angular not set to authorize'
        });
      });
    }
  }
}
