import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/models/user.model';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { UserService } from 'src/app/services/user.service';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['Username', 'UserStatus', 'UserCreateDate', 'delete'];
  users = new MatTableDataSource<User>();
  loading = true;

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private layoutSvc: LayoutMainService
  ) {
    layoutSvc.setTitle('Users');
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    return this.userService.getUsers().subscribe(
      (success: User[]) => {
        this.users = new MatTableDataSource<User>(success);
        this.users.sort = this.sort;
        this.loading = false;
      },
      (failure) => {
        console.log(failure);
        this.loading = false;
      }
    );
  }

  confirmUser(username: string) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to confirm ${username}?`;
    dialogRef.componentInstance.title = 'Confirm User';

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.confirmUser(username).subscribe(() => {
          this.getUsers();
        });
      }
    });
  }

  deleteUser(username: string) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = `Are you sure you want to delete ${username}?`;
    dialogRef.componentInstance.title = `Delete User`;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.deleteUser(username).subscribe(() => {
          this.getUsers();
        });
      }
    });
  }

  public filterList = (value: string) => {
    this.users.filter = value.trim().toLocaleLowerCase();
  };
}
