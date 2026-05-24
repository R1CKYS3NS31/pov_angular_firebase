import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PoV } from '@core/models/pov.model';

@Component({
  selector: 'app-pov-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './pov-form.html',
  styleUrls: ['./pov-form.scss'],
})
export class PovForm {
  pov = input<Partial<PoV> | null>(null);
  loading = input(false);
  title = input('');

  onSubmit = output<{ formData: any; triggerServerPost: boolean }>();
  onCancel = output<void>();

  private fb = inject(FormBuilder);
  povForm!: FormGroup;

  MAX_TITLE = 120;
  MAX_DESC = 3000;

  readonly displayTitle = computed(() =>
    this.title() || (this.pov() ? 'Edit Perspective' : 'Share a Point of View'),
  );

  constructor() {
    this.povForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(this.MAX_TITLE)]],
      description: ['', [Validators.required, Validators.maxLength(this.MAX_DESC)]],
      points: [''],
      isLocal: [false],
    });

    effect(() => {
      const currentPov = this.pov();
      this.povForm.patchValue({
        title: currentPov?.title || '',
        description: currentPov?.description || '',
        points: Array.isArray(currentPov?.points)
          ? currentPov?.points.join('\n')
          : (currentPov?.points as string) || '',
        isLocal: currentPov?.isLocal || false,
      });
    });
  }

  submit(triggerServerPost: boolean) {
    if (this.povForm.valid) {
      this.onSubmit.emit({
        formData: this.povForm.value,
        triggerServerPost,
      });
    } else {
      this.povForm.markAllAsTouched();
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}

