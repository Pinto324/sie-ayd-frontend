import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

// Interfaz para definir la estructura de la columna
export interface TableColumn {
  key: string;            // La propiedad del objeto de datos (ej: 'code', 'recipient', 'status.name')
  header: string;         // El texto a mostrar en el encabezado
  type?: 'text' | 'date' | 'currency' | 'iconStatus' | 'nested'; // Tipo de formato/renderizado
  nestedKey?: string;     // Para type: 'nested', la sub-propiedad (ej: 'name' para 'status.name')
  pipeFormat?: string;    // Formato para date o currency (ej: 'shortDate', '1.2-2')
}

// Interfaz para definir la acción de un botón
export interface TableAction {
  label: string;
  icon: any; // Usaremos el tipo 'any' para fa-icon
  action: string; // Nombre de la acción a emitir (ej: 'edit', 'cancel')
  condition?: (item: any) => boolean; // Función para decidir si mostrar el botón
  class?: string; // Clases de estilo del botón
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, DatePipe, DecimalPipe, FontAwesomeModule, FaIconComponent],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table {
  @Input() data: any[] | null = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = []; // Botones de acción
  @Input() statusIcons: { [key: number]: any } = {}; // Para iconos de estado

  // Emite un evento cuando se hace clic en un botón de acción
  @Output() actionClick = new EventEmitter<{ action: string, item: any }>();

  // Función para obtener el valor de la celda, manejando propiedades anidadas
  getCellValue(item: any, column: TableColumn): any {
    if (column.type === 'nested' && column.nestedKey) {
      return item[column.key]?.[column.nestedKey];
    }
    return item[column.key];
  }

  // Lógica para manejar el clic en los botones de acción
  onActionClick(action: string, item: any): void {
    this.actionClick.emit({ action, item });
  }

  // Lógica para determinar si un botón de acción debe mostrarse
  shouldShowAction(action: TableAction, item: any): boolean {
    return action.condition ? action.condition(item) : true;
  }
}
