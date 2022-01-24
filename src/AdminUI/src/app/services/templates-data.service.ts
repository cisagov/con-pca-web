import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TemplatesDataService {
  private messageSource = new BehaviorSubject([]);
  currentData = this.messageSource.asObservable();

  changeData(templates: string[]) {
    this.messageSource.next(templates);
  }
}
