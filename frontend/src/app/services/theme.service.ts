import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  applyTheme(theme: 'light' | 'dark' | 'system') {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.documentElement.classList.remove('dark');

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }

  getStoredTheme(): 'light' | 'dark' | 'system' {
    if (!isPlatformBrowser(this.platformId)) {
      return 'system';
    }
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'system';
  }
}

