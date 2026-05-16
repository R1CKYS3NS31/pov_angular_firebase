import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { PoV } from '../models/pov.model';
import { QuerySnapshotCustom } from '../firebase/config/firebase-firestore';
import { commentOnPoVFirebase, deletePoVFirebase, getMyPoVsFirebase, getPoVsByAuthorFirebase, getPoVsPublishedFirebase, likePoVFirebase, savePoVFirebase, uncommentPoVFirebase, unLikePoVFirebase, updatePoVFirebase } from '../firebase/controller/pov-firebase';


@Injectable({
  providedIn: 'root'
})
export class PovService {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  private loadingSignal = signal<boolean>(false);
  private myPovsSignal = signal<PoV[]>([]);
  private globalPovsSignal = signal<PoV[]>([]);

  public readonly loading = computed(() => this.loadingSignal());
  public readonly myPovs = computed(() => this.myPovsSignal());
  public readonly globalPovs = computed(() => this.globalPovsSignal());

  async loadMyPovs(lastVisible: any = null): Promise<QuerySnapshotCustom<PoV> | undefined> {
    const uid = this.authService.user()?.uid;
    if (!uid) return undefined;
    this.loadingSignal.set(true);
    try {
      const response = await getMyPoVsFirebase(uid, { lastVisible });
      if (lastVisible) {
        this.myPovsSignal.update(povs => [...povs, ...response.content]);
      } else {
        this.myPovsSignal.set(response.content);
      }
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      return undefined;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadGlobalPovs(lastVisible: any = null): Promise<QuerySnapshotCustom<PoV> | undefined> {
    this.loadingSignal.set(true);
    try {
      const response = await getPoVsPublishedFirebase({ lastVisible });
      if (lastVisible) {
        this.globalPovsSignal.update(povs => [...povs, ...response.content]);
      } else {
        this.globalPovsSignal.set(response.content);
      }
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      return undefined;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getPoVsByAuthor(authorId: string, lastVisible: any = null) {
    this.loadingSignal.set(true);
    try {
      return await getPoVsByAuthorFirebase(authorId, { lastVisible });
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createPov(povData: Partial<PoV>) {
    this.loadingSignal.set(true);
    try {
      const response = await savePoVFirebase(povData);
      this.myPovsSignal.update(povs => [response as PoV, ...povs]);
      this.globalPovsSignal.update(povs => [response as PoV, ...povs]);
      this.notificationService.notify("PoV created successfully!", "success");
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updatePov(povId: string, povData: Partial<PoV>) {
    this.loadingSignal.set(true);
    try {
      const response = await updatePoVFirebase(povId, povData);
      const updateFn = (povs: PoV[]) => povs.map(p => p.id === povId ? { ...p, ...response } : p);
      this.myPovsSignal.update(updateFn);
      this.globalPovsSignal.update(updateFn);
      this.notificationService.notify("PoV updated successfully!", "success");
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deletePov(povId: string) {
    this.loadingSignal.set(true);
    try {
      const response = await deletePoVFirebase(povId);
      if (response) {
        const filterFn = (povs: PoV[]) => povs.filter(p => p.id !== povId);
        this.myPovsSignal.update(filterFn);
        this.globalPovsSignal.update(filterFn);
        this.notificationService.notify("PoV deleted successfully!", "success");
      }
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async likePov(povId: string) {
    const accountId = this.authService.user()?.uid;
    if (!accountId) return;
    this.loadingSignal.set(true);
    try {
      const response = await likePoVFirebase(povId, accountId);
      const updateFn = (povs: PoV[]) => povs.map(p => p.id === povId ? { ...p, ...response } : p);
      this.myPovsSignal.update(updateFn);
      this.globalPovsSignal.update(updateFn);
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async unlikePov(povId: string) {
    const accountId = this.authService.user()?.uid;
    if (!accountId) return;
    this.loadingSignal.set(true);
    try {
      const response = await unLikePoVFirebase(povId, accountId);
      const updateFn = (povs: PoV[]) => povs.map(p => p.id === povId ? { ...p, ...response } : p);
      this.myPovsSignal.update(updateFn);
      this.globalPovsSignal.update(updateFn);
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async commentOnPov(povId: string, commentText: string) {
    const user = this.authService.user();
    if (!user) return;
    this.loadingSignal.set(true);
    try {
      const response = await commentOnPoVFirebase(povId, user, { comment: commentText });
      const updateFn = (povs: PoV[]) => povs.map(p => p.id === povId ? { ...p, ...response } : p);
      this.myPovsSignal.update(updateFn);
      this.globalPovsSignal.update(updateFn);
      this.notificationService.notify("Comment added!", "success");
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async uncommentPov(povId: string, commentId: string) {
    this.loadingSignal.set(true);
    try {
      const response = await uncommentPoVFirebase(povId, commentId);
      const updateFn = (povs: PoV[]) => povs.map(p => p.id === povId ? { ...p, ...response } : p);
      this.myPovsSignal.update(updateFn);
      this.globalPovsSignal.update(updateFn);
      this.notificationService.notify("Comment removed!", "success");
      return response;
    } catch (error: any) {
      this.notificationService.handleApiError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
