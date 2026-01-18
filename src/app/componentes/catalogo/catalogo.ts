import { Component } from '@angular/core';
import { Getasset } from '../../serveis/getasset/getasset';

@Component({
  selector: 'app-catalogo',
  imports: [],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
    constructor(private getasset: Getasset){
    }
  
    public cgetpath(path: string){
      return this.getasset.getpath(path);
    }
}
