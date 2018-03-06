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
  private _selectedBrands$: BehaviorSubject<string[]>;

  constructor(private data: Data) {
    this._selectedTypes$ = new BehaviorSubject<string[]>([]);
    this._selectedSellers$ = new BehaviorSubject<string[]>([]);
    this._selectedBrands$ = new BehaviorSubject<string[]>([]);

    this.productTypes$ = this.getProductTypesObservable();
    this.brands$ = this.getBandsObservable();
    this.sellers$ = this.getSellersObservable();
  }

  get selectedSellers$(): Observable<string[]> {
    return this._selectedSellers$.asObservable();
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
    this._selectedSellers$.next(sellers);
  }

  /**
   * setBrands
   * @param {string[]} brands
   */
  public setBrands(brands: string[]): void {
    this._selectedBrands$.next(brands);
  }

  /**
   * clear
   */
  public clear(): void {
    this._selectedTypes$.next([]);
    this._selectedSellers$.next([]);
    this._selectedBrands$.next([]);
    this.data.clear();
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

  /**
   * getSellersObservable
   * @returns {Observable<string[]>}
   */
  private getSellersObservable(): Observable<string[]> {
    const stream = Observable.zip(
      this._selectedTypes$,
      this._selectedBrands$,
      this.data.data$,
      (types: string[], brands: string[], data: ProductsData) => ({types, brands, data})
    );

    const getSellers = (computed: { types: string[], brands: string[], data: ProductsData }) => {
      let sellers: string[] = [];

      for (const item of computed.data.items) {
        const itemBrand = Data.get(item, 'Производитель', computed.data.headers);
        const itemType = Data.get(item, 'Раздел', computed.data.headers);
        if (computed.brands.indexOf(itemBrand) > -1 && computed.types.indexOf(itemType) > -1) {
          for (let shopNumber = 1; ; shopNumber++) {
            const shopHeader = `Магазин ${shopNumber}`;
            if (computed.data.headers.indexOf(shopHeader) < 0) {
              break;
            }

            const itemInShopPrice = parseInt(
              Data.get(item, `Цена ${shopNumber}`, computed.data.headers),
              10
            );

            const shopName = Data.get(item, shopHeader, computed.data.headers);
            const sellerAdded = sellers.indexOf(shopName) > -1;
            if (itemInShopPrice > 0 && !sellerAdded) {
              sellers.push(shopName);
            }
          }
        }
      }

      return sellers;
    };

    return stream.map(getSellers);
  }
}
