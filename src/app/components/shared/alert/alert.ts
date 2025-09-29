import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck,  // Success
  faTriangleExclamation, // Danger (antes faTriangleExclamation o faExclamationCircle)
  faCircleInfo,   // Info
  faTimes         // Cerrar
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { AlertType } from './alert-type.type';
@Component({
  selector: 'app-alert',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class Alert implements OnInit {

  // CONTROL DE VISIBILIDAD (Input)
  @Input() isOpen: boolean = false;
  
  // TIPO DE ALERTA (Input)
  @Input() type: AlertType = 'info';

  // MENSAJE (Input, puede ser string o array de strings para errores de backend)
  @Input() message: string | string[] = '';
  
  // EVENTO DE CIERRE (Output)
  @Output() closed = new EventEmitter<void>();

  // Íconos de Font Awesome
  faTimes = faTimes;

  // Propiedades dinámicas (colores, íconos, etc.)
  icon: IconDefinition = faCircleInfo;
  colorClass: string = 'text-blue-500';
  buttonClass: string = 'bg-blue-600 hover:bg-blue-800 focus:ring-blue-300 dark:focus:ring-blue-800';
  
  ngOnInit(): void {
    // Inicialización si fuera necesaria
  }

  // Se llama cada vez que cambian las propiedades de entrada
  ngOnChanges(): void {
    this.updateModalLook();
  }

  /**
   * Actualiza el color y el ícono del modal basado en el tipo de alerta.
   */
  updateModalLook(): void {
    switch (this.type) {
      case 'success':
        this.icon = faCircleCheck;
        this.colorClass = 'text-green-500 dark:text-green-400';
        this.buttonClass = 'bg-green-600 hover:bg-green-800 focus:ring-green-300 dark:focus:ring-green-800';
        break;
      case 'danger':
        this.icon = faTriangleExclamation;
        this.colorClass = 'text-red-500 dark:text-red-400';
        this.buttonClass = 'bg-red-600 hover:bg-red-800 focus:ring-red-300 dark:focus:ring-red-800';
        break;
      case 'info':
      default:
        this.icon = faCircleInfo;
        this.colorClass = 'text-blue-500 dark:text-blue-400';
        this.buttonClass = 'bg-blue-600 hover:bg-blue-800 focus:ring-blue-300 dark:focus:ring-blue-800';
        break;
    }
  }

  /**
   * Emite el evento de cierre al componente padre.
   */
  closeModal(): void {
    this.closed.emit();
  }

  /**
   * Determina si el mensaje debe ser renderizado como lista.
   */
  isMessageArray(): boolean {
    return Array.isArray(this.message);
  }
}
