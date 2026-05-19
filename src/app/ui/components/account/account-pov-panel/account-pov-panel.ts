import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { PoV } from '@core/models/pov.model';
import { PovList } from '../../pov/pov-list/pov-list';

@Component({
  selector: 'app-account-pov-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PovList],
  templateUrl: './account-pov-panel.html',
  styleUrls: ['./account-pov-panel.scss'],
})
export class AccountPovPanel {
  @Input() items: { content: PoV[]; empty: boolean } | null = null;
  @Input() loading: boolean = false;
  @Input() emptyTitle: string = '';
  @Input() emptyDescription: string = '';
  @Input() emptyMessage: string = '';

  @Output() edit = new EventEmitter<PoV>();
  @Output() delete = new EventEmitter<string>();
}

