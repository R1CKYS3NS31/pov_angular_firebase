import { Component, inject } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password !== confirmPassword && confirmPassword !== '') {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // If they match, clear the error if it was previously set by this validator
    if (control.get('confirmPassword')?.hasError('passwordMismatch')) {
      control.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);

  signupForm: FormGroup = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  async onSubmit() {
    if (this.signupForm.invalid) return;

    const { firstName, lastName, email, password } = this.signupForm.value;
    const userData = {
      name: { first: firstName, last: lastName },
      email,
      password,
      description: 'I am a new user ready to explore different perspectives!',
    };

    await this.authService.handleSignUp(userData).then(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/']);
      }
    });
  }

  async onGoogleSignIn() {
    await this.authService.handleGoogleSignIn().then(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/']);
      }
    });
  }
}
