import { Component } from '@angular/core';
import { Getasset } from '../../serveis/getasset/getasset';
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';
import { IniciarSessio } from '../../serveis/usuaridades/usuaridades';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  imports: [],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
    constructor(private getasset: Getasset, private manejarcistella: Manejarcistella,
      private iniciaSessio: IniciarSessio, private router: Router
    ){
    }
  
    public cgetpath(path: string){
      return this.getasset.getpath(path);
    }

    public sumar(id: string){
      let elem = document.getElementById(id)!
      const valor = parseInt(elem.textContent!.trim(), 10) + 1;
      elem.textContent = valor.toString();
    }
    
    public restar(id: string){
      let elem = document.getElementById(id)!
      const valor = parseInt(elem.textContent!.trim(), 10) - 1;
      elem.textContent = valor <= 0 ? "0" : valor.toString();
    }

    public afegirCistella(foto: string, nom: string, idquantitatcomprada: string, preu: string){

    if(!this.iniciaSessio.getIniciatSessio()){
      alert("Inicia sesion per añadir a la cesta")
      this.router.navigate(['/registre']);
      }

      idquantitatcomprada = document.getElementById(idquantitatcomprada)!.textContent

      if ((idquantitatcomprada) == "0"){
        const alerta = document.getElementById('popup-alerta')!;

        alerta.textContent = "No has puesto ningun producto";
        alerta.classList.add('show');

        setTimeout(() => {
          alerta.classList.remove('show');
          alerta.textContent = '';
        }, 2000);
        return
      }

      nom = document.getElementById(nom)!.textContent
      preu = document.getElementById(preu)!.textContent.slice(0, -1).replace(" ", "")

      let quantitatcomprada: number = parseInt(idquantitatcomprada)
      let preutotal: number = parseFloat(preu)

      this.manejarcistella.afegircistella(foto, nom, quantitatcomprada, preutotal * quantitatcomprada, preutotal)
    }

  filtrar(tipo: string) {
  const categorias = document.querySelectorAll('.categoria');

  categorias.forEach((categoria: any) => {
    if (tipo === 'todo') {
      categoria.style.display = 'flex';
    } else if (categoria.classList.contains(tipo)) {
      categoria.style.display = 'flex';
    } else {
      categoria.style.display = 'none';
    }
  }); 
}

}


