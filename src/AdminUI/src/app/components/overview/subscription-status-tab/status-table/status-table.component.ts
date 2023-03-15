import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/AppSettings';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-status-table',
  templateUrl: './status-table.component.html',
  styleUrls: ['./status-table.component.scss']
})
export class StatusTableComponent implements OnInit {


  @Input() tableName: string
  apiMethod: any;

  dateFormat = AppSettings.DATE_FORMAT;
  itemCount = 10;
  pageNumber = 0;
  pageSize = 5;
  sortBy = "name"
  sortOrder = "asc"

  public tableDataSource: MatTableDataSource<SubscriptionWithEndDate>;
  displayColumns = [
    'name',
    'startDate',
    'endDate',
    'appendixDate',
    'isContinuous',
    'lastUpdated',
  ];
  
  constructor(
    private router: Router,
    private subSvc: SubscriptionService,
    ) { 
      console.log(this.tableName)
    }

  getAPIMethod(){
  }

  ngOnInit(): void {
    this.getSize()
    // this.refreshData()
  }

  getSize(){
    //TODO : Create seconddary API call to get size
    if(this.tableName == "endingSoon"){
      this.subSvc.getSubStatusEndingSoon(0,100000,this.sortBy,this.sortOrder).subscribe(
        (success) => {
          let arrayVal = []
          arrayVal = success as Array<any>
          this.itemCount = arrayVal.length;
          this.setData(success)
        }
      )
    }
    if(this.tableName == "inProgress"){
      this.subSvc.getSubStatusInProgress(0,100000,this.sortBy,this.sortOrder).subscribe(
        (success) => {
          let arrayVal = []
          arrayVal = success as Array<any>
          this.itemCount = arrayVal.length;
          this.setData(success)
        }
      )
    }
    if(this.tableName == "stopped"){
      this.subSvc.getSubStatusStopped(0,100000,this.sortBy,this.sortOrder).subscribe(
        (success) => {
          let arrayVal = []
          arrayVal = success as Array<any>
          this.itemCount = arrayVal.length;
          this.setData(success)
        }
      )
    }
  }
  refreshData(){
    //Why wont it let me set the method as a variable and use it based on that :<
    if(this.tableName == "endingSoon"){
      this.subSvc.getSubStatusEndingSoon(this.pageNumber,this.pageSize,this.sortBy,this.sortOrder).subscribe(
        (success) => {
          this.setData(success)
        }
      )
    }
    if(this.tableName == "inProgress"){
      this.subSvc.getSubStatusInProgress(this.pageNumber,this.pageSize,this.sortBy,this.sortOrder).subscribe(
        (success) => {
          this.setData(success)
        }
      )
    }
    if(this.tableName == "stopped"){
      this.subSvc.getSubStatusStopped(this.pageNumber,this.pageSize,this.sortBy,this.sortOrder).subscribe(
        (success) => {
          this.setData(success)
        }
      )
    }
  }


  changeSort(sortEvent) {
    this.sortOrder = sortEvent.direction;
    if (sortEvent.direction == '') {
      this.sortOrder = 'asc';
      this.sortBy = 'name';
    } else {
      this.sortBy = sortEvent.active;
    }
    this.refreshData();
  }

  paginationChange(event) {
    this.pageNumber = event.pageIndex;
    this.pageSize = event.pageSize;
    this.refreshData();
  }

  setData(success){
    this.tableDataSource = new MatTableDataSource();
    this.tableDataSource.data = success as any
    // this.sortingDataAccessor(this.tableDataSource);
  }

  // private sortingDataAccessor(callBack: any) {
  //   callBack.sortingDataAccessor = (item, property) => {
  //     switch (property) {
  //       case 'startDate':
  //         return new Date(item.cycle_start_date);
  //       case 'endDate':
  //         return new Date(item.cycle_end_date);
  //       case 'appendixDate':
  //         return new Date(item.appendix_a_date);
  //       case 'isContinuous':
  //         return item.continuous_subscription ? 1 : 0;
  //       case 'lastUpdated':
  //         return new Date(item.updated);
  //       default:
  //         return item[property];
  //     }
  //   };
  // }

  public editSubscription(row) {
    this.router.navigate(['/view-subscription', row._id]);
  }

}

interface SubscriptionWithEndDate {
  // top-level primitives for column sorting
  name: string;
  cycle_start_date: Date;
  cycle_end_date: Date;
  appendix_a_date: Date;
  is_continuous: string;
  last_updated: Date;
}