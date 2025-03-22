import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { Task } from '../models/task.model';
import { TaskStats } from '../models/stats.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:4000/api/tasks';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((tasks) => this.tasksSubject.next(tasks)) // Actualizar el BehaviorSubject
    );
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task).pipe(
      tap((updatedTask) => {
        const tasks = this.tasksSubject.value.map((t) =>
          t._id === id ? updatedTask : t
        );
        this.tasksSubject.next(tasks);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getTasksSorted(sortBy: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?sort=${sortBy}`);
  }
  getCompletedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?completed=true`);
  }

  getPendingTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?completed=false`);
  }
  // Método para actualizar las tareas en toda la app
  updateTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
  }

  toggleTaskStatus(id: string): Observable<Task> {
    const currentTasks = this.tasksSubject.value;
    const taskIndex = currentTasks.findIndex((t) => t._id === id);

    // Actualización optimista
    const optimisticTasks = [...currentTasks];
    const optimisticTask = {
      ...optimisticTasks[taskIndex],
      completed: !optimisticTasks[taskIndex].completed,
    };
    optimisticTasks[taskIndex] = optimisticTask;
    this.tasksSubject.next(optimisticTasks);

    // Llamada al backend
    return this.http
      .patch<Task>(`${this.apiUrl}/${id}`, {
        completed: optimisticTask.completed,
      })
      .pipe(
        tap((updatedTask) => {
          this.getTasks().subscribe(); // Actualización forzada
        }),
        catchError((err) => {
          optimisticTasks[taskIndex] = currentTasks[taskIndex];
          this.tasksSubject.next(optimisticTasks);
          return throwError(() => err);
        })
      );
  }
  getStats(): Observable<TaskStats> {
    return this.tasks$.pipe(
      map((tasks) => {
        const stats: TaskStats = {
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.completed).length,
          pendingTasks: tasks.filter((t) => !t.completed).length,
          priorityDistribution: {
            low: tasks.filter((t) => t.priority === 'low').length,
            medium: tasks.filter((t) => t.priority === 'medium').length,
            high: tasks.filter((t) => t.priority === 'high').length,
          },
          categoryDistribution: this.getCategoryDistribution(tasks),
          completionRate: this.calculateCompletionRate(tasks),
          avgCompletionTime: this.calculateAvgCompletionTime(tasks),
        };
        return stats;
      })
    );
  }

  private getCategoryDistribution(tasks: Task[]): Record<string, number> {
    return tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateCompletionRate(tasks: Task[]): number {
    const completed = tasks.filter((t) => t.completed).length;
    return tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  }
  private calculateAvgCompletionTime(tasks: Task[]): number {
    const validTasks = tasks.filter(
      (t) =>
        t.completed &&
        t.createdAt &&
        t.dueDate &&
        !isNaN(new Date(t.createdAt).getTime()) &&
        !isNaN(new Date(t.dueDate).getTime())
    );

    if (validTasks.length === 0) return 0;

    const totalDays = validTasks.reduce((sum, task) => {
      const created = new Date(task.createdAt!).getTime();
      const due = new Date(task.dueDate!).getTime();
      return sum + Math.ceil((due - created) / (1000 * 3600 * 24));
    }, 0);

    return Math.round(totalDays / validTasks.length);
  }
}
