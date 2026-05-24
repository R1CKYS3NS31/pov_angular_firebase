import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  output,
} from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PovCard } from '../pov-card/pov-card';
import { PoV } from '@core/models/pov.model';
import { QuerySnapshotCustom } from '@core/models/snapshot.model';

@Component({
  selector: 'app-pov-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PovCard, MatProgressSpinnerModule],
  templateUrl: './pov-list.html',
  styleUrls: ['./pov-list.scss'],
})
export class PovList implements AfterViewInit, OnDestroy {
  povs = input<QuerySnapshotCustom<PoV> | null>(null);
  loading = input(false);
  hasMore = input(false);
  loadingMore = input(false);
  emptyMessage = input('No POVs found');

  edit = output<PoV>();
  delete = output<string>();
  loadMore = output<void>();

  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;

  private observer: IntersectionObserver | null = null;

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined' || typeof window === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          this.hasMore() &&
          !this.loading() &&
          !this.loadingMore()
        ) {
          this.loadMore.emit();
        }
      },
      { threshold: 0.1 },
    );

    if (this.loadMoreTrigger?.nativeElement) {
      this.observer.observe(this.loadMoreTrigger.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  skeletonArray = [1, 2, 3];
}
