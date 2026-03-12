import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

@Component({
  selector: 'app-confirmarcambiocorreo',
  imports: [],
  templateUrl: './confirmarcambiocorreo.html',
  styleUrl: './confirmarcambiocorreo.css',
})
export class Confirmarcambiocorreo {
  private token: string = ""

  public constructor(private aroute: ActivatedRoute, private router: Router, private usuaridades: Usuaridades){
    this.aroute.queryParams.subscribe(params => {
    const token = params['token'];

    if(!token){
      alert("No hay token, volviendo al index")
      this.router.navigate(["/index"])
    }

    this.token = token
  });

  this.usuaridades.confirmarcambiocorreo(this.token).subscribe({
    next: (res) => {
      alert(res.mensaje)
      this.usuaridades.limpiarUser()
      this.router.navigate(["/registre"])
    },
    error: (err) => {
      alert(err.error.message)
      this.router.navigate(["/index"])
    }
  })
  }

}
