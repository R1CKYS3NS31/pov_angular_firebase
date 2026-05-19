import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsDialog } from './account-settings-dialog';

describe('AccountSettingsDialog', () => {
  let component: AccountSettingsDialog;
  let fixture: ComponentFixture<AccountSettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
