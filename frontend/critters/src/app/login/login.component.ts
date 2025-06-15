import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {FormsModule} from '@angular/forms';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgClass,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  form: any = {
    username: null,
    password: null
  };

  isLoginFailed = false;
  errorMessage = "";

  isLoggedIn$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    // Subscribe once to redirect if already logged in
    this.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['/profile']);
      }
    });
  }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.isLoginFailed = false;
        this.router.navigate(['/profile']);
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }
}
