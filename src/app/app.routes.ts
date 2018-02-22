import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';
import { ProductsLoaderComponent } from './products-loader';
import { PricesUpdaterComponent } from './prices-updater';

export const ROUTES: Routes = [
  { path: '',      component: ProductsLoaderComponent },
  { path: 'bikes-loader',  component: ProductsLoaderComponent },
  { path: 'prices-updater',  component: PricesUpdaterComponent },
  { path: '**',    component: NoContentComponent },
];
