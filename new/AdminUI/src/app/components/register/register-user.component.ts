// Angular Imports
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import {
  FormControl,
  NgForm,
  FormGroupDirective,
  Validators,
  FormGroup,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { RegisterUserModel } from 'src/app/models/registered-user.model';

// Third party imports
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

// Local Service Imports
import { UserService } from 'src/app/services/user.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent implements OnInit {
  model = new RegisterUserModel();
  faBan = faBan;
  faCheck = faCheck;

  minNumberOfChar = 8;
  matcherusername = new MyErrorStateMatcher();
  matcherpassword = new MyErrorStateMatcher();
  matcherconfirmpassword = new MyErrorStateMatcher();
  matchemail = new MyErrorStateMatcher();

  userFormGroup = new FormGroup({
    firstname: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-za-z]*$'),
    ]),
    lastname: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-za-z]*$'),
    ]),
    password: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  error: string;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public userSvc: UserService
  ) {}

  ngOnInit() {}

  submit() {
    if (this.userFormGroup.valid) {
      this.model.username = `${this.model.firstname.toLowerCase()}.${this.model.lastname.toLowerCase()}`;
      this.userSvc.postCreateUser(this.model).subscribe(
        (data) => {
          this.snackBar.open(
            `User created successfully (${this.model.username}), your account is awaiting admin approval`,
            'close',
            {
              duration: 0,
              verticalPosition: 'top',
            }
          );
          this.router.navigateByUrl('/login');
        },
        (error: HttpErrorResponse) => {
          this.error = error.error;
        }
      );
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  checkPasswordRules() {
    const pass: boolean =
      this.checkPasswordLength() &&
      this.checkPasswordUpperChar() &&
      this.checkPasswordLowerChar() &&
      this.checkPasswordSpecialChar() &&
      this.checkPasswordNumber() &&
      this.checkPasswordEquality() &&
      this.userFormGroup.controls.username.value;
    return pass;
  }

  checkPasswordEquality() {
    return (
      this.userFormGroup.controls.password.value ===
      this.userFormGroup.controls.confirmPassword.value
    );
  }

  checkPasswordLength() {
    if (this.userFormGroup.controls.password.value) {
      return (
        this.userFormGroup.controls.password.value.length >=
        this.minNumberOfChar
      );
    }
    return false;
  }

  checkPasswordUpperChar() {
    if (this.userFormGroup.controls.password.value) {
      return /[A-Z]/.test(this.userFormGroup.controls.password.value);
    }
    return false;
  }

  checkPasswordLowerChar() {
    if (this.userFormGroup.controls.password.value) {
      return /[a-z]/.test(this.userFormGroup.controls.password.value);
    }
    return false;
  }

  checkPasswordSpecialChar() {
    if (this.userFormGroup.controls.password.value) {
      return /[~`@!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/.test(
        this.userFormGroup.controls.password.value
      );
    }
    return false;
  }

  checkPasswordNumber() {
    if (this.userFormGroup.controls.password.value) {
      return /[\d/]/.test(this.userFormGroup.controls.password.value);
    }
    return false;
  }
}
