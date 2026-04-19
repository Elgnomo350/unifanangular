import { Injectable } from '@angular/core';
import { Bbddsql } from '../bbddsql/bbddsql';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Manejarcistella {

  constructor(private bbddsql: Bbddsql) {}

  private cistellaarray: CistellaInterface[] = [];
  private numCistellaSubject = new BehaviorSubject<number>(0);

  numCistella$ = this.numCistellaSubject.asObservable();

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

  let found = false;

  this.cistellaarray.forEach(element => {
    if (element.nom === nom) {
      element.preutotal += element.preuperunitat * quantitatcomprada;
      element.quantitatcomprada += quantitatcomprada;
      found = true;
    }
  });

  if (!found) {
    this.cistellaarray.push({
      id,
      foto,
      nom,
      quantitatcomprada,
      preutotal,
      preuperunitat
    });
  }

  this.updateCistellaCount();
  }

  public comprarCistella(){
    return this.bbddsql.registrarCompra(this.cistellaarray)
  }

  public buidarcistella() {
  this.cistellaarray = [];
  this.updateCistellaCount();
}

  public eliminarProducto(index: number) {
  this.cistellaarray.splice(index, 1);
  this.updateCistellaCount();
  }

  public updateCistellaCount() {
  const total = this.cistellaarray.reduce((acc, item) => acc + item.quantitatcomprada, 0);
  this.numCistellaSubject.next(total);
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