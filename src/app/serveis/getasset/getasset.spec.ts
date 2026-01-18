import { TestBed } from '@angular/core/testing';

import { Getasset } from '../getasset/getasset';

describe('Getasset', () => {
  let service: Getasset;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Getasset);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
