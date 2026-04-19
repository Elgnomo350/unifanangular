import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Usuaridades, HistorialCompra } from '../../serveis/usuaridades/usuaridades';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-adminpanel',
  imports: [DatePipe],
  templateUrl: './adminpanel.html',
  styleUrl: './adminpanel.css',
})
export class Adminpanel implements OnInit{

  private historial: HistorialCompra[] = []

  constructor(private usuaridades: Usuaridades, private router: Router, private cdr: ChangeDetectorRef){
    if (!this.isAdmin()) {
      alert("No eres admin, no tienes permiso para entrar aqui")
      this.router.navigate(["/index"])
    }
  }

  ngOnInit(): void {
    this.usuaridades.isAdminBackend().subscribe({
      next: (res) => {
        this.historial = res.historial
        this.crearGraficoProductos();
        this.crearGraficoOfertas();
        this.cdr.detectChanges()
      },
      error: (err) => {
      alert(err.error.message)
      this.router.navigate(["/index"])
      }
    })
  }

  public getHistorial(){
    return this.historial
  }

  public isAdmin(){
    return this.usuaridades.isAdmin()
  }

  crearGraficoProductos() {
    const dataMap: any = {};

    this.historial.forEach(item => {
      const fecha = new Date(item.fecha).toISOString().split('T')[0];
      const key = `${fecha}_${item.producto_id}`;

      if (!dataMap[key]) {
        dataMap[key] = {
          fecha,
          producto: item.producto_id,
          total: 0
        };
      }

      dataMap[key].total += item.cantidad;
    });

    const data = Object.values(dataMap);

    new Chart('chartProductos', {
      type: 'bar',
      data: {
        labels: data.map((d: any) => `${d.fecha} (P${d.producto})`),
        datasets: [{
          label: 'Cantidad vendida',
          data: data.map((d: any) => d.total)
        }]
      }
    });
  }

  crearGraficoOfertas() {
    const dataMap: any = {};

    this.historial.forEach(item => {
      const fecha = new Date(item.fecha).toISOString().split('T')[0];

      if (!dataMap[fecha]) {
        dataMap[fecha] = {
          fecha,
          oferta: 0,
          normal: 0
        };
      }

      if (item.oferta) {
        dataMap[fecha].oferta += item.cantidad;
      } else {
        dataMap[fecha].normal += item.cantidad;
      }
    });

    const data = Object.values(dataMap);

    new Chart('chartOfertas', {
      type: 'line',
      data: {
        labels: data.map((d: any) => d.fecha),
        datasets: [
          {
            label: 'Ofertas',
            data: data.map((d: any) => d.oferta)
          },
          {
            label: 'Sin oferta',
            data: data.map((d: any) => d.normal)
          }
        ]
      }
    });
  }
}

