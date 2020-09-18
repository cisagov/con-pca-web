import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Tags } from 'src/app/models/tags.model';
import { TagService } from 'src/app/services/tag.service';


@Component({
  selector: 'app-tag-selection',
  templateUrl: './tag-selection.component.html',
})
export class TagSelectionComponent implements OnInit {
  /**
   * Constructor.
   * @param dialogRef
   * @param templateManagerSvc
   */
  tags: Tags[];

  constructor(
    public dialogRef: MatDialogRef<TagSelectionComponent>,
    public tagService: TagService
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.tagService.getAllTags().subscribe((result: Tags[]) => {
      this.tags = result;
    });
  }

  /**
   * Closes the dialog.
   */
  onCancelClick() {
    this.dialogRef.close();
  }
}
