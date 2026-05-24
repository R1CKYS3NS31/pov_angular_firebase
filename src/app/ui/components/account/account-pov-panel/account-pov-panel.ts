import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { PoV } from '@core/models/pov.model';
import { PovList } from '../../pov/pov-list/pov-list';
import { QuerySnapshotCustom } from '@core/models/snapshot.model';

@Component({
  selector: 'app-account-pov-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PovList],
  templateUrl: './account-pov-panel.html',
  styleUrls: ['./account-pov-panel.scss'],
})
export class AccountPovPanel {
  @Input() items: QuerySnapshotCustom<PoV> | null = null;
  @Input() loading = false;
  @Input() emptyTitle = '';
  @Input() emptyDescription = '';
  @Input() emptyMessage = '';

  @Output() edit = new EventEmitter<PoV>();
  @Output() delete = new EventEmitter<string>();
}
