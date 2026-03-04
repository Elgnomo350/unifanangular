import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
    private router: Router
  ) {}

  ngOnInit(): void {
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

}
