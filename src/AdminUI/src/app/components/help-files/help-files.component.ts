import { Component, OnInit } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';

@Component({
  selector: 'help-files',
  templateUrl: './help-files.component.html',
  styleUrls: ['./help-files.component.scss']
})
export class HelpFilesComponent implements OnInit {
  
  constructor(
    private layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Help Files');
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

}