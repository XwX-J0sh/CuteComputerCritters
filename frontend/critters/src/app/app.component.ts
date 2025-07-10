import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    const storedTheme = this.themeService.getStoredTheme();
    this.themeService.applyTheme(storedTheme);
  }
}
