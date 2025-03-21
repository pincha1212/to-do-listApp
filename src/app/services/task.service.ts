import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Task } from '../models/task.model';
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
      tap(updatedTask => {
        const tasks = this.tasksSubject.value.map(t => 
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
    const taskIndex = currentTasks.findIndex(t => t._id === id);
  
    // 1. Actualización optimista
    const optimisticTasks = [...currentTasks];
    const optimisticTask = { 
      ...optimisticTasks[taskIndex], 
      completed: !optimisticTasks[taskIndex].completed 
    };
    optimisticTasks[taskIndex] = optimisticTask;
    this.tasksSubject.next(optimisticTasks); // UI actualizada al instante
  
    // 2. Llamada al backend
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { 
      completed: optimisticTask.completed 
    }).pipe(
      catchError(err => {
        // Revertir en caso de error
        optimisticTasks[taskIndex] = currentTasks[taskIndex];
        this.tasksSubject.next(optimisticTasks);
        return throwError(() => err);
      })
    );
  }
  
}
