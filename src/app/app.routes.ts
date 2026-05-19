import { Routes } from '@angular/router';
import { Layout } from '@ui/components/shared/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () => import('@ui/features/home/home').then(m => m.Home)
      },
       {
        path: 'account',
        loadComponent: () => import('@ui/features/account/account').then(m => m.Account)
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('@ui/features/profile/profile').then(m => m.Profile)
      },
      {
        path: 'signup',
        loadComponent: () => import('@ui/features/auth/signup/signup').then(m => m.Signup)
      },
      {
        path: 'signin',
        loadComponent: () => import('@ui/features/auth/signin/signin').then(m => m.Signin)
      },
      {
        path: '**',
        loadComponent: () => import('@ui/features/not-found/not-found').then(m => m.NotFound)
      }
    ]
  }
];
