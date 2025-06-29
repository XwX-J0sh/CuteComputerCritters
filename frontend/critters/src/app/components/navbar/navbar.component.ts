import { Component,OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgIf, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {

  username?: string;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private authService: AuthService,
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

  //section for profile drop down menu

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative.z-40') && !target.closest('.absolute.right-0')) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // You can redirect or refresh after logout
        window.location.reload();
      },
      error: (err) => console.log(err),
    });
  }
}
