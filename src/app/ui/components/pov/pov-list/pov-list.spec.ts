import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PovList } from './pov-list';
import { PoV } from '@core/models/pov.model';
import { QuerySnapshotCustom } from '@core/models/snapshot.model';

const makePov = (overrides: Partial<PoV> = {}): PoV => ({
  id: overrides.id ?? 'pov-1',
  title: overrides.title ?? 'Test Perspective',
  titleLower: overrides.titleLower ?? 'test perspective',
  description: overrides.description ?? 'A short description',
  points: overrides.points ?? 'First point\nSecond point',
  author: overrides.author ?? 'user-1',
  published: overrides.published ?? true,
  likesCount: overrides.likesCount ?? 0,
  commentsCount: overrides.commentsCount ?? 0,
});

describe('PovList', () => {
  let component: PovList;
  let fixture: ComponentFixture<PovList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PovList],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PovList);
    component = fixture.componentInstance;
  });

  it('renders cards when snapshot content exists', () => {
    const snapshot: QuerySnapshotCustom<PoV> = {
      size: 1,
      empty: false,
      content: [makePov()],
      lastVisible: null,
      last: true,
    };

    fixture.componentRef.setInput('povs', snapshot);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('hasMore', false);
    fixture.componentRef.setInput('loadingMore', false);

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-pov-card')).length).toBe(1);
  });
});
