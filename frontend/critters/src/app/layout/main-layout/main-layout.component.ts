import { Component } from '@angular/core';
import {NavbarComponent} from '../../components/navbar/navbar.component';
import {FooterComponent} from '../../components/footer/footer.component';
import {RouterOutlet} from '@angular/router';
import {PageWrapperComponent} from '../../components/page-wrapper/page-wrapper.component';
import {ThemeService} from '../../theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet,
    PageWrapperComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.isDarkMode()
  }

}
