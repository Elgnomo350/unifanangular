import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import {
  vi,
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
} from 'vitest';

let mockPredictions: {
  className: string;
  probability: number;
}[] = [];

const mockWebcam = {
  setup: vi.fn(() => Promise.resolve()),
  play: vi.fn(() => Promise.resolve()),
  update: vi.fn(),
  stop: vi.fn(),
  canvas: {} as HTMLCanvasElement,
};

const mockModel = {
  predict: vi.fn(() => Promise.resolve(mockPredictions)),
};

vi.mock('@teachablemachine/image', () => {
  function WebcamMock() {
    return mockWebcam;
  }

  WebcamMock.prototype = mockWebcam;

  return {
    load: vi.fn(() => Promise.resolve(mockModel)),
    Webcam: WebcamMock,
  };
});

import { Ia, ChatMessage } from './ia';
import { Usuaridades } from '../usuaridades/usuaridades';
import { Manejarcistella } from '../manejarcistella/manejarcistella';

const mockUsuaridades = {
  cerrarSesion: vi.fn(),
  limpiarUser: vi.fn(),
};

const mockManejarcistella = {
  gcistella: [],
};

const mockRouter = {
  navigate: vi.fn(),
};

function getLastRafFn(): (() => void) | undefined {
  const rAF = window.requestAnimationFrame as unknown as ReturnType<
    typeof vi.fn
  >;

  return rAF.mock.calls.at(-1)?.[0];
}

