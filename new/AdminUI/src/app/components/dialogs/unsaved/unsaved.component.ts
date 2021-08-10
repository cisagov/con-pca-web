import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-unsaved',
  templateUrl: './unsaved.component.html',
  styleUrls: ['./unsaved.component.scss'],
})
export class UnsavedComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<UnsavedComponent>) {}

  ngOnInit(): void {}
}
