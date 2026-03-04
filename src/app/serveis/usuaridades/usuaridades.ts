import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class Usuaridades {

  private dades: UsuariData | null = null
  private iniciatSessio: boolean = false

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

public getDades(){
  return this.dades;
}

public setDades(dades: UsuariData){
  this.dades = dades
}

public getIniciatSessio(){
  return this.iniciatSessio
}

public setIniciatSessio(bool: boolean){
  this.iniciatSessio = bool
}

}

export interface UsuariData {
  nom: string;
  cognom: string;
  correu: string;
  direccio: string;
  telefon: string;
}


