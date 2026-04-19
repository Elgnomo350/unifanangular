import { TestBed } from '@angular/core/testing';
import { Bbddsql } from './bbddsql';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('Bbddsql', () => {

  let service: Bbddsql;
  let httpMock: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Bbddsql]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Bbddsql);

    httpMock.expectOne('http://localhost:23000/demanarproductes');
  });

  it('debería pedir productos', () => {

    service.demanarProductes().subscribe();

    const req = httpMock.expectOne('http://localhost:23000/demanarproductes');
    req.flush({ productos: {} });

    expect(req.request.method).toBe('GET');
  });

  it('debería registrar compra', () => {

    service.registrarCompra([]).subscribe();

    const req = httpMock.expectOne('http://localhost:23000/registrarcompra');
    req.flush({ mensaje: 'ok' });

    expect(req.request.method).toBe('POST');
  });

});