import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Guiadetalle } from '../../../shared/guiadetalle/guiadetalle';


@Component({
  selector: 'app-guia',
  imports: [CommonModule, FormsModule, FontAwesomeModule, Guiadetalle],
  templateUrl: './guia.html',
  styleUrl: './guia.css'
})
export class Guia implements OnInit {
  guideCode: string = '';

  errorMessage: string | null = null; // Kept for input validation error
  faSearch = faSearch;

  searchCode: string | null = null;


  constructor() { }

  ngOnInit() { }


  getGuideInfo() {
    if (!this.guideCode.trim()) {
      this.errorMessage = 'Por favor, introduce un código de guía.';
      this.searchCode = null; // Clear detail view
      return;
    }

    this.errorMessage = null;

    this.searchCode = this.guideCode.trim();

    // NOTA: Si necesitas que el input vacío se considere un error de UX aquí, 
    // el código de arriba es suficiente. Si permites que el componente hijo
    // maneje la validación del código vacío/nulo, podrías simplificar esto:
    // this.searchCode = this.guideCode.trim() || null;
  }

  // REMOVED: isCurrentStatus, getGuideInfo (the original API call logic)
}