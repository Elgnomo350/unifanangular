import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Manejarcistella {

  constructor() {}

  private cistellaarray: CistellaInterface[] = [];

  public get gcistella() {
    return this.cistellaarray;
  }

  public set gcistella(cistella: CistellaInterface[]){
    this.cistellaarray = cistella
  }

  public afegircistella(
    foto: string,
    nom: string,
    quantitatcomprada: number,
    preutotal: number,
    preuperunitat: number
  ) {
    let volver = false;

    this.cistellaarray.forEach(element => {
      if (element.nom === nom) {
        element.preutotal += element.preuperunitat * quantitatcomprada;
        element.quantitatcomprada += quantitatcomprada;
        volver = true;
      }
    });

    if (volver) return;

    this.cistellaarray.push({
      foto: foto,
      nom: nom,
      quantitatcomprada: quantitatcomprada,
      preutotal: preutotal,
      preuperunitat: preuperunitat
    });
  }

  public buidarcistella() {
    this.cistellaarray = [];
  }

  public eliminarProducto(index: number) {
    this.cistellaarray.splice(index, 1);
  }

  public sumar(item: CistellaInterface, quantitat: number) {
  item.preutotal += item.preuperunitat * quantitat;
  item.quantitatcomprada += quantitat;
}
}

export interface CistellaInterface {
  foto: string;
  nom: string;
  quantitatcomprada: number;
  preutotal: number;
  preuperunitat: number;
}