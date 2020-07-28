import { Component, OnInit, Input } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';

@Component({
  selector: '',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss']
})
export class DomainsComponent implements OnInit {
  constructor(layoutSvc: LayoutMainService) {
    layoutSvc.setTitle('Domains');
  }

  ngOnInit() {}
}
