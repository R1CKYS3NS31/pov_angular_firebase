import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PovList } from '../../components/pov/pov-list/pov-list';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, PovList],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);
  userService = inject(UserService);
  // povService = inject(PovService);

  userId: string = '';
  // profile: User | null = null;
  // userPovs: { content: PoV[]; empty: boolean } | null = null;
  // loadingProfile = true;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!!;
      if (this.userId) {
        this.loadProfileData(this.userId);
      }
    });
  }

  async loadProfileData(userId: string) {
    await this.userService.getUserProfile(userId);
    await this.userService.getPoVsByAuthor(userId);
  }

  // async loadProfileData(userId: string) {
  //   this.loadingProfile = true;
  //   try {
  //     this.profile = (await this.userService.getUserProfile(userId)) as User;
  //     if (this.profile) {
  //       const povsResponse = await this.userService.getPoVsByAuthor(userId);
  //       this.userPovs = {
  //         content: povsResponse.content,
  //         empty: povsResponse.content.length === 0,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Failed to load profile', error);
  //   } finally {
  //     this.loadingProfile = false;
  //   }
  // }

  // get displayName() {
  //   if (!this.profile) return 'Unknown User';
  //   return (
  //     this.profile.name?.full ||
  //     `${this.profile.name?.first ?? ''} ${this.profile.name?.last ?? ''}`.trim() ||
  //     'Unknown User'
  //   );
  // }

  goBack() {
    this.location.back();
  }
}

