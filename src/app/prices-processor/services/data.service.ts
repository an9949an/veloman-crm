import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ProductsData } from './models/products-data';

@Injectable()
export class Data {
  public static get(item: string[], prop: string, headers: string[]): string {
    return item[headers.indexOf(prop)];
  }

  private _catalogData$: BehaviorSubject<ProductsData>;
  private _shopData$: BehaviorSubject<string[][]>;

  get catalogData$(): Observable<ProductsData> {
    return this._catalogData$.asObservable();
  }

  get shopData$(): Observable<string[][]> {
    return this._shopData$.asObservable();
  }

  constructor() {
    this._catalogData$ = new BehaviorSubject<ProductsData>({items: [], headers: []});
    this._shopData$ = new BehaviorSubject<string[][]>([]);
  }

  public setCatalogData(data: ProductsData): void {
    this._catalogData$.next(data);
  }

  public setShopData(data: string[][]): void {
    this._shopData$.next(data);
  }

  public clear(): void {
    this._catalogData$.next({items: [], headers: []});
    this._shopData$.next([]);
  }
}
