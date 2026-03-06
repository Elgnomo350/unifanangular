import { Component, signal } from '@angular/core';
import { Header } from './componentes/header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from './componentes/footer/footer';
import { Usuaridades } from './serveis/usuaridades/usuaridades';


@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('unifanangular');
  constructor(private usuariDades: Usuaridades){
    this.usuariDades.checkSessio()
  }
}
