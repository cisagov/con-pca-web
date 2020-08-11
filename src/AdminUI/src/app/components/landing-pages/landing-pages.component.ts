import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { LandingPageManagerService } from 'src/app/services/landing-page-manager.service';
import { Router } from '@angular/router';
import { Template } from 'src/app/models/template.model';
import { Landing_Page } from 'src/app/models/landing-page.models';

@Component({
  selector: 'app-landing-pages',
  templateUrl: './landing-pages.component.html',
  styleUrls: ['./landing-pages.component.scss']
})
export class LandingPagesComponent implements OnInit , AfterViewInit {
        displayedColumns = ['name', 'template_type', 'created_by', 'select'];
        landingPageData = new MatTableDataSource<Landing_Page>();
        search_input = '';
        @ViewChild(MatSort) sort: MatSort;

        showRetired: boolean = false;

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
          this.templateSvc
            .getAlllandingpages(this.showRetired)
            .subscribe((data: any) => {
              this.landingPageData.data = data as Landing_Page[];
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
        public editTemplate(template: Landing_Page) {
          this.router.navigate(['/landingpagesmanager', template.landing_page_uuid]);
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
