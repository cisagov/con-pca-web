import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';

import { LoginService } from '../services/login.service';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private loginSvc: LoginService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (environment.authorize) {
      return next.handle(request).pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.loginSvc.logout();
          }

          if (!this.loginSvc.isLoggedIn()) {
            this.loginSvc.logout();
          }

          return next.handle(request);
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
