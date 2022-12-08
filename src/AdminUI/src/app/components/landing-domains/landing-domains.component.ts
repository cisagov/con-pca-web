import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LandingDomainModel } from 'src/app/models/landing-domains.model';
import { LandingDomainService } from 'src/app/services/landing-domain.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { AlertComponent } from '../dialogs/alert/alert.component';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { LandingDomainDetailComponent } from './landing-domain-detail/landing-domain-detail.component';

@Component({
  selector: 'app-landing-domains',
  templateUrl: './landing-domains.component.html',
  styleUrls: ['./landing-domains.component.scss'],
})
export class LandingDomainsComponent implements OnInit {
  displayedColumns = ['domain', 'action'];

  landingDomains: LandingDomainModel[] = [];

  loading = false;

  constructor(
    public landingDomainSvc: LandingDomainService,
    public dialog: MatDialog,
    public layoutSvc: LayoutMainService,
  ) {
    layoutSvc.setTitle('Simulated Phishing URLs');
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.landingDomainSvc.getLandingDomains().subscribe(
      (data) => {
        this.landingDomains = data;
        this.loading = false;
      },
      (error) => {
        console.log(error);
        this.loading = false;
      },
    );
  }

  confirmDelete(domain: LandingDomainModel) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to delete ${domain.domain}?`;
    dialogRef.componentInstance.title = 'Confirm Delete';

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteLandingDomain(domain);
      }
    });
  }

  deleteLandingDomain(domain: LandingDomainModel) {
    this.landingDomainSvc.deleteLandingDomain(domain._id).subscribe(
      () => {
        this.refresh();
      },
      (error) => {
        console.log(error);
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Error Trying to Delete',
            messageText:
              'An error occurred deleting the Sending Profile: ' +
              error.error.error,
            list: error.error.subscriptions,
            listTitle: 'Subscriptions',
          },
        });
      },
    );
  }

  openLandingDomainDialog(domain: LandingDomainModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '60vw';
    dialogConfig.data = {
      landingDomain: domain,
    };
    const dialogRef = this.dialog.open(
      LandingDomainDetailComponent,
      dialogConfig,
    );

    dialogRef.afterClosed().subscribe(() => {
      this.refresh();
    });
  }
}
