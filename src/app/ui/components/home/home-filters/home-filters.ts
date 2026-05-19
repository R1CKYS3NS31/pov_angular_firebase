import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatIconModule],
  templateUrl: './home-filters.html',
  styleUrls: ['./home-filters.scss'],
})
export class HomeFilters implements OnDestroy {
  @Input() sortBy: string = 'createdAt';

  @Output() search = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();

  searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
    this.search.emit(query);
  });

  constructor() {}

  onSearchChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  onSortSelect(value: string) {
    this.sortChange.emit(value);
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }
}

