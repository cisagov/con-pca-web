import { Component, OnInit, Input } from '@angular/core';
import { SubscriptionService } from 'src/app/services/subscription.service';
import * as moment from 'node_modules/moment/moment';
import { DatePipe } from '@angular/common';
import {
    Subscription,
    GoPhishCampaignModel,
    TimelineItem
  } from 'src/app/models/subscription.model';
  import {
    FormGroup,
    FormControl,
    FormBuilder,
    Validators,
    ValidatorFn,
    ValidationErrors,
    AbstractControl
  } from '@angular/forms';
  import { isSameDate } from 'src/app/helper/utilities';
import { ResolvedStaticSymbol } from '@angular/compiler';

@Component({
  selector: 'subscription-stats-tab',
  templateUrl: './subscription-stats-tab.component.html',
  styleUrls: ['./subscription-stats-tab.component.scss'],
  providers: [DatePipe]
})
export class SubscriptionStatsTab implements OnInit {
  //   @Input()
  //   subscription: Subscription

  subscription: Subscription;
  subscription_uuid: string;
  selectedCycle: any;
  timelineItems: any[] = [];
  reportedStatsForm: FormGroup;
  invalidDateTimeObject: String;
  reportsData: any;
  activeCycleReports: any;
  hasOverrideValue = false;
  validationErrors = {
    invalidEmailFormat : "",
    invalidDateFormat : "",
    emailNotATarget : "",
    duplicateEmail : ""
  };
  reportListErrorLineNum = 0

  constructor(
    public subscriptionSvc: SubscriptionService,
    public datePipe: DatePipe
  ) {
    this.subscription = new Subscription();
    this.initValidationList()
  }

  ngOnInit() {

    this.reportedStatsForm = new FormGroup({
        reportedItems: new FormControl(''),     
        overRiderNumber: new FormControl('',[this.maxReports(40)])  //set to targetcount         
      },
        { updateOn: 'blur' });
    this.invalidDateTimeObject = "" 
    this.subscriptionSvc.getSubBehaviorSubject().subscribe(data => {
        this.subscription = data
        if(data.subscription_uuid && !this.subscription_uuid){
          this.subscription_uuid = data.subscription_uuid
          this.subscriptionSvc.getReportValuesForSubscription(this.subscription_uuid)
            .subscribe((data) => {
              this.reportsData = data
              
              this.setReportsForCycle()    
              this.reportedStatsForm.controls["overRiderNumber"].setValidators([this.maxReports(this.subscription.target_email_list.length)]) 
              this.reportedStatsForm.controls["reportedItems"]
                .setValidators(
                  [this.reportListValidator(this.targetListSimple(this.subscription.target_email_list))]
                  )
              this.reportedStatsForm.updateValueAndValidity()
            },
            (error) => {
              //Error retreiving reports for cycle data
              console.log(error)
            })
        }
        if("gophish_campaign_list" in data){
          this.buildSubscriptionTimeline(this.subscription);
          this.subscription = data
          //@ts-ignore
          this.selectedCycle = this.subscription.cycles[0]
          this.subscriptionSvc.getCycleBehaviorSubject().subscribe(data => {
            this.selectedCycle = data
          })
        }
      })    
  }
  setReportsForCycle(cycle = null) {
    let cycleReports = null;
    // find the correct cycle report data to use
    if (cycle && this.subscription.cycles) {
      this.reportsData.forEach(element => {
        if (this.selectedCycle.start_date == element.start_date) {
          cycleReports = element;
        }
      });
    } else {
      cycleReports = this.reportsData[0];
    }
    if (!cycleReports) {
      console.log('error finding correct cyclereports');
      return;
    }
    //
    if(cycleReports.override_total_reported != -1){
      this.reportedStatsForm.controls['overRiderNumber'].setValue(cycleReports.override_total_reported)
      this.hasOverrideValue = true
      this.reportedStatsForm.updateValueAndValidity();
    } else {
      this.reportedStatsForm.controls['overRiderNumber'].setValue(null)
      this.hasOverrideValue = false
    }
    this.setManualReportDisabledStatus()
    //format the cycle report data for display
    let formatedReports = [];
    let displayString = '';
    let newDate = null;
    cycleReports.email_list.forEach(element => {
      newDate = new Date(element.date);
      formatedReports.push({
        email: element.email,
        date: newDate,
        campaign_id: element.campaign_id
      });
      displayString +=
        element.email +
        ', ' +
        this.datePipe.transform(newDate, 'MM/dd/yyyy h:mm:ss a') +
        '\n';
    });
    displayString = displayString.substring(0, displayString.length - 1); //Remove trailing endline character
    this.activeCycleReports = formatedReports;
    this.reportedStatsForm.controls['reportedItems'].setValue(displayString);
  }
  formatCSVtoReports() {
    let lines = this.reportedStatsForm.controls['reportedItems'].value.split(
      '\n'
    );
    let reportVals = [];
    let newDate = null;
    lines.forEach(element => {
      let reportItems = element.split(',');
      if (reportItems.length == 2) {
        newDate = new Date(reportItems[1].trim());
        reportVals.push({
          email: reportItems[0].trim(),
          date: newDate
        });
      }
    });
    return reportVals;
  }

