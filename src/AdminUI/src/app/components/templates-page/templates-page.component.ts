import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { Template } from 'src/app/models/template.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: '',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss']
})
export class TemplatesPageComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'deception_score', 'template_type', 'created_by','select'];
  templatesData = new MatTableDataSource<Template>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  showRetired: boolean = false;

  loading = true;

  constructor(
    private templateSvc: TemplateManagerService,
    private router: Router,
    private layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Templates');
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.templateSvc
      .getAllTemplates(this.showRetired)
      .subscribe((data: any) => {
        this.templatesData.data = data as Template[];
        this.templatesData.sort = this.sort;
        this.loading = false;
      });
  }

  ngAfterViewInit(): void {
    this.templatesData.sort = this.sort;
  }

  public filterTemplates = (value: string) => {
    this.templatesData.filter = value.trim().toLocaleLowerCase();
  };
  public editTemplate(template: Template) {
    this.router.navigate(['/templatemanager', template.template_uuid]);
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
