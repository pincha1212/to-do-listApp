import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.css',
})
export class TaskEditComponent implements OnChanges {
  @Input() task!: Task; // Recibe la tarea a editar
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() cancelEdit = new EventEmitter<void>();

  editedTask: Partial<Task> = {}; // Inicializado como objeto vacío
  dueDateString: string | null = null; 

  constructor(private taskService: TaskService) {
    this.editedTask = { ...this.task }; // Copia los valores iniciales
  }

  onSubmit(): void {
    // Convertir string a Date antes de enviar
    if (this.dueDateString) {
      this.editedTask.dueDate = new Date(this.dueDateString);
    } else {
      this.editedTask.dueDate = null;
    }

    this.taskService.updateTask(this.task._id, this.editedTask)
      .subscribe(updatedTask => {
        this.taskUpdated.emit(updatedTask);
        this.cancelEdit.emit();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.editedTask = { ...this.task };
      
      // Convertir Date a string para el input
      this.dueDateString = this.task.dueDate
        ? new Date(this.task.dueDate).toISOString().split('T')[0]
        : null;
    }
  }

  private parseDate(date: string | Date | null): string | null {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
  }

  onCancel(): void {
    this.cancelEdit.emit(); // Emitir evento de cancelación
  }
}
