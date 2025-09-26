import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-modal',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @Input() title: string = 'Título del Modal';
  @Input() isOpen: boolean = false;

  // Define tamaños: sm, md, lg, xl, 2xl. Usaremos '2xl' para acomodar bien las 2 columnas.
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = '2xl';

  @Output() close = new EventEmitter<void>();

  faTimes = faTimes;

  // Clases dinámicas de Tailwind para controlar el ancho máximo del modal
  get modalSizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      default: return 'max-w-lg';
    }
  }

  // Cierra el modal (usado por el botón de X y el clic en el fondo)
  onClose(): void {
    this.close.emit();
  }
}
