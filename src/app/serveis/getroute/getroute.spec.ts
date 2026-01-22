import { TestBed } from '@angular/core/testing';

import { Getroute } from '../getroute/getroute';

describe('Getroute', () => {
  let service: Getroute;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Getroute);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
