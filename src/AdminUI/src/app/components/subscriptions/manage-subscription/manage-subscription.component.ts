import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { SubscriptionModel } from 'src/app/models/subscription.model';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AlertComponent } from '../../dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { CanComponentDeactivate } from 'src/app/guards/unsaved-changes.guard';
import { SubscriptionConfigTab } from './subscription-config-tab/subscription-config-tab.component';
import { CycleService } from 'src/app/services/cycle.service';

@Component({
  selector: 'app-manage-subscription',
  templateUrl: './manage-subscription.component.html',
  styleUrls: ['./manage-subscription.component.scss'],
})
export class ManageSubscriptionComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  @ViewChild(SubscriptionConfigTab) configTab: SubscriptionConfigTab;
  private routeSub: any;
  subscription: SubscriptionModel;

  sub_subscription: any;
  loading = true;

  selectedTabIndex: number;

  constructor(
    private layoutSvc: LayoutMainService,
    private subscriptionSvc: SubscriptionService,
    private cycleSvc: CycleService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    });
    this.routeSub = this.route.params.subscribe((params) => {
      if (!params.id) {
        //this.loadPageForCreate(params);
      } else {
        this.loadPageForEdit(params);
        this.route.queryParams.subscribe((queryParams) => {
          if (!queryParams.tab) {
            this.selectedTabIndex = 0;
          } else {
            this.selectedTabIndex = queryParams.tab;
          }
        });
      }
    });
  }

  public canDeactivate(): Promise<boolean> {
    return this.configTab.canDeactivate();
  }

  onTabChanged(event) {
    window.dispatchEvent(new Event('resize'));
    this.selectedTabIndex = event.index;
  }

  loadPageForEdit(params: any) {
    this.subscriptionSvc.subscription = new SubscriptionModel();
    const sub = this.subscriptionSvc.subscription;
    sub._id = params.id;
    this.sub_subscription = this.subscriptionSvc
      .getSubscription(sub._id)
      .subscribe(
        (success: SubscriptionModel) => {
          this.cycleSvc.getSubscriptionCycles(sub._id).subscribe((cycles) => {
            success.cycles = cycles;
            this.loading = false;
            this.setPageForEdit(success);
          });
        },
        (error) => {
          console.log(error);
          this.loading = false;
          this.router.navigate(['/subscriptions']);
          this.dialog.open(AlertComponent, {
            // Parse error here
            data: {
              title: 'Not Found',
              messageText: 'Subscription Not Found.',
            },
          });
        },
      );
  }

  setPageForEdit(s: SubscriptionModel) {
    if (s.cycles) {
      s.cycles.reverse();
    }

    this.subscription = s as SubscriptionModel;
    this.subscriptionSvc.subscription = this.subscription;
    this.subscriptionSvc.setSubBehaviorSubject(s);

    if (s.cycles) {
      // Need to use let here. Compiler raises an error if not.
      const i = 0;
      this.subscriptionSvc.setCycleBehaviorSubject(s.cycles[i]);
    }

    this.setPageTitle();
  }

  setPageTitle() {
    if (this.subscription) {
      let title = `Edit Subscription: ${this.subscription.name}`;
      if (this.subscription.status.toLowerCase() === 'stopped') {
        title += ' (stopped)';
      }
      this.layoutSvc.setTitle(title);
    } else {
      let title = `New Subscription `;
      this.layoutSvc.setTitle(title);
    }
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.sub_subscription.unsubscribe();
    this.subscriptionSvc.clearSubBehaviorSubject();
  }
}
