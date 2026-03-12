import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { CistellaInterface, Manejarcistella } from '../manejarcistella/manejarcistella';

@Injectable({
  providedIn: 'root',
})

export class Usuaridades {

  private dades: UsuariData | null = null
  private iniciatSessioBhvior = new BehaviorSubject<boolean>(false);
  private iniciatSessio = this.iniciatSessioBhvior.asObservable();


  constructor(private httpclient: HttpClient, private manejarCistella: Manejarcistella) {
    this.checkSessio()
  }
  
  public setUsuari(
      nom: string,
      cognom: string,
      correu: string,
      passwd: string,
      direccio: string,
      telefon: string,
      cesta: CistellaInterface[]
    ) {

    return this.httpclient.post<{mensaje: string}>("http://localhost:23000/registrar", 
      {nom, cognom, correu, passwd, direccio, telefon, cesta})
}  

public iniciarSessio(correu: string, passwd: string){
    return this.httpclient.post<{mensaje: string, token: string}>("http://localhost:23000/iniciarsessio", 
      {correu, passwd}, {withCredentials: true})
} 

public cerrarSesion(cesta: CistellaInterface[]){
    return this.httpclient.post<{mensaje: string, token: string}>("http://localhost:23000/cerrarsesion", 
      {cesta: cesta}, {withCredentials: true})
}

public checkSessio() {
  this.httpclient.get<{token: string}>('http://localhost:23000/loggedin', { withCredentials: true }).subscribe({
    next: (res) => {
      const dades = jwtDecode<UsuariData>(res.token);
      this.setDades(dades)
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

public modificarDatos(campo: string, contenido: string){
    return this.httpclient.patch<{mensaje: string, token: string}>("http://localhost:23000/modificarcampo", {campo: campo, contenido: contenido},{withCredentials: true})
}

public modificarCorreo(correo: string){
    return this.httpclient.post<{mensaje: string}>("http://localhost:23000/modificarcorreu", {noucorreu: correo},{withCredentials: true})
}

public cambiarPasswd(nuevaPasswd: string){
    return this.httpclient.post<{mensaje: string}>("http://localhost:23000/cambiarpasswd", 
    {nuevaPasswd: nuevaPasswd}, {withCredentials: true})
}

public conseguirtokenpasswd(correu: string){
  return this.httpclient.post<{mensaje: string}>("http://localhost:23000/mandarlinkolvidarpasswd", {correu: correu})
}

public actualizarpasswd(passwd: string, token: string){
  return this.httpclient.post<{mensaje: string}>("http://localhost:23000/actualitzarpasswd", {nuevaPasswd: passwd, token: token})
}

public confirmarcorreu(token: string){
  return this.httpclient.post<{mensaje: string}>("http://localhost:23000/ferregistre", {token: token})
}

public confirmarcambiocorreo(token: string){
  return this.httpclient.patch<{mensaje: string}>("http://localhost:23000/fermodificaciocorreu", {token: token})
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

public limpiarUser(){
    this.setDades({  
          nom: "",
          cognom: "",
          correu: "",
          direccio: "",
          telefon: "",
          sessionID: "",
          cesta: []
    })
    this.manejarCistella.gcistella = this.dades!.cesta
    this.setIniciatSessio(false);
}

}

export interface UsuariData {
  nom: string;
  cognom: string;
  correu: string;
  direccio: string;
  telefon: string;
  sessionID: string;
  cesta: CistellaInterface[]
}


