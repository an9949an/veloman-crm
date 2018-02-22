import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';
import { ProductsLoaderComponent } from './products-loader';

export const ROUTES: Routes = [
  { path: '',      component: ProductsLoaderComponent },
  { path: 'bikes-loader',  component: ProductsLoaderComponent },
  { path: '**',    component: NoContentComponent },
];
