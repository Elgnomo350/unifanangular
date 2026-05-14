import { Injectable } from '@angular/core';
import * as tmImage from '@teachablemachine/image';
import { HttpClient } from '@angular/common/http';
import { Usuaridades } from '../usuaridades/usuaridades';
import { Manejarcistella } from '../manejarcistella/manejarcistella';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Ia {

  private model!: tmImage.CustomMobileNet;
  private webcam!: tmImage.Webcam;
  private running: boolean = false;

  constructor(private http: HttpClient, private usuaridades: Usuaridades, private manejarcistella: Manejarcistella,
    private router: Router
  ) {}

  async start() {
    if (this.running) return;
    this.running = true;


    this.model = await tmImage.load("http://localhost:23000/modelia/model.json", "http://localhost:23000/modelia/metadata.json");

    this.webcam = new tmImage.Webcam(300, 300, true);
    await this.webcam.setup();
    await this.webcam.play();

    this.loop();
  }

  stop() {
    this.running = false;
    if (this.webcam) {
      this.webcam.stop();
    }
  }

  private async loop() {
    if (!this.running) return;

    this.webcam!.update();
    await this.predict();

    requestAnimationFrame(() => this.loop());
  }

  private async predict() {
    const predictions = await this.model!.predict(this.webcam!.canvas);

    for (const p of predictions) {
      if (
        (p.className === 'Dedo medio' && p.probability > 0.30) ||
        (p.className === 'Dedo medio 2' && p.probability > 0.30)
      ) {
        this.triggerLogout();
      }
    }
  }

  private triggerLogout() {
    this.stop();
    this.usuaridades.cerrarSesion(this.manejarcistella.gcistella).subscribe({
      next: () => {
        alert("Tu sesión ha sido cerrada por un gesto obsceno")
        this.usuaridades.limpiarUser()
        this.router.navigate(["/registre"])
      },
      error: () => {
        alert("No hagas gestos obscenos o te cerraremos la sesión")
      }
    })
  }
}