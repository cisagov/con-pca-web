import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable()
export class LayoutMainService {
  static title: string;
  static content_height: number;
  static side_nav: MatSidenav;

  onTitleUpdate: EventEmitter<string> = new EventEmitter<string>();
  onHeightUpdate: BehaviorSubject<number> = new BehaviorSubject<number>(500);
  navBarSet: EventEmitter<boolean> = new EventEmitter<boolean>();

  setTitle(title: string) {
    try {
      LayoutMainService.title = title;
    } catch {}

    this.onTitleUpdate.emit(LayoutMainService.title);
  }

  getTitle() {
    return LayoutMainService.title;
  }

  setSideNav(side_nav_arg) {
    try {
      LayoutMainService.side_nav = side_nav_arg;
    } catch {}
    this.navBarSet.emit(true);
  }
  getSideNavIsSet() {
    return this.navBarSet;
  }

  closeSideNav() {
    return LayoutMainService.side_nav.close();
  }

  openSideNav() {
    return LayoutMainService.side_nav.open();
  }

  toggleSideNav() {
    return LayoutMainService.side_nav.toggle();
  }

  setContentHeight(height_in_px: number) {
    var height_adjusted_for_margin = height_in_px;
    try {
      LayoutMainService.content_height = height_adjusted_for_margin;
    } catch {}
    this.onHeightUpdate.next(LayoutMainService.content_height);
  }

  getContentHeightEmitter() {
    return this.onHeightUpdate;
  }
}
