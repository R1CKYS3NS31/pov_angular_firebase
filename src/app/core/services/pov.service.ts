import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationService } from './notification.service';
import { type PoV } from '../models/pov.model';
import { type QuerySnapshotCustom } from '../models/snapshot.model';
import {
  getPoVsPublishedFirebase,
  searchPoVsByTitleFirebase,
} from '../firebase/controller/pov-firebase';
import { OrderByDirection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class PovService {
  private notificationService = inject(NotificationService);

  private loadingSignal = signal<boolean>(false);
  private povsSignal = signal<QuerySnapshotCustom<PoV>>({
    size: 12,
    empty: true,
    content: [],
    lastVisible: null,
    last: true,
  });

  public readonly loading = computed(() => this.loadingSignal());
  public readonly povs = computed(() => this.povsSignal());

  constructor() {
    this.loadPublishedPoVs();
  }

  private loadPublishedPoVs() {
    this.getPovs();
  }

  async getPovs(
    size: number = 12,
    sortBy: string = 'createdAt',
    sortOrder: OrderByDirection = 'desc',
    lastVisible: any = null,
  ): Promise<QuerySnapshotCustom<PoV>> {
    this.loadingSignal.set(true);

    return await getPoVsPublishedFirebase({ size, sortBy, sortOrder, lastVisible })
      .then((response) => {
        // console.log("getPovs response: ", response);

        this.povsSignal.update((povs) => {
          const mergedContent = lastVisible
            ? [...povs.content, ...response.content]
            : [...response.content];
          return {
            ...povs,
            empty: mergedContent.length === 0,
            content: mergedContent,
            lastVisible: response.lastVisible,
            last: response.last,
          };
        });
        // this.notificationService.notify("PoVs loaded successfully!", "success");
        return response;
      })
      .catch((error: any) => {
        this.notificationService.handleApiError(error);
        return this.povsSignal();
      })
      .finally(() => {
        this.loadingSignal.set(false);
      });
  }

  async searchPovs(
    query: string,
    size: number = 12,
    sortBy: string = 'createdAt',
    sortOrder: OrderByDirection = 'desc',
    lastVisible: any = null,
  ): Promise<QuerySnapshotCustom<PoV>> {
    this.loadingSignal.set(true);

    return await searchPoVsByTitleFirebase({
      searchTitle: query,
      size,
      sortBy,
      sortOrder,
      lastVisible,
    })
      .then((response) => {
        this.povsSignal.update((povs) => {
          const mergedContent = lastVisible
            ? [...povs.content, ...response.content]
            : [...response.content];
          return {
            ...povs,
            empty: mergedContent.length === 0,
            content: mergedContent,
            lastVisible: response.lastVisible,
            last: response.last,
          };
        });
        return response;
      })
      .catch((error: any) => {
        this.notificationService.handleApiError(error);
        return this.povsSignal();
      })
      .finally(() => {
        this.loadingSignal.set(false);
      });
  }
}
