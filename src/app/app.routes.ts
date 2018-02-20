import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';
import { BikesLoaderComponent } from './bikes-loader';

export const ROUTES: Routes = [
  { path: '',      component: BikesLoaderComponent },
  { path: 'bikes-loader',  component: BikesLoaderComponent },
  { path: '**',    component: NoContentComponent },
];
