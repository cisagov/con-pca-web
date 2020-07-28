import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TemplateManagerService } from 'src/app/services/template-manager.service';

@Component({
  selector: 'app-tag-selection',
  templateUrl: './tag-selection.component.html'
})
export class TagSelectionComponent implements OnInit {
  /**
   * Constructor.
   * @param dialogRef
   * @param templateManagerSvc
   */
  constructor(
    public dialogRef: MatDialogRef<TagSelectionComponent>,
    public templateManagerSvc: TemplateManagerService
  ) {}

  /**
   *
   */
  ngOnInit(): void {}

  /**
   * Closes the dialog.
   */
  onCancelClick() {
    this.dialogRef.close();
  }
}
