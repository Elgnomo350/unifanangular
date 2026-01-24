import { TestBed } from '@angular/core/testing';

import { Usuaridades } from './usuaridades';

describe('Usuaridades', () => {
  let service: Usuaridades;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Usuaridades);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
