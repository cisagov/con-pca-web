import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-navigate-away',
  templateUrl: './navigate-away.component.html',
  styleUrls: ['./navigate-away.component.scss'],
})
export class NavigateAwayComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<NavigateAwayComponent>) {}

  ngOnInit(): void {}
}
