import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Catalogo } from './catalogo';
import { Bbddsql } from '../../serveis/bbddsql/bbddsql';
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';
import { Getasset } from '../../serveis/getasset/getasset';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('Catalogo', () => {
  let component: Catalogo;
  let fixture: ComponentFixture<Catalogo>;

  beforeEach(async () => {
    const bbddSpy = {
      getProductes: vi.fn().mockReturnValue({}),
      demanarProductes: vi.fn().mockReturnValue(of({ productos: {} })),
      setProductes: vi.fn(),
    };

    const manejarSpy = {
      afegircistella: vi.fn(),
      updateCistellaCount: vi.fn(),
      gcistella: [],
    };

    const getassetSpy = {
      getpath: vi.fn().mockReturnValue(''),
    };

    const routerSpy = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [
        { provide: Bbddsql, useValue: bbddSpy },
        { provide: Manejarcistella, useValue: manejarSpy },
        { provide: Getasset, useValue: getassetSpy },
        { provide: Router, useValue: routerSpy },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Catalogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});