  //Compare the initial reports data to the current and generate a list of the differences
  generateReportDiffernceList(currentVal = null) {
    if (
      this.reportedStatsForm.controls['overRiderNumber'].value ||
      currentVal == null 
    ) {
      let val =  parseInt(
        this.reportedStatsForm.controls['overRiderNumber'].value,
        10
      )
      if(Number.isNaN(val)){
        val = -1
      }
      return {
        override_total_reported: val,
        update_list: [],
        delete_list: []

      };
    } else {

    }
    let removelist = [];
    let addList = [];
    let previousVals = this.activeCycleReports;
    if (currentVal.length == 0 && previousVals.length != 0) {
      //All items deleted
      removelist = previousVals;
    }
    if (previousVals.length == 0 && currentVal.length != 0) {
      //All items new
      addList = currentVal;
    }
    //Generate remove list
    //Loop through both lists, comparing previous values to the current ones
    //If a previous value does not have a match, it has been removed or altered
    //add the previous value to the remove list
    for (let i = 0; i < previousVals.length; i++) {
      for (let h = 0; h < currentVal.length; h++) {
        if (previousVals[i].email == currentVal[h].email) {
          if (previousVals[i].date.getTime() == currentVal[h].date.getTime()) {
            h = currentVal.length;
          } else {
            h = currentVal.length;
            removelist.push(previousVals[i]);
          }
        } else if (h == currentVal.length - 1) {
          removelist.push(previousVals[i]);
        }
      }
    }
    //Generate add list
    //Loop through both lists, comparing current values to the previous ones
    //If a current value does not have a match, it has been added or altered
    //add the current value to the add list
    for (let i = 0; i < currentVal.length; i++) {
      for (let h = 0; h < previousVals.length; h++) {
        if (currentVal[i].email == previousVals[h].email) {
          if (currentVal[i].date.getTime() == previousVals[h].date.getTime()) {
            h = previousVals.length;
          } else {
            h = previousVals.length;
            addList.push(currentVal[i]);
          }
        } else if (h == previousVals.length - 1) {
          addList.push(currentVal[i]);
        }
      }
    }

    return {
      update_list: this.formatAddRemoveListDates(addList),
      delete_list: this.formatAddRemoveListDates(removelist),
      override_total_reported: Number(-1)
    };
  }

  focusOffReportList() {
    this.reportedStatsForm.updateValueAndValidity();
    this.getValidationMessage()
    if (this.reportedStatsForm.valid) {
      let formatedReportInput = this.formatCSVtoReports();
      let addRemoveLists = this.generateReportDiffernceList(
        formatedReportInput
      );
      this.saveReports(addRemoveLists);
    }
  }
  saveReports(addRemoveList){
    if(this.reportedStatsForm.valid){
      addRemoveList['start_date'] = this.selectedCycle['start_date']
      addRemoveList['end_date'] = this.selectedCycle['end_date']
      this.subscriptionSvc.postReportValuesForSubscription(addRemoveList,this.subscription_uuid).subscribe(
        (data) => {
          this.reportsData = data
          //this.setReportsForCycle() 
          this.setReportsForCycle(this.selectedCycle)
        },(failed) => {
          console.log("Failure To Save Reported Emails List")
          console.log(failed)
        }
      )
    } 
  }

  focusOffOverrideVal(){
    let val = this.reportedStatsForm.controls['overRiderNumber'].value
    let saveVal = this.generateReportDiffernceList()
    if(val){
      if(val >= 0){
        this.hasOverrideValue = true
        this.saveReports(this.generateReportDiffernceList())
        this.setManualReportDisabledStatus()
        return
      }
    }
    this.hasOverrideValue = false    
    this.saveReports(this.generateReportDiffernceList())
    this.setManualReportDisabledStatus()
  }

  setManualReportDisabledStatus(){
    if(this.hasOverrideValue == false){
      this.reportedStatsForm.controls['reportedItems'].enable();
    } else {
      this.reportedStatsForm.controls['reportedItems'].disable();      
    }
  }

