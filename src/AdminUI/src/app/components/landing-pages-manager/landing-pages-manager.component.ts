import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router, ActivatedRoute } from '@angular/router';
import { MyErrorStateMatcher } from 'src/app/helper/ErrorStateMatcher';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { SubscriptionModel as PcaSubscription } from 'src/app/models/subscription.model';
import { Subscription } from 'rxjs';
import $ from 'jquery';
import 'src/app/helper/csvToArray';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { ConfirmComponent } from '../dialogs/confirm/confirm.component';
import { AppSettings } from 'src/app/AppSettings';
import { MatTableDataSource } from '@angular/material/table';
import { SettingsService } from 'src/app/services/settings.service';
import { AlertComponent } from '../dialogs/alert/alert.component';
import { LandingPageManagerService } from 'src/app/services/landing-page-manager.service';
import { LandingPageModel } from 'src/app/models/landing-page.models';
import { TemplateModel } from 'src/app/models/template.model';
import { TagSelectionComponent } from '../dialogs/tag-selection/tag-selection.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-pages-manager',
  templateUrl: './landing-pages-manager.component.html',
  styleUrls: ['./landing-pages-manager.component.scss'],
})
export class LandingPagesManagerComponent implements OnInit {
  sortTemplates: MatSort;
  loading = false;
  public templatesSource: MatTableDataSource<TemplateModel>;

  dialogRefConfirm: MatDialogRef<ConfirmComponent>;
  dialogRefTagSelection: MatDialogRef<TagSelectionComponent>;

  canDelete: boolean;
  templates: TemplateModel[] = [];

  //Full template list variables
  search_input: string;

  //Body Form Variables
  templateId: string;
  currentTemplateFormGroup: FormGroup;
  matchSubject = new MyErrorStateMatcher();
  matchFromAddress = new MyErrorStateMatcher();
  matchTemplateName = new MyErrorStateMatcher();
  matchTemplateHTML = new MyErrorStateMatcher();
  IsDefaultTemplate: boolean = false;
  angular_editor_mode: String = 'WYSIWYG';

  //RxJS Subscriptions
  subscriptions = Array<Subscription>();

  // Con-PCA Subscriptions for the current Template
  pcaSubscriptions = new MatTableDataSource<PcaSubscription>();
  displayed_columns = ['name', 'deception_score'];

  //config vars
  image_upload_url: string = `${this.settingsService.settings.apiUrl}/api/util/imageencode/`;

  dateFormat = AppSettings.DATE_FORMAT;

  //Styling variables, required to properly size and display the angular-editor import
  body_content_height: number;
  text_editor_height: number;
  text_area_bot_marg: number = 20; //based on the default text area padding on a mat textarea element
  //Elements used to get reference sizes for styling
  @ViewChild('selectedTemplateTitle') titleElement: ElementRef;
  @ViewChild('tabs') tabElement: any;
  @ViewChild('angularEditor') angularEditorEle: any;

