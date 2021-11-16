import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router, ActivatedRoute } from '@angular/router';
import { MyErrorStateMatcher } from 'src/app/helper/ErrorStateMatcher';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { TemplateManagerService } from 'src/app/services/template-manager.service';
import { TemplateModel } from 'src/app/models/template.model';
import { SubscriptionModel as PcaSubscription } from 'src/app/models/subscription.model';
import { Subscription } from 'rxjs';
import $ from 'jquery';
import 'src/app/helper/csvToArray';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { AppSettings } from 'src/app/AppSettings';
import { MatTableDataSource } from '@angular/material/table';
import { TagSelectionComponent } from '../dialogs/tag-selection/tag-selection.component';
import { SettingsService } from 'src/app/services/settings.service';
import { RetireTemplateDialogComponent } from './retire-template-dialog/retire-template-dialog.component';
import { AlertComponent } from '../dialogs/alert/alert.component';
import { LandingPageManagerService } from 'src/app/services/landing-page-manager.service';
import { LandingPageModel } from 'src/app/models/landing-page.models';
import Swal from 'sweetalert2';

import { SendingProfileService } from 'src/app/services/sending-profile.service';
import { TestEmailModel } from 'src/app/models/test-email.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ImportTemplateDialogComponent } from './import-template-dialog/import-template-dialog.component';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerModel } from 'src/app/models/customer.model';
import { TagModel } from 'src/app/models/tags.model';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { RecommendationModel } from 'src/app/models/recommendations.model';
import { RecommendationsListComponent } from '../recommendations/recommendations.component';

@Component({
  selector: 'app-template-manager',
  styleUrls: ['./template-manager.component.scss'],
  templateUrl: './template-manager.component.html',
})
export class TemplateManagerComponent implements OnInit, AfterViewInit {
  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  dialogRefTagSelection: MatDialogRef<TagSelectionComponent>;
  dialogRefRetire: MatDialogRef<RetireTemplateDialogComponent>;

  // Full template list variables
  sendingProfiles = [];
  customers = [];
  sophisticated = [];
  redFlag = [];
  testEmail = '';
  firstName = '';
  lastName = '';
  role = '';

  // Body Form Variables
  templateId: string;
  retired: boolean;
  canDelete: boolean = false;
  deleteTooltip: string = '';
  retiredReason: string;
  currentTemplateFormGroup: FormGroup;
  matchSubject = new MyErrorStateMatcher();
  matchFromAddress = new MyErrorStateMatcher();
  matchTemplateName = new MyErrorStateMatcher();
  matchTemplateHTML = new MyErrorStateMatcher();
  fromDisplayName: string;
  fromSender: string;

  mailtester_iframe_url = this.cleanURL('');
  currentTab = 'HTML View';

  // RxJS Subscriptions
  subscriptions = Array<Subscription>();

  // Con-PCA Subscriptions for the current Template
  pcaSubscriptions = new MatTableDataSource<PcaSubscription>();
  displayed_columns = ['name', 'start_date'];

  // config vars
  image_upload_url: string = `${this.settingsService.settings.apiUrl}/api/imageupload/`;

  dateFormat = AppSettings.DATE_FORMAT;

  tags: TagModel[];
  pagesList: LandingPageModel[];

  // Styling variables, required to properly size and display the angular-editor import
  body_content_height: number;
  text_editor_height: number;
  text_editor_height2: number;
  iframe_height: number;
  text_area_bot_marg: number = 20; // based on the default text area padding on a mat textarea element
  angular_editor_mode: String = 'WYSIWYG';

  // Elements used to get reference sizes for styling
  @ViewChild('selectedTemplateTitle') titleElement: ElementRef;
  @ViewChild('tabs') tabElement: any;
  @ViewChild('angularEditor') angularEditorEle: any;
  submitted: boolean = true;

  constructor(
    private layoutSvc: LayoutMainService,
    private recommendationSvc: RecommendationsService,
    private templateManagerSvc: TemplateManagerService,
    private subscriptionSvc: SubscriptionService,
    private landingPageSvc: LandingPageManagerService,
    public sendingProfileSvc: SendingProfileService,
    public customerSvc: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    public dialog: MatDialog,
    private domSanitizer: DomSanitizer
  ) {
    this.setTemplateForm(new TemplateModel());
    // Here updating title on creation.
    route.params.subscribe((params) => {
      this.templateId = params['templateId'];
      if (this.templateId != undefined) {
        layoutSvc.setTitle('Edit Template');
        this.selectTemplate(this.templateId);
      } else {
        // Use preset empty form
        layoutSvc.setTitle('New Template');
      }
    });
  }

