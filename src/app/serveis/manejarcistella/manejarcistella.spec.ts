import { TestBed } from '@angular/core/testing';
import { Manejarcistella } from './manejarcistella';
import { Bbddsql } from '../bbddsql/bbddsql';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('Manejarcistella', () => {

  let service: Manejarcistella;

  let bbddSpy = {
    registrarCompra: vi.fn()
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        Manejarcistella,
        { provide: Bbddsql, useValue: bbddSpy }
      ]
    });

    service = TestBed.inject(Manejarcistella);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería añadir producto al carrito', () => {
    service.afegircistella(1, '', 'prod', 2, 10, 5);
    expect(service.gcistella.length).toBe(1);
  });

  it('debería vaciar carrito', () => {
    service.afegircistella(1, '', 'prod', 2, 10, 5);
    service.buidarcistella();
    expect(service.gcistella.length).toBe(0);
  });

  it('debería llamar compra', () => {
    bbddSpy.registrarCompra.mockReturnValue(of({ mensaje: 'ok' }));
    service.comprarCistella().subscribe();
    expect(bbddSpy.registrarCompra).toHaveBeenCalled();
  });

});