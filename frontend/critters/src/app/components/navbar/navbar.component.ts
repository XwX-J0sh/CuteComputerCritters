import { Component,OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgIf, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {

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
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    console.log('Toggled menuOpen:', this.menuOpen);
  }

  //section for profile drop down menu


  //closes dropdown for profile when clicking outside the menu
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.custom-dropdown-container');
    const clickedAvatar = target.closest('.custom-dropdown-toggle');
    if (target.closest('#game-container')) {
      return;
    }
    console.log("Ya-ha! Ya-Hoo!")
    if (!clickedInsideDropdown && !clickedAvatar) {
      this.dropdownOpen = false;
    }
  }

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        //clear client-side stored stuff
        //localStorage.removeItem('authToken');
        //sessionStorage.clear();

        // You can redirect or refresh after logout
        //this.router.navigate(['/login']);
        window.location.reload();
      },
      error: (err) => console.log(err),
    });
  }
}
