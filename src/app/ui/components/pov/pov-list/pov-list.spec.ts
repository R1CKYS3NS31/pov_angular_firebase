import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PovList } from './pov-list';

describe('PovList', () => {
  let component: PovList;
  let fixture: ComponentFixture<PovList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PovList],
    }).compileComponents();

    fixture = TestBed.createComponent(PovList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
