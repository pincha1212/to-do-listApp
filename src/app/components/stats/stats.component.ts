import '../../chart.config'
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { TaskStats } from '../../models/stats.model';
import { catchError, of, Subject, takeUntil } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-stats',
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats: TaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    priorityDistribution: { low: 0, medium: 0, high: 0 },
    categoryDistribution: {},
    completionRate: 0,
    avgCompletionTime: 0,
  };

  // Configuración de gráficos
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  priorityChartData: any;
  categoryChartData: any;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService
      .getStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error obteniendo estadísticas:', error);
          return of(this.stats); // Devuelve stats vacío
        })
      )
      .subscribe((stats) => {
        this.stats = stats;
        this.initCharts();
        this.updateCharts();
      });
  }

  private updateCharts(): void {
    // Forzar nueva instancia para detección de cambios
    this.priorityChartData = { ...this.priorityChartData };
    this.categoryChartData = { ...this.categoryChartData };
  }
  // Elimina las líneas que modifican los defaults globales
  private initCharts(): void {
    // Configuración movida a chartOptions

    // Prioridades
    this.priorityChartData = {
      labels: ['Baja', 'Media', 'Alta'],
      datasets: [
        {
          data: [
            this.stats.priorityDistribution.low,
            this.stats.priorityDistribution.medium,
            this.stats.priorityDistribution.high,
          ],
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        },
      ],
    };

    // Categorías
    this.categoryChartData = {
      labels: Object.keys(this.stats.categoryDistribution),
      datasets: [
        {
          data: Object.values(this.stats.categoryDistribution),
          backgroundColor: this.generateCategoryColors(),
        },
      ],
    };
  }

  private generateCategoryColors(): string[] {
    return Object.keys(this.stats.categoryDistribution).map((_, i) => {
      const hue = i * 137.508; // Distribución áurea de colores
      return `hsl(${hue}, 70%, 50%)`;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  hasPriorityData(): boolean {
    // Verificar directamente los datos de stats, no del chart
    return (
      this.stats.priorityDistribution.low > 0 ||
      this.stats.priorityDistribution.medium > 0 ||
      this.stats.priorityDistribution.high > 0
    );
  }

  hasCategories(): boolean {
    return Object.keys(this.stats.categoryDistribution).length > 0;
  }
}
