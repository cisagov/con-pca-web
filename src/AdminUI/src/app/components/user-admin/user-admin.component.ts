import { SettingsService } from 'src/app/services/settings.service';
import { Component, OnInit, Input } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { NonhumanService } from 'src/app/services/nonhuman.service';

@Component({
  selector: '',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
})
export class UserAdminComponent implements OnInit {
  orgs = [];
  newOrg: string;

  constructor(
    public layoutSvc: LayoutMainService,
    public settingsSvc: SettingsService,
    public nonhumanSvc: NonhumanService
  ) {
    layoutSvc.setTitle('User Admin');
  }

  ngOnInit() {
    this.getAsnOrgs();
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
    this.nonhumanSvc.saveNonHumanOrg(this.newOrg).subscribe(() => {
      this.getAsnOrgs();
      this.newOrg = '';
    });
  }
}