  constructor(
    private layoutSvc: LayoutMainService,
    private landingPageManagerSvc: LandingPageManagerService,
    private subscriptionSvc: SubscriptionService,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    public dialog: MatDialog,
    private http: HttpClient,
  ) {
    // Set title of page
    route.params.subscribe((params) => {
      this.templateId = params['landing_page_id'];
      if (this.templateId != undefined) {
        layoutSvc.setTitle('Edit Landing Page');
      } else {
        //Use preset empty form
        layoutSvc.setTitle('New Landing Page');
      }
    });
    //this.setEmptyTemplateForm();
    this.setTemplateForm(new LandingPageModel());
  }
  ngOnInit() {
    //get subscription to height of page from main layout component
    this.subscriptions.push(
      this.layoutSvc.getContentHeightEmitter().subscribe((height) => {
        this.body_content_height = height;
        if (this.titleElement != undefined) {
          this.setEditorHeight();
        }
      }),
    );
    //get subscription to check for the sidenav element being set in layout, and close by default
    this.subscriptions.push(
      this.layoutSvc.getSideNavIsSet().subscribe((sideNavEmit) => {
        this.layoutSvc.closeSideNav().then(() => {
          this.setEditorHeight();
        });
      }),
    );
    //Check if template ID was included in the route, open template identified if so
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.templateId = params['landing_page_id'];
        if (this.templateId != undefined) {
          this.selectTemplate(this.templateId);
        } else {
          //Use preset empty form
        }
      }),
    );
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
  }

  //Select a template based on template_id, returns the full template
  selectTemplate(template_id: string) {
    //Get template and call setTemplateForm to initialize a form group using the selected template
    this.landingPageManagerSvc.getlandingpage(template_id).then(
      (success) => {
        let t = <LandingPageModel>success;

        this.setTemplateForm(t);
        this.templateId = t._id;
        this.IsDefaultTemplate = t.is_default_template ? true : false;

        this.setCanDelete();
      },
      (error) => {},
    );
  }

  //Create a formgroup using a Template as initial data
  setTemplateForm(template: LandingPageModel) {
    this.currentTemplateFormGroup = new FormGroup({
      landingPageId: new FormControl(template._id),
      templateName: new FormControl(template.name, [Validators.required]),
      templateHTML: new FormControl(template.html, [Validators.required]),
      IsDefaultTemplate: new FormControl(
        {
          value: template.is_default_template,
          disabled: template.is_default_template,
        },
        [Validators.nullValidator],
      ),
    });
  }

  //Get Template model from the form group
  getTemplateFromForm(form: FormGroup) {
    // form fields might not have the up-to-date content that the angular-editor has
    form.controls['templateHTML'].setValue(
      this.angularEditorEle.textArea.nativeElement.innerHTML,
    );
    let htmlValue = this.replaceEscapeSequence(
      form.controls['templateHTML'].value,
    );

    let saveTemplate = new LandingPageModel({
      _id: form.controls['landingPageId'].value,
      name: form.controls['templateName'].value,
      html: htmlValue,
      is_default_template: form.controls['IsDefaultTemplate'].value,
    });
    if (saveTemplate.is_default_template === undefined) {
      saveTemplate.is_default_template = false;
    }

    saveTemplate._id = this.templateId;
    return saveTemplate;
  }

  replaceEscapeSequence(value: string) {
    let rval = value.split('&lt;%').join('<%');
    rval = rval.split('%&gt;').join('%>');
    return rval;
  }

  toggleEditorMode(event) {
    if ($('#justifyLeft-').is(':disabled')) {
      this.angular_editor_mode = 'WYSIWYG';
    } else {
      this.angular_editor_mode = 'Text';
    }
  }

  /**
   *
   */
  onCancelClick() {
    this.router.navigate(['/landing-pages']);
  }

  /**
   *
   */
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
        this.currentTemplateFormGroup,
      );
      //PATCH - existing template update
      if (this.currentTemplateFormGroup.controls['landingPageId'].value) {
        this.landingPageManagerSvc.updatelandingpage(templateToSave).then(
          (success) => {
            this.router.navigate(['/landing-pages']);
            // let retTemplate = <Template>success
            // this.updateTemplateInList(retTemplate)
          },
          (error) => {
            console.log(error);
            this.dialog.open(AlertComponent, {
              // Parse error here
              data: {
                title: 'Template Error',
                messageText: `Error: ${error.error.error}`,
              },
            });
          },
        );
        //POST - new template creation
      } else {
        this.landingPageManagerSvc.saveNewlandingpage(templateToSave).subscribe(
          (resp: any) => {
            this.dialog.open(AlertComponent, {
              data: {
                title: '',
                messageText: 'Your template was created.',
              },
            });

            this.router.navigate(['/landing-pages']);
          },
          (error: any) => {
            console.log(error);
            this.dialog.open(AlertComponent, {
              // Parse error here
              data: {
                title: 'Template Error',
                messageText: `Error: ${error.error.error}`,
              },
            });
          },
        );
      }
    } else {
      //non valid form, collect nonvalid fields and display to user
      const invalid = [];
      const controls = this.currentTemplateFormGroup.controls;
      for (var name in controls) {
        if (controls[name].invalid) {
          if (name == 'templateName') {
            name = 'Page Name';
          } else if (name == 'templateHTML') {
            name = 'Template HTML';
          }
          invalid.push(name);
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

  deletePage() {
    let template_to_delete = this.getTemplateFromForm(
      this.currentTemplateFormGroup,
    );

    this.dialogRefConfirm = this.dialog.open(ConfirmComponent, {
      disableClose: false,
    });
    this.dialogRefConfirm.componentInstance.confirmMessage = `Are you sure you want to delete ${template_to_delete.name}?`;
    this.dialogRefConfirm.componentInstance.title = 'Confirm Delete';

    this.dialogRefConfirm.afterClosed().subscribe((result) => {
      if (result) {
        this.landingPageManagerSvc.deletelandingpage(template_to_delete).then(
          (success) => {
            this.router.navigate(['/landing-pages']);
          },
          (error) => {},
        );
      }
      this.dialogRefConfirm = null;
    });
  }

  setCanDelete() {
    this.landingPageManagerSvc
      .getLandingPageTemplates(this.templateId)
      .subscribe((templates: TemplateModel[]) => {
        this.templates = templates;
        if (templates.length === 0 && !this.IsDefaultTemplate) {
          this.canDelete = true;
        }
      });
  }

  //Event that fires everytime the template tab choice is changed
  onTabChanged($event) {
    //Required because the angular-editor library can not bind to [value].
    //Set the formGroups template text value to itself to force an update on tab switch
    this.currentTemplateFormGroup.controls['templateHTML'].setValue(
      this.currentTemplateFormGroup.controls['templateHTML'].value,
    );
  }

  //Required because the angular-editor requires a hard coded height. Sets a new height referencing the elements on the page for
  //an accurate hieght measurement
  setEditorHeight() {
    //height of the selected Template input and deceptioncalculator button div
    let selected_template_height = this.titleElement.nativeElement.offsetHeight;
    //height of the tabs
    let tab_height =
      this.tabElement._tabHeader._elementRef.nativeElement.clientHeight;
    //height of the space created between teh text area and the bottom of the tab structure
    let mat_text_area_height = $('.mat-form-field-infix')[0].clientHeight;
    //
    let save_button_row_height = 54;
    //Calculate the height allocated for the text areas, the text-area will use this directly while the editor will require assingment
    this.text_editor_height =
      this.body_content_height -
      selected_template_height -
      tab_height -
      mat_text_area_height -
      save_button_row_height;

    //Get the angular-editor toolbar height as it changes when the buttons wrap
    let angular_editor_tool_bar_height = $('.angular-editor-toolbar')[0]
      .clientHeight;
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
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [['insertVideo']],
  };

  /**
   * Hack the angular-editor to add a new button after the "clear formatting" button.
   * Clicking it clicks a hidden button to get us back into Angular.
   */
  addInsertTagButtonIntoEditor() {
    let btnClearFormatting = $(this.angularEditorEle.doc).find(
      "[title='Horizontal Line']",
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
}
