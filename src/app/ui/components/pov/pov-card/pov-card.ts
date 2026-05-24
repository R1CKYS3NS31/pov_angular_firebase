import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PoV } from '@core/models/pov.model';
import { User } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { SharePovModal } from '../share-pov-modal/share-pov-modal';
import { DialogCommentPov } from '../dialog-comment-pov/dialog-comment-pov';
import { AccountService } from '@core/services/account.service';

@Component({
  selector: 'app-pov-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    SharePovModal,
  ],
  templateUrl: './pov-card.html',
  styleUrls: ['./pov-card.scss'],
})
export class PovCard {
  pov = input.required<PoV>();
  edit = output<PoV>();
  delete = output<string>();

  authService = inject(AuthService);
  accountService = inject(AccountService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  dialog = inject(MatDialog);

  shareModalOpen = false;
  speedDialOpen = false;

  toggleSpeedDial(event: Event) {
    event.stopPropagation();
    this.speedDialOpen = !this.speedDialOpen;
  }

  get authorId() {
    const current = this.pov();
    if (!current?.author) return null;
    return typeof current.author === 'object' ? (current.author as User).id : current.author;
  }

  get isAuthor() {
    return this.authService.isAuthenticated() && this.authService.account()?.id === this.authorId;
  }

  get authorName() {
    const current = this.pov();
    if (!current?.author) return 'Unknown Author';
    return typeof current.author === 'object'
      ? (current.author as User).displayName || 'Unknown'
      : 'Unknown Author';
  }

  get authorPicture() {
    const current = this.pov();
    if (!current?.author) return '';
    return typeof current.author === 'object' ? (current.author as User).displayPicture : '';
  }

  get hasLiked() {
    return this.pov()?.likes?.includes(this.authService.account()?.id as string);
  }

  get pointsArray(): Array<{ id: string; text: string }> {
    const current = this.pov();
    if (Array.isArray(current?.points)) {
      return current.points
        .map((point, index) => ({ id: `${index}-${point.slice(0, 30)}`, text: point.trim() }))
        .filter((point) => point.text);
    }

    if (typeof current?.points === 'string') {
      return current.points
        .split('\n')
        .map((point, index) => ({ id: `${index}-${point.slice(0, 30)}`, text: point.trim() }))
        .filter((point) => point.text);
    }

    return [];
  }

  formatDate(dateValue: any) {
    if (!dateValue) return 'Date unknown';
    try {
      if (dateValue.toDate) return dateValue.toDate().toLocaleString();
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  }

  onAuthorClick(event: Event) {
    event.stopPropagation();
    if (!this.authorId || this.authorId === this.authService.account()?.id) {
      this.router.navigate(['/account']);
    } else {
      this.router.navigate(['/profile', this.authorId]);
    }
  }

  async toggleLike() {
    const current = this.pov();
    if (!this.authService.isAuthenticated() || !current) return;
    if (this.hasLiked) {
      await this.accountService.unlikePov(current.id);
    } else {
      await this.accountService.likePov(current.id);
    }
  }

  async togglePublish() {
    const current = this.pov();
    if (!current) return;
    await this.accountService.updatePov(current.id, { published: !current.published });
  }

  onEdit() {
    this.edit.emit(this.pov());
  }

  onDelete() {
    const current = this.pov();
    if (!current) return;
    if (confirm(`Are you sure you want to delete "${current.title}"?`)) {
      this.delete.emit(current.id);
    }
  }

  onShare() {
    this.shareModalOpen = true;
  }

  onCopy() {
    const current = this.pov();
    if (!current) return;
    const text = `${current.title}\n\n${current.description}\n\nShared via PoV`;
    navigator.clipboard.writeText(text);
    this.notificationService.notify('PoV copied to clipboard!', 'success');
  }

  openComment() {
    this.dialog.open(DialogCommentPov, {
      data: { pov: this.pov() },
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false,
    });
  }
}

