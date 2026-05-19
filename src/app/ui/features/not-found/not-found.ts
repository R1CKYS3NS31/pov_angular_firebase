import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
})
export class NotFound {}
