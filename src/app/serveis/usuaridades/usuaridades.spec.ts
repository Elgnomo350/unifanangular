import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Usuaridades, UsuariData } from './usuaridades';

// JWT mínim parsejable: jwtDecode no valida signatura, només llegeix el payload base64url.
// Els imports ESM són immutables al bundler d'Angular/esbuild, per tant NO es pot
// mockejar jwtDecode. En canvi, construïm un JWT real amb el payload que volem.
function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=+$/, '');
  const body   = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  return `${header}.${body}.fakesig`;
}

describe("Usuaridades - Cas d'ús: Registre d'usuari", () => {
  let service: Usuaridades;
  let httpMock: HttpTestingController;

  const mockUsuariData: UsuariData = {
    nom: 'Joan',
    cognom: 'Garcia',
    correu: 'joan@example.com',
    direccio: 'Carrer Major 1',
    telefon: '612345678',
    sessionID: 'abc123',
  };

  const mockJwt = makeJwt(mockUsuariData);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Usuaridades],
    });

    service  = TestBed.inject(Usuaridades);
    httpMock = TestBed.inject(HttpTestingController);

    // Absorbim la crida HTTP que el constructor dispara via checkSessio()
    const req = httpMock.expectOne('http://localhost:23000/loggedin');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── setUsuari ────────────────────────────────────────────────────────────

  describe('setUsuari()', () => {
    it('ha de fer POST a /registrar amb les dades correctes', () => {
      service
        .setUsuari('Joan', 'Garcia', 'joan@example.com', '1234', 'Carrer Major 1', '612345678')
        .subscribe();

      const req = httpMock.expectOne('http://localhost:23000/registrar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        nom: 'Joan',
        cognom: 'Garcia',
        correu: 'joan@example.com',
        passwd: '1234',
        direccio: 'Carrer Major 1',
        telefon: '612345678',
      });
      req.flush({ mensaje: 'Usuari registrat correctament' });
    });

    it("ha de retornar el mensaje del servidor en cas d'èxit", () => {
      let result: { mensaje: string } | undefined;

      service
        .setUsuari('Joan', 'Garcia', 'joan@example.com', '1234', 'Carrer Major 1', '612345678')
        .subscribe((res) => (result = res));

      const req = httpMock.expectOne('http://localhost:23000/registrar');
      req.flush({ mensaje: 'Usuari registrat correctament' });

      expect(result?.mensaje).toBe('Usuari registrat correctament');
    });

    it("ha de propagar l'error si el servidor retorna un error", () => {
      let errorResult: any;

      service
        .setUsuari('Joan', 'Garcia', 'joan@example.com', '1234', 'Carrer Major 1', '612345678')
        .subscribe({ error: (err) => (errorResult = err) });

      const req = httpMock.expectOne('http://localhost:23000/registrar');
      req.flush({ message: 'El correu ja existeix' }, { status: 400, statusText: 'Bad Request' });

      expect(errorResult.error.message).toBe('El correu ja existeix');
    });

    it('ha de permetre cridar amb camps buits (validació delegada al servidor)', () => {
      service.setUsuari('', '', '', '', '', '').subscribe({ error: () => {} });

      const req = httpMock.expectOne('http://localhost:23000/registrar');
      expect(req.request.body).toEqual({
        nom: '', cognom: '', correu: '', passwd: '', direccio: '', telefon: '',
      });
      req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ─── confirmarcorreu ──────────────────────────────────────────────────────

  describe('confirmarcorreu()', () => {
    it('ha de fer POST a /ferregistre amb el token correcte', () => {
      service.confirmarcorreu('token-valid-123').subscribe();

      const req = httpMock.expectOne('http://localhost:23000/ferregistre');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: 'token-valid-123' });
      req.flush({ mensaje: 'Compte confirmat' });
    });

    it("ha de retornar el mensaje en cas d'èxit", () => {
      let result: { mensaje: string } | undefined;

      service.confirmarcorreu('token-valid-123').subscribe((res) => (result = res));

      const req = httpMock.expectOne('http://localhost:23000/ferregistre');
      req.flush({ mensaje: 'Compte confirmat' });

      expect(result?.mensaje).toBe('Compte confirmat');
    });

    it("ha de propagar error si el token no és vàlid", () => {
      let errorResult: any;

      service
        .confirmarcorreu('token-invalid')
        .subscribe({ error: (err) => (errorResult = err) });

      const req = httpMock.expectOne('http://localhost:23000/ferregistre');
      req.flush(
        { message: "Token invàlid o caducat" },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(errorResult.error.message).toBe("Token invàlid o caducat");
    });

    it("ha de propagar error si el token és una cadena buida", () => {
      let errorResult: any;

      service.confirmarcorreu('').subscribe({ error: (err) => (errorResult = err) });

      const req = httpMock.expectOne('http://localhost:23000/ferregistre');
      req.flush({ message: 'Token buit' }, { status: 400, statusText: 'Bad Request' });

      expect(errorResult.status).toBe(400);
    });
  });

  // ─── checkSessio ──────────────────────────────────────────────────────────

  describe('checkSessio()', () => {
    it('ha de posar iniciatSessio a true si el servidor retorna un token vàlid', () => {
      service.checkSessio();

      const req = httpMock.expectOne('http://localhost:23000/loggedin');
      req.flush({ token: mockJwt });

      expect(service.getIniciatSessioValue()).toBe(true);
    });

    it('ha de posar iniciatSessio a false si el servidor retorna 401', () => {
      service.checkSessio();

      const req = httpMock.expectOne('http://localhost:23000/loggedin');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(service.getIniciatSessioValue()).toBe(false);
    });

    it("ha de desar les dades de l'usuari descodificades del JWT", () => {
      service.checkSessio();

      const req = httpMock.expectOne('http://localhost:23000/loggedin');
      req.flush({ token: mockJwt });

      expect(service.getDades()).toEqual(mockUsuariData);
    });
  });

  // ─── setDades / getDades ──────────────────────────────────────────────────

  describe('setDades() / getDades()', () => {
    it("ha de desar i recuperar les dades de l'usuari correctament", () => {
      service.setDades(mockUsuariData);
      expect(service.getDades()).toEqual(mockUsuariData);
    });

    it('inicialment les dades han de ser null (checkSessio va fallar al beforeEach)', () => {
      expect(service.getDades()).toBeNull();
    });
  });

  // ─── setIniciatSessio / getIniciatSessio ──────────────────────────────────

  describe('setIniciatSessio() / getIniciatSessio()', () => {
    it('ha de retornar false per defecte', async () => {
      const val = await new Promise<boolean>((resolve) => {
        service.getIniciatSessio().subscribe(resolve);
      });
      expect(val).toBe(false);
    });

    it("ha d'emetre true quan s'estableix a true", async () => {
      service.setIniciatSessio(true);
      const val = await new Promise<boolean>((resolve) => {
        service.getIniciatSessio().subscribe(resolve);
      });
      expect(val).toBe(true);
    });

    it('getIniciatSessioValue() ha de retornar el valor síncron actual', () => {
      service.setIniciatSessio(true);
      expect(service.getIniciatSessioValue()).toBe(true);

      service.setIniciatSessio(false);
      expect(service.getIniciatSessioValue()).toBe(false);
    });
  });

  // ─── limpiarUser ─────────────────────────────────────────────────────────

  describe('limpiarUser()', () => {
    it("ha de buidar les dades de l'usuari i posar sessió a false", () => {
      service.setDades(mockUsuariData);
      service.setIniciatSessio(true);

      service.limpiarUser();

      const dades = service.getDades();
      expect(dades?.nom).toBe('');
      expect(dades?.cognom).toBe('');
      expect(dades?.correu).toBe('');
      expect(service.getIniciatSessioValue()).toBe(false);
    });
  });
});