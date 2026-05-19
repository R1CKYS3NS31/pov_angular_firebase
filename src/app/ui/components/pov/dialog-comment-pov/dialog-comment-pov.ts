import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PovService } from '@core/services/pov.service';
import { AuthService } from '@core/services/auth.service';
import { PoV } from '@core/models/pov.model';
import { AccountService } from '@core/services/account.service';

@Component({
  selector: 'app-dialog-comment-pov',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './dialog-comment-pov.html',
  styleUrls: ['./dialog-comment-pov.scss'],
})
export class DialogCommentPov {
  private dialogRef = inject(MatDialogRef<DialogCommentPov>);
  public data = inject<{ pov: PoV }>(MAT_DIALOG_DATA);
  private accountService = inject(AccountService);
   authService = inject(AuthService);

  newComment = signal<string>('');
  pov = signal<PoV>(this.data.pov);

  handleClose() {
    this.dialogRef.close();
  }

  async handleComment(event: Event) {
    event.preventDefault();
    const commentText = this.newComment().trim();
    if (!commentText) return;

    this.accountService.commentOnPov(this.pov().id, commentText);
  }

  async handleUncomment(commentId: string | number) {
    await this.accountService.uncommentPov(this.pov().id, commentId.toString());
  }
}
