import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Data } from './data.service';
import { ProductsData } from './models/products-data';

@Injectable()
export class UiData {
  public productTypes$: Observable<string[]>;
  public sellers$: Observable<string[]>;
  public brands$: Observable<string[]>;

  private _selectedTypes$: BehaviorSubject<string[]>;
  private _selectedSellers$: BehaviorSubject<string[]>;

  constructor(private data: Data) {
    this._selectedTypes$ = new BehaviorSubject<string[]>([]);
    this._selectedSellers$ = new BehaviorSubject<string[]>([]);

    this.productTypes$ = this.getProductTypesObservable();
    this.brands$ = this.getBandsObservable();
  }

  /**
   * setTypes
   * @param {string[]} types
   */
  public setTypes(types: string[]): void {
    this._selectedTypes$.next(types);
  }

  /**
   * setSellers
   * @param {string[]} sellers
   */
  public setSellers(sellers: string[]): void {
    this._selectedTypes$.next(sellers);
  }

  /**
   * getProductTypesObservable
   * @returns {Observable<string[]>}
   */
  private getProductTypesObservable(): Observable<string[]> {
    return this.data.data$.map((productsData: ProductsData) => {
      let productTypes = [];

      for (const item of productsData.items) {
        if (productTypes.indexOf(item[0]) < 0) {
          productTypes.push(item[0]);
        }
      }

      return productTypes;
    });
  }

  /**
   * getBandsObservable
   * @returns {Observable<string[]>}
   */
  private getBandsObservable(): Observable<string[]> {
    return this._selectedTypes$
      .flatMap((types) => {
        return this.data.data$.map((productsData: ProductsData) => {
          let brands = [];

          for (const item of productsData.items) {
            if (brands.indexOf(item[1]) < 0 && types.indexOf(item[0]) > -1) {
              brands.push(item[1]);
            }
          }

          return brands;
        });
      });
  }
}
