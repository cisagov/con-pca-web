import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
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
import { TemplatesDataService } from 'src/app/services/templates-data.service';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { TestTemplatesDialogComponent } from '../template-manager/test-templates-dialog/test-templates-dialog.component';
import { RestoreTemplatesDialogComponent } from '../template-manager/restore-templates-dialog/restore-templates-dialog.component';

@Component({
  selector: '',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export class TemplatesPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  displayedColumns = [
    'select',
    'name',
    'deception_score',
    'sending_profile_domain',
    'created_by',
    'edit',
  ];
  templatesList = [];
  templatesSubscription: Subscription;
  templatesData = new MatTableDataSource<TemplateModel>();
  search_input = '';
  dialogRefRetire: MatDialogRef<RetireTemplatesDialogComponent>;
  dialogRefRestore: MatDialogRef<RestoreTemplatesDialogComponent>;
  @ViewChild(MatSort) sort: MatSort;

  showRetired: boolean = false;

  loading = true;

  // Template Selection
  selection = new SelectionModel<TemplateModel>(true, []);

  constructor(
    private templateSvc: TemplateManagerService,
    private router: Router,
    private layoutSvc: LayoutMainService,
    private templatesSortedData: TemplatesDataService,
    public dialog: MatDialog,
    public alertsService: AlertsService,
  ) {
    layoutSvc.setTitle('Templates');
  }

  ngOnInit() {
    this.refresh();
  }

  async refresh() {
    this.loading = true;
    this.templatesData.data = await this.templateSvc.getAllTemplates(
      this.showRetired,
    );
    this.templatesData.sort = this.sort;
    const sortState: Sort = { active: 'deception_score', direction: 'asc' };
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
    this.loading = false;
    this.templatesSubscription = this.templatesSortedData.currentData.subscribe(
      (templates) => (this.templatesList = templates),
    );
    this.selection = new SelectionModel<TemplateModel>(true, []);
  }

  ngAfterViewInit(): void {
    this.templatesData.sort = this.sort;
  }

  ngOnDestroy() {
    this.updateTemplateIds();
    this.templatesSubscription.unsubscribe();
  }

  public filterTemplates = (value: string) => {
    this.templatesData.filter = value.trim().toLocaleLowerCase();
  };
  public editTemplate(template: TemplateModel) {
    this.router.navigate(['/templatemanager', template._id]);
  }

  updateTemplateIds() {
    this.templatesSortedData.changeData(
      this.templatesData
        .sortData(this.templatesData.filteredData, this.templatesData.sort)
        .map((obj) => obj._id),
    );
  }

  testTemplates() {
    this.dialog.open(TestTemplatesDialogComponent, {
      disableClose: false,
      data: this.selection.selected,
    });
  }

  retireTemplates() {
    const templatesToRetire = this.selection.selected;

    this.dialogRefRetire = this.dialog.open(RetireTemplatesDialogComponent, {
      disableClose: false,
      data: templatesToRetire,
    });
    this.dialogRefRetire.afterClosed().subscribe((result) => {
      if (result.retired) {
        this.refresh();
      } else if (result.error) {
        this.alertsService.alert(
          `Error retiring template. ${result.error.error}`,
        );
      }
    });
  }

  restoreTemplates() {
    const templatesToRestore = this.selection.selected;

    this.dialogRefRestore = this.dialog.open(RestoreTemplatesDialogComponent, {
      disableClose: false,
      data: templatesToRestore,
    });
    this.dialogRefRestore.afterClosed().subscribe((result) => {
      if (!result.retired) {
        this.refresh();
      } else if (result.error) {
        this.alertsService.alert(
          `Error restoring template. ${result.error.error}`,
        );
      }
    });
  }

  async duplicateTemplate() {
    const templatesToDuplicate = this.selection.selected;
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
        this.refresh();
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
        },
      );
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.templatesData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.templatesData.data.forEach((row) => this.selection.select(row));
  }
}
