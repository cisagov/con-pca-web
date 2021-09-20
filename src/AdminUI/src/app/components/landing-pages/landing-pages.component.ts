import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { LandingPageManagerService } from 'src/app/services/landing-page-manager.service';
import { Router } from '@angular/router';
import { TemplateModel } from 'src/app/models/template.model';
import { LandingPageModel } from 'src/app/models/landing-page.models';

@Component({
  selector: 'app-landing-pages',
  templateUrl: './landing-pages.component.html',
  styleUrls: ['./landing-pages.component.scss'],
})
export class LandingPagesComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'is_default_template', 'created_by', 'select'];
  landingPageData = new MatTableDataSource<LandingPageModel>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  loading = true;

  constructor(
    private templateSvc: LandingPageManagerService,
    private router: Router,
    private layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Landing Pages');
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.templateSvc.getAlllandingpages().subscribe((data: any) => {
      this.landingPageData.data = data as LandingPageModel[];
      this.landingPageData.sort = this.sort;
      this.loading = false;
    });
  }

  ngAfterViewInit(): void {
    this.landingPageData.sort = this.sort;
  }

  public filterTemplates = (value: string) => {
    this.landingPageData.filter = value.trim().toLocaleLowerCase();
  };
  public editTemplate(template: LandingPageModel) {
    this.router.navigate(['/landingpagesmanager', template.landing_page_uuid]);
  }
}
