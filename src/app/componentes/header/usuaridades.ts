import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Usuaridades {

  private registrat1 = false;
  private Usuari1!: string;
  private Cognom1!: string;
  private Correu!: string;
  private passwd!: string;
  private direccio!: string;
  private Telefon!: bigint;

  constructor() {}

  public getUserNom() {
    return this.Usuari1;
  }

  public getCorreu() {
    return this.Correu;
  }

  public setUsuari(
    usuari: string,
    cognom: string,
    correu: string,
    passwd: string,
    direccio: string,
    telefon: bigint
  ) {
    this.Usuari1 = usuari;
    this.Cognom1 = cognom;
    this.Correu = correu;
    this.passwd = passwd;
    this.direccio = direccio;
    this.Telefon = telefon;
    this.registrat1 = true;
  }
}
