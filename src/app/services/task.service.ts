import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { Task } from '../models/task.model';
import { TaskStats } from '../models/stats.model';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private cachedTasks: Task[] = [];

  private apiUrl =
    'https://todolist-backend-w0diz5uqk-pincha1212s-projects.vercel.app/api/tasks';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Modificar getTasks para usar caché
  getTasks(): Observable<Task[]> {
    if (this.cachedTasks.length > 0) {
      return of(this.cachedTasks).pipe(
        switchMap((cached) =>
          this.http.get<Task[]>(this.apiUrl).pipe(catchError(() => of(cached)))
        )
      );
    }
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((tasks) => {
        this.cachedTasks = tasks;
        this.tasksSubject.next(tasks);
      })
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

  // Modificar toggleTaskStatus
  toggleTaskStatus(id: string): Observable<Task> {
    const currentTasks = this.tasksSubject.value;
    const taskIndex = currentTasks.findIndex((t) => t._id === id);

    if (taskIndex === -1) return throwError(() => 'Tarea no encontrada');

    // Actualización optimista INMEDIATA
    const updatedTask = {
      ...currentTasks[taskIndex],
      completed: !currentTasks[taskIndex].completed,
    };

    const newTasks = [...currentTasks];
    newTasks[taskIndex] = updatedTask;
    this.tasksSubject.next(newTasks); // Emitir nueva lista

    return this.http
      .patch<Task>(`${this.apiUrl}/${id}`, {
        completed: updatedTask.completed,
      })
      .pipe(
        catchError((err) => {
          this.tasksSubject.next(currentTasks); // Revertir en error
          return throwError(() => err);
        })
      );
  }
  // Modificar el método getStats
  getStats(): Observable<TaskStats> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      // 1. Obtener datos frescos
      tap((tasks) => this.tasksSubject.next(tasks)), // 2. Actualizar el BehaviorSubject
      switchMap((tasks) => this.calculateStats(tasks)) // 3. Calcular estadísticas
    );
  }

  private calculateStats(tasks: Task[]): Observable<TaskStats> {
    return of({
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
    });
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
