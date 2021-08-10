import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout-login',
  templateUrl: './layout-login.component.html',
  styleUrls: ['./layout-login.component.scss'],
  host: { class: 'center-blank-layout' },
  preserveWhitespaces: true,
})
export class LayoutLoginComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
