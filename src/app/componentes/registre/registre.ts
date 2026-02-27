import { Component, OnInit } from '@angular/core';
import { IniciarSessio, Registrar, Usuaridades } from '../../serveis/usuaridades/usuaridades';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registre',
  imports: [FormsModule],
  templateUrl: './registre.html',
  styleUrl: './registre.css',
})
export class Registre implements OnInit{
  constructor(private usuariDades: Usuaridades, private iniciaSessio: IniciarSessio, 
    private registrarservei: Registrar, private router: Router){}

  ngOnInit(): void {
    if(this.iniciaSessio.getIniciatSessio()){
      this.anarAPanell()
    }
  }

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

    this.nom = '';
    this.cognom = '';
    this.email = '';
    this.passwd = '';
    this.direccio = '';
    this.telefon = '';
  }

  public iniciarSessio(){
    if (!this.loginEmail || !this.loginPass) {
      alert('Rellena todos los campos');
      return;
    }

    this.usuariDades.iniciarSessio(this.loginEmail, this.loginPass);

    if (this.iniciaSessio.getIniciatSessio()) {
      alert('Sesión iniciada correctamente');
      this.anarAPanell()
    } else {
      alert('Correo o contraseña incorrectos');
    }

    this.loginEmail = '';
    this.loginPass = '';
  }


  public anarAPanell(){
    this.router.navigate(['/panelusuari']);
  }

  public iniciatSessio(){
    return this.iniciaSessio.getIniciatSessio()
  }

}
