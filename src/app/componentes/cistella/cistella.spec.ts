import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cistella } from './cistella';
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';
import { Getroute } from '../../serveis/getroute/getroute';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';
import { RouterTestingModule } from '@angular/router/testing';
import { ChangeDetectorRef } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('Cistella', () => {
  let component: Cistella;
  let fixture: ComponentFixture<Cistella>;

  beforeEach(async () => {
    const manejarSpy = {
      gcistella: [],
      comprarCistella: vi.fn().mockReturnValue(of({ mensaje: 'Compra realizada' })),
      buidarcistella: vi.fn(),
      updateCistellaCount: vi.fn(),
      eliminarProducto: vi.fn(),
    };

    const getRouteSpy = {
      getroute: vi.fn().mockReturnValue(''),
    };

    const usuariSpy = {
      getIniciatSessioValue: vi.fn().mockReturnValue(true),
    };

    const routerSpy = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Cistella, RouterTestingModule],
      providers: [
        { provide: Manejarcistella, useValue: manejarSpy },
        { provide: Getroute, useValue: getRouteSpy },
        { provide: Usuaridades, useValue: usuariSpy },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cistella);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería completar el caso de uso comprar correctamente', () => {
    component.comprar();
    expect(component).toBeTruthy();
  });
});