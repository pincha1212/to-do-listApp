import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { TaskItemComponent } from '../task-item/task-item.component';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, TaskEditComponent, TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  selectedTask: Task | null = null; // Tarea seleccionada para editar

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadTasks();
  }
  ngOnInit(): void {
    this.loadTasks(); // Cargar datos iniciales

    // Suscripción reactiva con filtro estricto
    this.taskService.tasks$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((tasks) => {
        this.tasks = tasks.filter((t) => !t.completed); // Filtro aquí
        this.cdr.detectChanges(); // Forzar actualización de la vista
      });
  }

  // Método para cargar las tareas
  private loadTasks(): void {
    this.taskService.getTasks().subscribe({
      // Recargar desde el servidor
      next: () => {}, // El BehaviorSubject ya maneja la actualización
      error: (err) => console.error('Error:', err),
    });
  }

  editTask(task: Task): void {
    this.selectedTask = task;
  }
  onTaskUpdated(updatedTask: Task): void {
    this.tasks = this.tasks.map((task) =>
      task._id === updatedTask._id ? updatedTask : task
    );
    this.selectedTask = null; // Cierra el formulario de edición
  }

  onTaskCreated(newTask: Task): void {
    this.tasks = [newTask, ...this.tasks]; // Agrega la tarea al inicio de la lista
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter((task) => task._id !== id);
    });
  }

  fetchTasks(): void {
    this.errorMessage = null;
    this.taskService
      .getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (err) => {
          this.errorMessage = 'Error al cargar las tareas.';
          console.error('Detalles:', err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancelEdit(): void {
    this.selectedTask = null; // Restablecer la tarea seleccionada
  }

  toggleTaskStatus(taskId: string): void {
    this.taskService.toggleTaskStatus(taskId).subscribe(); // Usar el método del servicio
  }

  trackById(index: number, task: Task): string {
    return task._id;
  }
}
