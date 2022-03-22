import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { RecommendationModel } from 'src/app/models/recommendations.model';
import { RecommendationsService } from 'src/app/services/recommendations.service';
import { MatSort } from '@angular/material/sort';
import { AlertComponent } from '../dialogs/alert/alert.component';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: 'app-recommendation-detail',
  templateUrl: './recommendation-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationDetailComponent implements OnInit {
  /**
   * NEW or EDIT
   */
  mode = 'new';
  testEmail = '';

  recommendForm: FormGroup;
  recommendation: RecommendationModel;
  id: string;

  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['header', 'value', 'actions'];

  submitted = false;

  /**
   * Constructor.
   */
  constructor(
    public alertSvc: AlertsService,
    private recommendationSvc: RecommendationsService,
    private changeDetector: ChangeDetectorRef,
    public dialogRef: MatDialogRef<RecommendationDetailComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.id = data.recommendation_id;
  }

  /**
   * convenience getter for easy access to form fields
   */
  get f() {
    return this.recommendForm.controls;
  }

  /**
   *
   */
  ngOnInit(): void {
    this.recommendForm = new FormGroup({
      title: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      description: new FormControl(''),
    });

    if (!!this.id) {
      this.mode = 'edit';
      this.recommendationSvc.getRecommendation(this.id).subscribe(
        (data: any) => {
          this.recommendation = data as RecommendationModel;
          this.f.title.setValue(this.recommendation.title);
          this.f.type.setValue(this.recommendation.type);
          this.f.description.setValue(this.recommendation.description);
        },
        (err) => {
          console.log('recommendation error:');
          console.log(err);
        }
      );
    }
  }

  /**
   *
   */
  onSaveClick() {
    let rm: RecommendationModel;
    this.submitted = true;

    if (this.recommendForm.valid) {
      rm = this.save();
      if (rm._id) {
        this.recommendationSvc
          .updateRecommendation(rm._id, rm)
          .subscribe(() => {
            this.dialogRef.close();
          });
        this.dialogRef.close(true);
      } else {
        this.recommendationSvc.saveRecommendation(rm).subscribe(
          (success) => {
            this.dialogRef.close(true);
          },
          (error) => {
            this.alertSvc.alert(`An error occurred: ${error.error.error}`);
          }
        );
      }
    } else {
      //non valid form, collect nonvalid fields and display to user
      const invalid = [];
      const controls = this.recommendForm.controls;
      for (var title in controls) {
        if (controls[title].invalid) {
          invalid.push(this.capitalizeFirstLetter(title));
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

  capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  save() {
    if (this.recommendForm.invalid) {
      console.log(this.f.from.errors);
      return;
    }

    const rm = new RecommendationModel();
    rm.title = this.f.title.value;
    rm.type = this.f.type.value;
    rm.description = this.f.description.value;

    if (this.id) {
      rm._id = this.id;
    }
    return rm;
  }

  /**
   *
   */
  onCancelClick() {
    this.dialogRef.close(false);
  }
}
