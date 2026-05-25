import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';


@Component({
  selector: 'app-contacto',
  imports: [FormsModule, RecaptchaModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  constructor(private httpclient: HttpClient){}

  captchaToken: string | null = null;

  public enviarConsulta(correu: string, nom: string, consulta: string){

    if (!this.captchaToken) {
    alert("Completa el captcha");
    return;
    }

    this.httpclient.post<{mensaje: string}>("http://localhost:23000/hacerconsulta", {
      correu: correu,
      nom: nom,
      consulta: consulta,
      captcha: this.captchaToken
    }).subscribe({
      next: (res) => {
        alert(res.mensaje)
      },
      error: (err) => {
        alert(err.message)
      }
    })
  }

  onCaptchaResolved(token: string | null) {
  this.captchaToken = token;
  }
}
