import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  currentAuthUser: any;

  constructor() {
    this.currentAuthUser = localStorage.getItem('username');
  }

  // getReportToken() {
  //   if (environment.authorize) {
  //     return new Promise((resolve, reject) => {
  //       this.route.queryParamMap
  //         .toPromise()
  //         .then((success) => {
  //           resolve({
  //             idToken: success['reportToken'],
  //           });
  //         })
  //         .catch((error) => {
  //           reject(error);
  //         });
  //     });
  //   }
  // }

  // getUserTokens() {
  //   if (environment.authorize) {
  //     const reportTokenGlobal = new URL(
  //       document.location.toString()
  //     ).searchParams.get('reportToken');

  //     if (reportTokenGlobal) {
  //       return new Promise((resolve, reject) => {
  //         resolve({
  //           idToken: reportTokenGlobal,
  //         });
  //       });
  //     } else {
  //       return new Promise((resolve, reject) => {
  //         Auth.currentAuthenticatedUser()
  //           .then((success) => {
  //             this._setUserName(success);
  //             resolve({
  //               idToken: success.signInUserSession.accessToken.jwtToken,
  //               accessToken: success.signInUserSession.idToken.jwtToken,
  //             });
  //           })
  //           .catch((error) => {
  //             reject(error);
  //             this.redirectToSignIn();
  //           });
  //       });
  //     }
  //   } else {
  //     return new Promise((resolve, reject) => {
  //       resolve({
  //         idToken: 'Angular not set to authorize',
  //         accessToken: 'Angular not set to authorize',
  //       });
  //     });
  //   }
  // }
}