  formatAddRemoveListDates(inputList){
    let ret_val = []
    //Add List
    for (let i = 0; i < inputList.length; i++) {
      if ('campaign_id' in inputList[i]) {
        ret_val.push({
          email: inputList[i].email,
          date: inputList[i].date.toISOString(),
          campaign_id: inputList[i].campaign_id
        });
      } else {
        ret_val.push({
          email: inputList[i].email,
          date: inputList[i].date.toISOString(),
          campaign_id: null
        });
      }
    }
    return ret_val;
  }

  cycleChange(event) {
    this.subscriptionSvc.setCycleBhaviorSubject(event.value)
    this.setReportsForCycle(event.value);
  }

  buildSubscriptionTimeline(s: Subscription) {
    const items: TimelineItem[] = [];

    items.push({
      title: 'Subscription Started',
      date: moment(s.start_date)
    });
    // now extract a simple timeline based on campaign events
    s.gophish_campaign_list.forEach((c: GoPhishCampaignModel) => {
      for (const t of c.timeline) {
        // ignore campaigns started on the subscription start date
        if (
          t.message.toLowerCase() === 'campaign created' &&
          isSameDate(t.time, s.start_date)
        ) {
          continue;
        }

        // ignore extra campaign starts we have already put into the list
        if (
          t.message.toLowerCase() === 'campaign created' &&
          items.find(x => isSameDate(x.date, t.time)) !== null
        ) {
          continue;
        }

        if (t.message.toLowerCase() === 'campaign created') {
          items.push({
            title: 'Cycle Start',
            date: moment(t.time)
          });
        }
      }
    });

    // add an item for 'today'
    items.push({
      title: 'Today',
      date: moment()
    });

    items.push({
      title: 'Cycle End',
      date: moment(s.end_date)
    });

    this.timelineItems = items;
  }

  invalidReportCsv(control: FormControl) {
    const exprEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (control.value == '') {
      return null;
    }
    const lines = control.value.split('\n');
    let emails = [];
    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length !== 2) {
        return { invalidTargetCsv: true };
      }

      if (!!parts[0] && !exprEmail.test(String(parts[0]).toLowerCase())) {
        return { invalidEmailFormat: true };
      }
      emails.push(parts[0]);

      if (!!parts[1]) {
        let date = new Date(parts[1]);
        if (isNaN(date.valueOf())) {
          return { invalidDateFormat: true, invalidDate: parts[1] };
        }
      }
    }
    for (let i = 0; i < emails.length; i++) {
      for (let h = i; h < emails.length; h++) {
        if (emails[i] == emails[h] && i != h) {
          return { duplicateEmail: true };
        }
      }
    }

    return null;
  }

  maxReports(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value !== undefined && (isNaN(control.value) ||control.value > max)) {
            return { ExcedesTargetCount: true };
        }
        return null;
    };
  }
  reportListValidator(targetList: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const exprEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if(control.value == ""){
        return null
      }
      const lines = control.value.split('\n');
      let emails = []
      let matchFound = false
      this.reportListErrorLineNum = 1
      for (const line of lines) {
        if(line){        
          const parts = line.split(',');
          if (parts.length !== 2) {
            return { invalidTargetCsv: true };
          }
    
          if (!!parts[0] && !exprEmail.test(String(parts[0]).toLowerCase().trim())) {
            return { invalidEmailFormat: parts[0] };
          }
          emails.push(parts[0])
          for(let i = 0; i < targetList.length;i++){
            if(targetList[i] == parts[0].trim()){
              matchFound = true
            }
          }
          if(!matchFound){
            return { emailNotATarget: parts[0] }
          }
          matchFound = false
    
          if(!!parts[1]){
            let date = new Date(parts[1])
            if(isNaN(date.valueOf())){
              return { invalidDateFormat: parts[1] }     
            }   
          }
        }
        this.reportListErrorLineNum++
      }
      for(let i = 0; i < emails.length; i++){
        for(let h = i; h < emails.length; h++){
          if(emails[i] == emails[h] && i != h){
            return { duplicateEmail: true }     
          }
        }
      } 
      // if (control.value !== undefined && (isNaN(control.value) ||control.value > max)) {
        //     return { 'ExcedesTargetCount': true };
        // }
        return null;
    };
  }
  targetListSimple(list){
    let retVal = []
    list.forEach(element => {
      retVal.push(element.email)
    });
    return retVal
  }
  getValidationMessage(){
    this.initValidationList()
    // const errors = this.reportedStatsForm.controls[control].errors;
    Object.keys(this.reportedStatsForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.reportedStatsForm.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(element => {
          this.validationErrors[element] = controlErrors[element]
        });
      }
    })
  }

  
  

  public initValidationList(){
    this.validationErrors = {
      invalidEmailFormat : "",
      invalidDateFormat : "",
      emailNotATarget : "",
      duplicateEmail : ""
    }
  }
  get f() {
    return this.reportedStatsForm.controls;
  }
}
