import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Header } from './componentes/header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from './componentes/footer/footer';
import { Usuaridades } from './serveis/usuaridades/usuaridades';
import { Bbddsql } from './serveis/bbddsql/bbddsql';


@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('unifanangular');
  constructor(private usuariDades: Usuaridades, private bbddsql: Bbddsql){}
  
  ngOnInit(): void {
    this.usuariDades.checkSessio()
    this.bbddsql.demanarProductesResponse()
  }
}
