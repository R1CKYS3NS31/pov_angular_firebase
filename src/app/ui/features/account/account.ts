import { Component, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@core/services/auth.service';
import { PovService } from '@core/services/pov.service';
import { DraftService } from '@core/services/draft.service';
import { UserService } from '@core/services/user.service';
import { AccountProfileCard } from '../../components/account/account-profile-card/account-profile-card';
import { AccountPovTabs } from '../../components/account/account-pov-tabs/account-pov-tabs';
import { AccountPovPanel } from '../../components/account/account-pov-panel/account-pov-panel';
import { AccountSettingsDialog } from '../../components/account/account-settings-dialog/account-settings-dialog';
import { PovDialog } from '../../components/pov/pov-dialog/pov-dialog';
import { PoV } from '@core/models/pov.model';
import { User } from '@core/models/user.model';
import { AccountService } from '@core/services/account.service';

@Component({
  selector: 'app-account',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AccountProfileCard,
    AccountPovTabs,
    AccountPovPanel,
    AccountSettingsDialog,
  ],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
})
export class Account implements OnInit {
  authService = inject(AuthService);
  accountService = inject(AccountService);
  draftService = inject(DraftService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);

  activeTab = signal<number>(0);
  settingsOpen = signal<boolean>(false);

  myPovs: { content: PoV[]; empty: boolean } | null = null;
  loading = false;

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const tab = parseInt(params.get('tab') || '0', 10);
      this.activeTab.set(tab);
    });
    this.loadMyPovs();
  }

  async loadMyPovs() {
    this.loading = true;
    try {
      const response = await this.accountService.getMyPoVs(); // load my PoVs
      if (response) {
        this.myPovs = { content: response.content, empty: response.content.length === 0 };
      }
    } finally {
      this.loading = false;
    }
  }

  onTabChange(index: number) {
    this.activeTab.set(index);
    this.router.navigate([], {
      queryParams: { tab: index },
      queryParamsHandling: 'merge',
    });
  }

  openSettings() {
    this.settingsOpen.set(true);
  }

  async onSaveSettings(updates: Partial<User>) {
    await this.authService.updateAccount(updates);
    this.settingsOpen.set(false);
  }

  async onDeleteAccount() {
    await this.authService.deleteAccount();
    this.settingsOpen.set(false);
  }

  onEditPov(pov: PoV | null = null, isLocal: boolean = false) {
    this.dialog.open(PovDialog, {
      data: { povToEdit: pov, isLocal },
      maxWidth: '600px',
      width: '95vw',
      panelClass: 'pov-dialog-panel',
    });
  }

  async onDeletePov(povId: string, isLocal: boolean = false) {
    if (isLocal) {
      this.draftService.deleteDraft(povId);
      return;
    }

    await this.accountService.deletePov(povId);
    if (this.myPovs) {
      this.myPovs = {
        content: this.myPovs.content.filter((p) => p.id !== povId),
        empty: this.myPovs.content.length - 1 === 0,
      };
    }
  }
}

