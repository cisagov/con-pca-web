import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class OverviewTabService {
  subscriptionStatsClicked = new BehaviorSubject<boolean>(false);
  loggingErrorsClicked = new BehaviorSubject<boolean>(false);
  failedEmailsClicked = new BehaviorSubject<boolean>(false);
}
