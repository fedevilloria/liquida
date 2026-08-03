import { Component, signal } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  // Controla si el menú lateral está abierto en dispositivos móviles.
  protected readonly isSidebarOpen = signal(false);

  // Abre o cierra el menú lateral.
  protected toggleSidebar(): void {
    this.isSidebarOpen.update((isOpen) => !isOpen);
  }

  // Cierra el menú después de seleccionar una página en dispositivos móviles.
  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}