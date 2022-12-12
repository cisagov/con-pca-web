import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import {
  SubscriptionModel,
  TaskModel,
} from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from 'src/app/components/dialogs/confirm/confirm.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-subscription-tasks-tab',
  templateUrl: './subscription-tasks-tab.component.html',
  styleUrls: ['./subscription-tasks-tab.component.scss'],
})
export class SubscriptionTasksTabComponent implements OnInit {
  subscription: SubscriptionModel;
  tasks = new MatTableDataSource<TaskModel>();

  displayedColumns = [
    'message_type',
    'scheduled_date',
    'executed',
    'executed_date',
    'error',
  ];

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  constructor(
    private subscriptionSvc: SubscriptionService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.subscriptionSvc.subBehaviorSubject.subscribe((data) => {
      if ('_id' in data) {
        this.subscription = data;
        this.tasks.data = data.tasks;
      }
    });
  }
}
