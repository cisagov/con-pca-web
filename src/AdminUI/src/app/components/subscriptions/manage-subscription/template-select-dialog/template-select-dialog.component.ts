import {Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Template } from  'src/app/models/template.model'
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-template-select-dialog',
  templateUrl: './template-select-dialog.component.html',
  styleUrls: ['./template-select-dialog.component.scss']
})
export class TemplateSelectDialogComponent {

  selectedList : MatTableDataSource<Template>;
  avaiableList : MatTableDataSource<Template>;
  @ViewChild('selectedSort') selectedSort: MatSort;
  @ViewChild('availableSort') availableSort: MatSort;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Object) {
    this.selectedList = new MatTableDataSource<Template>(
      data['selected'] as Template[]
    );
    this.selectedList.sort = this.selectedSort;
    this.avaiableList = new MatTableDataSource<Template>(
      data['available'] as Template[]
    );
    this.selectedList.sort = this.availableSort;
  }


  displayedColumnsSelected = [
    'name',
    'deception_score',
  ];
  displayedColumnsAvailable = [
    'name',
    'deception_score',
  ];


  ngOnInit(): void {
  }


  test(){
    console.log(this.data)
    console.log("test from modal")
  }

  public filterList = (value: string) => {
    this.selectedList.filter = value.trim().toLocaleLowerCase();
    this.avaiableList.filter = value.trim().toLocaleLowerCase();
  };

}
