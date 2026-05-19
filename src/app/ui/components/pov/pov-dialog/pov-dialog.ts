import { Component, Inject, inject, signal } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PovForm } from '../pov-form/pov-form';
import { AuthService } from '@core/services/auth.service';
import { PovService } from '@core/services/pov.service';
import { DraftService } from '@core/services/draft.service';
import { NotificationService } from '@core/services/notification.service';
import { PoV } from '@core/models/pov.model';

@Component({
  selector: 'app-pov-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, PovForm],
  templateUrl: './pov-dialog.html',
  styleUrls: ['./pov-dialog.scss'],
})
export class PovDialog {
  private dialogRef = inject(MatDialogRef<PovDialog>);

  // Data passed via dialog.open()
  povToEdit: PoV | null = null;
  isLocal = false;

  authService = inject(AuthService);
  povService = inject(PovService);
  draftService = inject(DraftService);
  notificationService = inject(NotificationService);

  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { povToEdit: PoV | null; isLocal: boolean }) {
    if (data) {
      this.povToEdit = data.povToEdit;
      this.isLocal = data.isLocal;
    }
  }

  async handleSubmit(event: { formData: any; triggerServerPost: boolean }) {
    const { formData, triggerServerPost } = event;
    const isUpdate = !!this.povToEdit?.id;
    const user = this.authService.user();

    // Server posts require authentication
    if (triggerServerPost && !user) {
      this.notificationService.notify('Cannot post: User not authenticated', 'error');
      return;
    }

    const authorId = user?.uid || user?.id || 'local-guest';

    this.loading = true;

    try {
      const povData: any = {
        ...this.povToEdit,
        ...formData,
      };

      if (triggerServerPost) {
        povData.author = authorId;
        povData.isLocal = false;

        if (isUpdate && !this.isLocal) {
          await this.povService.updatePov(this.povToEdit!.id, povData);
        } else {
          await this.povService.createPov(povData);
        }

        // If it was local and now posted to server, delete local
        if (isUpdate && this.isLocal) {
          this.draftService.deleteDraft(this.povToEdit!.id);
        }
        this.notificationService.notify('PoV posted successfully!', 'success');
      } else {
        // Save as local draft
        povData.author = {
          id: authorId,
          displayName: user?.displayName || user?.name || 'Local Guest',
          displayPicture: user?.displayPicture || '',
        };
        povData.isLocal = true;

        this.draftService.saveDraft(povData);
        this.notificationService.notify('Draft saved locally', 'success');
      }
      this.onClose();
    } catch (error) {
      console.error('PoV submission failed:', error);
      this.notificationService.notify('Action failed. Please try again.', 'error');
    } finally {
      this.loading = false;
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
