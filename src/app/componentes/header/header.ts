import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Getasset } from '../../serveis/getasset/getasset';
import { Getroute } from '../../serveis/getroute/getroute';
import { Manejarcistella } from '../../serveis/manejarcistella/manejarcistella';
import { Usuaridades } from '../../serveis/usuaridades/usuaridades';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit{

  constructor(private getasset: Getasset, private getroute: Getroute, 
    private manejarCistella: Manejarcistella, private router: Router, private usuaridades: Usuaridades,
    private cgr: ChangeDetectorRef){}  

  ngOnInit(): void {
      this.usuaridades.getIniciatSessio().subscribe(iniciat => {
      this.iniciatSessio = iniciat
      this.cgr.detectChanges()
    })
  }

  private iniciatSessio: boolean = false; 

  public getNumProductes(){
    let num = 0
    for (let index = 0; index < this.manejarCistella.gcistella.length; index++) {
      num += this.manejarCistella.gcistella[index].quantitatcomprada
    }
    return num
  }
  
  public tancarSessio() {
    this.usuaridades.cerrarSesion(this.manejarCistella.gcistella).subscribe({
      next: (res) => {
        this.router.navigate(["/registre"])
        alert(res.mensaje)
        this.usuaridades.limpiarUser()
      },
      error: (err) => {
        alert("Error: " + err.error.message)
      }
    })
  }

  public cgetpath(path: string){
    return this.getasset.getpath(path);
  }

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }

  public registreOpanell(){
    return this.iniciatSessio ? "panel" : "registre"
  }

  public hainiciatSessio(){
    return this.iniciatSessio
  }

  public getNom(){
    return this.usuaridades.getDades()?.nom;
  }
}
