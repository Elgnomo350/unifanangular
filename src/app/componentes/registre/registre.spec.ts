import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Registre } from './registre';
import { Usuaridades, UsuariData } from '../../serveis/usuaridades/usuaridades';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=+$/, '');
  const body   = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `${header}.${body}.fakesig`;
}

describe("Registre - Cas d'ús: Registre d'usuari", () => {
  let component: Registre;
  let fixture: ComponentFixture<Registre>;
  let usuaridadesMock: any;
  let routerMock: any;
  let iniciatSessioSubject: BehaviorSubject<boolean>;

  const mockUsuariData: UsuariData = {
    nom: 'Joan',
    cognom: 'Garcia',
    correu: 'joan@example.com',
    direccio: 'Carrer Major 1',
    telefon: '612345678',
    sessionID: 'abc123',
    cesta: [],
    role: 'usuario'
  };

  const mockJwt = makeJwt(mockUsuariData);

  beforeEach(async () => {
    iniciatSessioSubject = new BehaviorSubject<boolean>(false);

    usuaridadesMock = {
      setUsuari:        vi.fn(),
      iniciarSessio:    vi.fn(),
      setDades:         vi.fn(),
      setIniciatSessio: vi.fn(),
      getIniciatSessio: vi.fn().mockReturnValue(iniciatSessioSubject.asObservable()),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Registre, FormsModule],
      providers: [
        { provide: Usuaridades, useValue: usuaridadesMock },
        { provide: Router,      useValue: routerMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(Registre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('ha de redirigir a /panelusuari si ja hi ha sessió iniciada', () => {
      iniciatSessioSubject.next(true);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/panelusuari']);
    });

    it('no ha de redirigir si la sessió no està iniciada', () => {
      iniciatSessioSubject.next(false);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  // ─── registrarse() ────────────────────────────────────────────────────────

  describe('registrarse()', () => {
    beforeEach(() => {
      component.nom      = 'Joan';
      component.cognom   = 'Garcia';
      component.email    = 'joan@example.com';
      component.passwd   = '1234';
      component.direccio = 'Carrer Major 1';
      component.telefon  = '612345678';
    });

    it('ha de cridar setUsuari amb les dades del formulari', () => {
      usuaridadesMock.setUsuari.mockReturnValue(of({ mensaje: 'Registrat' }));
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.registrarse();

      expect(usuaridadesMock.setUsuari).toHaveBeenCalledWith(
        'Joan', 'Garcia', 'joan@example.com', '1234', 'Carrer Major 1', '612345678', []
      );
    });

    it("ha de mostrar alert amb el mensaje del servidor en cas d'èxit", () => {
      usuaridadesMock.setUsuari.mockReturnValue(of({ mensaje: 'Usuari registrat correctament' }));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.registrarse();

      expect(alertSpy).toHaveBeenCalledWith('Usuari registrat correctament');
    });

    it("ha de buidar els camps del formulari després del registre exitós", () => {
      usuaridadesMock.setUsuari.mockReturnValue(of({ mensaje: 'OK' }));
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.registrarse();

      expect(component.nom).toBe('');
      expect(component.cognom).toBe('');
      expect(component.email).toBe('');
      expect(component.passwd).toBe('');
      expect(component.direccio).toBe('');
      expect(component.telefon).toBe('');
    });

    it("ha de mostrar alert amb el missatge d'error en cas de fallada", () => {
      usuaridadesMock.setUsuari.mockReturnValue(
        throwError(() => ({ error: { message: 'El correu ja existeix' } }))
      );
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.registrarse();

      expect(alertSpy).toHaveBeenCalledWith('El correu ja existeix');
    });

    it('no ha de buidar els camps si el registre falla', () => {
      usuaridadesMock.setUsuari.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.registrarse();

      expect(component.nom).toBe('Joan');
      expect(component.email).toBe('joan@example.com');
    });
  });

  // ─── iniciarSessio() ──────────────────────────────────────────────────────

  describe('iniciarSessio()', () => {
    beforeEach(() => {
      component.loginEmail = 'joan@example.com';
      component.loginPass  = '1234';
    });

    it('ha de cridar iniciarSessio del servei amb email i password', () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        of({ mensaje: 'Sessió iniciada', token: mockJwt })
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(usuaridadesMock.iniciarSessio).toHaveBeenCalledWith('joan@example.com', '1234');
    });

    it("ha de mostrar alert amb el mensaje del servidor en cas d'èxit", () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        of({ mensaje: 'Benvingut!', token: mockJwt })
      );
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(alertSpy).toHaveBeenCalledWith('Benvingut!');
    });

    it("ha de descodificar el JWT i desar les dades de l'usuari", () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        of({ mensaje: 'OK', token: mockJwt })
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(usuaridadesMock.setDades).toHaveBeenCalledWith(mockUsuariData);
    });

    it('ha de posar iniciatSessio a true després del login', () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        of({ mensaje: 'OK', token: mockJwt })
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(usuaridadesMock.setIniciatSessio).toHaveBeenCalledWith(true);
    });

    it("ha de buidar els camps de login després de l'èxit", () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        of({ mensaje: 'OK', token: mockJwt })
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(component.loginEmail).toBe('');
      expect(component.loginPass).toBe('');
    });

    it('ha de redirigir a /panelusuari després del login exitós', () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        of({ mensaje: 'OK', token: mockJwt })
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/panelusuari']);
    });

    it("ha de mostrar alert amb l'error si el login falla", () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        throwError(() => ({ error: { message: 'Credencials incorrectes' } }))
      );
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(alertSpy).toHaveBeenCalledWith('Credencials incorrectes');
    });

    it('no ha de redirigir si el login falla', () => {
      usuaridadesMock.iniciarSessio.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.iniciarSessio();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  // ─── Navegació ────────────────────────────────────────────────────────────

  describe('Navegació', () => {
    it('anarAPanell() ha de navegar a /panelusuari', () => {
      component.anarAPanell();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/panelusuari']);
    });

    it('recuperarpasswd() ha de navegar a /recuperarpasswd', () => {
      component.recuperarpasswd();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/recuperarpasswd']);
    });
  });
});