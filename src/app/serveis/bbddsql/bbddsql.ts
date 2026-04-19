import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CistellaInterface } from '../manejarcistella/manejarcistella';

@Injectable({
  providedIn: 'root',
})
export class Bbddsql {

  constructor(private httpclient: HttpClient, private router: Router){
    this.demanarProductesResponse()
  }
  
  private backurl = "http://localhost:23000/"
  private productos: Record<string, Producte[]> = {}

  demanarProductes(){
    return this.httpclient.get<{productos: Record<string, Producte[]>}>(this.backurl + "demanarproductes")
  }

  public demanarProductesResponse(){
    if (this.router.url !== "/catalogo") {
        this.demanarProductes().subscribe({
      next: (res) => {
       this.productos = res.productos
      },
      error: (err) => {
        console.log("Error: " + err.error.message)
      }
    })
    }
  }

  setProductes(productos: Record<string, Producte[]>){
    this.productos = productos
  }

  getProductes(){
    return this.productos
  }

  public registrarCompra(productos: CistellaInterface[]){
    return this.httpclient.post<{mensaje: string}>(this.backurl + "registrarcompra", {productos: productos}, {withCredentials: true})
  }

}

export interface Producte {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  foto: string;
  categoria: string;
}
