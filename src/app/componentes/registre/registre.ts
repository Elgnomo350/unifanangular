import { Component, OnInit } from '@angular/core';
import { IniciarSessio, Registrar, Usuaridades } from '../../serveis/usuaridades/usuaridades';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';

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
    if (!this.nom || !this.cognom || !this.email || !this.passwd || !this.direccio || !this.telefon) {
      alert('Rellena los campos obligatorios');
      return;
    }

    if(this.registrarservei.getUsuaris()[this.email]){
      alert('Ja hi ha aquest correu registrat');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      alert("Email con formato incorrecto, sigue el formato text@text.text")
      return;
    }

    const telefonoRegex = /^[0-9]{9}$/;

    if (!telefonoRegex.test(this.telefon)) {
      alert("Numero con formato incorrecto, pon 9 digitos juntos");
      return;
    }

    this.usuariDades.setUsuari(this.nom, this.cognom, this.email, this.passwd, this.direccio, this.telefon).subscribe((res) => {
      alert(res.mensaje)
    })

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
