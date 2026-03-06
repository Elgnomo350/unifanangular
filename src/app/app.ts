import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
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
export class App implements OnInit{
  protected readonly title = signal('unifanangular');
  constructor(private usuariDades: Usuaridades, private cgr: ChangeDetectorRef){}
  
  ngOnInit(): void {
    this.usuariDades.checkSessio()
  }
}
