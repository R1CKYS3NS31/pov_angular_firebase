import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-account-pov-tabs',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, MatChipsModule],
  templateUrl: './account-pov-tabs.html',
  styleUrls: ['./account-pov-tabs.scss'],
})
export class AccountPovTabs {

  activeTab = input<number>(0);
  localCount = input<number>(0);
  myCount = input<number>(0);

  @Output() tabChange = new EventEmitter<number>();

  onTabChange(index: number) {
    this.tabChange.emit(index);
  }
}