describe('Ia', () => {
  let service: Ia;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    mockUsuaridades.cerrarSesion.mockReset();
    mockUsuaridades.limpiarUser.mockReset();

    mockRouter.navigate.mockReset();

    mockWebcam.setup.mockReset();
    mockWebcam.setup.mockReturnValue(Promise.resolve());

    mockWebcam.play.mockReset();
    mockWebcam.play.mockReturnValue(Promise.resolve());

    mockWebcam.update.mockReset();
    mockWebcam.stop.mockReset();

    mockModel.predict.mockReset();
    mockModel.predict.mockImplementation(() =>
      Promise.resolve(mockPredictions)
    );

    mockPredictions = [];

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(function () {
      return 0;
    });

    vi.spyOn(window, 'alert').mockImplementation(function () {});

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Ia,
        { provide: Usuaridades, useValue: mockUsuaridades },
        { provide: Manejarcistella, useValue: mockManejarcistella },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(Ia);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
    service?.stop();

    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('start()', () => {
    it('should load model and set up webcam', async () => {
      const tmImage = await import('@teachablemachine/image');

      await service.start();

      expect(tmImage.load).toHaveBeenCalledWith(
        'http://localhost:23000/modelia/model.json',
        'http://localhost:23000/modelia/metadata.json'
      );

      expect(mockWebcam.setup).toHaveBeenCalled();
      expect(mockWebcam.play).toHaveBeenCalled();
    });

    it('should not reload the model if already running', async () => {
  const tmImage = await import('@teachablemachine/image');

  vi.mocked(tmImage.load).mockClear();

  await service.start();
  await service.start();

  expect(tmImage.load).toHaveBeenCalledTimes(1);
});

    it('should call requestAnimationFrame to continue the loop', async () => {
      await service.start();

      await Promise.resolve();
      await Promise.resolve();

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('stop()', () => {
    it('should stop the webcam after start', async () => {
      await service.start();

      service.stop();

      expect(mockWebcam.stop).toHaveBeenCalled();
    });

    it('should not throw if called before start', () => {
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('predict() — no logout gesture', () => {
    it('should not trigger logout when probability is below threshold', async () => {
      mockPredictions = [
        {
          className: 'Dedo medio',
          probability: 0.1,
        },
        {
          className: 'Thumbs up',
          probability: 0.9,
        },
      ];

      mockUsuaridades.cerrarSesion.mockReturnValue(of({}));

      await service.start();

      const loopFn = getLastRafFn();

      if (loopFn) {
        await loopFn();
      }

      await Promise.resolve();

      expect(mockUsuaridades.cerrarSesion).not.toHaveBeenCalled();
    });
  });

  describe('predict() — obscene gesture triggers logout', () => {
    it('should call cerrarSesion when "Dedo medio" probability > 0.30', async () => {
      mockPredictions = [
        {
          className: 'Dedo medio',
          probability: 0.8,
        },
      ];

      mockUsuaridades.cerrarSesion.mockReturnValue(of({}));

      await service.start();

      const loopFn = getLastRafFn();

      if (loopFn) {
        await loopFn();
      }

      expect(mockUsuaridades.cerrarSesion).toHaveBeenCalledWith(
        mockManejarcistella.gcistella
      );
    });

    it('should call cerrarSesion when "Dedo medio 2" probability > 0.30', async () => {
      mockPredictions = [
        {
          className: 'Dedo medio 2',
          probability: 0.5,
        },
      ];

      mockUsuaridades.cerrarSesion.mockReturnValue(of({}));

      await service.start();

      const loopFn = getLastRafFn();

      if (loopFn) {
        await loopFn();
      }

      expect(mockUsuaridades.cerrarSesion).toHaveBeenCalled();
    });
  });

  describe('triggerLogout() — cerrarSesion succeeds', () => {
    beforeEach(async () => {
      mockPredictions = [
        {
          className: 'Dedo medio',
          probability: 0.99,
        },
      ];

      mockUsuaridades.cerrarSesion.mockReturnValue(of({}));

      await service.start();

      const loopFn = getLastRafFn();

      if (loopFn) {
        await loopFn();
      }
    });

    it('should stop the webcam', () => {
      expect(mockWebcam.stop).toHaveBeenCalled();
    });

    it('should call limpiarUser', () => {
      expect(mockUsuaridades.limpiarUser).toHaveBeenCalled();
    });

    it('should navigate to /registre', () => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/registre']);
    });

    it('should show alert about obscene gesture', () => {
      expect(window.alert).toHaveBeenCalledWith(
        'Tu sesión ha sido cerrada por un gesto obsceno'
      );
    });
  });

  describe('triggerLogout() — cerrarSesion fails', () => {
    beforeEach(async () => {
      mockPredictions = [
        {
          className: 'Dedo medio',
          probability: 0.99,
        },
      ];

      mockUsuaridades.cerrarSesion.mockReturnValue(
        throwError(() => new Error('network error'))
      );

      await service.start();

      const loopFn = getLastRafFn();

      if (loopFn) {
        await loopFn();
      }
    });

    it('should show a warning alert on error', () => {
      expect(window.alert).toHaveBeenCalledWith(
        'No hagas gestos obscenos o te cerraremos la sesión'
      );
    });

    it('should not call limpiarUser on error', () => {
      expect(mockUsuaridades.limpiarUser).not.toHaveBeenCalled();
    });

    it('should not navigate on error', () => {
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('enviarChatbot()', () => {
    const chat: ChatMessage[] = [
      {
        text: 'Hola',
        enviatPer: 'user',
      },
      {
        text: 'Hola, ¿cómo puedo ayudarte?',
        enviatPer: 'ai',
      },
    ];

    it('should POST to /chatbot and return the response', () => {
      service
        .enviarChatbot('¿Tenéis camisetas?', chat)
        .subscribe((res) => {
          expect(res.respuesta).toBe(
            'Sí, tenemos varias opciones.'
          );
        });

      const req = httpMock.expectOne(
        'http://localhost:23000/chatbot'
      );

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({
        consulta: '¿Tenéis camisetas?',
        chat,
      });

      req.flush({
        respuesta: 'Sí, tenemos varias opciones.',
      });
    });

    it('should include the exact consulta in the request body', () => {
      service.enviarChatbot('precio de camiseta', []).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:23000/chatbot'
      );

      expect(req.request.body.consulta).toBe(
        'precio de camiseta'
      );

      req.flush({
        respuesta: '20€',
      });
    });

    it('should propagate HTTP errors', () => {
      let error: any;

      service.enviarChatbot('test', []).subscribe({
        error: err => (error = err),
      });

      const req = httpMock.expectOne(
        'http://localhost:23000/chatbot'
      );

      req.flush(
        {
          message: 'Server error',
        },
        {
          status: 500,
          statusText: 'Internal Server Error',
        }
      );

      expect(error).toBeTruthy();
      expect(error.status).toBe(500);
    });
  });
});