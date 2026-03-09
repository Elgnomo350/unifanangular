import { Component, OnInit } from '@angular/core';
import { Getroute } from '../../serveis/getroute/getroute';
import { Router, RouterLink } from "@angular/router";
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

@Component({
  selector: 'app-cistella',
  imports: [RouterLink],
  templateUrl: './cistella.html',
  styleUrl: './cistella.css',
})
export class Cistella implements OnInit{

  private total: number = 0;

  constructor(
    private getroute: Getroute,
    private manejarcistella: Manejarcistella,
    private router: Router,
    private usuaridades: Usuaridades
  ) {
  }

  ngOnInit(): void {
      if(!this.usuaridades.getIniciatSessioValue()){
      alert("No puedes tenir una cesta sin una cuenta, no te preocupes, si inicias sesión por primera vez tu cesta se guarda");
      this.router.navigate(["/registre"]);
      }
    }

  public cgetroute(path: string) {
    return this.getroute.getroute(path);
  }

  public getcistella() {
    return this.manejarcistella.gcistella;
  }

  public sumTotal() {
    this.total = 0;

    for (let index = 0; index < this.manejarcistella.gcistella.length; index++) {
      this.total += this.manejarcistella.gcistella[index].preutotal;
    }

    document.getElementById("total")!.textContent =
      "Total: " + this.retornarPreuArrodonit(this.total) + "€";
  }

  public retornarPreuArrodonit(num: number) {
    return Math.round(num * 100) / 100;
  }

  public buidarcistella() {
    this.manejarcistella.buidarcistella();
  }

  public borrarelement(index: number) {
    this.manejarcistella.eliminarProducto(index);
  }

  public sumarUnaUnitat(index: number) {
    const item = this.manejarcistella.gcistella[index];

    item.quantitatcomprada += 1;
    item.preutotal += item.preuperunitat;
  }

  public restarUnaUnitat(index: number) {
    const item = this.manejarcistella.gcistella[index];

    if (item.quantitatcomprada <= 1) {
      this.borrarelement(index);
      return;
    }

    item.quantitatcomprada -= 1;
    item.preutotal -= item.preuperunitat;
  }
}