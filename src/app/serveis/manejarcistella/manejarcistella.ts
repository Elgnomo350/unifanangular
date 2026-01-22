import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Manejarcistella {
  
  constructor(){
  
  }

  private cistellaarray: Array<CistellaClass> = []

  public get gcistella() {
    return this.cistellaarray
  }

  public afegircistella(foto: string, nom: string, quantitatcomprada: number, preutotal: number, preuperunitat: number){
    let volver = false
    this.cistellaarray.forEach(element => {
      if(element.gnom === nom){
        element.sumar(quantitatcomprada)
        volver = true
      }
    })

    if (volver) return
    this.cistellaarray.push(new CistellaClass(foto, nom, quantitatcomprada, preutotal, preuperunitat))
  }

  public buidarcistella(){
    this.cistellaarray = []
  }

  public eliminarProducto(index: number) {
  this.cistellaarray.splice(index, 1);
  }
}

export class CistellaClass {
  constructor(private foto: string, private nom: string, private quantitatcomprada: number, private preutotal: number, private preuperunitat: number) {
  }

  public get gfoto() : string {
    return this.foto 
  }

  public get gnom() : string {
    return this.nom
  }

  public get gquantitat() : number {
    return this.quantitatcomprada
  }

  public sumar(quantitat: number) {
    this.preutotal += this.preuperunitat * quantitat
    this.quantitatcomprada += quantitat
  }

  public get gpreutotal() : number {
    return this.preutotal
  }

  public get gpreuperunitat() : number {
    return this.preuperunitat
  }
}
