import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet , RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentTab: string = 'list';

  constructor(private route: ActivatedRoute) {
    this.route.url.subscribe(segments => {
      this.currentTab = segments[0]?.path || 'list';
    });
  }
}
