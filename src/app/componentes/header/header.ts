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
    private numCistella = 0
    private iniciatSessio: boolean = false; 

  ngOnInit(): void {
      this.usuaridades.getIniciatSessio().subscribe(iniciat => {
      this.iniciatSessio = iniciat
      this.cgr.detectChanges()
    })

  this.manejarCistella.numCistella$.subscribe(value => {
    this.numCistella = value;
    this.cgr.detectChanges();
  });
  }

  public getNumCis(){
    return this.numCistella
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
