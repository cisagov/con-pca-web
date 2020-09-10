import { Component, OnInit, Input } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: '',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss'],
})
export class DomainsComponent implements OnInit {
  constructor(
    layoutSvc: LayoutMainService,
    private settingsService: SettingsService) {
    layoutSvc.setTitle('Domains');
  }

  ngOnInit() {
  }

  redirectToDomainManagement(){
    window.location.href = this.settingsService.settings.domainManagementURL;
  }
}
