import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeFilters } from './home-filters';

describe('HomeFilters', () => {
  let component: HomeFilters;
  let fixture: ComponentFixture<HomeFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
