import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

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
export class PovForm implements OnInit {
  @Input() pov: Partial<PoV> | null = null;
  @Input() loading = false;
  @Input() title = '';

  @Output() onSubmit = new EventEmitter<{ formData: any; triggerServerPost: boolean }>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  povForm!: FormGroup;

  MAX_TITLE = 120;
  MAX_DESC = 3000;

  ngOnInit() {
    this.povForm = this.fb.group({
      title: [this.pov?.title || '', [Validators.required, Validators.maxLength(this.MAX_TITLE)]],
      description: [
        this.pov?.description || '',
        [Validators.required, Validators.maxLength(this.MAX_DESC)],
      ],
      points: [
        Array.isArray(this.pov?.points)
          ? this.pov?.points.join('\n')
          : (this.pov?.points as string) || '',
      ],
      isLocal: [this.pov?.isLocal || false],
    });

    if (!this.title) {
      this.title = this.pov ? 'Edit Perspective' : 'Share a Point of View';
    }
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

