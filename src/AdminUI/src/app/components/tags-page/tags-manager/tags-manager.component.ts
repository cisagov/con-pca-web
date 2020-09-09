import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MyErrorStateMatcher } from '../../../helper/ErrorStateMatcher';
import { Tags } from 'src/app/models/tags.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TagService } from 'src/app/services/tag.service';
import { LayoutMainService } from 'src/app/services/layout-main.service';
import { AlertComponent } from '../../dialogs/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tags-manager',
  templateUrl: './tags-manager.component.html',
  styleUrls: ['./tags-manager.component.scss'],
})
export class TagsManagerComponent implements OnInit {
  tagsId: string;
  tags: Tags;
  tagFormGroup: FormGroup;
  subscriptions = Array<Subscription>();

  constructor(
    public tagsSvc: TagService,
    private route: ActivatedRoute,
    public router: Router,
    public layoutSvc: LayoutMainService,
    public dialog: MatDialog
  ) {
    // Set title
    route.params.subscribe((params) => {
      this.tagsId = params['tagsId'];
      if (this.tagsId != undefined) {
        layoutSvc.setTitle('Edit Tag');
      } else {
        //Use preset empty form
        layoutSvc.setTitle('New Tag');
      }
    })

    this.setTagsForm(new Tags());
  }

  /**
   * convenience getter for easy access to form fields
   */
  get f() {
    return this.tagFormGroup.controls;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.tagsId = params['tagsId'];
      if (this.tagsId != undefined) {
        this.tagsSvc
          .getTag(this.tagsId)
          .subscribe((tagsData: Tags) => {
            this.tagsId = tagsData.tag_definition_uuid;
            console.log(tagsData);
            this.setTagsForm(tagsData);
          })
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }


  onCancelClick() {
        this.router.navigate(['/tags']);
  }

  //Create a formgroup using a Tag as initial data
  setTagsForm(tag: Tags) {

    this.tagFormGroup = new FormGroup({
      tagUUID: new FormControl(tag.tag_definition_uuid),
      tagName: new FormControl(tag.tag, [
        Validators.required,
      ]),
      tagDescription: new FormControl(
        tag.description
      ),
      tagDataSource: new FormControl(tag.data_source),
      tagType: new FormControl(tag.tag_type),
    });
  }

  /**
   * Returns a Tag model initialized from a provided formgroup
   * @param decep_form
   */
  getTagsModelFromForm(rec_form: FormGroup) {
    let saveTag = new Tags();
    saveTag.tag = this.f.tagName.value;
    saveTag.description = this.f.tagDescription.value;
    saveTag.data_source = this.f.tagDataSource.value;
    saveTag.tag_type = this.f.tagType.value;

    saveTag.tag_definition_uuid = this.tagsId;
    return saveTag;
  }

  saveTags() {
    let tag_to_save = this.getTagsModelFromForm(
      this.tagFormGroup
    );
    if (this.tagsId) {
      this.tagsSvc.updateTag(tag_to_save).subscribe(
        (data: any) => {
          this.router.navigate(['/tags']);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this.tagsSvc.saveNewTag(tag_to_save).subscribe(
        (data: any) => {
          this.router.navigate(['/tags']);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
}
