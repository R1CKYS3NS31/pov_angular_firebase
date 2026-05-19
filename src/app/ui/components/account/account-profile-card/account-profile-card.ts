import { Component, EventEmitter, input, Input, Output } from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-account-profile-card',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './account-profile-card.html',
  styleUrls: ['./account-profile-card.scss'],
})
export class AccountProfileCard {
  account = input.required<User>();
  isAuthenticated = input<boolean>(false);
  myCount = input<number>(0);
  localCount = input<number>(0);

  @Output() editProfile = new EventEmitter<void>();

  get firstInitial(): string {
    return this.account()?.name?.first?.[0] || '';
  }
  @Output() signOut = new EventEmitter<void>();

  get displayName() {
    return (
      this.account()?.name?.full ||
      `${this.account()?.name?.first ?? ''} ${this.account()?.name?.last ?? ''}`.trim() ||
      this.account()?.displayName ||
      'Guest User'
    );
  }

  onEditProfile() {
    this.editProfile.emit();
  }

  onSignOut() {
    this.signOut.emit();
  }
}
