import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fidelizacion } from './fidelizacion/fidelizacion';
import { Paquetes } from './paquetes/paquetes';
import { Filtroseleccion } from '../../../components/shared/filtroseleccion/filtroseleccion'; 
import { FilterOption } from '../../../interfaces/filter-option.interface';
@Component({
  selector: 'app-precios',
  imports: [CommonModule, Fidelizacion, Paquetes, Filtroseleccion],
  templateUrl: './precios.html',
  styleUrl: './precios.css'
})
export class Precios implements OnInit {
  selectedFilter: string = 'todos';
filterOptions: FilterOption[] = [
    { value: 'todos', label: 'Fidelización', iconClass: 'fas fa-list-ul' },
    { value: 'activos', label: 'Paquetes', iconClass: 'fas fa-check-circle' },
  ];
  // Variables booleanas para controlar qué componentes mostrar
  showTodos: boolean = true;
  showActivos: boolean = false;
  showPendientes: boolean = false;
  showCompletados: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Inicializar la visibilidad con el valor por defecto
    this.updateComponentVisibility(this.selectedFilter);
  }

  onFilterSelected(newFilter: string): void {
    this.selectedFilter = newFilter;
    this.updateComponentVisibility(newFilter);
  }

  updateComponentVisibility(filterValue: string): void {
    // Resetear todas las variables
    this.showTodos = false;
    this.showActivos = false;
    this.showPendientes = false;
    this.showCompletados = false;

    // Activar solo la seleccionada
    switch (filterValue) {
      case 'todos':
        this.showTodos = true;
        break;
      case 'activos':
        this.showActivos = true;
        break;
      case 'pendientes':
        this.showPendientes = true;
        break;
      case 'completados':
        this.showCompletados = true;
        break;
    }
  }

  getFilterText(): string {
    switch (this.selectedFilter) {
      case 'todos': return 'Todos los elementos';
      case 'activos': return 'Solo elementos activos';
      case 'pendientes': return 'Elementos pendientes';
      case 'completados': return 'Elementos completados';
      default: return 'Todos los elementos';
    }
  }
}