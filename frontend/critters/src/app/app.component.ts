import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from './services/auth.service';
import {map, Observable} from 'rxjs';
import {AsyncPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'critters';

  private roles: string[] = [];
  username?: string;
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router)  {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.username = user?.username;
    });

    // Optionally restore login on app load:
    this.authService.checkAuth().subscribe({
      next: () => {},
      error: () => {
        // no-op if not logged in
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // You can redirect or refresh after logout
        window.location.reload();
      },
      error: err => console.log(err)
    });
  }
}
