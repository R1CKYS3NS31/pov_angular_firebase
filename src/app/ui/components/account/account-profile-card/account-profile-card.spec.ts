import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountProfileCard } from './account-profile-card';

describe('AccountProfileCard', () => {
  let component: AccountProfileCard;
  let fixture: ComponentFixture<AccountProfileCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountProfileCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountProfileCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
