import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { RecommendationModel } from 'src/app/models/recommendations.model';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { RecommendationDetailComponent } from './recommendation-details.component';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: '',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class RecommendationsListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['title', 'type', 'created_by', 'edit'];
  recommendationsData = new MatTableDataSource<RecommendationModel>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  loading = true;

  constructor(
    private recommendationSvc: RecommendationsService,
    public layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    public alertSvc: AlertsService,
  ) {
    layoutSvc.setTitle('Recommendations');
  }

  ngOnInit() {
    this.refresh();
  }

  async refresh() {
    this.loading = true;
    this.recommendationSvc
      .getRecommendations()
      .subscribe((data: RecommendationModel[]) => {
        this.recommendationsData.data = data;
      });
    this.recommendationsData.sort = this.sort;
    this.loading = false;
  }

  ngAfterViewInit(): void {
    this.recommendationsData.sort = this.sort;
  }

  public filterRecommendations = (value: string) => {
    this.recommendationsData.filter = value.trim().toLocaleLowerCase();
  };

  openRecDialog(row: any): void {
    if (this.dialog.openDialogs.length === 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '30vw';
      dialogConfig.data = {
        recommendation_id: row._id,
      };
      const dialogRef = this.dialog.open(
        RecommendationDetailComponent,
        dialogConfig,
      );

      dialogRef.afterClosed().subscribe((value) => {
        this.refresh();
      });
    }
  }

  deleteRec(row: RecommendationModel) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to delete the recommendation: ${row.title}?`;
    dialogRef.componentInstance.title = 'Confirm Delete';

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.recommendationSvc.deleteRecommendation(row._id).subscribe(
          () => {
            this.refresh();
          },
          (failure) => {
            console.error(failure.error);
            this.dialog.open(AlertComponent, {
              data: {
                title: 'Error Deleting',
                messageText: `An error occured deleting the recommendation: ${failure.error.error}`,
                list: failure.error.templates,
              },
            });
          },
        );
      }
    });
  }
}
