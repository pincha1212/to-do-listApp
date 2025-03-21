import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskEditComponent } from "../task-edit/task-edit.component";

@Component({
  selector: 'app-completed-tasks',
  imports: [CommonModule, TaskItemComponent, TaskEditComponent],
  templateUrl: './completed-tasks.component.html',
  styleUrl: './completed-tasks.component.css',
})
export class CompletedTasksComponent implements OnInit {
  completedTasks: Task[] = [];
  pendingTasks: Task[] = [];
  selectedTask: Task | null = null;
  private destroy$ = new Subject<void>();
  constructor(private taskService: TaskService) {}
  ngOnInit(): void {
    this.taskService.getTasks().subscribe();
    
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.completedTasks = tasks.filter(t => t.completed);
        this.pendingTasks = tasks.filter(t => !t.completed);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  toggleTaskStatus(id: string): void {
    this.taskService.toggleTaskStatus(id).subscribe({
      error: (err) => console.error('Error:', err)
    });
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.completedTasks = this.completedTasks.filter(t => t._id !== id);
        this.pendingTasks = this.pendingTasks.filter(t => t._id !== id);
      },
      error: (err) => console.error('Error:', err)
    });
  }
  onTaskUpdated(updatedTask: Task): void {
    this.pendingTasks = this.pendingTasks.map(t => 
      t._id === updatedTask._id ? updatedTask : t
    );
    this.selectedTask = null;
  }
}
