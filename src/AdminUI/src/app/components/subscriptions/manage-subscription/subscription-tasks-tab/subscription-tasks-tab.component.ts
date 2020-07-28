import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription, Task } from 'src/app/models/subscription.model';
import { MatTableDataSource } from '@angular/material/table';
import { AppSettings } from 'src/app/AppSettings';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from 'src/app/components/dialogs/confirm/confirm.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-subscription-tasks-tab',
  templateUrl: './subscription-tasks-tab.component.html',
  styleUrls: ['./subscription-tasks-tab.component.scss']
})
export class SubscriptionTasksTabComponent implements OnInit {
  subscription: Subscription;
  tasks = new MatTableDataSource<Task>();

  dateFormat = AppSettings.DATE_FORMAT;

  displayedColumns = [
    'task_uuid',
    'message_type',
    'scheduled_date',
    'executed',
    'executed_date',
    'error',
    'action'
  ];

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;

  constructor(
    private subscriptionSvc: SubscriptionService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.subscriptionSvc.subBehaviorSubject.subscribe(data => {
      if ('subscription_uuid' in data) {
        this.subscription = data;
        this.tasks.data = data.tasks;
      }
    });
  }

  deleteTask(task: Task) {
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to delete task '${task.message_type}' scheduled to run on '${this.datePipe.transform(task.scheduled_date, this.dateFormat)}'?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Task Delete';

    this.dialogRefConfirm.afterClosed().subscribe(result => {
      if (result) {
        const index = this.tasks.data.findIndex(d => d === task);
        this.tasks.data.splice(index, 1);
        const tempTask = this.tasks;
        this.tasks = new MatTableDataSource<Task>(tempTask.data);
        this.subscription.tasks = this.tasks.data;
        this.subscriptionSvc.patchSubscription(this.subscription).subscribe(() => { });
      }
    });
  }
}
