import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

type canDeactivateType = Observable<boolean> | Promise<boolean> | boolean;

export interface CanComponentDeactivate {
  canDeactivate: () => canDeactivateType;
}

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesGuard
  implements CanDeactivate<CanComponentDeactivate>
{
  canDeactivate(component: CanComponentDeactivate): canDeactivateType {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
