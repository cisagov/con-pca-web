import { Component, ViewChild } from '@angular/core';
import { ThemeService } from '../app/services/theme.service';
import { Hub } from 'aws-amplify';
import { UserAuthService } from './services/user-auth.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AdminUI';

  constructor(
    private themeSvc: ThemeService,
    private userAuthSvc: UserAuthService
  )
    {
    //Listen for any auth changes from amplifyy and handle
    Hub.listen("auth", (data) => {
      userAuthSvc.handleAuthNotification(data);
    }) 
  }

  getTheme() {
    return this.themeSvc.getStoredTheme();
  }

  ngAfterViewInit(): void {}
}
