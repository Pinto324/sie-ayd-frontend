import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Inicio } from './views/inicio/inicio';
import { Navbar } from './components/shared/navbar/navbar'; 
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Inicio, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sie-ayd-frontend');
}
