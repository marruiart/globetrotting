import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';
import { AdminGuard } from 'src/app/core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'destinations-management',
    loadChildren: () => import('./destinations-management/destinations-management.module').then(m => m.DestinationsManagementPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'agents-management',
    loadChildren: () => import('./agents-management/agents-management.module').then(m => m.AgentsManagementPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'bookings',
    loadChildren: () => import('../bookings/bookings.module').then(m => m.BookingsPageModule),
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule { }
