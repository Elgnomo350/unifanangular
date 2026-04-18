import { Injectable } from '@angular/core';
import { Bbddsql } from '../bbddsql/bbddsql';

@Injectable({
  providedIn: 'root',
})
export class Manejarcistella {

  constructor(private bbddsql: Bbddsql) {}

  private cistellaarray: CistellaInterface[] = [];

  public get gcistella() {
    return this.cistellaarray;
  }

  public set gcistella(cistella: CistellaInterface[]){
    this.cistellaarray = cistella
  }

  public afegircistella(
    id: number,
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
      id: id,
      foto: foto,
      nom: nom,
      quantitatcomprada: quantitatcomprada,
      preutotal: preutotal,
      preuperunitat: preuperunitat
    });
  }

  public comprarCistella(){
    return this.bbddsql.registrarCompra(this.cistellaarray)
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
  id: number;
  foto: string;
  nom: string;
  quantitatcomprada: number;
  preutotal: number;
  preuperunitat: number;
}