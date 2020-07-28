import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppSettings } from 'src/app/AppSettings';

@Pipe({name: 'UTCtoReadableTime'})
export class UTCtoReadableTime extends DatePipe implements PipeTransform {
  transform(value: string): string {
      return super.transform(new Date(value),AppSettings.DATE_FORMAT)      
  }
}