import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Asume FontAwesome
import { FilterOption } from '../../../interfaces/filter-option.interface'; 

@Component({
  selector: 'app-filtroseleccion',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './filtroseleccion.html',
  styleUrl: './filtroseleccion.css'
})
export class Filtroseleccion implements OnInit {

  /**
   * @Input(): Recibe el array de opciones de filtro desde el componente padre.
   */
  @Input() options: FilterOption[] = [];

  /**
   * @Input(): Valor inicial de la selección, sincronizado con el padre.
   */
  @Input() initialSelection: string = '';

  /**
   * @Output(): Emite el valor del filtro seleccionado al componente padre.
   */
  @Output() filterSelected = new EventEmitter<string>();

  // Propiedad interna enlazada con [(ngModel)] del radio button group
  selectedFilter: string = '';

  ngOnInit(): void {
    // Inicializa la selección interna con el valor proporcionado o la primera opción
    this.selectedFilter = this.initialSelection || (this.options.length > 0 ? this.options[0].value : '');
    // Emitir la selección inicial
    this.filterSelected.emit(this.selectedFilter);
  }

  /**
   * Método que se ejecuta cuando el usuario selecciona un nuevo filtro.
   */
  onFilterChange(): void {
    // Emite el valor seleccionado al componente padre
    this.filterSelected.emit(this.selectedFilter);
  }
}
