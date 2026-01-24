import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Getasset } from '../../serveis/getasset/getasset';
import { Getroute } from '../../serveis/getroute/getroute';
import { IniciarSessio } from '../../serveis/usuaridades/usuaridades';
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header{

  constructor(private getasset: Getasset, private getroute: Getroute, private iniciarSessio: IniciarSessio,
    private manejarCistella: Manejarcistella, private router: Router){
  }  

  public getNumProductes(){
    let num = 0
    for (let index = 0; index < this.manejarCistella.gcistella.length; index++) {
      num += this.manejarCistella.gcistella[index].gquantitat
    }
    return this.iniciarSessio.getIniciatSessio() ? num : 0
  }
  public tancarSessio() {
    this.iniciarSessio.tancarSessio();
    alert('Sesión cerrada');
    this.router.navigate(['/registre']);
  }

  public iniciatSessio(){
    return this.iniciarSessio.getIniciatSessio()
  }

  public getNom(){
   return this.iniciarSessio.getUsuariIniciat()?.Nom || ""
  }

  public cgetpath(path: string){
    return this.getasset.getpath(path);
  }

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }

}
