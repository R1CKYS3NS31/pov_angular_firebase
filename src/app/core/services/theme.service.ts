import { Injectable, signal, effect, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'pov-theme-mode';
  private readonly platformId = inject(PLATFORM_ID);
  private themeSignal = signal<ThemeMode>('light');

  readonly themeMode = computed(() => this.themeSignal());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.themeSignal.set(this.getInitialTheme());

      effect(() => {
        const mode = this.themeSignal();
        localStorage.setItem(this.STORAGE_KEY, mode);
        this.applyThemeToDocument(mode);
      });
    }
  }

  private getInitialTheme(): ThemeMode {
    const savedThemeMode = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    if (savedThemeMode && (savedThemeMode === 'light' || savedThemeMode === 'dark')) {
      return savedThemeMode;
    }
    return 'light';
  }  
      
  toggleTheme() {
    this.themeSignal.update((mode) => (mode === 'light' ? 'dark' : 'light'));
  }

  private applyThemeToDocument(mode: ThemeMode) {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }

}
