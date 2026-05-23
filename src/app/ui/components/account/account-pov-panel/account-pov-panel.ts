import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
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
  items = input<QuerySnapshotCustom<PoV> | null>(null);
  loading = input<boolean>(false);
  emptyTitle = input<string>('');
  emptyDescription = input<string>('');
  emptyMessage = input<string>('');

  @Output() edit = new EventEmitter<PoV>();
  @Output() delete = new EventEmitter<string>();
}
