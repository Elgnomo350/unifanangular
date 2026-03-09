import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

@Component({
  selector: 'app-confirmarusuari',
  imports: [],
  templateUrl: './confirmarusuari.html',
  styleUrl: './confirmarusuari.css',
})
export class Confirmarusuari {
  private token: string = ""

  public constructor(private aroute: ActivatedRoute, private router: Router, private usuaridades: Usuaridades){
    this.aroute.queryParams.subscribe(params => {
    const token = params['token'];

    if(!token){
      alert("No hay token, volviendo al registro")
      this.router.navigate(["/registre"])
    }

    this.token = token
  });

  this.usuaridades.confirmarcorreu(this.token).subscribe({
    next: (res) => {
      alert(res.mensaje)
      this.router.navigate(["/registre"])
    },
    error: (err) => {
      alert(err.error.message)
      this.router.navigate(["/registre"])
    }
  })
  }

}
