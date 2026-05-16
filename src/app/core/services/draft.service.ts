import { Injectable, signal, computed, effect } from '@angular/core';
import { PoV } from '../models/pov.model';

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  private readonly STORAGE_KEY = 'pov_local_drafts';

  private draftsSignal = signal<PoV[]>([]);

  public readonly drafts = computed(() => this.draftsSignal());
  public readonly draftCount = computed(() => this.draftsSignal().length);
  public readonly isEmpty = computed(() => this.draftsSignal().length === 0);

  constructor() {
    this.loadDrafts();
    
    // Auto-save to localStorage whenever draftsSignal changes
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.draftsSignal()));
    });
  }

  private loadDrafts() {
    const savedDrafts = localStorage.getItem(this.STORAGE_KEY);
    if (savedDrafts) {
      try {
        this.draftsSignal.set(JSON.parse(savedDrafts));
      } catch (e) {
        console.error('Failed to parse local drafts', e);
        this.draftsSignal.set([]);
      }
    }
  }

  getDraftsPage() {
    return {
      content: this.draftsSignal(),
      empty: this.isEmpty(),
      totalElements: this.draftCount(),
      last: true
    };
  }

  saveDraft(pov: Partial<PoV>): string {
    const drafts = this.draftsSignal();
    const id = pov.id || `local_${Date.now()}`;
    
    const newDraft: PoV = {
      ...pov,
      id,
      isLocal: true,
      createdAt: pov.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as PoV;

    const existingIndex = drafts.findIndex(d => d.id === id);
    if (existingIndex !== -1) {
      this.draftsSignal.update(ds => {
        const newDs = [...ds];
        newDs[existingIndex] = newDraft;
        return newDs;
      });
    } else {
      this.draftsSignal.update(ds => [newDraft, ...ds]);
    }
    
    return id;
  }

  deleteDraft(id: string) {
    this.draftsSignal.update(ds => ds.filter(d => d.id !== id));
  }

  clearAllDrafts() {
    this.draftsSignal.set([]);
  }
}
