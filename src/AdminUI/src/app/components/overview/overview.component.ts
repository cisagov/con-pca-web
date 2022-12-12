import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutMainService } from 'src/app/services/layout-main.service';
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
  ) {}

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
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
