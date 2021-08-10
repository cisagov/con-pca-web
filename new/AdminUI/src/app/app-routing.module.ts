import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutMainComponent } from './components/layout/layout-main/layout-main.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { ManageSubscriptionComponent } from './components/subscriptions/manage-subscription/manage-subscription.component';
import { SubscriptionConfigTab } from './components/subscriptions/manage-subscription/subscription-config-tab/subscription-config-tab.component';
import { TemplateManagerComponent } from './components/template-manager/template-manager.component';
import { RecommendationsManagerComponent } from './components/recommendations/recommendations-manager/recommendations-manager.component';
import { TagsManagerComponent } from './components/tags-page/tags-manager/tags-manager.component';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { DomainsComponent } from './components/domains/domains.component';
import { TemplatesPageComponent } from './components/templates-page/templates-page.component';
import { UserAdminComponent } from './components/user-admin/user-admin.component';
import { CustomersComponent } from './components/customers/customers.component';
import { AddCustomerComponent } from './components/customer/add-customer/add-customer.component';
import { SendingProfilesComponent } from './components/sending-profiles/sending-profiles.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from 'src/app/components/login/login.component';
import { RegisterUserComponent } from 'src/app/components/register/register-user.component';
import { DhsPocComponent } from './components/user-admin/dhs-poc/dhs-poc.component';
import { HelpFilesComponent } from './components/help-files/help-files.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { TagsPageComponent } from './components/tags-page/tags-page.component';
import { LayoutBlankComponent } from './components/layout/layout-blank/layout-blank.component';
import { MonthlyComponent } from './components/reports/monthly/monthly.component';
import { CycleComponent } from './components/reports/cycle/cycle.component';
import { YearlyComponent } from './components/reports/yearly/yearly.component';
import { AggregateStatsComponent } from './components/user-admin/aggregate-stats/aggregate-stats.component';
import { LandingPagesComponent } from './components/landing-pages/landing-pages.component';
import { LandingPagesManagerComponent } from './components/landing-pages-manager/landing-pages-manager.component';
import { UsersComponent } from './components/users/users.component';
import { LayoutLoginComponent } from './components/layout/layout-login/layout-login.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'reports',
    component: LayoutBlankComponent,
    children: [
      {
        path: 'monthly/:id/:cycle_uuid/:isHeadless/:nonhuman',
        component: MonthlyComponent,
      },
      {
        path: 'cycle/:id/:cycle_uuid/:isHeadless/:nonhuman',
        component: CycleComponent,
      },
      {
        path: 'yearly/:id/:cycle_uuid/:isHeadless/:nonhuman',
        component: YearlyComponent,
      },
    ],
  },
  {
    path: 'subscriptions',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SubscriptionsComponent },
      { path: '', component: SearchPanelComponent, outlet: 'sidebar' },
    ],
  },
  {
    path: 'create-subscription',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: SubscriptionConfigTab }],
  },
  {
    path: 'view-subscription',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: ':id',
        component: ManageSubscriptionComponent,
        canDeactivate: [UnsavedChangesGuard],
      },
    ],
  },
  {
    path: 'templatemanager',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TemplateManagerComponent }],
  },
  {
    path: 'templatemanager/:templateId',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TemplateManagerComponent }],
  },
  {
    path: 'templates',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TemplatesPageComponent }],
  },
  {
    path: 'login',
    component: LayoutLoginComponent,
    children: [
      { path: '', component: LoginComponent },
      { path: 'registeruser', component: RegisterUserComponent },
    ],
  },
  {
    path: 'contacts',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: ContactsComponent }],
  },
  {
    path: 'customers',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: CustomersComponent }],
  },
  {
    path: 'customer/:customerId',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: AddCustomerComponent }],
  },
  {
    path: 'domains',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: DomainsComponent }],
  },
  {
    path: 'recommendations',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: RecommendationsComponent }],
  },
  {
    path: 'recommendationsmanager',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: RecommendationsManagerComponent }],
  },
  {
    path: 'recommendationsmanager/:recommendationsId',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: RecommendationsManagerComponent }],
  },
  {
    path: 'useradmin',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: UserAdminComponent }],
  },
  {
    path: 'help',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: HelpFilesComponent }],
  },
  {
    path: 'dhspoc',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: DhsPocComponent }],
  },
  {
    path: 'aggreg-stats',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: AggregateStatsComponent }],
  },
  {
    path: 'sending-profiles',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: SendingProfilesComponent }],
  },
  {
    path: 'landing-pages',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: LandingPagesComponent }],
  },
  {
    path: 'landingpagesmanager',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: LandingPagesManagerComponent }],
  },
  {
    path: 'landingpagesmanager/:landing_page_uuid',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: LandingPagesManagerComponent }],
  },
  {
    path: '',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: SubscriptionsComponent }],
  },
  {
    path: 'tags',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TagsPageComponent }],
  },
  {
    path: 'tagsmanager',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TagsManagerComponent }],
  },
  {
    path: 'tagsmanager/:tagsId',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TagsManagerComponent }],
  },
  {
    path: 'users',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: UsersComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
