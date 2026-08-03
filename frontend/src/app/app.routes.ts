import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(
        (component) => component.MainLayout,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(
            (component) => component.Dashboard,
          ),
        title: 'Dashboard | Liquida',
      },
      {
        path: 'liquidaciones/nueva',
        loadComponent: () =>
          import('./pages/new-calculation/new-calculation').then(
            (component) => component.NewCalculation,
          ),
        title: 'Nueva liquidación | Liquida',
      },
      {
        path: 'liquidaciones/historial',
        loadComponent: () =>
          import('./pages/calculation-history/calculation-history').then(
            (component) => component.CalculationHistory,
          ),
        title: 'Historial | Liquida',
      },
      {
        path: 'grupos',
        loadComponent: () =>
          import('./pages/groups/groups').then(
            (component) => component.Groups,
          ),
        title: 'Grupos | Liquida',
      },
      {
        path: 'bancos',
        loadComponent: () =>
          import('./pages/banks/banks').then(
            (component) => component.Banks,
          ),
        title: 'Bancos | Liquida',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];