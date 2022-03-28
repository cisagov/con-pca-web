import { Component, OnInit } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  constructor(private layoutSvc: LayoutMainService) {}

  ngOnInit(): void {
    this.layoutSvc.setTitle('Overview');
  }
}
