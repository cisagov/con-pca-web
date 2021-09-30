import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Input,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
})
export class LoadingOverlayComponent implements OnInit {
  @ViewChild('overlayContainer')
  overlayContainer: ElementRef;
  @ViewChild('loadingText')
  loadingText: ElementRef;

  display = true;
  display_text = 'Loading';

  @Input() showLoading: boolean;
  @Input() displayText: string;
  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayText) {
      this.display_text = this.displayText;
    }
    if (changes.showLoading) {
      this.display = changes.showLoading.currentValue;
      this.changeDisplay();
    }
  }
  changeDisplay() {
    if (!this.overlayContainer) {
      return;
    }
    if (!this.display) {
      this.overlayContainer.nativeElement.setAttribute('style', 'display:none');
    } else {
      if (this.overlayContainer) {
        this.overlayContainer.nativeElement.setAttribute(
          'style',
          'display:block'
        );
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var width = this.overlayContainer.nativeElement.offsetWidth;
    this.loadingText.nativeElement.setAttribute(
      'style',
      'width:' + width + 'px;'
    );
  }
  ngAfterViewChecked() {
    var width = this.overlayContainer.nativeElement.offsetWidth;
    this.loadingText.nativeElement.setAttribute(
      'style',
      'width:' + width + 'px;'
    );
    this.changeDisplay();
  }

  constructor() {}

  ngOnInit(): void {}
  ngAfterViewInit() {}
}
