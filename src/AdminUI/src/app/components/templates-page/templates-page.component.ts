import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { TemplateModel } from 'src/app/models/template.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { RetireTemplatesDialogComponent } from '../template-manager/retire-templates-dialog/retire-templates-dialog.component';
import { AlertsService } from 'src/app/services/alerts.service';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { HttpErrorResponse } from '@angular/common/http';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';

@Component({
  selector: '',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export class TemplatesPageComponent implements OnInit, AfterViewInit {
  displayedColumns = [
    'checked',
    'name',
    'deception_score',
    'created_by',
    'select',
  ];
  templatesData = new MatTableDataSource<TemplateModel>();
  search_input = '';
  allChecked = false;
  dialogRefRetire: MatDialogRef<RetireTemplatesDialogComponent>;
  @ViewChild(MatSort) sort: MatSort;

  showRetired: boolean = false;

  loading = true;

  constructor(
    private templateSvc: TemplateManagerService,
    private router: Router,
    private layoutSvc: LayoutMainService,
    public dialog: MatDialog,
    public alertsService: AlertsService
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
    const sortState: Sort = { active: 'deception_score', direction: 'asc' };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
    this.loading = false;
  }

  ngAfterViewInit(): void {
    this.templatesData.sort = this.sort;
  }

  public filterTemplates = (value: string) => {
    this.templatesData.filter = value.trim().toLocaleLowerCase();
  };
  public editTemplate(template: TemplateModel) {
    this.router.navigate(['/templatemanager', template._id]);
  }

  selectTemplates(templateList) {
    if (templateList) {
      templateList.forEach((group) => {
        group['isChecked'] = true;
      });
    }
    return templateList;
  }

  updateAllCheckboxComplete(event) {
    let data = this.templatesData['_data']['_value'];
    this.allChecked = data != null && data.every((t) => t.isChecked);
  }

  someChecked() {
    let data = this.templatesData['_data']['_value'];
    if (data == null || data == undefined) {
      return false;
    }
    return data.filter((t) => t.isChecked).length > 0 && !this.allChecked;
  }

  retireTemplates() {
    const templatesToRetire = this.templatesData['_data']['_value'].filter(
      (template) => template['isChecked'] == true
    );

    this.dialogRefRetire = this.dialog.open(RetireTemplatesDialogComponent, {
      disableClose: false,
      data: templatesToRetire,
    });
    this.dialogRefRetire.afterClosed().subscribe((result) => {
      if (result.retired) {
        this.templatesData.data = this.templatesData.data.filter(
          (obj) => !templatesToRetire.includes(obj)
        );
      } else if (result.error) {
        this.alertsService.alert(
          `Error retiring template. ${result.error.error}`
        );
      }
    });
  }

  async duplicateTemplate() {
    const templatesToDuplicate = this.templatesData['_data']['_value'].filter(
      (template) => template['isChecked'] == true
    );
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to create duplicate templates?`;
    dialogRef.componentInstance.title = 'Confirm';

    const dialogResp = await dialogRef.afterClosed().toPromise();
    const errors = [];
    if (dialogResp) {
      for (const t of templatesToDuplicate) {
        try {
          await this.templateSvc.duplicateTemplate(t._id).toPromise();
        } catch (error) {
          console.log(error);
          errors.push(t);
        }
      }
      let resultRef = null;
      if (errors.length > 0) {
        resultRef = this.dialog.open(AlertComponent, {
          data: {
            title: `Duplication Results`,
            messageText: 'All templates except the following have succeeded.',
            listTitle: 'Templates Already Duplicated',
            list: errors,
          },
        });
      } else {
        resultRef = this.dialog.open(AlertComponent, {
          data: {
            title: 'Success',
            messageText: 'All templates have been duplicated.',
          },
        });
      }
      resultRef.afterClosed().subscribe(() => {
        location.reload();
      });
    }
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
