import { Component, OnInit } from '@angular/core';
import { Usuaridades, UsuariData } from '../../serveis/usuaridades/usuaridades';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-registre',
  imports: [FormsModule],
  templateUrl: './registre.html',
  styleUrl: './registre.css',
})
export class Registre implements OnInit{
  constructor(private usuariDades: Usuaridades,private router: Router){}

  nom = '';
  cognom = '';
  email = '';
  passwd = '';
  direccio = '';
  telefon = '';
  loginEmail = '';
  loginPass = '';

  ngOnInit(): void {
    this.usuariDades.getIniciatSessio().subscribe(iniciat => {
      if(iniciat){
        this.anarAPanell()
      }
    })
  }

  public registrarse(){

    this.usuariDades.setUsuari(this.nom, this.cognom, this.email, this.passwd, this.direccio, this.telefon)
    .subscribe({
    next: (res) => {
      alert(res.mensaje);

      this.nom = ''
      this.cognom = '';
      this.email = '';
      this.passwd = '';
      this.direccio = '';
      this.telefon = '';

    },
    error: (err) => {
      alert(err.error.message);
    }
  });
  }

  public iniciarSessio(){
    this.usuariDades.iniciarSessio(this.loginEmail, this.loginPass).subscribe({
      next: (res) => {
        alert(res.mensaje)

        const dades = jwtDecode<UsuariData>(res.token);
        this.usuariDades.setDades(dades)
        this.usuariDades.setIniciatSessio(true);

        this.loginEmail = '';
        this.loginPass = '';

        this.anarAPanell()
      },
      error: (err) => {
        alert(err.error.message)
      }
    })
  }

  public anarAPanell(){
    this.router.navigate(['/panelusuari']);
  }

  public recuperarpasswd(){
    this.router.navigate(["/recuperarpasswd"])
  }

}
