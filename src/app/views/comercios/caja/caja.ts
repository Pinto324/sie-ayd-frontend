import { Component,OnInit } from '@angular/core';
import { Caja } from '../../../components/shared/view/caja/caja';
import { AuthService } from '../../../services/auth'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
interface CommerceIdResponse {
  id: number; // Asumiendo que la respuesta tiene una propiedad 'id' con el ID del comercio
}
@Component({
  // Selector corregido
  selector: 'app-caja-comercio', 
  standalone: true, // Si es un standalone component
  imports: [Caja], // Asegúrate de que CommonModule esté si usas lógica de template
  templateUrl: './caja.html',
  styleUrl: './caja.css'
})
export class CajaComercio implements OnInit {
   idComercio: number | undefined; 
  private apiUrl = 'http://147.135.215.156:8090/api/v1/commerce/id';

  idEmpleadoHistorial: number | undefined;
    constructor(
    private authService: AuthService,private http: HttpClient,
  ) { }
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
     ngOnInit() {
    const userId = this.authService.getUserId();
    
    if (userId !== null) {
      this.getCommerceId(userId);
    } else {
      console.error('ID de Usuario no disponible.');
      // Aquí puedes manejar la visualización de un error si el ID no existe
    }
  }

  getCommerceId(userId: number): void {
    const headers = this.getHeaders();
    
    // ⬅️ LLAMADA A LA API
    this.http.get<CommerceIdResponse>(`${this.apiUrl}/${userId}`, { headers })
      .subscribe({
        next: (response) => {
          // Asigna el ID de comercio
          this.idComercio = response.id; 
          console.log(`ID de Comercio obtenido: ${this.idComercio}`);
        },
        error: (error) => {
          console.error('Error al obtener el ID de Comercio:', error);
          // Manejo de error: podrías mostrar un mensaje al usuario
          this.idComercio = undefined;
        }
      });
  }
}