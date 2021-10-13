import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { RecommendationsModel } from '../../models/recommendations.model';
import { MatRadioChange } from '@angular/material/radio';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class RecommendationsComponent implements OnInit {
  recommendations = new RecommendationsModel();
  selected: any = {};

  constructor(
    public recommendationsSvc: RecommendationsService,
    public router: Router,
    public layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    public alertSvc: AlertsService
  ) {
    this.layoutSvc.setTitle('Recommendations');
  }

  async ngOnInit() {
    await this.getRecommendations();
  }

  async getRecommendations() {
    this.recommendations = await this.recommendationsSvc
      .getRecommendations()
      .toPromise();
  }

  onChange(change: MatRadioChange) {
    this.selected = change.value;
  }

  onCancelClick() {
    const dialogRef = this.dialog.open(ConfirmComponent);
    dialogRef.componentInstance.confirmMessage =
      'Are you sure you want to revert changes?';
    dialogRef.componentInstance.title = 'Revert Changes';
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        window.location.reload();
      }
    });
  }

  saveRecommendations() {
    const dialogRef = this.dialog.open(ConfirmComponent);
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to save all recommendations?`;
    dialogRef.componentInstance.title = 'Save Recommendations';
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.recommendationsSvc
          .saveRecommendations(this.recommendations)
          .subscribe(
            () => {
              this.alertSvc.alert('Recommendations saved successfully.');
            },
            (error) => {
              this.alertSvc.alert('Error saving recommendations. Check Logs.');
              console.log(error);
            }
          );
      }
    });
  }
}
