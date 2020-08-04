import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Subject, Observable, BehaviorSubject, from } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../environments/environment';
import { resolve } from 'dns';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  currentAuthUser: any;
  public currentAuthUserSubject: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('Not Authorized');

  constructor(private router: Router, private route: ActivatedRoute) {
    this.currentAuthUserSubject.subscribe((value) => {
      this.currentAuthUser = value;
    });
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
    console.log("user is authenticated")
    console.log(this.route.snapshot.queryParams)


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
    if (
      succesfulAuthObject['signInUserSession']['idToken']['payload']['name'] !=
      undefined
    ) {
      this.currentAuthUserSubject.next(
        String(
          succesfulAuthObject['signInUserSession']['idToken']['payload']['name']
        )
      );
    } else {
      this.currentAuthUserSubject.next(succesfulAuthObject['username']);
    }
  }

  getUserNameBehaviorSubject(): Observable<any> {
    return this.currentAuthUserSubject;
  }


  getReportToken() {
    if (environment.authorize) {
      console.log('using report token 1')
      return new Promise((resolve, reject) => {
        this.route.queryParamMap.toPromise()
          .then((success) => {
            console.log('using report token 2')
            console.log(success)
            resolve({
              idToken: success['reportToken'],
            });
          })
          .catch((error) => {
            console.log('report token error')
            console.log(error)
            reject(error)
          })
      });
    }
  }

  getUserTokens() {
    if (environment.authorize) {
      console.log("Getting User Tokens")

      const reportTokenGlobal = (new URL(document.location.toString())).searchParams.get('reportToken');

      if (reportTokenGlobal) {
        console.log("using report token")
        return new Promise((resolve, reject) => {
          resolve({
            idToken: reportTokenGlobal
          });
        });
      }
      else {
        console.log("checking for local storage token.")
        return new Promise((resolve, reject) => {
          Auth.currentAuthenticatedUser()
            .then((success) => {
              this._setUserName(success);
              console.log('using local storage token')
              resolve({
                idToken: success.signInUserSession.accessToken.jwtToken,
                accessToken: success.signInUserSession.idToken.jwtToken,
              });
            })
            .catch((error) => {
              console.log('no tokens present')
              reject(error);
              this.redirectToSignIn();
            });
        });
      }
    } else {
      return new Promise((resolve, reject) => {
        resolve({
          idToken: 'Angular not set to authorize',
          accessToken: 'Angular not set to authorize',
        });
      });
    }
  }
}
