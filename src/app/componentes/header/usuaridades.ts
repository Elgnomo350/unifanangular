import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Usuaridades {
  registrat1 = false
  Usuari1 : string
  Cognom1 : string
  Correu : string
  passwd : string
  direccio : string
  Telefon : bigint


  constructor(usr1:string, cog:string, correu:string, pswd:string, direc:string, tel:bigint) {
    this.Usuari1 = usr1
    this.Cognom1 = cog
    this.Correu = correu
    this.passwd = pswd
    this.direccio = direc
    this.Telefon = tel
  }

  public getUserNom () {
    return this.Usuari1
  }

  public getCorreu () {
    return this.Correu
  }
}
