import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-home-hero',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home-hero.html',
  styleUrls: ['./home-hero.scss'],
})
export class HomeHero {}

