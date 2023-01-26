import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeService } from '../../../services/theme.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { UserAuthService } from '../../../services/user-auth.service';
import { Location } from '@angular/common';
import { SettingsService } from 'src/app/services/settings.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-layout-main',
  templateUrl: './layout-main.component.html',
  styleUrls: ['./layout-main.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutMainComponent implements OnInit {
  isDark: boolean = false;
  currentUserName: string = '';
  environment: string = 'test';
  footerColor: string = 'primary';
  footerText: string = '';

  constructor(
    private themeSvc: ThemeService,
    public layoutSvc: LayoutMainService,
    private userAuthSvc: UserAuthService,
    public settingsSvc: SettingsService,
    private loginSvc: LoginService,
    public overlayContainer: OverlayContainer,
    public location: Location,
  ) {
    this.isDark = themeSvc.getStoredTheme();
    if (this.isDark) {
      overlayContainer.getContainerElement().classList.add('theme-alternate');
    }
    this.currentUserName = this.userAuthSvc.currentAuthUser;
    this.environment = this.settingsSvc.settings.environment;
    this.setFooterColorAndText();
    console.log(this.settingsSvc.settings);
    console.log(this.footerText);
  }

  @ViewChild('drawer', { static: false })
  drawer: MatSidenav;
  @ViewChild('mainContent', { static: false })
  mainContent;

  setFooterColorAndText() {
    switch (this.settingsSvc.settings.environment) {
      case 'dev': {
        this.footerColor = '#F26419';
        this.footerText = 'Sandbox';
        break;
      }
      case 'test': {
        this.footerColor = '#F6AE2D';
        this.footerText = 'Test';
        break;
      }
      case 'staging': {
        this.footerColor = '#e3021c';
        this.footerText = 'Staging';
        break;
      }
      default: {
        this.footerColor = '#3c6f8e';
        break;
      }
    }
  }

  setTheme(event) {
    this.themeSvc.storeTheme(event.checked);
    this.isDark = event.checked;
    if (event.checked) {
      this.overlayContainer
        .getContainerElement()
        .classList.add('theme-alternate');
    } else {
      this.overlayContainer
        .getContainerElement()
        .classList.remove('theme-alternate');
    }
  }

  help() {
    const angularRoute = this.location.path();
    const url = window.location.href;
    const appDomain = url.replace(angularRoute, '');

    let helpUrl = appDomain + '/assets/htmlhelp/introduction_to_con_pca.htm';
    window.open(helpUrl, '_blank');
  }

  logOut() {
    this.loginSvc.logout();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.setContentHeight();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContentHeight();
  }

  setContentHeight() {
    //TODO get values of card padding
    let default_card_padding = 16;
    let default_card_margin = 10;
    if (this.mainContent) {
      this.layoutSvc.setContentHeight(
        this.mainContent.elementRef.nativeElement.offsetHeight -
          default_card_margin * 2 -
          default_card_padding * 2,
      );
    }
  }
}
