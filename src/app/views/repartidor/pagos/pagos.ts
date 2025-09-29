import { Component,OnInit } from '@angular/core';
import { Historialpagos } from '../../../components/shared/view/historialpagos/historialpagos';
import { AuthService } from '../../../services/auth'; 
@Component({
  selector: 'app-pagos',
  imports: [Historialpagos],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css'
})
export class pagosrepartidor implements OnInit {
  idEmpleadoHistorial: number | undefined;
    constructor(
    private authService: AuthService,
  ) {}
      ngOnInit() {
      const roleId = this.authService.getUserId();
        this.idEmpleadoHistorial = roleId !== null ? roleId : undefined;
        console.log(this.idEmpleadoHistorial);
    }
    
  }
