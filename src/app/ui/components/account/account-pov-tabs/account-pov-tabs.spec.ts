import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPovTabs } from './account-pov-tabs';

describe('AccountPovTabs', () => {
  let component: AccountPovTabs;
  let fixture: ComponentFixture<AccountPovTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPovTabs],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPovTabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
