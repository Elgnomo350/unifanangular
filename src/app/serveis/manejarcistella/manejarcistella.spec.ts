import { TestBed } from '@angular/core/testing';

import { Manejarcistella } from './manejarcistella';

describe('Manejarcistella', () => {
  let service: Manejarcistella;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Manejarcistella);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
