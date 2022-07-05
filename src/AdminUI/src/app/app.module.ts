import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import {
  BrowserModule,
  ɵBROWSER_SANITIZATION_PROVIDERS,
} from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MaterialModule } from './material.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { LayoutBlankComponent } from './components/layout/layout-blank/layout-blank.component';
import { LayoutMainComponent } from './components/layout/layout-main/layout-main.component';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { ManageSubscriptionComponent } from './components/subscriptions/manage-subscription/manage-subscription.component';
import { SubscriptionConfigTab } from './components/subscriptions/manage-subscription/subscription-config-tab/subscription-config-tab.component';
import { SubscriptionStatsTab } from './components/subscriptions/manage-subscription/subscription-cycles-tab/subscription-cycles-tab.component';
import { SubscriptionTasksTabComponent } from './components/subscriptions/manage-subscription/subscription-tasks-tab/subscription-tasks-tab.component';
import { UserAuthService } from './services/user-auth.service';
import { TemplateManagerComponent } from './components/template-manager/template-manager.component';
import { TemplateManagerService } from './services/template-manager.service';
import { ListFilterPipe } from './pipes/list-filter.pipe';
import { NullishCoalescePipe } from './pipes/nullish-coalesce.pipe';
import { AutosizeModule } from 'node_modules/ngx-autosize';

import { AddCustomerComponent } from './components/customer/add-customer/add-customer.component';
import { SubscriptionService } from './services/subscription.service';
import { ThemeService } from './services/theme.service';
import { LayoutMainService } from './services/layout-main.service';
import { CycleSelect } from './components/dialogs/cycle-select-default/cycle-select.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';

import { TemplatesPageComponent } from './components/templates-page/templates-page.component';
import { TagsPageComponent } from './components/tags-page/tags-page.component';
import { ConfigComponent } from './components/config/config.component';
import { HelpFilesComponent } from './components/help-files/help-files.component';
import { CustomerService } from './services/customer.service';
import { CustomersComponent } from './components/customers/customers.component';
import { AddContactDialogComponent } from './components/contacts/add-contact-dialog/add-contact-dialog.component';
import { ViewContactDialogComponent } from './components/contacts/view-contact-dialog/view-contact-dialog.component';
import {
  DeleteSubscription,
  DeleteSubscriptionDialog,
} from 'src/app/components/subscriptions/delete-subscription/delete-subscription.component';
import {
  DeleteCycle,
  DeleteCycleDialog,
} from './components/subscriptions/delete-cycle/delete-cycle.component';
import { SendingProfilesComponent } from './components/sending-profiles/sending-profiles.component';
import { SendingProfileDetailComponent } from './components/sending-profiles/sending-profile-detail.component';
import { CustomerSubscriptionsComponent } from './components/subscriptions/customer-subscriptions/customer-subscriptions.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SubDashboardComponent } from './components/subscriptions/sub-dashboard/sub-dashboard.component';
import { ConfirmComponent } from './components/dialogs/confirm/confirm.component';
import { TagSelectionComponent } from './components/dialogs/tag-selection/tag-selection.component';
import { SettingsHttpService } from './services/settings-http.service';
import { RetireTemplateDialogComponent } from './components/template-manager/retire-template-dialog/retire-template-dialog.component';
import { CustomerDialogComponent } from './components/dialogs/customer-dialog/customer-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertComponent } from './components/dialogs/alert/alert.component';
import { SafePipe } from './helper/safe.pipe';
import { UTCtoReadableTime } from './helper/utcTimeReadable.pipe';
import { SvgTimelineComponent } from './components/subscriptions/svg-timeline/svg-timeline.component';
import { AuthAppendInterceptor } from './helper/AuthAppendInterceptor';
import { UnauthorizedInterceptor } from './helper/UnauthorizedInterceptor';
import { InputTrimDirective } from './helper/input-trim.directive';
import { DatePipe } from '@angular/common';
import { TagService } from './services/tag.service';
import { StatsByLevelComponent } from './components/reports/stats-by-level/stats-by-level.component';
import { ChartComplexityLevelComponent } from './components/charts/chart-complexity-level/chart-complexity-level.component';
import { ChartStatsByLevelComponent } from './components/charts/chart-stats-by-level/chart-stats-by-level.component';
import { ChartTimeIntervalsComponent } from './components/charts/chart-time-intervals/chart-time-intervals.component';
import { YearlyPercentageTrendsComponent } from './components/charts/yearly-percentage-trends/yearly-percentage-trends.component';
import { ChartTimeToFirstClickLevelsComponent } from './components/charts/chart-time-to-first-click-levels/chart-time-to-first-click-levels.component';
import { YearlyClickRateVsReportRateComponent } from './components/charts/yearly-clickrate-vs-reportedrate/yearly-clickrate-vs-reportedrate.component';
import { LandingPagesComponent } from './components/landing-pages/landing-pages.component';
import { LandingPageManagerService } from './services/landing-page-manager.service';
import { LandingPagesManagerComponent } from './components/landing-pages-manager/landing-pages-manager.component';
import { UsersComponent } from './components/users/users.component';
import { ImportTemplateDialogComponent } from './components/template-manager/import-template-dialog/import-template-dialog.component';
import { TemplateSelectDialogComponent } from './components/subscriptions/manage-subscription/template-select-dialog/template-select-dialog.component';
import { RegisterUserComponent } from 'src/app/components/register/register-user.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginService } from 'src/app/services/login.service';
import { LayoutLoginComponent } from './components/layout/layout-login/layout-login.component';
import { UnsavedComponent } from './components/dialogs/unsaved/unsaved.component';
import { InvalidEmailDialogComponent } from './components/subscriptions/invalid-email-dialog/invalid-email-dialog.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { RecommendationsListComponent } from './components/recommendations/recommendations.component';
import { RecommendationDetailComponent } from './components/recommendations/recommendation-details.component';
import { RecommendationsService } from './services/recommendations.service';
import { AlertsService } from './services/alerts.service';
import { ConfigService } from './services/config.service';
import { SubscriptionTestingTabComponent } from './components/subscriptions/manage-subscription/subscription-testing-tab/subscription-testing-tab.component';
import { GenericViewComponent } from './components/dialogs/generic-view/generic-view.component';
import { RetireTemplatesDialogComponent } from './components/template-manager/retire-templates-dialog/retire-templates-dialog.component';
import { TemplatesDataService } from './services/templates-data.service';
import { TestTemplatesDialogComponent } from './components/template-manager/test-templates-dialog/test-templates-dialog.component';
import { LandingDomainsComponent } from './components/landing-domains/landing-domains.component';
import { LandingDomainDetailComponent } from './components/landing-domains/landing-domain-detail/landing-domain-detail.component';
import { NavigateAwayComponent } from './components/dialogs/navigate-away/navigate-away.component';
import { OverviewComponent } from './components/overview/overview.component';
import { AggregateStatisticsTab } from './components/overview/aggregate-statistics-tab/aggregate-statistics-tab.component';
import { SubscriptionStatusTab } from './components/overview/subscription-status-tab/subscription-status-tab.component';
import { TemplateDataDialogComponent } from './components/subscriptions/manage-subscription/subscription-testing-tab/template-data-dialog/template-data-dialog.component';
import { LoggingTab } from './components/overview/logging-tab/logging-tab.component';
import { RestoreTemplatesDialogComponent } from './components/template-manager/restore-templates-dialog/restore-templates-dialog.component';

