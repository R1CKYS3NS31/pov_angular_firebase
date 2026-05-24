import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PoV } from '@core/models/pov.model';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-share-pov-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './share-pov-modal.html',
  styleUrls: ['./share-pov-modal.scss'],
})
export class SharePovModal {
  open = input(false);
  pov = input<PoV | null>(null);
  close = output<void>();

  private notificationService = inject(NotificationService);

  get shareUrl() {
    const current = this.pov();
    return typeof window === 'undefined' ? '' : `${window.location.origin}/pov/${current?.id}`;
  }

  shareActions = [
    {
      name: 'Copy Link',
      icon: 'content_copy',
      color: '#f6c143',
      action: () => this.copyToClipboard(),
    },
    {
      name: 'Facebook',
      icon: 'facebook',
      color: '#1877F2',
      action: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${this.shareUrl}`, '_blank'),
    },
    {
      name: 'Twitter',
      icon: 'share',
      color: '#1DA1F2',
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${this.shareUrl}&text=${this.pov()?.title}`,
          '_blank',
        ),
    },
    {
      name: 'WhatsApp',
      icon: 'chat',
      color: '#25D366',
      action: () =>
        window.open(
          `https://api.whatsapp.com/send?text=${this.pov()?.title} ${this.shareUrl}`,
          '_blank',
        ),
    },
  ];

  copyToClipboard() {
    navigator.clipboard.writeText(this.shareUrl);
    this.notificationService.notify('Link copied to clipboard!', 'success');
  }

  onClose() {
    this.close.emit();
  }
}

