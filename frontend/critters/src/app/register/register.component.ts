import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgClass
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: any = {
    username: null,
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authservice: AuthService) {}

  /**
   * onSubmit uses authservice to send a POST request to register a User,
   * which returns an Observable, that it subscribes to
   * -> if it returns a response its marked successful through the variable isSuccessful
   * -> if it returns an error it's marked unsuccessful through the variable isSuccessful and returns an error message
   */

  onSubmit(): void {
    const { username, email, password } = this.form;

    this.authservice.register(username, email, password).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    })
  }
}
