import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { RecommendationsModel } from 'src/app/models/recommendations.model';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';

@Component({
  selector: '',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class RecommendationsListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['title', 'type', 'created_by', 'edit'];
  recommendationsData = new MatTableDataSource<RecommendationsModel>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  loading = true;

  constructor(
    private recommendationSvc: RecommendationsService,
    private router: Router,
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog
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
      .subscribe((data: RecommendationsModel[]) => {
        this.recommendationsData.data = data;
      });
    this.recommendationsData.sort = this.sort;
    this.loading = false;
    console.log(this.recommendationsData.data);
  }

  ngAfterViewInit(): void {
    this.recommendationsData.sort = this.sort;
  }

  public filterRecommendations = (value: string) => {
    this.recommendationsData.filter = value.trim().toLocaleLowerCase();
  };
  public editRecommendation(recommendation: RecommendationsModel) {
    this.router.navigate(['/templatemanager', recommendation._id]);
  }

  onRetiredToggle() {
    if (this.displayedColumns.includes('retired')) {
      this.displayedColumns.pop();
    } else {
      this.displayedColumns.push('retired');
    }
    this.refresh();
  }
}
