import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.css'
})
export class TaskEditComponent implements OnChanges {
  @Input() task!: Task; // Recibe la tarea a editar
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() cancelEdit = new EventEmitter<void>(); 

  editedTask: Partial<Task> = {}; // Inicializado como objeto vacío

  constructor(private taskService: TaskService) {
    this.editedTask = { ...this.task }; // Copia los valores iniciales
  }

  onSubmit(): void {
    this.taskService.updateTask(this.task._id, this.editedTask)
      .subscribe(updatedTask => {
        this.taskUpdated.emit(updatedTask);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.editedTask = { 
        ...this.task,
        dueDate: this.task.dueDate ? new Date(this.task.dueDate) : null 
      };
    }
  }
  onCancel(): void {
    this.cancelEdit.emit(); // Emitir evento de cancelación
  }
}
