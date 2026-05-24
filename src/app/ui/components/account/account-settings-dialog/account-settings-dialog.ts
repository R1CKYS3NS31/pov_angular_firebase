import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-account-settings-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './account-settings-dialog.html',
  styleUrls: ['./account-settings-dialog.scss'],
})
export class AccountSettingsDialog {
  open = input<boolean>(false);
  account = input<User | null>(null);
  loading = input<boolean>(false);

  close = output<void>();
  save = output<Partial<User>>();
  deleteAccountEvent = output<void>();

  private fb = inject(FormBuilder);

  settingsForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    description: [''],
    displayPicture: [''],
    email: [{ value: '', disabled: true }],
  });

  deleteConfirm = false;

  constructor() {
    effect(() => {
      const currentAccount = this.account();
      if (currentAccount && this.open()) {
        this.settingsForm.patchValue({
          firstName: currentAccount.name?.first || '',
          lastName: currentAccount.name?.last || '',
          description: currentAccount.description || '',
          displayPicture: currentAccount.displayPicture || '',
          email: currentAccount.email || '',
        });
        this.deleteConfirm = false;
      }
    });
  }

  onSave() {
    const currentAccount = this.account();
    if (!currentAccount) return;
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
