import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  NgForm,
  FormGroupDirective,
  Validators,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { MyErrorStateMatcher } from 'src/app/helper/ErrorStateMatcher';
import { DeceptionCalculatorService } from 'src/app/services/deception-calculator.service';
import { DeceptionCalculation } from 'src/app/models/deception-calculator.model';
import { Template } from 'src/app/models/template.model';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { Subscription, Observable } from 'rxjs';
import { temporaryAllocator } from '@angular/compiler/src/render3/view/util';
import { AlertComponent } from '../dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'deception-calculator',
  templateUrl: './deception-calculator.component.html',
  styleUrls: ['./deception-calculator.component.scss']
})
export class DeceptionCalculatorComponent implements OnInit {
  //models
  decpeption_calculation: DeceptionCalculation;

  //Forms and presentation elements
  templateId: string;
  deceptionFormGroup: FormGroup;
  templateName: string;
  templateSubject: string;
  templateHTML: string;

  //Subscriptions
  subscriptions = Array<Subscription>();

  constructor(
    public deceptionService: DeceptionCalculatorService,
    private layoutSvc: LayoutMainService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    layoutSvc.setTitle('Deception Calculator');

    //Set formGroup to empty model to avoid collision when HTML is rendered
    this.setDeceptionFormFromModel(new Template());
  }

  ngOnInit(): void {
    //Get a subscription to the template and build out the formGroup and html preview
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.templateId = params['templateId'];
        if (this.templateId != undefined) {
          this.subscriptions.push(
            this.deceptionService
              .getDeception(this.templateId)
              .subscribe((templateData: Template) => {
                this.templateId = templateData.template_uuid;
                this.setDeceptionFormFromModel(templateData);
                this.setTemplatePreview(templateData);
                this.onValueChanges();
              })
          );
        } else {
          this.router.navigate(['/templatemanager']);
        }
      })
    );

    //Get access to the sidenav element, set to closed initially
    this.subscriptions.push(
      this.layoutSvc
        .getSideNavIsSet()
        .subscribe(sideNavEmit => this.layoutSvc.closeSideNav())
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  saveDeceptionCalculation() {
    if (this.deceptionFormGroup.valid) {
      let template_to_save = this.getTemplateModelFromForm(
        this.deceptionFormGroup
      );
      this.deceptionService.saveDeception(template_to_save);
    } else {
      this.dialog.open(AlertComponent, {
        data: {
          title: 'Error',
          messageText: 'Errors on deception form' + this.deceptionFormGroup.errors
        }
      });
    }
  }

  onValueChanges(): void {
    //Event fires for every modification to the form, used to update deception score
    this.deceptionFormGroup.valueChanges.subscribe(val => {
      this.deceptionFormGroup.patchValue(
        {
          final_deception_score: this.calcDeceptionScore(val)
        },
        { emitEvent: false }
      );
    });
  }

  /**
   * Calculate the deception score using the provided Template model
   */
  calcDeceptionScore(formValues: Template) {
    return (
      formValues.authoritative +
      formValues.grammar +
      formValues.internal +
      formValues.link_domain +
      formValues.logo_graphics +
      formValues.public_news +
      formValues.organization +
      formValues.external
    );
  }

  /**
   * Set the angular form data from the provided DeceptionCalculation model
   */
  setDeceptionFormFromModel(template: Template) {
    if (!template.appearance) {
      template.appearance = <any>{};
    }
    if (!template.sender) {
      template.sender = <any>{};
    }
    if (!template.relevancy) {
      template.relevancy = <any>{};
    }
    if (!template.behavior) {
      template.behavior = <any>{};
    }

    this.deceptionFormGroup = new FormGroup({
      authoritative: new FormControl(template.sender?.authoritative ?? 0),
      external: new FormControl(template.sender?.external ?? 0),
      internal: new FormControl(template.sender?.internal ?? 0),
      grammar: new FormControl(template.appearance?.grammar ?? 0),
      link_domain: new FormControl(template.appearance?.link_domain ?? 0),
      logo_graphics: new FormControl(template.appearance?.logo_graphics ?? 0),
      organization: new FormControl(template.relevancy.organization ?? 0),
      public_news: new FormControl(template.relevancy.public_news ?? 0),
      fear: new FormControl(template.behavior?.fear ?? false),
      duty_obligation: new FormControl(
        template.behavior?.duty_obligation ?? false
      ),
      curiosity: new FormControl(template.behavior?.curiosity ?? false),
      greed: new FormControl(template.behavior?.greed ?? false),
      descriptive_words: new FormControl(template.descriptive_words ?? ' ', {
        updateOn: 'blur'
      }),
      final_deception_score: new FormControl({
        value: this.calcDeceptionScore(template),
        disabled: true
      })
    });
  }
  /**
   * Sets the template preview for display
   * @param template
   */
  setTemplatePreview(template: Template) {
    this.templateName = template.name
      ? template.name
      : 'Template name not found';
    this.templateSubject = template.subject
      ? template.subject
      : 'Template subject not found';
    this.templateHTML = template.html
      ? template.html
      : '<h1>Preivew not Found</h1>';
  }

  /**
   * Returns a Template model initialized from a provided formgroup
   * @param decep_form
   */
  getTemplateModelFromForm(decep_form: FormGroup) {
    //Multiple templates used to easily strip the data from the form, and transfer to a template format the API expects
    let formTemplate = new Template(decep_form.value);
    let saveTemplate = new Template();
    saveTemplate.appearance = {
      grammar: formTemplate.grammar,
      link_domain: formTemplate.link_domain,
      logo_graphics: formTemplate.logo_graphics
    };
    saveTemplate.sender = {
      authoritative: formTemplate.authoritative,
      external: formTemplate.external,
      internal: formTemplate.internal
    };
    saveTemplate.relevancy = {
      organization: formTemplate.organization,
      public_news: formTemplate.public_news
    };
    saveTemplate.behavior = {
      curiosity: formTemplate.curiosity,
      duty_obligation: formTemplate.duty_obligation,
      fear: formTemplate.fear,
      greed: formTemplate.greed
    };
    saveTemplate.descriptive_words = formTemplate.descriptive_words;
    saveTemplate.template_uuid = this.templateId;
    saveTemplate.deception_score = this.calcDeceptionScore(formTemplate);
    return saveTemplate;
  }

  /**
   * Called to save and redirect to template manager page, and select the current template
   */
  saveAndReturn() {
    this.saveDeceptionCalculation();
    this.router.navigate(['/templatemanager', this.templateId]);
  }
}
