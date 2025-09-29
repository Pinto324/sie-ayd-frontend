import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filtroseleccion } from '../../../components/shared/filtroseleccion/filtroseleccion'; 
import { FormsModule } from '@angular/forms';
import { FilterOption } from '../../../interfaces/filter-option.interface'; // Asumiendo que esta interfaz existe
import { Entregas } from './entregas/entregas';
import { Comisiones } from './comisiones/comisiones';
import { Descuentos } from './descuentos/descuentos';
import { Ranking } from './ranking/ranking';
@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, Ranking,Filtroseleccion, Entregas, Descuentos,Comisiones],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  
  // Lista de opciones de reportes para el componente Filtroseleccion
  reporteOptions: FilterOption[] = [
    { label: 'Entregas', value: 'delivery_reports', iconClass: 'fas fa-truck' },
    { label: 'Comisiones', value: 'delivery_performance', iconClass: 'fas fa-tachometer-alt' },
    { label: 'Descuentos', value: 'clients_commerce', iconClass: 'fas fa-users' },
    { label: 'Ranking', value: 'transactions', iconClass: 'fas fa-exchange-alt' },
    { label: 'Cancelarciones', value: 'kpi_global', iconClass: 'fas fa-chart-line' },
  ];

  // El reporte seleccionado (inicialmente el primero)
  selectedReport: string = this.reporteOptions[0].value; 

  constructor() { }

  ngOnInit(): void {
    // La inicialización del filtro ya se hace en el componente Filtroseleccion
  }
 get currentReportLabel(): string {
    const selected = this.reporteOptions.find(o => o.value === this.selectedReport);
    // Toda la lógica compleja se realiza de forma segura en TypeScript
    return selected?.label ?? 'Selecciona un reporte';
  }
  /**
   * Se llama cuando el usuario cambia la selección en el componente de filtro.
   */
  onReportChange(reportValue: string): void {
    this.selectedReport = reportValue;
    console.log('Reporte seleccionado:', this.selectedReport);
    // Aquí podrías desencadenar la carga inicial de datos o componentes
  }
}
