export interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: Date | null;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    category: string;
    createdAt: Date;
  }