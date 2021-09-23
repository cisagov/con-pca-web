import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TemplateModel } from 'src/app/models/template.model';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertComponent } from 'src/app/components/dialogs/alert/alert.component';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-template-select-dialog',
  templateUrl: './template-select-dialog.component.html',
  styleUrls: ['./template-select-dialog.component.scss'],
})
export class TemplateSelectDialogComponent {
  selectedArray: Array<TemplateModel>;
  availableArray: Array<TemplateModel>;

  selectedList = new MatTableDataSource<TemplateModel>();
  availableList = new MatTableDataSource<TemplateModel>();
  emptyList: MatTableDataSource<TemplateModel>;

  selectedToggleLevel = 'all';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public templateSvc: TemplateManagerService
  ) {
    this.selectedArray = data.selected;
    this.availableArray = data.available;
    this.initMatTables();
  }
  displayHTML = '';
  templateName = '';
  templateSubject = '';
  templateFromName = '';
  templateSelected = false;

  displayedColumnsSelected = ['name', 'deception_score', 'remove'];
  displayedColumnsAvailable = ['name', 'deception_score', 'add'];

  initMatTables() {
    // Remove selected elements from the avaiable list to avoid duplicates
    this.selectedArray.forEach((selected) => {
      this.availableArray.forEach((available, index) => {
        if (selected.template_uuid === available.template_uuid) {
          this.availableArray.splice(index, 1);
        }
      });
    });
    this.selectedList = new MatTableDataSource<TemplateModel>(
      this.selectedArray as TemplateModel[]
    );
    this.toggleLevel();
  }

  remove(template) {
    if (this.selectedArray.length > 1) {
      for (let i = 0; i < this.selectedArray.length; i++) {
        if (this.selectedArray[i].template_uuid === template.template_uuid) {
          this.availableArray.push(template);
          this.selectedArray.splice(i, 1);
          i = this.selectedArray.length;
          this.initMatTables();
        }
      }
    } else {
      this.dialog.open(AlertComponent, {
        data: {
          title: '',
          messageText: 'Can not remove all templates',
        },
      });
    }
  }

  add(template) {
    for (let i = 0; i < this.availableArray.length; i++) {
      if (this.availableArray[i].template_uuid === template.template_uuid) {
        this.selectedArray.push(template);
        this.availableArray.splice(i, 1);
        i = this.availableArray.length;
        this.initMatTables();
      }
    }
  }

  public filterList = (value: string) => {
    this.selectedList.filter = value.trim().toLocaleLowerCase();
    this.availableList.filter = value.trim().toLocaleLowerCase();
  };

  display(template: TemplateModel) {
    this.templateSelected = true;
    this.displayHTML = template.html;
    this.templateName = template.name;
    this.templateSubject = template.subject;
    this.templateFromName = template.from_address;
  }

  toggleLevel() {
    if (this.selectedToggleLevel === 'all') {
      this.availableList.data = this.availableArray;
    } else {
      this.availableList.data = this.availableArray.filter(
        (t) =>
          this.templateSvc.getDeceptionLevel(t.deception_score) ===
          this.selectedToggleLevel
      );
    }
  }
}
