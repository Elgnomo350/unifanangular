import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Registrar, IniciarSessio, UsuariData } from '../../serveis/usuaridades/usuaridades';
import { Router } from '@angular/router';

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

  constructor(
    private registrar: Registrar,
    private iniciaSessio: IniciarSessio,
    private router: Router
  ) {}

  ngOnInit(): void {
    if(!this.iniciaSessio.getIniciatSessio()){
    alert("Inicia sesion per entrar aqui")
    this.router.navigate(['/registre']);
    }
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

  get usuariIniciat(): UsuariData | null {
    return this.iniciaSessio.getUsuariIniciat();
  }

  get iniciat(): boolean {
    return this.iniciaSessio.getIniciatSessio();
  }

  tancarSessio() {
    this.iniciaSessio.tancarSessio();
    alert('Sesión cerrada');
    this.router.navigate(['/registre']);
  }

  eliminarCuenta() {
    if (!this.usuariIniciat) return;

    const confirmar = confirm('¿Seguro que quieres eliminar tu cuenta?');
    if (!confirmar) return;

    this.registrar.clearUsuari(this.usuariIniciat.Correu);
    this.tancarSessio();
  }

  eliminarTodasCuentas() {
    const confirmar = confirm('¿Seguro que quieres eliminar todas las cuentas?');
    if (!confirmar) return;

    this.registrar.clearAll();
    this.tancarSessio();
  }

}
