import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

@Component({
  selector: 'app-recuperarpasswd',
  imports: [FormsModule],
  templateUrl: './recuperarpasswd.html',
  styleUrl: './recuperarpasswd.css',
})
export class Recuperarpasswd{

public constructor(private usuaridades: Usuaridades){}
 
public getPasswdEmail(correu: string){
  this.usuaridades.conseguirtokenpasswd(correu).subscribe({
    next: (res) => {
      alert(res.mensaje)
    },
    error: (err) => {
      alert(err.error.message)
    }
  })
}

}

