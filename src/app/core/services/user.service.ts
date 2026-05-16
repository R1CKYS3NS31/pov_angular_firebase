import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationService } from './notification.service';
import { getUserFirebase } from '../firebase/controller/user-firebase';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private notificationService = inject(NotificationService);

  private loadingSignal = signal<boolean>(false);

  public readonly loading = computed(() => this.loadingSignal());

  async getUserProfile(userId: string) {
    this.loadingSignal.set(true);

    return await getUserFirebase(userId)
      .then(userProfile => {
        // console.log(" Get other user's profile - userProfile", userProfile)
        return userProfile;
      }).catch(error => {
        this.notificationService.handleApiError(error);
        throw error;
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }
}
