import { ChangeDetectionStrategy, Component, input, OnDestroy, output } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatInputModule, MatSelectModule, MatFormFieldModule, MatIconModule],
  templateUrl: './home-filters.html',
  styleUrls: ['./home-filters.scss'],
})
export class HomeFilters implements OnDestroy {
  sortBy = input<string>('createdAt');
  search = output<string>();
  sortChange = output<string>();

  searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
    this.search.emit(query);
  });

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
