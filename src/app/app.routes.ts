import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { StatsComponent } from './components/stats/stats.component';
import { CompletedTasksComponent } from './components/completed-tasks/completed-tasks.component';
import { HomeComponent } from './components/home/home.component';
import { TaskFormComponent } from './components/task-form/task-form.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { headerTab: 'home' },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: TaskListComponent,
        data: {
          parentRoute: false,
        },
      },
      {
        path: 'new',
        component: TaskFormComponent,
      },
    ],
  },

  {
    path: 'stats',
    component: StatsComponent,
    data: {
      headerTab: 'stats',
    },
  },
  {
    path: 'completed',
    component: CompletedTasksComponent,
    data: {
      headerTab: 'completed',
    },
  },
  {
    path: '**',
    redirectTo: '',
  }, // Ruta comodín para errores
];
