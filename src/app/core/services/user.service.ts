import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationService } from './notification.service';
import { getUserFirebase } from '../firebase/controller/user-firebase';
import { type User } from '../models/user.model';
import { type PoV } from '../models/pov.model';
import { type QuerySnapshotCustom } from '../models/snapshot.model';
import { getPoVsByAuthorFirebase } from '../firebase/controller/pov-firebase';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private notificationService = inject(NotificationService);

  private userSignal = signal<User | null>(null);
  private userPoVsSignal = signal<QuerySnapshotCustom<PoV>>({
    size: 12,
    empty: true,
    content: [],
    lastVisible: null,
    last: true,
  });
  private loadingSignal = signal<boolean>(false);

  public readonly user = computed(() => this.userSignal());
  public readonly userPoVs = computed(() => this.userPoVsSignal());
  public readonly loading = computed(() => this.loadingSignal());

  async getUserProfile(userId: string) {
    this.loadingSignal.set(true);

    return await getUserFirebase(userId)
      .then(userProfile => {
        // console.log(" Get other user's profile - userProfile", userProfile)
        this.userSignal.set(userProfile);
        return userProfile;
      }).catch(error => {
        this.notificationService.handleApiError(error);
        this.userSignal.set(null);
        throw error;
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }

  
  async getPoVsByAuthor(authorId: string, lastVisible: any = null) {

    this.loadingSignal.set(true);
    return await getPoVsByAuthorFirebase(authorId, { lastVisible })
      .then(response => {
        // console.log("getPovsByAuthor response: ", response);

          this.userPoVsSignal.update(povs => {
            const mergedContent = lastVisible ? [...povs.content, ...response.content] : [...response.content];
            return {
            ...povs,
            empty: mergedContent.length === 0,
            content: mergedContent,
            lastVisible: response.lastVisible,
            last: response.last
          }});
          
        return response;
      }).catch((error: any) => {
        this.notificationService.handleApiError(error);
        return this.userPoVsSignal();
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }
}
