import {Component, OnInit, HostListener, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgIf, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  menuOpen = false;
  dropdownOpen = false;
  username?: string;
  isLoggedIn$: Observable<boolean>;

  constructor(
    protected authService: AuthService,
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.username = user?.username;
    });

    // Optionally restore login on app load:
    this.authService.checkAuth().subscribe({
      next: () => {},
      error: () => {
        // no-op if not logged in
      },
    });
  }

  //for the navbar menu option on mobile

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    console.log('Toggled menuOpen:', this.menuOpen);
  }

  //Profile dropdown menu logic
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  //closes dropdown menu when clicking outside of it
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.custom-dropdown-container');
    const clickedAvatar = target.closest('.custom-dropdown-toggle');
    if (!clickedInsideDropdown && !clickedAvatar) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.log(err),
    });
  }
}
