import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // component: Layout,
    children: [
      {
        path: '',
        loadComponent: () => import('./ui/features/home/home').then(m => m.Home)
      },
      //  {
      //   path: 'account',
      //   loadComponent: () => import('./features/account/account').then(m => m.Account)
      // },
      // {
      //   path: 'profile/:id',
      //   loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
      // },
      // {
      //   path: 'signup',
      //   loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup)
      // },
      // {
      //   path: 'signin',
      //   loadComponent: () => import('./features/auth/signin/signin').then(m => m.Signin)
      // },
      // {
      //   path: '**',
      //   loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound)
      // }
    ]
  }
];
