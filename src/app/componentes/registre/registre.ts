import { Component } from '@angular/core';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-registre',
  imports: [FormsModule],
  templateUrl: './registre.html',
  styleUrl: './registre.css',
})
export class Registre{
  constructor(private usuariDades: Usuaridades,private router: Router){}

  nom = '';
  cognom = '';
  email = '';
  passwd = '';
  direccio = '';
  telefon = '';
  loginEmail = '';
  loginPass = '';


  public registrarse(){

    this.usuariDades.setUsuari(this.nom, this.cognom, this.email, this.passwd, this.direccio, this.telefon)
    .subscribe({
    next: (res) => {
      alert(res.mensaje);
    },
    error: (err) => {
      alert(err.error.message);
    }
  });

    this.nom = ''
    this.cognom = '';
    this.email = '';
    this.passwd = '';
    this.direccio = '';
    this.telefon = '';
  }

  public iniciarSessio(){
    this.usuariDades.iniciarSessio(this.loginEmail, this.loginPass).subscribe({
      next: (res) => {
        alert(res.mensaje)

        const dades = jwtDecode<Payload>(res.token);
        this.usuariDades.setDades(dades)
        this.usuariDades.setIniciatSessio(true);

      },
      error: (err) => {
        alert(err.error.message)
      },
      complete: () => {
          this.loginEmail = '';
          this.loginPass = '';
      }
    })
  }


  public anarAPanell(){
    this.router.navigate(['/panelusuari']);
  }

  public iniciatSessio(){
  }

}

export interface Payload {
  nom: string;
  cognom: string;
  correu: string;
  direccio: string;
  telefon: string;
} 
