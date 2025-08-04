import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ThemeService} from '../../services/theme.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent{
  selectedTheme: 'light' | 'dark' | 'system' = 'system';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.selectedTheme = this.themeService.getStoredTheme();
  }

  onThemeChange(theme: string): void {
    this.selectedTheme = theme as 'light' | 'dark' | 'system';
    this.themeService.applyTheme(this.selectedTheme);
  }
}
