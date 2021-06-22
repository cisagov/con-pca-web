import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { Template } from 'src/app/models/template.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';

@Component({
  selector: '',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export class TemplatesPageComponent implements OnInit, AfterViewInit {
  displayedColumns = [
    'name',
    'deception_score',
    'template_type',
    'created_by',
    'select',
  ];
  templatesData = new MatTableDataSource<Template>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  showRetired: boolean = false;

  loading = true;

  constructor(
    private templateSvc: TemplateManagerService,
    private router: Router,
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog
  ) {
    layoutSvc.setTitle('Templates');
  }

  ngOnInit() {
    this.refresh();
  }

  async refresh() {
    this.loading = true;
    this.templatesData.data = await this.templateSvc.getAllTemplates(
      this.showRetired
    );
    this.templatesData.sort = this.sort;
    this.loading = false;
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
  downloadObject(filename, blob) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  downloadTemplatesJSON() {
    if (confirm('Download all templates?')) {
      this.templateSvc.getTemplatesJSON(this.showRetired).subscribe(
        (blob) => {
          this.downloadObject(`template_data.json`, blob);
        },
        (error) => {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Error',
              messageText: `An error occured downloading the template data. Check logs for more detail.`,
            },
          });
        }
      );
    }
  }
}
