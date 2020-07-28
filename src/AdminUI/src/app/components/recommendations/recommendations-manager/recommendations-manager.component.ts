import {
    Component,
    Input,
    OnInit,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MyErrorStateMatcher } from '../../../helper/ErrorStateMatcher';
import { Recommendations } from 'src/app/models/recommendations.model';
import { Router, ActivatedRoute } from '@angular/router';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { AlertComponent } from '../../dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-recommendations-manager',
    templateUrl: './recommendations-manager.component.html',
    styleUrls: ['./recommendations-manager.component.scss'],
})

export class RecommendationsManagerComponent implements OnInit {

    recommendationsId: string;
    recommendations: Recommendations;
    recommendationsFormGroup: FormGroup;
    subscriptions = Array<Subscription>();

    constructor(
        public recommendationsSvc: RecommendationsService,
        private route: ActivatedRoute,
        public router: Router,
        public layoutSvc: LayoutMainService,
        public dialog: MatDialog
    ) {
        layoutSvc.setTitle('Edit Recommendations');
        this.setRecommendationsForm(new Recommendations())
    }

    /**
     * convenience getter for easy access to form fields
     */
    get f() {
        return this.recommendationsFormGroup.controls;
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.recommendationsId = params["recommendationsId"];
            if (this.recommendationsId != undefined) {
                this.subscriptions.push(
                    this.recommendationsSvc.getRecommendation(this.recommendationsId).subscribe(
                        (recommendationsData: Recommendations) => {
                            this.recommendationsId = recommendationsData.recommendations_uuid;
                            this.setRecommendationsForm(recommendationsData)
                        }
                    )
                )
            }
        })
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    //Create a formgroup using a Template as initial data
    setRecommendationsForm(recommendation: Recommendations) {

        if (!recommendation.appearance) {
            recommendation.appearance = <any>{};
        }
        if (!recommendation.sender) {
            recommendation.sender = <any>{};
        }
        if (!recommendation.relevancy) {
            recommendation.relevancy = <any>{};
        }
        if (!recommendation.behavior) {
            recommendation.behavior = <any>{};
        }

        this.recommendationsFormGroup = new FormGroup({
            recommendationsUUID: new FormControl(recommendation.recommendations_uuid),
            recommendationsName: new FormControl(recommendation.name, [Validators.required]),
            recommendationsDeceptionLevel: new FormControl(recommendation.deception_level),
            recommendationsDescription: new FormControl(recommendation.description),
            authoritative: new FormControl(recommendation.sender?.authoritative ?? 0),
            external: new FormControl(recommendation.sender?.external ?? 0),
            internal: new FormControl(recommendation.sender?.internal ?? 0),
            grammar: new FormControl(recommendation.appearance?.grammar ?? 0),
            link_domain: new FormControl(recommendation.appearance?.link_domain ?? 0),
            logo_graphics: new FormControl(recommendation.appearance?.logo_graphics ?? 0),
            organization: new FormControl(recommendation.relevancy?.organization ?? 0),
            public_news: new FormControl(recommendation.relevancy?.public_news ?? 0),
            fear: new FormControl(recommendation.behavior?.fear ?? false),
            duty_obligation: new FormControl(
                recommendation.behavior?.duty_obligation ?? false
            ),
            curiosity: new FormControl(recommendation.behavior?.curiosity ?? false),
            greed: new FormControl(recommendation.behavior?.greed ?? false),
        });
    }

    /**
     * Returns a Recommendation model initialized from a provided formgroup
     * @param decep_form
     */
    getRecommendationsModelFromForm(rec_form: FormGroup) {
        let saveRecommendations = new Recommendations();
        saveRecommendations.name = this.f.recommendationsName.value;
        saveRecommendations.description = this.f.recommendationsDescription.value;
        saveRecommendations.appearance = {
            grammar: this.f.grammar.value,
            link_domain: this.f.link_domain.value,
            logo_graphics: this.f.logo_graphics.value
        };
        saveRecommendations.sender = {
            authoritative: this.f.authoritative.value,
            external: this.f.external.value,
            internal: this.f.internal.value
        };
        saveRecommendations.relevancy = {
            organization: this.f.organization.value,
            public_news: this.f.public_news.value
        };
        saveRecommendations.behavior = {
            curiosity: this.f.curiosity.value,
            duty_obligation: this.f.duty_obligation.value,
            fear: this.f.fear.value,
            greed: this.f.greed.value
        };
        saveRecommendations.recommendations_uuid = this.recommendationsId;
        return saveRecommendations;
    }

    saveRecommendations() {
        // if (this.recommendationsFormGroup.valid) {
        let template_to_save = this.getRecommendationsModelFromForm(
            this.recommendationsFormGroup
        );
        if (this.recommendationsId) {
            this.recommendationsSvc.updateRecommendation(template_to_save).subscribe(
                (data: any) => {
                    this.router.navigate(['/recommendations']);
                },
                (error) => {
                    console.log(error)
                }
            );
        } else {
            this.recommendationsSvc.saveNewRecommendation(template_to_save).subscribe(
                (data: any) => {
                    this.router.navigate(['/recommendations']);
                },
                (error) => {
                    console.log(error)
                }
            );
        }
        // } else {
        //     this.dialog.open(AlertComponent, {
        //         data: {
        //             title: 'Error',
        //             messageText: 'Errors on deception form' + this.recommendationsFormGroup.errors
        //         }
        //     });
        // }
    }

}
