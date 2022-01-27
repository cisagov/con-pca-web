import { SettingsService } from 'src/app/services/settings.service';
import { Component, OnInit, Input } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { NonhumanService } from 'src/app/services/nonhuman.service';
import { ConfigModel } from 'src/app/models/config.model';
import { ConfigService } from 'src/app/services/config.service';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  orgs = [];
  newOrg: string;
  config = new ConfigModel();

  constructor(
    public alertsService: AlertsService,
    public layoutSvc: LayoutMainService,
    public settingsSvc: SettingsService,
    public nonhumanSvc: NonhumanService,
    public configSvc: ConfigService,
    public alertSvc: AlertsService
  ) {
    layoutSvc.setTitle('Config');
  }

  ngOnInit() {
    this.getAsnOrgs();
    this.getConfig();
  }

  getAsnOrgs() {
    this.nonhumanSvc.getNonHumanOrgs().subscribe((data: string[]) => {
      this.orgs = data;
    });
  }

  deleteOrg(org: string) {
    this.nonhumanSvc.deleteNonHumanOrg(org).subscribe(() => {
      this.getAsnOrgs();
    });
  }

  addOrg() {
    this.nonhumanSvc.saveNonHumanOrg(this.newOrg).subscribe(
      () => {
        this.getAsnOrgs();
        this.newOrg = '';
      },
      (error) => {
        console.log(error.error);
        this.alertsService.alert(error.error);
      }
    );
  }

  getConfig() {
    this.configSvc.getConfig().subscribe((data) => {
      this.config = data;
    });
  }

  saveConfig() {
    this.configSvc.saveConfig(this.config).subscribe(() => {
      this.alertSvc.alert('Config saved.');
    });
  }
}
