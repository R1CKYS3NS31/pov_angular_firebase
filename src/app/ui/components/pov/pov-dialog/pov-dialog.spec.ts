import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PovDialog } from './pov-dialog';

describe('PovDialog', () => {
  let component: PovDialog;
  let fixture: ComponentFixture<PovDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PovDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PovDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
