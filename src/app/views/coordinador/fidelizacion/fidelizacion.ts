import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comercios } from '../../admin/sucursal/comercios/comercios'; 
@Component({
  selector: 'app-fidelizacion',
  imports: [CommonModule, 
    Comercios ],
  templateUrl: './fidelizacion.html',
  styleUrl: './fidelizacion.css'
})
export class FidelizacionCoordinador {
  constructor() { }
}
