import { Component } from '@angular/core';
import { Getroute } from '../../serveis/getroute/getroute';
import { RouterLink } from "@angular/router";
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';


@Component({
  selector: 'app-cistella',
  imports: [RouterLink],
  templateUrl: './cistella.html',
  styleUrl: './cistella.css',
})
export class Cistella {

  private total: number = 0

    constructor(private getroute: Getroute, private manejarcistella: Manejarcistella){
    }
  
    public cgetroute(path: string){
      return this.getroute.getroute(path);
    }

    public getcistella(){
      return this.manejarcistella.gcistella
    }

    public sumTotal(){
      this.total = 0
      for (let index = 0; index < this.manejarcistella.gcistella.length; index++) {
        this.total += this.manejarcistella.gcistella[index].gpreutotal
      }

      document.getElementById("total")!.textContent = "Total: " + this.retornarPreuArrodonit(this.total) + "€"
    }

    public retornarPreuArrodonit(num: number){
      return Math.round(num * 100) / 100
    }

    public buidarcistella(){
      this.manejarcistella.buidarcistella()
    }

    public borrarelement(index: number){
      this.manejarcistella.eliminarProducto(index)
    }

    public sumarUnaUnitat(index: number){
      this.manejarcistella.gcistella.at(index)?.sumar(1)
    }


    public restarUnaUnitat(index: number){
      this.manejarcistella.gcistella.at(index)?.sumar(-1)
    }
}
