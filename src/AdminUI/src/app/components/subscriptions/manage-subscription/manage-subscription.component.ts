import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscription } from 'src/app/models/subscription.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-manage-subscription',
  templateUrl: './manage-subscription.component.html',
  styleUrls: ['./manage-subscription.component.scss']
})
export class ManageSubscriptionComponent implements OnInit, OnDestroy {

  private routeSub: any;
  subscription: Subscription

  sub_subscription: any;

  constructor(
    private layoutSvc: LayoutMainService,
    private subscriptionSvc: SubscriptionService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {

    this.routeSub = this.route.params.subscribe(params => {
      if (!params.id) {
        //this.loadPageForCreate(params);
      } else {
        this.loadPageForEdit(params);

      }
    });
  }

  onTabChanged(event) {
    window.dispatchEvent(new Event('resize'));
  }

  loadPageForEdit(params: any) {
    this.subscriptionSvc.subscription = new Subscription()
    const sub = this.subscriptionSvc.subscription;
    sub.subscription_uuid = params.id;

    this.sub_subscription = this.subscriptionSvc
      .getSubscription(sub.subscription_uuid)
      .subscribe(
        (success: Subscription) => {
          this.setPageForEdit(success);
        },
        (error) => {
          console.log(error);
          this.router.navigate(['/subscriptions']);
          if (error.status === 404) {
            this.dialog.open(AlertComponent, {
              // Parse error here
              data: {
                title: 'Not Found',
                messageText: 'Subscription Not Found.'
              }
            });
          }
        }
      );
  }

  setPageForEdit(s: Subscription) {
    this.subscriptionSvc.setSubBhaviorSubject(s)
    this.subscription = s as Subscription;
    this.subscriptionSvc.subscription = this.subscription;
    //@ts-ignore
    this.subscriptionSvc.setCycleBhaviorSubject(s["cycles"][0])
    this.setPageTitle()
  }

  setPageTitle() {
    if (this.subscription) {
      let title = `Edit Subscription: ${this.subscription.name}`;
      if (this.subscription.status.toLowerCase() === 'stopped') {
        title += ' (stopped)';
      }
      this.layoutSvc.setTitle(title);
    }
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.sub_subscription.unsubscribe();
    this.subscriptionSvc.clearSubBehaviorSubject();
  }
}