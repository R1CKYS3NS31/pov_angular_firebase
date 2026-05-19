import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PovCard } from './pov-card';

describe('PovCard', () => {
  let component: PovCard;
  let fixture: ComponentFixture<PovCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PovCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PovCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
