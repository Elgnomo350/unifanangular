import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Usuaridades {

  private dades: UsuariData | null = null
  private iniciatSessioBhvior = new BehaviorSubject<boolean>(false);
  private iniciatSessio = this.iniciatSessioBhvior.asObservable();


  constructor(private httpclient: HttpClient) {
    this.checkSessio()
  }
  
  public setUsuari(
      nom: string,
      cognom: string,
      correu: string,
      passwd: string,
      direccio: string,
      telefon: string
    ) {

    return this.httpclient.post<{mensaje: string}>("http://localhost:23000/registrar", 
      {nom, cognom, correu, passwd, direccio, telefon})
}  

public iniciarSessio(correu: string, passwd: string){
    return this.httpclient.post<{mensaje: string, token: string}>("http://localhost:23000/iniciarsessio", 
      {correu, passwd}, {withCredentials: true})
} 

public cerrarSesion(){
    return this.httpclient.post<{mensaje: string, token: string}>("http://localhost:23000/cerrarsesion", 
      {}, {withCredentials: true})
}

public checkSessio() {
  this.httpclient.get('http://localhost:23000/loggedin', { withCredentials: true }).subscribe({
    next: (res: any) => {
      this.setDades(res.usuario);
      this.setIniciatSessio(true);
    },
    error: () => {
      this.setIniciatSessio(false);
    }
  });
}

public borrarMiCuenta(){
    return this.httpclient.delete<{mensaje: string, token: string}>("http://localhost:23000/borrarmicuenta", {withCredentials: true})
}

public getDades(){
  return this.dades;
}

public setDades(dades: UsuariData){
  this.dades = dades
}

public getIniciatSessio(){
  return this.iniciatSessio
}

public getIniciatSessioValue(): boolean{
  return this.iniciatSessioBhvior.getValue()
}

public setIniciatSessio(bool: boolean){
  this.iniciatSessioBhvior.next(bool)
}

}

export interface UsuariData {
  nom: string;
  cognom: string;
  correu: string;
  direccio: string;
  telefon: string;
  sessionID: string;
}


