import { TestBed } from '@angular/core/testing';

import { Bbddsql } from './bbddsql';

describe('Bbddsql', () => {
  let service: Bbddsql;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bbddsql);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
