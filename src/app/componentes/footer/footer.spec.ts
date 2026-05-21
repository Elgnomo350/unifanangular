import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Observable, of, throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Footer } from './footer';
import { Getroute } from '../../serveis/getroute/getroute';
import { Ia } from '../../serveis/ia/ia';

// ─── Helpers ────────────────────────────────────────────────────────────────

function createBtn(id: string, tag: 'button' | 'input' = 'button') {
  const el = document.createElement(tag) as HTMLButtonElement | HTMLInputElement;
  el.id = id;
  document.body.appendChild(el);
  return el;
}

// ─── Mocks ──────────────────────────────────────────────────────────────────

const getrouteMock = { getroute: vi.fn((path: string) => `/mocked/${path}`) };
const iaMock = { enviarChatbot: vi.fn() };

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  let cdrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, FormsModule],
      providers: [
        provideRouter([]),
        { provide: Getroute, useValue: getrouteMock },
        { provide: Ia,       useValue: iaMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ChangeDetectorRef is a view-level token — Angular always injects its own
    // instance into the component regardless of TestBed providers.
    // We must spy on the real instance obtained from the component's injector.
    const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
    cdrSpy = vi.spyOn(cdr, 'detectChanges');

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.getElementById('enviarChatbot')?.remove();
    document.getElementById('enviarChatbotEnter')?.remove();
    vi.useRealTimers();
  });

  // ── getroute delegation ────────────────────────────────────────────────────

  describe('cgetroute()', () => {
    it('delegates to the Getroute service and returns its value', () => {
      const result = component.cgetroute('home');
      expect(getrouteMock.getroute).toHaveBeenCalledWith('home');
      expect(result).toBe('/mocked/home');
    });
  });

  // ── chat visibility toggle ─────────────────────────────────────────────────

  describe('getVChat() / setVChat()', () => {
    it('starts as false', () => {
      expect(component.getVChat()).toBe(false);
    });

    it('setVChat(true) makes getVChat() return true', () => {
      component.setVChat(true);
      expect(component.getVChat()).toBe(true);
    });

    it('setVChat(false) makes getVChat() return false', () => {
      component.setVChat(true);
      component.setVChat(false);
      expect(component.getVChat()).toBe(false);
    });
  });

  // ── initial chat messages ──────────────────────────────────────────────────

  describe('getChatMensajes()', () => {
    it('returns an array with the initial AI greeting', () => {
      const msgs = component.getChatMensajes();
      expect(msgs).toHaveLength(1);
      expect(msgs[0]).toEqual({ text: 'Hola 👋 ¿En qué puedo ayudarte?', enviatPer: 'ai' });
    });
  });

  // ── MsjChatbot accessor ────────────────────────────────────────────────────

  describe('MsjChatbot', () => {
    it('getter returns empty string by default', () => {
      expect(component.MsjChatbot).toBe('');
    });

    it('setter updates the value returned by the getter', () => {
      component.MsjChatbot = 'hola';
      expect(component.MsjChatbot).toBe('hola');
    });
  });

  // ── enviarChatbot() – empty message guard ──────────────────────────────────

  describe('enviarChatbot() with empty/blank message', () => {
    it('does not call ia.enviarChatbot when message is blank', async () => {
      createBtn('enviarChatbot');
      createBtn('enviarChatbotEnter', 'input');

      component.MsjChatbot = '   ';
      await component.enviarChatbot();

      expect(iaMock.enviarChatbot).not.toHaveBeenCalled();
    });

    it('still pushes the blank user message and the waiting placeholder', async () => {
      createBtn('enviarChatbot');
      createBtn('enviarChatbotEnter', 'input');

      component.MsjChatbot = '   ';
      await component.enviarChatbot();

      // Initial greeting + user blank msg + ai placeholder = 3
      expect(component.getChatMensajes()).toHaveLength(3);
    });
  });

  // ── enviarChatbot() – success path ────────────────────────────────────────

  describe('enviarChatbot() – success', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      createBtn('enviarChatbot');
      createBtn('enviarChatbotEnter', 'input');
    });

    it('adds user message and calls ia.enviarChatbot with the query', async () => {
      iaMock.enviarChatbot.mockReturnValue(of({ respuesta: 'Hola!' }));

      component.MsjChatbot = 'Pregunta de prueba';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      expect(iaMock.enviarChatbot).toHaveBeenCalledWith(
        'Pregunta de prueba',
        expect.any(Array),
      );
    });

    it('clears MsjChatbot after sending', async () => {
      iaMock.enviarChatbot.mockReturnValue(of({ respuesta: 'OK' }));

      component.MsjChatbot = 'Algo';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      expect(component.MsjChatbot).toBe('');
    });

    it('final AI message equals the full response text', async () => {
      const respuesta = 'Respuesta completa';
      iaMock.enviarChatbot.mockReturnValue(of({ respuesta }));

      component.MsjChatbot = 'test';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      const msgs = component.getChatMensajes();
      const lastMsg = msgs[msgs.length - 1];
      expect(lastMsg.enviatPer).toBe('ai');
      expect(lastMsg.text).toBe(respuesta);
    });

    it('re-enables the button and input after success', async () => {
      iaMock.enviarChatbot.mockReturnValue(of({ respuesta: 'OK' }));

      const btn   = document.getElementById('enviarChatbot')    as HTMLButtonElement;
      const input = document.getElementById('enviarChatbotEnter') as HTMLInputElement;

      component.MsjChatbot = 'test';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      expect(btn.disabled).toBe(false);
      expect(input.disabled).toBe(false);
    });


    it('passes chat history WITHOUT the waiting placeholder to the service', async () => {
      iaMock.enviarChatbot.mockReturnValue(of({ respuesta: 'OK' }));

      component.MsjChatbot = 'Mi consulta';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      const [, historyArg] = iaMock.enviarChatbot.mock.calls[0];
      const waitingTexts = (historyArg as { text: string }[]).filter(m =>
        m.text.startsWith('Espera un minuto'),
      );
      expect(waitingTexts).toHaveLength(0);
    });
  });

  // ── enviarChatbot() – error path ───────────────────────────────────────────

  describe('enviarChatbot() – error', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      createBtn('enviarChatbot');
      createBtn('enviarChatbotEnter', 'input');
    });

    it('displays an error message when the service fails', async () => {
      const errorMsg = 'Timeout';
      iaMock.enviarChatbot.mockReturnValue(
        throwError(() => ({ error: { message: errorMsg } })),
      );

      component.MsjChatbot = 'pregunta';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      const msgs = component.getChatMensajes();
      const lastMsg = msgs[msgs.length - 1];
      expect(lastMsg.enviatPer).toBe('ai');
      expect(lastMsg.text).toContain('Lo siento, he tenido un error:');
      expect(lastMsg.text).toContain(errorMsg);
    });

    it('re-enables the button and input after an error', async () => {
      iaMock.enviarChatbot.mockReturnValue(
        throwError(() => ({ error: { message: 'fail' } })),
      );

      const btn   = document.getElementById('enviarChatbot')    as HTMLButtonElement;
      const input = document.getElementById('enviarChatbotEnter') as HTMLInputElement;

      component.MsjChatbot = 'pregunta';
      const promise = component.enviarChatbot();
      await vi.runAllTimersAsync();
      await promise;

      expect(btn.disabled).toBe(false);
      expect(input.disabled).toBe(false);
    });
  });

  // ── waiting animation interval ─────────────────────────────────────────────

  describe('waiting animation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      createBtn('enviarChatbot');
      createBtn('enviarChatbotEnter', 'input');
    });

    it('cycles through the 4 waiting texts while the request is pending', async () => {
      let resolveObs!: (v: { respuesta: string }) => void;
      iaMock.enviarChatbot.mockReturnValue(
        new Observable((observer) => {
          resolveObs = (v) => { observer.next(v); observer.complete(); };
        }),
      );

      component.MsjChatbot = 'test';
      const promise = component.enviarChatbot();

      // Let the interval fire a few times
      vi.advanceTimersByTime(2000);

      const msgs = component.getChatMensajes();
      const aiPlaceholder = msgs[msgs.length - 1];
      expect(aiPlaceholder.enviatPer).toBe('ai');
      expect(aiPlaceholder.text).toMatch(/^Espera un minuto/);

      // Resolve and finish
      resolveObs({ respuesta: 'Listo' });
      await vi.runAllTimersAsync();
      await promise;
    });
  });
});