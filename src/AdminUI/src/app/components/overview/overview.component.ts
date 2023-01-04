import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { OverviewTabService } from 'src/app/services/overview-tab.service';
import { AggregateStatisticsTab } from './aggregate-statistics-tab/aggregate-statistics-tab.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  @ViewChild(AggregateStatisticsTab) configTab: AggregateStatisticsTab;
  private routeSub: any;
  selectedTabIndex: number;

  constructor(
    private route: ActivatedRoute,
    private layoutSvc: LayoutMainService,
    private tabSvc: OverviewTabService,
  ) {

  }

  ngOnInit(): void {
    this.layoutSvc.setTitle('Overview');

    this.routeSub = this.route.params.subscribe(() => {
      this.route.queryParams.subscribe((queryParams) => {
        if (!queryParams.tab) {
          this.selectedTabIndex = 0;
        } else {
          this.selectedTabIndex = queryParams.tab;
        }
      });
    });
  }

  onTabChanged(event) {
    window.dispatchEvent(new Event('resize'));
    this.selectedTabIndex = event.index;
    console.log(this.selectedTabIndex)
    if(this.selectedTabIndex == 1){ 
      this.tabSvc.subscriptionStatsClicked.next(true);
    }
    if(this.selectedTabIndex == 2){ 
      this.tabSvc.loggingErrorsClicked.next(true);
    }
    if(this.selectedTabIndex == 3){ 
      this.tabSvc.failedEmailsClicked.next(true);
    }
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
