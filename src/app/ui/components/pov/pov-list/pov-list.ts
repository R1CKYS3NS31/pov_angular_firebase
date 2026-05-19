import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PovCard } from '../pov-card/pov-card';
import { PoV } from '@core/models/pov.model';

@Component({
  selector: 'app-pov-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PovCard, MatProgressSpinnerModule],
  templateUrl: './pov-list.html',
  styleUrls: ['./pov-list.scss'],
})
export class PovList implements AfterViewInit, OnDestroy {
  @Input() povs: { content: PoV[]; empty: boolean } | null | undefined;
  @Input() loading: boolean = false;
  @Input() hasMore: boolean = false;
  @Input() loadingMore: boolean = false;
  @Input() emptyMessage: string = 'No POVs found';

  @Output() edit = new EventEmitter<PoV>();
  @Output() delete = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;

  private observer: IntersectionObserver | null = null;

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore && !this.loading && !this.loadingMore) {
          this.loadMore.emit();
        }
      },
      { threshold: 0.1 },
    );

    if (this.loadMoreTrigger) {
      this.observer.observe(this.loadMoreTrigger.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Create an array for the skeleton loaders
  skeletonArray = [1, 2, 3];
}

