import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './services/theme.service';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  constructor(private themeService: ThemeService, private authService: AuthService) {}

  ngOnInit() {
    const storedTheme = this.themeService.getStoredTheme();
    this.themeService.applyTheme(storedTheme);
    this.authService.checkAuth().subscribe();
  }
}
