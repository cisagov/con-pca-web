import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(
    private sanitizer: DomSanitizer
  ) { }

  /**
   * Returns the provided HTML without sanitization.
   */
  transform(value: any) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
