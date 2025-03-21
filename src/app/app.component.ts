import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskService } from './services/task.service';
import { Task } from './models/task.model';
import { HeaderComponent } from "./components/header/header.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';  onTaskCreated(newTask: Task): void {
    // Si el componente de lista no está escuchando el evento directamente,
    // puedes usar un servicio compartido para actualizar la lista.
  }
}
