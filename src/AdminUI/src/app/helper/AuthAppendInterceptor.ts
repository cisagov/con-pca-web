import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable()
export class AuthAppendInterceptor implements HttpInterceptor {
  constructor(private loginSvc: LoginService) {}
  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this.loginSvc.checkTimer();
    const idToken = this.getUserToken();

    if (idToken) {
      const cloned = httpRequest.clone({
        headers: httpRequest.headers.set('Authorization', 'Bearer ' + idToken),
      });
      return next.handle(cloned);
    } else {
      return next.handle(httpRequest);
    }
  }

  getUserToken() {
    return localStorage.getItem('id_token');
  }
}
