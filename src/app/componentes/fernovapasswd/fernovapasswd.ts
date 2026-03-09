import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

@Component({
  selector: 'app-fernovapasswd',
  imports: [FormsModule],
  templateUrl: './fernovapasswd.html',
  styleUrl: './fernovapasswd.css',
})
export class Fernovapasswd{

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
  }

  public actualitzarpasswd(passwd: string){
    this.usuaridades.actualizarpasswd(passwd, this.token).subscribe({
      next: (res) => {
        alert(res.mensaje)
        this.usuaridades.limpiarUser()
        this.router.navigate(["/registre"])
      },
      error: (err) => {
        alert(err.error.message)
      }
    })
  }
}
