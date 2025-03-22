export interface TaskStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    priorityDistribution: {
      low: number;
      medium: number;
      high: number;
    };
    categoryDistribution: Record<string, number>;
    completionRate: number;
    avgCompletionTime: number; // En días
  }