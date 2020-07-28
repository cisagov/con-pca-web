import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';

import { UserAuthService } from '../services/user-auth.service';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private userAuthSvc: UserAuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (environment.authorize) {
      return next.handle(request).pipe(
        catchError((err) => {
          if (err.status === 401) {
            // auto logout if 401 response returned from api
            this.userAuthSvc.signOut();
            location.reload(true);
          }

          const error = err.error.message || err.statusText;
          return throwError(error);
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
