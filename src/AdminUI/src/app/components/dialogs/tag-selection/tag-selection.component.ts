import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TagModel } from 'src/app/models/tags.model';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-tag-selection',
  templateUrl: './tag-selection.component.html',
})
export class TagSelectionComponent implements OnInit, AfterViewInit {
  tags: TagModel[];

  displayedColumns = ['tag', 'description'];
  tagsData = new MatTableDataSource<TagModel>();
  searchInput = '';
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<TagSelectionComponent>,
    public tagService: TagService
  ) {}

  ngOnInit(): void {
    this.tagService.getAllTags().subscribe((result: TagModel[]) => {
      this.tags = result;

      this.tagsData.data = result;
      this.tagsData.sort = this.sort;
    });
  }

  ngAfterViewInit(): void {
    this.tagsData.sort = this.sort;
  }

  public filterTags = (value: string) => {
    this.tagsData.filter = value.trim().toLocaleLowerCase();
  };

  onCancelClick() {
    this.dialogRef.close();
  }
}
