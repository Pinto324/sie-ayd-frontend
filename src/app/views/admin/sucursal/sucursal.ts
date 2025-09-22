import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comercios } from './comercios/comercios';
import { Solicitud } from './solicitud/solicitud';
@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule, FormsModule, Comercios, Solicitud],
  templateUrl: './sucursal.html',
  styleUrl: './sucursal.css'
})
export class Sucursal implements OnInit {
  selectedFilter: string = 'todos';
  
  // Variables booleanas para controlar qué componentes mostrar
  showTodos: boolean = true;
  showActivos: boolean = false;
  showPendientes: boolean = false;
  showCompletados: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.updateComponentVisibility();
  }

  onFilterChange(): void {
    this.updateComponentVisibility();
  }

  updateComponentVisibility(): void {
    // Resetear todas las variables
    this.showTodos = false;
    this.showActivos = false;
    this.showPendientes = false;
    this.showCompletados = false;

    // Activar solo la seleccionada
    switch(this.selectedFilter) {
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
    switch(this.selectedFilter) {
      case 'todos': return 'Todos los elementos';
      case 'activos': return 'Solo elementos activos';
      case 'pendientes': return 'Elementos pendientes';
      case 'completados': return 'Elementos completados';
      default: return 'Todos los elementos';
    }
  }
}