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
        const itemType = Data.get(item, 'Раздел', productsData.headers);
        if (productTypes.indexOf(itemType) < 0) {
          productTypes.push(itemType);
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
    const getBrands = (types) => {
      return this.data.data$.map((productsData: ProductsData) => {
        let brands = [];

        for (const item of productsData.items) {
          const itemBrand = Data.get(item, 'Производитель', productsData.headers);
          const itemType = Data.get(item, 'Раздел', productsData.headers);
          if (brands.indexOf(itemBrand) < 0 && types.indexOf(itemType) > -1) {
            brands.push(itemBrand);
          }
        }

        return brands;
      });
    };

    return this._selectedTypes$.flatMap(getBrands);
  }
}