  /**
   * convenience getter for easy access to form fields
   */
  get f() {
    return this.currentTemplateFormGroup.controls;
  }

  ngOnInit() {
    //get subscription to height of page from main layout component
    this.subscriptions.push(
      this.layoutSvc.getContentHeightEmitter().subscribe((height) => {
        this.body_content_height = height;
        if (this.titleElement != undefined) {
          this.setEditorHeight();
        }
      })
    );
    //get subscription to check for the sidenav element being set in layout, and close by default
    this.subscriptions.push(
      this.layoutSvc.getSideNavIsSet().subscribe((sideNavEmit) => {
        this.layoutSvc.closeSideNav().then(() => {
          this.setEditorHeight();
        });
      })
    );
    //Check if template ID was included in the route, open template identified if so
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.templateId = params['templateId'];
        if (this.templateId != undefined) {
          this.selectTemplate(this.templateId);
        } else {
          //Use preset empty form
        }
      })
    );

    this.landingPageSvc.getAlllandingpages(true).subscribe((data: any) => {
      this.pagesList = data;
    });
    this.sendingProfileSvc.getAllProfiles().subscribe((data: any) => {
      this.sendingProfiles = data;
    });
    this.customerSvc.getCustomers().subscribe((data: CustomerModel[]) => {
      this.customers = data;
    });
    this.recommendationSvc
      .getRecommendations()
      .subscribe((data: RecommendationModel[]) => {
        this.sophisticated = data.filter((rec) => rec.type === 'sophisticated');
        this.redFlag = data.filter((rec) => rec.type === 'red_flag');
      });
  }

  toggleEditorMode(event) {
    if ($('#justifyLeft-').is(':disabled')) {
      this.angular_editor_mode = 'WYSIWYG';
    } else {
      this.angular_editor_mode = 'Text';
    }
  }

  ngOnDestroy() {
    //Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngAfterViewInit() {
    this.configAngularEditor();
    this.addInsertTagButtonIntoEditor();
    $('#toggleEditorMode-').on('mousedown', this.toggleEditorMode.bind(this));
    $('.mat-tab-label').on('mousedown', this.matTabChange.bind(this));
  }

  matTabChange(event) {
    if (this.currentTab == 'HTML View') {
      if (this.angular_editor_mode == 'Text') {
        $('#toggleEditorMode-').click();
        this.angular_editor_mode = 'WYSIWYG';
      }
    }
  }

  onValueChanges(): void {
    //Event fires for every modification to the form, used to update deception score
    this.currentTemplateFormGroup.valueChanges.subscribe((val) => {
      this.currentTemplateFormGroup.patchValue(
        {
          final_deception_score:
            val.authoritative +
            val.grammar +
            val.internal +
            val.link_domain +
            val.logo_graphics +
            val.public_news +
            val.organization +
            val.external,
        },
        { emitEvent: false }
      );

      this.fromSender =
        this.currentTemplateFormGroup.controls['templateFromSender'].value;
      this.fromDisplayName =
        this.currentTemplateFormGroup.controls['templateFromDisplayName'].value;
    });
  }

  //Select a template based on template_id, returns the full template
  selectTemplate(template_id: string) {
    //Get template and call setTemplateForm to initialize a form group using the selected template
    this.templateManagerSvc.getTemplate(template_id).then((success) => {
      let t = <TemplateModel>success;

      this.setTemplateForm(t);
      this.testEmail = this.getRecommendedEmail();
      this.templateId = t._id;
      this.retired = t.retired;
      this.retiredReason = t.retired_description;
      this.subscriptionSvc
        .getSubscriptionsByTemplate(t)
        .subscribe((x: PcaSubscription[]) => {
          this.pcaSubscriptions.data = x;
          this.setCanDelete();
        });
    });
  }

  //Create a formgroup using a Template as initial data
  setTemplateForm(template: TemplateModel) {
    if (!template.indicators) {
      template.indicators = {} as any;
    }
    if (!template.indicators.appearance) {
      template.indicators.appearance = {} as any;
    }
    if (!template.indicators.sender) {
      template.indicators.sender = {} as any;
    }
    if (!template.indicators.relevancy) {
      template.indicators.relevancy = {} as any;
    }
    if (!template.indicators.behavior) {
      template.indicators.behavior = {} as any;
    }

    this.setTemplateFrom(template.from_address);
    this.currentTemplateFormGroup = new FormGroup({
      templateId: new FormControl(template._id),
      templateName: new FormControl(template.name, [Validators.required]),
      templateDeceptionScore: new FormControl(template.deception_score),
      templateFromDisplayName: new FormControl(this.fromDisplayName),
      templateFromSender: new FormControl(this.fromSender),
      sophisticatedRecs: new FormControl(template.sophisticated),
      redFlagRecs: new FormControl(template.red_flag),
      templateFromAddress: new FormControl(template.from_address),
      sendingProfile: new FormControl(''),
      customer: new FormControl(''),
      templateSubject: new FormControl(template.subject, [Validators.required]),
      templateText: new FormControl(template.text),
      templateHTML: new FormControl(template.html, [Validators.required]),
      landingPage: new FormControl(template.landing_page_id),
      templateSendingProfile: new FormControl(template.sending_profile_id),
      authoritative: new FormControl(
        template.indicators.sender?.authoritative ?? 0
      ),
      external: new FormControl(template.indicators.sender?.external ?? 0),
      internal: new FormControl(template.indicators.sender?.internal ?? 0),
      grammar: new FormControl(template.indicators.appearance?.grammar ?? 0),
      link_domain: new FormControl(
        template.indicators.appearance?.link_domain ?? 0
      ),
      logo_graphics: new FormControl(
        template.indicators.appearance?.logo_graphics ?? 0
      ),
      organization: new FormControl(
        template.indicators.relevancy.organization ?? 0
      ),
      public_news: new FormControl(
        template.indicators.relevancy.public_news ?? 0
      ),
      fear: new FormControl(template.indicators.behavior?.fear ?? false),
      duty_obligation: new FormControl(
        template.indicators.behavior?.duty_obligation ?? false
      ),
      curiosity: new FormControl(
        template.indicators.behavior?.curiosity ?? false
      ),
      greed: new FormControl(template.indicators.behavior?.greed ?? false),
      final_deception_score: new FormControl({
        value: this.calcDeceptionScore(template.indicators),
        disabled: true,
      }),
    });

    this.onValueChanges();
  }

  calcDeceptionScore(indicators) {
    return (
      (indicators.sender?.authoritative ?? 0) +
      (indicators.sender?.external ?? 0) +
      (indicators.sender?.internal ?? 0) +
      (indicators.appearance?.grammar ?? 0) +
      (indicators.appearance?.link_domain ?? 0) +
      (indicators.appearance?.logo_graphics ?? 0) +
      (indicators.relevancy?.public_news ?? 0) +
      (indicators.relevancy?.organization ?? 0)
    );
  }

  replaceEscapeSequence(value: string) {
    let rval = value.split('&lt;%').join('<%');
    rval = rval.split('%&gt;').join('%>');
    return rval;
  }

  //Get Template model from the form group
  getTemplateFromForm(form: FormGroup) {
    // form fields might not have the up-to-date content that the angular-editor has
    form.controls['templateHTML'].setValue(
      this.angularEditorEle.textArea.nativeElement.innerHTML
    );
    form.controls['templateText'].setValue(
      this.angularEditorEle.textArea.nativeElement.innerText
    );

    let formTemplate = form.value;
    let htmlValue = this.replaceEscapeSequence(
      form.controls['templateHTML'].value
    );
    console.log(form.controls['sophisticatedRecs'].value);
    return new TemplateModel({
      _id: this.templateId,
      name: form.controls['templateName'].value,
      sophisticated: form.controls['sophisticatedRecs'].value,
      red_flag: form.controls['redFlagRecs'].value,
      landing_page_id: form.controls['landingPage'].value,
      sending_profile_id: form.controls['templateSendingProfile'].value,
      deception_score: form.controls['final_deception_score'].value,
      from_address: this.getTemplateFrom(),
      subject: form.controls['templateSubject'].value,
      text: form.controls['templateText'].value,
      html: htmlValue,
      indicators: {
        appearance: {
          grammar: formTemplate.grammar,
          link_domain: formTemplate.link_domain,
          logo_graphics: formTemplate.logo_graphics,
        },
        sender: {
          authoritative: formTemplate.authoritative,
          external: formTemplate.external,
          internal: formTemplate.internal,
        },
        relevancy: {
          organization: formTemplate.organization,
          public_news: formTemplate.public_news,
        },
        behavior: {
          curiosity: formTemplate.curiosity ? 1 : 0,
          duty_obligation: formTemplate.duty_obligation ? 1 : 0,
          fear: formTemplate.fear ? 1 : 0,
          greed: formTemplate.greed ? 1 : 0,
        },
      },
    });
  }

  onCancelClick() {
    this.router.navigate(['/templates']);
  }

  saveTemplate() {
    // mark all as touched to ensure formgroup validation checks all fields on new entry
    this.currentTemplateFormGroup.markAllAsTouched();
    if (this.currentTemplateFormGroup.valid) {
      //check editor mode, change to wysiwg mode if in html text mode
      if (this.angular_editor_mode == 'Text') {
        $('#toggleEditorMode-').trigger('click');
        this.angular_editor_mode = 'WYSIWYG';
      }
      let templateToSave = this.getTemplateFromForm(
        this.currentTemplateFormGroup
      );
      //PATCH - existing template update
      if (this.currentTemplateFormGroup.controls['templateId'].value) {
        this.templateManagerSvc.updateTemplate(templateToSave).then(
          (success) => {
            this.dialog.open(AlertComponent, {
              data: {
                title: 'Template Saved',
                messageText: 'Your Template was Saved.',
              },
            });
          },
          (error) => {
            console.log(error);
            this.dialog.open(AlertComponent, {
              data: {
                title: 'Template Error',
                messageText: JSON.stringify(error.error),
              },
            });
          }
        );
        //POST - new template creation
      } else {
        this.templateManagerSvc.saveNewTemplate(templateToSave).subscribe(
          (resp: any) => {
            this.dialog.open(AlertComponent, {
              data: {
                title: '',
                messageText: 'Your template was created.',
              },
            });

            this.router.navigate(['/templates']);
          },
          (error: any) => {
            console.log(error);
            this.dialog.open(AlertComponent, {
              // Parse error here
              data: {
                title: `Template Error - ${error.statusText}`,
                messageText: JSON.stringify(error.error),
              },
            });
          }
        );
      }
    } else {
      //non valid form, collect nonvalid fields and display to user
      const invalid = [];
      const controls = this.currentTemplateFormGroup.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          let nameIng = 'Template ' + name.replace(/template/g, '');
          invalid.push(nameIng);
        }
      }
      this.dialog.open(AlertComponent, {
        data: {
          title: 'Missing Required Information',
          messageText: '',
          invalidData: invalid,
        },
      });
    }
  }

  deleteTemplate() {
    let template_to_delete = this.getTemplateFromForm(
      this.currentTemplateFormGroup
    );

    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to delete ${template_to_delete.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.templateManagerSvc.deleteTemplate(template_to_delete).then(
          (success) => {
            this.dialog.open(AlertComponent, {
              data: {
                title: 'Template Deleted',
                messageText: 'Your Template Was Deleted',
              },
            });
            this.router.navigate(['/templates']);
          },
          (error) => {}
        );
      }
      this.dialogRefConfirm = null;
    });
  }

  openRetireTemplateDialog() {
    const templateToRetire = this.getTemplateFromForm(
      this.currentTemplateFormGroup
    );
    this.dialogRefRetire = this.dialog.open(RetireTemplateDialogComponent, {
      disableClose: false,
      data: templateToRetire,
    });
    this.dialogRefRetire.afterClosed().subscribe((result) => {
      if (result.retired) {
        this.retired = result.retired;
        this.retiredReason = result.description;
        this.setCanDelete();
      }
    });
  }

  openRestoreTemplateDialog() {
    const templateToRestore = this.getTemplateFromForm(
      this.currentTemplateFormGroup
    );
    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to restore ${templateToRestore.name}? Initial Reason for Retiring - ${templateToRestore.retired_description}`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Restore';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        templateToRestore.retired = false;
        templateToRestore.retired_description = '';
        this.templateManagerSvc.updateTemplate(templateToRestore);
        this.retired = templateToRestore.retired;
      }
    });
  }

  //Event that fires everytime the template tab choice is changed
  onTabChanged($event) {
    //Required because the angular-editor library can not bind to [value].
    //Set the formGroups template text value to itself to force an update on tab switch
    this.currentTemplateFormGroup.controls['templateHTML'].setValue(
      this.currentTemplateFormGroup.controls['templateHTML'].value
    );
  }

  //Required because the angular-editor requires a hard coded height. Sets a new height referencing the elements on the page for
  //an accurate hieght measurement
  setEditorHeight() {
    //height of the selected Template input and deceptioncalculator button div
    let selected_template_height = this.titleElement.nativeElement.offsetHeight;
    //height of the tabs
    let tmpelement = this.tabElement._tabHeader._elementRef.nativeElement;
    let tab_height = (tmpelement && tmpelement.clientHeight) || 300;
    //height of the space created between teh text area and the bottom of the tab structure
    let mat_text_area_height =
      ($('.mat-form-field-infix')[0] &&
        $('.mat-form-field-infix')[0].clientHeight) ||
      300;
    //
    let save_button_row_height = 54;
    //Calculate the height allocated for the text areas, the text-area will use this directly while the editor will require assingment
    this.text_editor_height =
      this.body_content_height -
      selected_template_height -
      tab_height -
      mat_text_area_height -
      save_button_row_height;
    this.text_editor_height2 = this.text_editor_height;
    this.iframe_height = this.text_editor_height - 220;

    //Get the angular-editor toolbar height as it changes when the buttons wrap
    let angular_editor_tool_bar_height =
      ($('.angular-editor-toolbar')[0] &&
        $('.angular-editor-toolbar')[0].clientHeight) ||
      300;
    this.text_editor_height -= 50;
    //Set the editorConfig height to the text area height minus the toolbar height
    this.editorConfig['height'] =
      this.text_editor_height - angular_editor_tool_bar_height + 'px';
    this.editorConfig['maxHeight'] =
      this.text_editor_height - angular_editor_tool_bar_height + 'px';
    this.editorConfig['minHeight'] =
      this.text_editor_height - angular_editor_tool_bar_height + 'px';
    //remove the height from the text-area height to allow for the margin addition
    //Required to prevent the angular mat text area from overflowing onto its own border
    this.text_editor_height -= this.text_area_bot_marg;
  }

  //Configure elemenets of the angular-editor that are not included in the libraries config settings
  configAngularEditor() {
    let text_area = $('.angular-editor-textarea').first();
    text_area.css('resize', 'none');
    text_area.css('margin-bottom', '22px');
  }

  // Config setting for the angular-editor
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '500px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Please enter template text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: this.image_upload_url,
    //uploadUrl: 'localhost:8080/server/page/upload-image',
    uploadWithCredentials: false,
    sanitize: false,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [['insertVideo']],
  };

  /**
   * Hack the angular-editor to add a new button after the "clear formatting" button.
   * Clicking it clicks a hidden button to get us back into Angular.
   */
  addInsertTagButtonIntoEditor() {
    let btnClearFormatting = $(this.angularEditorEle.doc).find(
      "[title='Horizontal Line']"
    )[0];
    let attribs = btnClearFormatting.attributes;
    // this assumes that the _ngcontent attribute occurs first
    let ngcontent = attribs.item(0).name;
    let newButtonHtml1 = `<button ${ngcontent} type="button" title="Insert Tag" tabindex="-1" class="angular-editor-button" id="insertTag-" `;
    let newButtonHtml2 =
      'onclick="var h = document.getElementsByClassName(\'hidden-insert-tag-button\'); h[0].click();">';
    let newButtonHtml3 = `<i ${ngcontent} class="fa fa-tag"></i></button>`;
    $(btnClearFormatting)
      .closest('div')
      .append(newButtonHtml1 + newButtonHtml2 + newButtonHtml3);
  }

  /**
   * Opens a dialog that presents the tag options.
   */
  openTagChoice() {
    this.angularEditorEle.textArea.nativeElement.focus();
    const selection = window.getSelection().getRangeAt(0);
    this.dialogRefTagSelection = this.dialog.open(TagSelectionComponent, {
      disableClose: false,
    });
    this.dialogRefTagSelection.afterClosed().subscribe((result) => {
      if (result) {
        this.insertTag(selection, result);
        $('.angular-editor-wrapper').removeClass('show-placeholder');
      }
      this.dialogRefTagSelection = null;
    });
  }

  /**
   * Inserts a span containing the tag at the location of the selection.
   * @param selection
   * @param tag
   */
  insertTag(selection, tagText: string) {
    const newNode = document.createTextNode(tagText);
    selection.insertNode(newNode);
  }

  onSendTestClick() {
    this.submitted = true;

    //need to go get the sending profile from gophish
    let tmp_template = this.getTemplateFromForm(this.currentTemplateFormGroup);
    let email_for_test: TestEmailModel = {
      template: tmp_template, //template name to be used in the test
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.testEmail,
      position: this.role,
      url: '',
      smtp: this.f.sendingProfile.value,
      customer_id: this.f.customer.value,
    };

    this.sendingProfileSvc.sendTestEmail(email_for_test).subscribe(
      (data: any) => {
        Swal.fire(data.message);
        const iframesource = email_for_test.email.split('@');
        if (iframesource.length > 1) {
          this.mailtester_iframe_url = this.cleanURL(
            'https://www.mail-tester.com/' + iframesource[0]
          );
        } else {
          this.mailtester_iframe_url = this.cleanURL(
            'https://www.mail-tester.com/barryhansen-' + this.getCleanJobName()
          );
        }
      },
      (error) => {
        console.log(
          'Error sending test email: ' +
            (<Error>error).name +
            (<Error>error).message
        );
      }
    );
  }
  cleanURL(oldURL) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(oldURL);
  }

  getCleanJobName() {
    let name = this.currentTemplateFormGroup.controls['templateName'].value;
    const tname = name.replace(/[^a-zA-Z0-9_]/g, '');
    return tname;
  }

  getRecommendedEmail() {
    return 'barryhansen-' + this.getCleanJobName() + '@srv1.mail-tester.com';
  }

  setTemplateFrom(fromAddress: string) {
    if (fromAddress) {
      // Generate Display Name
      const spaceSplitArray = fromAddress.split(' ');
      if (spaceSplitArray.length > 1) {
        this.fromDisplayName = spaceSplitArray
          .splice(0, spaceSplitArray.length - 1)
          .join(' ')
          .trim();
      } else {
        this.fromDisplayName = 'Display Name';
      }

      // Generate Sender
      const senderArray = fromAddress.split('@')[0].split(' ');
      this.fromSender = senderArray[senderArray.length - 1]
        .trim()
        .replace('<', '');
      if (!this.fromSender) {
        this.fromSender = 'sender';
      }
    } else {
      // Default values if not from address
      this.fromSender = 'sender';
      this.fromDisplayName = 'Display Name';
    }
  }

  getTemplateFrom() {
    return `${this.fromDisplayName} <${this.fromSender}@domain.com>`;
  }

  setCanDelete() {
    if (this.pcaSubscriptions.data.length > 0) {
      this.canDelete = false;
      this.deleteTooltip =
        'Can not delete templates associated with a subscription';
    } else {
      this.canDelete = true;
      this.deleteTooltip = 'Delete the template';
    }
  }

  importEmail() {
    const dialogRef = this.dialog.open(ImportTemplateDialogComponent, {
      disableClose: false,
      width: '80%',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.angular_editor_mode === 'Text') {
          $('#toggleEditorMode-').trigger('click');
          this.angular_editor_mode = 'WYSIWYG';
        }
        // this.currentTemplateFormGroup.patchValue({
        //   templateSubject: result.subject,
        // });
        if (result.html) {
          this.angularEditorEle.textArea.nativeElement.innerHTML = result.html;
          this.editorConfig.placeholder = null;
        } else if (result.text) {
          this.angularEditorEle.textArea.nativeElement.innerText = result.text;
          this.editorConfig.placeholder = null;
        }
      }
    });
  }
}
