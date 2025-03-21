import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  activeTab: string = '';
  isMenuOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentRoute = this.router.routerState.snapshot.root;
        this.activeTab = currentRoute.firstChild?.data['headerTab'] || '';
      });
  }
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.isMenuOpen = false; // Cierra menú móvil al seleccionar
  }
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const menu = document.querySelector('.nav-links') as HTMLElement;
    menu.classList.toggle('active', this.isMenuOpen);
  }
}
