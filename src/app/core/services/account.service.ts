import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { deleteUserFirebase, getUserFirebase, updateUserFirebase } from '../firebase/controller/user-firebase';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  private loadingSignal = signal<boolean>(false);

  public readonly loading = computed(() => this.loadingSignal());
  // The current user account is synced with auth service.
  public readonly account = this.authService.user;

  async updateAccount(userData: Partial<User>) {
    const uid = this.account()?.uid || this.account()?.id;
    if (!uid) return;
    if (!this.authService.isAuthenticated()) {
      this.notificationService.notify("You must be logged in to update your account!", "error");
      return;
    }

    this.loadingSignal.set(true);
    try {
      const response = await updateUserFirebase(uid, userData);
      this.authService.updateAccountData(response);
      this.notificationService.notify("User account updated successfully!", "success");
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteAccount() {
    const uid = this.account()?.uid || this.account()?.id;
    if (!uid) return;
    if (!this.authService.isAuthenticated()) {
      this.notificationService.notify("You must be logged in to delete your account!", "error");
      return;
    }

    this.loadingSignal.set(true);
    try {
      const response = await deleteUserFirebase(uid);
      await this.authService.handleSignOut();
      this.notificationService.notify("User account deleted successfully!", "success");
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // Get other user's profile
  async getUserProfile(userId: string) {
    this.loadingSignal.set(true);
    try {
      const userProfile = await getUserFirebase(userId);
      return userProfile;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
