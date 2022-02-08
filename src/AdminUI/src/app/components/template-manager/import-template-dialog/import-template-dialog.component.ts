import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TemplateManagerService } from 'src/app/services/template-manager.service';

@Component({
  selector: 'app-import-template-dialog',
  templateUrl: './import-template-dialog.component.html',
  styleUrls: ['./import-template-dialog.component.scss'],
})
export class ImportTemplateDialogComponent implements OnInit {
  content = '';
  convertLink = true;

  constructor(
    public dialogRef: MatDialogRef<ImportTemplateDialogComponent>,
    public templateSvc: TemplateManagerService
  ) {}

  ngOnInit(): void {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  import(): void {
    this.templateSvc.importEmail(this.content, this.convertLink).subscribe(
      (success: any) => {
        this.dialogRef.close({
          subject: success.subject,
          text: success.text,
          html: success.html,
        });
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  openFileBrowser(event) {
    event.preventDefault();
    const element: HTMLElement = document.getElementById('uploadFile');
    element.click();
  }

  /**
   * Reads the contents of the event's file and puts them into csvText.
   * @param e The 'file' event
   */
  fileSelect(e: any) {
    const file: any = e.target.files[0];

    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.content = fileReader.result.toString();
    };
    fileReader.readAsText(file);
  }
}
