import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { UserAuthService } from '../services/user-auth.service';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRouteSnapshot, ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class AuthAppendInterceptor implements HttpInterceptor {
  constructor(private userAuthSvc: UserAuthService, private router: Router) { }
  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.userAuthSvc.getUserTokens()).pipe(
      switchMap((token) => {
        const headers = httpRequest.headers
          .set('Authorization', 'Bearer ' + token['idToken'])
          .append('Content-Type', 'application/json');
        const requestClone = httpRequest.clone({
          headers,
        });
        return next.handle(requestClone);
      })
    );
  }
}
