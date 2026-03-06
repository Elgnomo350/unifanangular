import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

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

  constructor(private router: Router, private usuariDades: Usuaridades,  ) {}

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
        this.usuariDades.setIniciatSessio(false)
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
        this.usuariDades.setIniciatSessio(false)
        this.router.navigate(["/registre"])
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

}
