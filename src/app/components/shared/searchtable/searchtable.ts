import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-searchtable',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './searchtable.html',
  styleUrl: './searchtable.css'
})
export class Searchtable {
  @Input() placeholder: string = 'Buscar...';
  // Input para inicializar o resetear el término de búsqueda desde el padre
  @Input()
  set initialTerm(value: string) {
    this.searchTerm = value;
  }

  // Output para notificar al padre sobre cambios en el término de búsqueda
  @Output() searchChange = new EventEmitter<string>();

  searchTerm: string = '';
  faSearch = faSearch;

  onSearchTermChange() {
    this.searchChange.emit(this.searchTerm);
  }
}