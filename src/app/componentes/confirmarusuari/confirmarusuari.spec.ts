import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Confirmarusuari } from './confirmarusuari';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

// El component Confirmarusuari executa tota la lògica al constructor.
// Per tant, els mocks han d'estar configurats al TestBed ABANS de createComponent.
// Cada describe configura el seu propi TestBed amb els mocks adequats.

describe("Confirmarusuari - Cas d'ús: Confirmació de correu en el registre", () => {

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  // Token valid
  describe('Amb token valid', () => {
    let confirmarcorreuMock: ReturnType<typeof vi.fn>;
    let navigateMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      confirmarcorreuMock = vi.fn().mockReturnValue(of({ mensaje: 'Compte confirmat' }));
      navigateMock = vi.fn();

      await TestBed.configureTestingModule({
        imports: [Confirmarusuari],
        providers: [
          { provide: Usuaridades,    useValue: { confirmarcorreu: confirmarcorreuMock } },
          { provide: Router,         useValue: { navigate: navigateMock } },
          { provide: ActivatedRoute, useValue: { queryParams: of({ token: 'token-valid-123' }) } },
        ],
      }).compileComponents();

      TestBed.createComponent(Confirmarusuari);
    });

    it('ha de cridar confirmarcorreu amb el token del query param', () => {
      expect(confirmarcorreuMock).toHaveBeenCalledWith('token-valid-123');
    });

    it('ha de mostrar alert amb el mensaje del servidor', () => {
      expect(window.alert).toHaveBeenCalledWith('Compte confirmat');
    });

    it('ha de redirigir a /registre despres de la confirmacio', () => {
      expect(navigateMock).toHaveBeenCalledWith(['/registre']);
    });

    it('no ha de redirigir a cap altre lloc', () => {
      expect(navigateMock).not.toHaveBeenCalledWith(['/panelusuari']);
    });
  });

  // Token invalid
  describe('Amb token invalid o caducat', () => {
    let confirmarcorreuMock: ReturnType<typeof vi.fn>;
    let navigateMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      confirmarcorreuMock = vi.fn().mockReturnValue(
        throwError(() => ({ error: { message: 'Token invalid o caducat' } }))
      );
      navigateMock = vi.fn();

      await TestBed.configureTestingModule({
        imports: [Confirmarusuari],
        providers: [
          { provide: Usuaridades,    useValue: { confirmarcorreu: confirmarcorreuMock } },
          { provide: Router,         useValue: { navigate: navigateMock } },
          { provide: ActivatedRoute, useValue: { queryParams: of({ token: 'token-invalid' }) } },
        ],
      }).compileComponents();

      TestBed.createComponent(Confirmarusuari);
    });

    it("ha de mostrar alert amb el missatge d'error del servidor", () => {
      expect(window.alert).toHaveBeenCalledWith('Token invalid o caducat');
    });

    it('ha de redirigir a /registre fins i tot si hi ha error', () => {
      expect(navigateMock).toHaveBeenCalledWith(['/registre']);
    });
  });

  // Sense token
  describe('Sense token al query param', () => {
    let confirmarcorreuMock: ReturnType<typeof vi.fn>;
    let navigateMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      confirmarcorreuMock = vi.fn().mockReturnValue(
        throwError(() => ({ error: { message: 'Token buit' } }))
      );
      navigateMock = vi.fn();

      await TestBed.configureTestingModule({
        imports: [Confirmarusuari],
        providers: [
          { provide: Usuaridades,    useValue: { confirmarcorreu: confirmarcorreuMock } },
          { provide: Router,         useValue: { navigate: navigateMock } },
          { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        ],
      }).compileComponents();

      TestBed.createComponent(Confirmarusuari);
    });

    it('ha de mostrar alert indicant que no hi ha token', () => {
      expect(window.alert).toHaveBeenCalledWith('No hay token, volviendo al registro');
    });

    it('ha de redirigir a /registre si no hi ha token', () => {
      expect(navigateMock).toHaveBeenCalledWith(['/registre']);
    });
  });

  // Interaccio amb el servei
  describe('Interaccio amb el servei', () => {
    it('ha de cridar confirmarcorreu exactament una vegada', async () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      const confirmarcorreuMock = vi.fn().mockReturnValue(of({ mensaje: 'OK' }));

      await TestBed.configureTestingModule({
        imports: [Confirmarusuari],
        providers: [
          { provide: Usuaridades,    useValue: { confirmarcorreu: confirmarcorreuMock } },
          { provide: Router,         useValue: { navigate: vi.fn() } },
          { provide: ActivatedRoute, useValue: { queryParams: of({ token: 'token-abc' }) } },
        ],
      }).compileComponents();

      TestBed.createComponent(Confirmarusuari);

      expect(confirmarcorreuMock).toHaveBeenCalledTimes(1);
    });

    it('ha de passar el token exacte sense modificar-lo', async () => {
      const tokenOriginal = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      const confirmarcorreuMock = vi.fn().mockReturnValue(of({ mensaje: 'OK' }));

      await TestBed.configureTestingModule({
        imports: [Confirmarusuari],
        providers: [
          { provide: Usuaridades,    useValue: { confirmarcorreu: confirmarcorreuMock } },
          { provide: Router,         useValue: { navigate: vi.fn() } },
          { provide: ActivatedRoute, useValue: { queryParams: of({ token: tokenOriginal }) } },
        ],
      }).compileComponents();

      TestBed.createComponent(Confirmarusuari);

      expect(confirmarcorreuMock).toHaveBeenCalledWith(tokenOriginal);
    });
  });
});