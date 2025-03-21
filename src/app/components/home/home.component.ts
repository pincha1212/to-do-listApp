import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet , RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  pendingTasks: number = 0;
  private destroy$ = new Subject<void>();
  currentTab: string = 'list';

  constructor(private route: ActivatedRoute) {
    this.route.url.subscribe(segments => {
      this.currentTab = segments[0]?.path || 'list';
    });
  }
}
