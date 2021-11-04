import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TagService } from 'src/app/services/tag.service';
import { TagModel } from 'src/app/models/tags.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';

@Component({
  selector: '',
  templateUrl: './tags-page.component.html',
  styleUrls: ['./tags-page.component.scss'],
})
export class TagsPageComponent implements OnInit, AfterViewInit {
  displayedColumns = ['tag', 'description'];
  tagsData = new MatTableDataSource<TagModel>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  loading = true;

  constructor(
    private tagsSvc: TagService,
    public dialog: MatDialog,
    private layoutSvc: LayoutMainService
  ) {
    this.layoutSvc.setTitle('Tags');
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.tagsSvc.getAllTags().subscribe((data: any) => {
      this.tagsData.data = data as TagModel[];
      this.tagsData.sort = this.sort;
      this.loading = false;
    });
  }

  ngAfterViewInit(): void {
    this.tagsData.sort = this.sort;
  }

  public filterTags = (value: string) => {
    this.tagsData.filter = value.trim().toLocaleLowerCase();
  };
}