export function app_Init(settingsHttpService: SettingsHttpService) {
  return () => settingsHttpService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
    SubscriptionsComponent,
    LayoutBlankComponent,
    LayoutMainComponent,
    SearchPanelComponent,
    AddCustomerComponent,
    ManageSubscriptionComponent,
    OverviewComponent,
    AggregateStatisticsTab,
    SubscriptionStatusTab,
    SubscriptionConfigTab,
    SubscriptionTasksTabComponent,
    SubscriptionStatsTab,
    TemplateManagerComponent,
    ListFilterPipe,
    NullishCoalescePipe,
    TemplatesPageComponent,
    CycleSelect,
    TagsPageComponent,
    ConfigComponent,
    HelpFilesComponent,
    CustomersComponent,
    AddContactDialogComponent,
    ViewContactDialogComponent,
    DeleteSubscription,
    DeleteSubscriptionDialog,
    DeleteCycle,
    DeleteCycleDialog,
    SendingProfilesComponent,
    SendingProfileDetailComponent,
    CustomerSubscriptionsComponent,
    SubDashboardComponent,
    ConfirmComponent,
    TagSelectionComponent,
    RestoreTemplatesDialogComponent,
    RetireTemplateDialogComponent,
    RetireTemplatesDialogComponent,
    CustomerDialogComponent,
    AlertComponent,
    SafePipe,
    UTCtoReadableTime,
    SvgTimelineComponent,
    InputTrimDirective,
    StatsByLevelComponent,
    ChartComplexityLevelComponent,
    ChartStatsByLevelComponent,
    ChartTimeIntervalsComponent,
    ChartTimeToFirstClickLevelsComponent,
    YearlyPercentageTrendsComponent,
    YearlyClickRateVsReportRateComponent,
    LandingPagesComponent,
    LandingPagesManagerComponent,
    UsersComponent,
    ImportTemplateDialogComponent,
    TemplateSelectDialogComponent,
    RegisterUserComponent,
    LoginComponent,
    LayoutLoginComponent,
    UnsavedComponent,
    InvalidEmailDialogComponent,
    ForgotPasswordComponent,
    PasswordResetComponent,
    LoadingOverlayComponent,
    RecommendationsListComponent,
    RecommendationDetailComponent,
    SubscriptionTestingTabComponent,
    GenericViewComponent,
    TemplateDataDialogComponent,
    TestTemplatesDialogComponent,
    LandingDomainsComponent,
    LandingDomainDetailComponent,
    NavigateAwayComponent,
    LoggingTab,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AngularEditorModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    MatExpansionModule,
    MatSortModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    AutosizeModule,
    HttpClientModule,
    NgxChartsModule,
  ],
  providers: [
    AlertsService,
    ConfigService,
    CustomerService,
    HttpClient,
    LandingPageManagerService,
    LayoutMainService,
    LoginService,
    RecommendationsService,
    SubscriptionService,
    TagService,
    TemplateManagerService,
    TemplatesDataService,
    ThemeService,
    UserAuthService,
    [DatePipe],
    { provide: MAT_DIALOG_DATA, useValue: [] },
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      deps: [SettingsHttpService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthAppendInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true,
    },
  ],
  exports: [MatSortModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
