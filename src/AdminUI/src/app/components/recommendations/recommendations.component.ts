import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { Recommendations } from 'src/app/models/recommendations.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';

@Component({
  selector: '',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'created_by', 'action'];
  recommendationsData = new MatTableDataSource<Recommendations>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  showRetired: boolean = false;
  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  loading = true;

  constructor(
    private recommendationsSvc: RecommendationsService,
    private router: Router,
    public dialog: MatDialog,
    private layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Recommendations');
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.recommendationsSvc
      .getAllRecommendations(this.showRetired)
      .subscribe((data: any) => {
        this.recommendationsData.data = data as Recommendations[];
        this.recommendationsData.sort = this.sort;
        this.loading = false;
      });
  }

  ngAfterViewInit(): void {
    this.recommendationsData.sort = this.sort;
  }

  public filterRecommendations = (value: string) => {
    this.recommendationsData.filter = value.trim().toLocaleLowerCase();
  };
  public editRecommendations(recommendations: Recommendations) {
    this.router.navigate(['/recommendationsmanager', recommendations.recommendations_uuid]);
  }

  onRetiredToggle() {
    if (this.displayedColumns.includes('retired')) {
      this.displayedColumns.pop();
    } else {
      this.displayedColumns.push('retired');
    }
    this.refresh();
  }

  /**
   *
   * @param row
   */
  deleteRecommendation(row: any) {
    this.recommendationsSvc.deleteRecommendation(row).subscribe(() => {
      this.refresh();
    });
  }
  /**
 * Confirm that they want to delete the profile.
 * @param row
 */
  confirmDeleteRecommendations(row: any): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `This will delete recommendation '${row.name}'.  Do you want to continue?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRecommendation(row);
      }
      this.dialogRefConfirm = null;
    });
  }
}
