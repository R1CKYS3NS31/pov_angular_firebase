import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { type PoV } from '../models/pov.model';
import { type QuerySnapshotCustom } from '../models/snapshot.model';
import { commentOnPoVFirebase, deletePoVFirebase, getMyPoVsFirebase, likePoVFirebase, savePoVFirebase, uncommentPoVFirebase, unLikePoVFirebase, updatePoVFirebase } from '../firebase/controller/pov-firebase';
// import { PovService } from './pov.service';
// import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  private loadingSignal = signal<boolean>(false);
  private myPoVsSignal = signal<QuerySnapshotCustom<PoV>>({
    size: 12,
    empty: true,
    content: [],
    lastVisible: null,
    last: true
  });

  public readonly loading = computed(() => this.loadingSignal());
  public readonly myPoVs = computed(() => this.myPoVsSignal());

  public readonly account = computed(() => this.authService.account());
  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor() {
    effect(() => {
      const loggedin = this.isAuthenticated();
      const account = this.account();
      // console.log("account effect triggered: ", loggedin,account);
      if (loggedin && account?.id) untracked(() => this.getMyPoVs());
    });
  }

  async getMyPoVs(lastVisible: any = null): Promise<QuerySnapshotCustom<PoV>> {
    const account = this.account();
    if (!this.isAuthenticated() || !account?.id) return this.myPoVsSignal();

    this.loadingSignal.set(true);
    return await getMyPoVsFirebase(account.id, { lastVisible })
      .then(response => {
        // console.log("myPoVs response: ", response);

        this.myPoVsSignal.update(povs => {
          const mergedContent = lastVisible ? [...povs.content, ...response.content] : [...response.content];
          return {
            ...povs,
            size: response.size,
            empty: mergedContent.length === 0,
            content: mergedContent,
            lastVisible: response.lastVisible,
            last: response.last
          };
        });
        return response;
      }).catch((error: any) => {
        this.notificationService.handleApiError(error);
        return this.myPoVsSignal()
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }

  async createPov(povData: Partial<PoV>) {
    const account = this.account();
    if (!account?.id) return;

    this.loadingSignal.set(true);
    await savePoVFirebase(povData)
      .then(response => {
        const savedPov = response as PoV;
        this.myPoVsSignal.update(povs => ({
          ...povs,
          empty: false,
          content: [savedPov, ...povs.content],
        }));
        this.notificationService.notify("PoV created successfully!", "success");
      }).catch((error: any) => {
        this.notificationService.handleApiError(error);
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }

  async updatePov(povId: string, povData: Partial<PoV>) {
    const account = this.account();
    if (!account?.id) return;

    this.loadingSignal.set(true);
    await updatePoVFirebase(povId, povData)
      .then(response => {
        const updatedPov = response as PoV;
        this.myPoVsSignal.update(povs => ({
          ...povs,
          content: povs.content.map(p => p.id === povId ? { ...p, ...updatedPov } : p)
        }));
        this.notificationService.notify("PoV updated successfully!", "success");
      }).catch((error: any) => {
        this.notificationService.handleApiError(error);
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }

  async deletePov(povId: string) {
    const account = this.account();
    if (!account?.id) return;

    this.loadingSignal.set(true);

    await deletePoVFirebase(povId)
      .then(() => {
        this.myPoVsSignal.update(povs => {
          const updatedContent = povs.content.filter(p => p.id !== povId);
          return {
            ...povs,
            content: updatedContent,
            empty: updatedContent.length === 0
          }
        });
        this.notificationService.notify("PoV deleted successfully!", "success");
      }).catch((error: any) => {
        this.notificationService.handleApiError(error);
      }).finally(() => {
        this.loadingSignal.set(false);
      })
  }

  async likePov(povId: string) {
    if (!this.account()?.id) return;

    this.loadingSignal.set(true);
    await likePoVFirebase(povId, this.account()!.id).then(response => {
      const updatedPov = response as PoV;
      this.myPoVsSignal.update(povs => ({
        ...povs,
        content: povs.content.map(p => p.id === povId ? { ...p, ...updatedPov } : p)
      }));
      this.notificationService.notify("PoV liked!", "success");
    }).catch((error: any) => {
      this.notificationService.handleApiError(error);
    }).finally(() => {
      this.loadingSignal.set(false);
    })
  }

  async unlikePov(povId: string) {
    if (!this.account()?.id) return;

    this.loadingSignal.set(true);
    await unLikePoVFirebase(povId, this.account()!.id).then(response => {
      const updatedPov = response as PoV;
      this.myPoVsSignal.update(povs => ({
        ...povs,
        content: povs.content.map(p => p.id === povId ? { ...p, ...updatedPov } : p)
      }));
      this.notificationService.notify("PoV unliked!", "success");
    }).catch((error: any) => {
      this.notificationService.handleApiError(error);
    }).finally(() => {
      this.loadingSignal.set(false);
    })
  }

  async commentOnPov(povId: string, commentText: string) {
    const account = this.account();
    if (!account?.id) return;

    this.loadingSignal.set(true);
    await commentOnPoVFirebase(povId, account, { comment: commentText }).then(response => {
      const updatedPov = response as PoV;
      this.myPoVsSignal.update(povs => ({
        ...povs,
        content: povs.content.map(p => p.id === povId ? { ...p, ...updatedPov } : p)
      }));
      this.notificationService.notify("Comment added!", "success");
    }).catch((error: any) => {
      this.notificationService.handleApiError(error);
    }).finally(() => {
      this.loadingSignal.set(false);
    })
  }

  async uncommentPov(povId: string, commentId: string) {
    const account = this.account();
    if (!account?.id) return;

    this.loadingSignal.set(true);
    await uncommentPoVFirebase(povId, commentId).then(response => {
      const updatedPov = response as PoV;
      this.myPoVsSignal.update(povs => ({
        ...povs,
        content: povs.content.map(p => p.id === povId ? { ...p, ...updatedPov } : p)
      }));
      this.notificationService.notify("Comment removed!", "success");
    }).catch((error: any) => {
      this.notificationService.handleApiError(error);
    }).finally(() => {
      this.loadingSignal.set(false);
    })
  }
}
