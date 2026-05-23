import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';

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
import { PovService } from '@core/services/pov.service';
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
  @Input() pov!: PoV;
  @Output() edit = new EventEmitter<PoV>();
  @Output() delete = new EventEmitter<string>();

  authService = inject(AuthService);
  povService = inject(PovService);
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
    if (!this.pov?.author) return null;
    return typeof this.pov.author === 'object' ? (this.pov.author as User).id : this.pov.author;
  }

  get isAuthor() {
    return this.authService.isAuthenticated() && this.authService.account()?.id === this.authorId;
  }

  get authorName() {
    if (!this.pov?.author) return 'Unknown Author';
    return typeof this.pov.author === 'object'
      ? (this.pov.author as User).displayName || 'Unknown'
      : 'Unknown Author';
  }

  get authorPicture() {
    if (!this.pov?.author) return '';
    return typeof this.pov.author === 'object' ? (this.pov.author as User).displayPicture : '';
  }

  // Todo: Implement proper like/unlike with backend integration and error handling
  get hasLiked() {
    return this.pov?.likes?.includes(this.authService.account()?.id as string);
  }

  get pointsArray(): Array<{ id: string; text: string }> {
    if (Array.isArray(this.pov?.points)) {
      return this.pov.points
        .map((point, index) => ({ id: `${index}-${point.slice(0, 30)}`, text: point.trim() }))
        .filter((point) => point.text);
    }

    if (typeof this.pov?.points === 'string') {
      return this.pov.points
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

  // Todo: Implement proper like/unlike with backend integration and error handling
  async toggleLike() {
    if (!this.authService.isAuthenticated()) return;
    if (this.hasLiked) {
      await this.accountService.unlikePov(this.pov.id);
    } else {
      await this.accountService.likePov(this.pov.id);
    }
  }

  async togglePublish() {
    await this.accountService.updatePov(this.pov.id, { published: !this.pov.published });
  }

  onEdit() {
    this.edit.emit(this.pov);
  }

  onDelete() {
    if (confirm(`Are you sure you want to delete "${this.pov.title}"?`)) {
      this.accountService.deletePov(this.pov.id);
      this.delete.emit(this.pov.id);
    }
  }

  onShare() {
    this.shareModalOpen = true;
  }

  onCopy() {
    const text = `${this.pov.title}\n\n${this.pov.description}\n\nShared via PoV`;
    navigator.clipboard.writeText(text);
    this.notificationService.notify('PoV copied to clipboard!', 'success');
  }

  openComment() {
    this.dialog.open(DialogCommentPov, {
      data: { pov: this.pov },
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false,
    });
  }
}

