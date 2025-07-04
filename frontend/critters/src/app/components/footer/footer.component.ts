import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import { ThemeService} from '../../theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit{
  isDarkMode = false;
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
}
