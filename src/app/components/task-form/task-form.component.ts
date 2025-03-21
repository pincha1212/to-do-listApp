import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent {
  private destroy$ = new Subject<void>();

  isLoading: boolean = false;
  @Output() taskCreated = new EventEmitter<Task>();
  task: Partial<Task> = { title: '', priority: 'medium' };
  taskForm: FormGroup; // Formulario reactivo
  tasks: Task[] = [];

  errorMessage: string | null = null;

  // Objeto para almacenar los datos del formulario
  newTask: Partial<Task> = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    category: 'general',
  };

  constructor(private taskService: TaskService, private fb: FormBuilder) {
    // Inicializar el formulario reactivo
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      dueDate: [null],
      category: ['general'],
    });
  }

  // Método para enviar el formulario
  onSubmit(): void {
    if (this.taskForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    // Convertir dueDate a ISO
    const formValue = {
      ...this.taskForm.value,
      dueDate: this.taskForm.value.dueDate
        ? new Date(this.taskForm.value.dueDate).toISOString()
        : null,
    };

    // Solo una llamada al servicio
    this.taskService.createTask(formValue).subscribe({
      next: (createdTask) => {
        this.taskCreated.emit(createdTask);
        this.taskForm.reset({
          priority: 'medium',
          category: 'general',
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al crear la tarea';
        this.isLoading = false;
      },
    });
  }
  // Limpiar el formulario
  resetForm(): void {
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: null,
      category: 'general',
    };
  }
  
}
