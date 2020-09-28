import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TagService } from 'src/app/services/tag.service';
import { Tags } from 'src/app/models/tags.model';
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
  displayedColumns = [
    'tag',
    'description',
    'data_source',
    'tag_type',
    'action',
  ];
  tagsData = new MatTableDataSource<Tags>();
  search_input = '';
  @ViewChild(MatSort) sort: MatSort;

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  loading = true;

  constructor(
    private tagsSvc: TagService,
    private router: Router,
    public dialog: MatDialog,
    private layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Tags');
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.tagsSvc.getAllTags().subscribe((data: any) => {
      this.tagsData.data = data as Tags[];
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

  public editTags(row: Tags) {
    if (this.canEditDelete(row)) {
      this.router.navigate(['/tagsmanager', row.tag_definition_uuid]);
    }
  }

  /**
   *
   * @param row
   */
  deleteTag(row: any) {
    this.tagsSvc.deleteTag(row).subscribe(() => {
      this.refresh();
    });
  }
  /**
   * Confirm that they want to delete the profile.
   * @param row
   */
  confirmDeleteTags(row: any): void {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `This will delete Tag '${row.tag}'.  Do you want to continue?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteTag(row);
        this.router.navigate(['/tags']);
      }
      this.dialogRefConfirm = null;
    });
  }

  canEditDelete(row: Tags) {
    if (row.tag_type === 'gophish') {
      return false;
    } else if (row.tag.startsWith('<%FAKER_')) {
      return false;
    } else {
      return true;
    }
  }
}
