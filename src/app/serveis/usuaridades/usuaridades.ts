import { Injectable } from '@angular/core';
import { Manejarcistella } from '../manejarcistella/manejarcistella';

@Injectable({
  providedIn: 'root',
})


export class Usuaridades {

  private Nom!: string;
  private Cognom!: string;
  private Correu!: string;
  private passwd!: string;
  private direccio!: string;
  private Telefon!: string;

  constructor(private registrar: Registrar, private iniciaSessio: IniciarSessio) {}

  public setUsuari(
    nom: string,
    cognom: string,
    correu: string,
    passwd: string,
    direccio: string,
    telefon: string
  ) {
    this.Nom = nom;
    this.Cognom = cognom;
    this.Correu = correu;
    this.passwd = passwd;
    this.direccio = direccio;
    this.Telefon = telefon;


    const dades: UsuariData = {
      Nom: this.Nom,
      Cognom: this.Cognom,
      Correu: this.Correu,
      passwd: this.passwd,
      direccio: this.direccio,
      Telefon: this.Telefon
    };

    this.registrar.afegirUsuari(dades)
}  

public iniciarSessio(correu: string | null, passwd: string | null){
  if (!correu || !passwd) return;

  const usuari = this.registrar.getUsuaris()[correu] || null;
  if (!usuari) return;

  if (usuari.passwd === passwd) {
    this.iniciaSessio.iniciarSessio(usuari);
  }
}
}

@Injectable({
  providedIn: 'root',
})


//Parte donde se ve el 4.2 de la investigacion, sessionstorage
export class Registrar {

  private usuarisExistents: Record<string, UsuariData> = {};

  constructor(private manejarCistella: Manejarcistella) {
    const guardats = localStorage.getItem('Usuarios');
    this.usuarisExistents = guardats ? JSON.parse(guardats) : {};
  }

  afegirUsuari(usuari: UsuariData) {
    this.usuarisExistents[usuari.Correu] = usuari;
    localStorage.setItem('Usuarios', JSON.stringify(this.usuarisExistents));
  }

  getUsuaris() {
    return this.usuarisExistents;
  }

  getCorreu(correu: string): UsuariData | null {
    return this.usuarisExistents[correu] || null;
  }

  getPassword(correu: string): string | null {
    return this.usuarisExistents[correu]?.passwd || null;
  }

  clearUsuari(correu: string) {
    if (this.usuarisExistents[correu]) {
      this.manejarCistella.borrarCuentacistella(correu)
      delete this.usuarisExistents[correu];
      localStorage.setItem('Usuarios', JSON.stringify(this.usuarisExistents));
    }
  }

  clearAll() {
    this.usuarisExistents = {};
    this.manejarCistella.borrarTotesCistelles()
    localStorage.removeItem('Usuarios');
  }
}


@Injectable({
  providedIn: 'root',
})

export class IniciarSessio{
  private iniciatSessio = false;
  private usuariIniciat: UsuariData | null = null;

  constructor(private registrar: Registrar, private manejarcistella: Manejarcistella) {}

  public getIniciatSessio() {
      return this.iniciatSessio;
    }

  public getUsuariIniciat() {
      return this.usuariIniciat;
    }


  public iniciarSessio(usuari: UsuariData) {
    if (!this.iniciatSessio) {
      this.usuariIniciat = usuari;
      this.iniciatSessio = true;
      this.manejarcistella.setCistella(usuari.Correu);
    }
  }

  public tancarSessio() {
      this.manejarcistella.guardarCistella(this.usuariIniciat!.Correu);
      this.usuariIniciat = null;
      this.iniciatSessio = false;
    }
}


export interface UsuariData {
  Nom: string;
  Cognom: string;
  Correu: string;
  passwd: string;
  direccio: string;
  Telefon: string;
}


