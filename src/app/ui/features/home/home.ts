import { Component, inject, signal, effect, untracked, computed } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HomeHero } from '../../components/home/home-hero/home-hero';
import { HomeFilters } from '../../components/home/home-filters/home-filters';
import { PovList } from '../../components/pov/pov-list/pov-list';
import { PovDialog } from '../../components/pov/pov-dialog/pov-dialog';
import { PovService } from '@core/services/pov.service';
import { PoV } from '@core/models/pov.model';
import { AccountService } from '@core/services/account.service';

@Component({
  selector: 'app-home',
  imports: [HomeHero, HomeFilters, PovList, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  povService = inject(PovService);
  accountService = inject(AccountService);
  private dialog = inject(MatDialog);

  hasMore = signal<boolean>(false);
  lastVisible: any = null;

  private currentQuery = signal<string>('');
  private currentSortBy = signal<string>('createdAt');

  query = computed(() => this.currentQuery().toLocaleLowerCase());
  sort = computed(() => this.currentSortBy());

  constructor() {
    effect(() => {
      const query = this.query();
      const sort = this.sort();

      untracked(() => {
        this.lastVisible = null;
        if (query) {
          this.povService.searchPovs(query.toLocaleLowerCase(), 12, sort, 'desc', null);
        } else {
          this.loadPovs(true);
        }
      });
    });
  }

  async loadPovs(initial = false) {
    if (initial) {
      this.povService.getPovs();
    } else {
      this.povService.getPovs(this.lastVisible);
    }

    this.hasMore.set(!(this.povService.povs()?.last ?? true));
    this.lastVisible = this.povService.povs()?.lastVisible;
  }

  onSearch(querySearch: string) {
    this.currentQuery.set(querySearch);
    this.povService.searchPovs(this.query() ,12, 'title', 'desc', null);
  }

  onSortChange(sortBy: string) {
    this.currentSortBy.set(sortBy);
    if (this.query()) {
      this.povService.searchPovs(this.query(), 12, this.sort(), 'desc', null);
    }
    this.povService.getPovs(12, this.sort(), 'desc', null);
  }

  onLoadMore() {
    // TODO: implement infinite scroll better
    if (this.hasMore() && !this.povService.loading()) {
      this.povService.getPovs(this.lastVisible);
    }
  }

  onEditPov(pov: PoV) {
    this.dialog.open(PovDialog, {
      data: {
        povToEdit: pov,
        isLocal: false,
      },
      maxWidth: '600px',
      width: '95vw',
      panelClass: 'pov-dialog-panel',
    });
  }

  onDeletePov(povId: string) {
    this.accountService.deletePov(povId);
  }
}
