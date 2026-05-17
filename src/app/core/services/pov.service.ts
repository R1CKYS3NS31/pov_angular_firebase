import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationService } from './notification.service';
import { type PoV } from '../models/pov.model';
import { type QuerySnapshotCustom } from '../models/snapshot.model';
import { getPoVsPublishedFirebase } from '../firebase/controller/pov-firebase';


@Injectable({
  providedIn: 'root'
})
export class PovService {
  private notificationService = inject(NotificationService);

  private loadingSignal = signal<boolean>(false);
  private povsSignal = signal<QuerySnapshotCustom<PoV>>({
    size: 12,
    empty: true,
    content: [],
    lastVisible: null,
    last: true
  })

  public readonly loading = computed(() => this.loadingSignal());
  public readonly povs = computed(() => this.povsSignal());

constructor(){
  this.loadPublishedPoVs();
}

private loadPublishedPoVs(){
  this.getPovs();
}

  async getPovs(lastVisible: any = null): Promise<QuerySnapshotCustom<PoV>> {
    this.loadingSignal.set(true);

    return await getPoVsPublishedFirebase({ lastVisible })
      .then(response => {
        // console.log("getPovs response: ", response);

          this.povsSignal.update(povs => {
            const mergedContent = lastVisible ? [...povs.content, ...response.content] : [...response.content];
            return {
              ...povs,
              empty: mergedContent.length === 0,
              content: mergedContent,
              lastVisible: response.lastVisible,
              last: response.last
            }
          });
          // this.notificationService.notify("PoVs loaded successfully!", "success");
        return response;
      }).catch((error: any) => {
        this.notificationService.handleApiError(error);
        return this.povsSignal();
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }
}
