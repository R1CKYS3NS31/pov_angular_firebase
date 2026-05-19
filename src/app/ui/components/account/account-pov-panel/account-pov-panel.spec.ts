import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPovPanel } from './account-pov-panel';

describe('AccountPovPanel', () => {
  let component: AccountPovPanel;
  let fixture: ComponentFixture<AccountPovPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPovPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPovPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
