import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Usuaridades, UsuariData } from '../../serveis/usuaridades/usuaridades';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-panelusuari',
  imports: [],
  templateUrl: './panelusuari.html',
  styleUrl: './panelusuari.css',
})
export class Panelusuari implements OnInit{

  //Parte donde se ve el 4.3 de la investigacion, @ViewChild
  @ViewChild('nombre') nombre!: ElementRef<HTMLParagraphElement>;
  @ViewChild('cognom') cognom!: ElementRef<HTMLParagraphElement>;
  private canmbiarrojo: boolean = true;

  constructor(private router: Router, private usuariDades: Usuaridades) {}

  ngOnInit(): void {
    this.usuariDades.getIniciatSessio().subscribe(iniciat => {
      if(!iniciat){
        this.router.navigate(["/registre"])
      }
    }
    )
  }

  public getUserDades(){
    return this.usuariDades.getDades()
  }

  ponerNombreRojo() {
    this.nombre.nativeElement.style.color = this.canmbiarrojo ? 'red' : 'black'
    this.canmbiarrojo = !this.canmbiarrojo
  }

  ponerCognomAzul() {
    this.cognom.nativeElement.style.color = 'blue';
  }

  quitarCognomAzul() {
    this.cognom.nativeElement.style.color = 'black';
  }
  
  public cerrarSesion(){
    this.usuariDades.cerrarSesion().subscribe({
      next: (res) => {
        alert(res.mensaje)
        this.usuariDades.limpiarUser()
        this.router.navigate(["/registre"])
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

  public eliminarMiCuenta(){
    this.usuariDades.borrarMiCuenta().subscribe({
      next: (res) => {
        alert(res.mensaje)
        this.usuariDades.limpiarUser()
        this.router.navigate(["/registre"])
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

  private editando: Record<string, boolean> = {
  nom: false,
  cognom: false,
  correu: false,
  direccio: false,
  telefon: false,
  infoSensibles: false,
  correo: false,
  passwd: false
  };

  public getPropietats(){
    return this.editando
  }

  public toggleEditar(campo: string){
    this.editando[campo] = !this.editando[campo];
  }

  public modificarCampo(campo: string, contenido: string){
    this.usuariDades.modificarDatos(campo, contenido).subscribe({
      next: (res) => {
        const dades = jwtDecode<UsuariData>(res.token);
        this.usuariDades.setDades(dades)
        alert(res.mensaje)
        window.location.reload();
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

  public modificarCorreo(correu: string){
    this.usuariDades.modificarCorreo(correu).subscribe({
      next: (res) => {
        alert(res.mensaje)
        this.usuariDades.limpiarUser()
        this.router.navigate(["/registre"])
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

  public cambiarPasswd(nuevaPasswd: string){
    this.usuariDades.cambiarPasswd(nuevaPasswd).subscribe({
      next: (res) => {
        this.usuariDades.limpiarUser()
        alert(res.mensaje)
        this.router.navigate(["/registre"])
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

}
