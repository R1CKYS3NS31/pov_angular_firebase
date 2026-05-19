import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onWindowScroll()'
  },
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class Layout {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  showTopBtn = signal(false);

  onWindowScroll() {
    this.showTopBtn.set(window.scrollY > 400);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get displayName(): string {
    const account = this.authService.account();
    return account?.displayName || (account as any)?.name?.full || 'User';
  }

  get displayPicture(): string {
    const account = this.authService.account();
    return account?.displayPicture || (account as any)?.photoURL || '';
  }

  get firstLetter(): string {
    return this.displayName ? this.displayName[0].toUpperCase() : 'U';
  }

  logout() {
    this.authService.handleSignOut();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}

