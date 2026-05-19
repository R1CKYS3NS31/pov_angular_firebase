import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-account-settings-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './account-settings-dialog.html',
  styleUrls: ['./account-settings-dialog.scss'],
})
export class AccountSettingsDialog implements OnChanges {
  @Input() open: boolean = false;
  @Input() account: User | null = null;
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<User>>();
  @Output() deleteAccountEvent = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  settingsForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    description: [''],
    displayPicture: [''],
    email: [{ value: '', disabled: true }],
  });

  deleteConfirm = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['account'] || changes['open']) {
      if (this.account && this.open) {
        this.settingsForm.patchValue({
          firstName: this.account.name?.first || '',
          lastName: this.account.name?.last || '',
          description: this.account.description || '',
          displayPicture: this.account.displayPicture || '',
          email: this.account.email || '',
        });
        this.deleteConfirm = false;
      }
    }
  }

  onSave() {
    if (!this.account) return;
    const { firstName, lastName, description, displayPicture } = this.settingsForm.value;
    const updates: Partial<User> = {
      name: {
        first: firstName,
        last: lastName,
        full: `${firstName} ${lastName}`.trim(),
      },
      description,
      displayPicture,
    };
    this.save.emit(updates);
  }

  onDelete() {
    this.deleteAccountEvent.emit();
    this.deleteConfirm = false;
  }

  onClose() {
    this.close.emit();
  }

  get previewInitial(): string {
    return this.settingsForm.get('firstName')?.value?.[0] || '?';
  }
}
