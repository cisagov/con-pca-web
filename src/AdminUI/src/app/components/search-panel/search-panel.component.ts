import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html'
})
export class SearchPanelComponent implements OnInit {
  status = new FormControl();
  statusList: string[] = ['Waiting on SRF', 'Waiting on ROE', 'Play', 'Paused'];
  constructor() {}

  ngOnInit(): void {}
}
