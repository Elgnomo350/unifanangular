import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Getasset } from '../../serveis/getasset/getasset';
import { Getroute } from '../../serveis/getroute/getroute';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  //Punto 4.2 de la parte de investigacion
  Usuari = "Manolo"
  constructor(private getasset: Getasset, private getroute: Getroute){
  }

  public cgetpath(path: string){
    return this.getasset.getpath(path);
  }

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }

}
