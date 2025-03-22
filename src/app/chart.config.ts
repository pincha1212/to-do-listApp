import { Chart } from 'chart.js';
import { 
  DoughnutController, 
  ArcElement, 
  PieController,
  Legend,
  Tooltip 
} from 'chart.js';

// Registrar elementos y plugins necesarios
Chart.register(
  DoughnutController,
  PieController,
  ArcElement,
  Legend, // Registrar Legend
  Tooltip // Registrar Tooltip
);