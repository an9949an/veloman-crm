import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ProductsData } from './models/products-data';

@Injectable()
export class Data {
  public static get(item: string[], prop: string, headers: string[]): string {
    return item[headers.indexOf(prop)];
  }

  private _data$: BehaviorSubject<ProductsData>;

  get data$(): Observable<ProductsData> {
    return this._data$.asObservable();
  }

  constructor() {
    this._data$ = new BehaviorSubject<ProductsData>({items: [], headers: []});
  }

  public setData(data: ProductsData): void {
    this._data$.next(data);
  }
}
