// Angular Imports
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NgForm,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Local Service Imports
import { LoginService } from 'src/app/services/login.service';

// Models
import { ResetPassword } from 'src/app/models/reset-password.model';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

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
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  model = new ResetPassword();
  faBan = faBan;
  faCheck = faCheck;

  matcherusername = new MyErrorStateMatcher();
  matchercode = new MyErrorStateMatcher();
  matcherpassword = new MyErrorStateMatcher();
  matcherconfirmpassword = new MyErrorStateMatcher();
  minNumberOfChar = 8;
  username = null;

  userFormGroup = new FormGroup({
    code: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  error: string;

  constructor(
    public activeRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params) => {
      this.username = params['username'];
    });
  }
}
