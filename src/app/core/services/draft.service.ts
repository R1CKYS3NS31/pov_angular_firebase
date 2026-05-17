import { Injectable, signal, computed, effect } from '@angular/core';
import { PoV } from '../models/pov.model';
import { QuerySnapshotCustom } from '../models/snapshot.model';

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  private readonly STORAGE_KEY = 'pov_local_drafts';

  private draftsSignal = signal<QuerySnapshotCustom<PoV>>({
    size: 12,
    empty: true,
    content: [],
    lastVisible: null,
    last: true
  });

  public readonly drafts = computed(() => this.draftsSignal());

  constructor() {
    this.loadDrafts();

    // Auto-save to localStorage whenever draftsSignal changes
    effect(() => {
      const state = this.draftsSignal();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...state, lastVisible: null, last: true }));
    });
  }

  private loadDrafts() {
    const savedDrafts = localStorage.getItem(this.STORAGE_KEY);
    if (!savedDrafts) return;

    try {
      this.draftsSignal.set(JSON.parse(savedDrafts));
    } catch (e) {
      console.error('Failed to parse local drafts', e);
      this.clearAllDrafts();
    }
  }

  saveDraft(povData: Partial<PoV>) {
    const id = povData.id || `local_${Date.now()}`;
    const timestamp = new Date().toISOString();

    this.draftsSignal.update(currentDrafts => {
      const existingIndex = currentDrafts.content.findIndex(d => d.id === id);
      let updatedDraftsContent = [...currentDrafts.content];

      if (existingIndex !== -1) {
        // Update existing draft
        updatedDraftsContent[existingIndex] = {
          ...currentDrafts.content[existingIndex],
          ...povData,
          updatedAt: timestamp
        };
      } else {
        // Add new draft
        const newDraft: PoV = {
          ...povData,
          id,
          isLocal: true,
          createdAt: timestamp,
          updatedAt: timestamp
        } as PoV;
        updatedDraftsContent.unshift(newDraft);
      }
      return {
        ...currentDrafts,
        content: updatedDraftsContent,
        empty: updatedDraftsContent.length === 0,
        lastVisible: currentDrafts.lastVisible,
        last: currentDrafts.last
      };
    });
  }

  // updateDraft(povData: Partial<PoV>) {
  //   const id = povData.id;
  //   const updatedDraft: PoV = {
  //     ...povData,
  //     updatedAt: new Date().toISOString()
  //   } as PoV;

  //   this.draftsSignal.update(currentDrafts => {
  //     const existingIndex = currentDrafts.content.findIndex(d => d.id === id);
  //     let updatedDraftsContent = currentDrafts.content;

  //     if (existingIndex !== -1) {
  //       // Update existing draft
  //       updatedDraftsContent = [...currentDrafts.content];
  //       updatedDraftsContent[existingIndex] = updatedDraft;
  //     }
  //     return {
  //       ...currentDrafts,
  //       content: updatedDraftsContent,
  //       empty: updatedDraftsContent.length === 0,
  //       lastVisible: null,
  //       last: true
  //     };
  //   });
  // }

  deleteDraft(id: string): void {
    this.draftsSignal.update(currentDrafts => {
      if (currentDrafts.empty) return currentDrafts;

      const draftIndex = currentDrafts.content.findIndex(d => d.id === id);
      if (draftIndex === -1) return currentDrafts;

      const updatedDraftsContent = currentDrafts.content.filter(draft => draft.id !== id);

      return {
        ...currentDrafts,
        content: updatedDraftsContent,
        empty: updatedDraftsContent.length === 0,
        lastVisible: currentDrafts.lastVisible,
        last: currentDrafts.last
      };
    });
  }

  clearAllDrafts() {
    localStorage.removeItem(this.STORAGE_KEY);

    this.draftsSignal.set({
      size: 12,
      empty: true,
      content: [],
      lastVisible: null,
      last: true
    });
  }
}
