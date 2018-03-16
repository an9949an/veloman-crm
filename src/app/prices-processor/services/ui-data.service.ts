import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Data } from './data.service';
import { ProductsData } from './models/products-data';
import { ConnectableObservable } from 'rxjs/Rx';
import { PricesProcessor } from './prices-processor.service';

@Injectable()
export class UiData {
  /**
   * sortDesc
   * @param a
   * @param b
   * @returns {number}
   */
  private static sortDesc(a, b): number {
    return (a < b) ? -1 :
      (a > b) ? 1 : 0;
  }

  public productTypes$: ConnectableObservable<string[]>;
  public sellers$: ConnectableObservable<string[]>;
  public brands$: ConnectableObservable<string[]>;

  public shopDataLoaded$: Observable<boolean>;

  private _selectedTypes$: BehaviorSubject<string[]>;
  private _selectedSellers$: BehaviorSubject<string[]>;
  private _selectedBrands$: BehaviorSubject<string[]>;

  constructor(private data: Data,
              private pricesProcessor: PricesProcessor) {
    this._selectedTypes$ = new BehaviorSubject<string[]>([]);
    this._selectedSellers$ = new BehaviorSubject<string[]>([]);
    this._selectedBrands$ = new BehaviorSubject<string[]>([]);

    this.shopDataLoaded$ = this.data.shopData$.map((shopData: any[]) => shopData.length > 0);

    this.productTypes$ = this.getProductTypesObservable()
      .multicast(new BehaviorSubject<string[]>([]));
    this.brands$ = this.getBandsObservable().multicast(new BehaviorSubject<string[]>([]));
    this.sellers$ = this.getSellersObservable().multicast(new BehaviorSubject<string[]>([]));

    this.productTypes$.connect();
    this.brands$.connect();
    this.sellers$.connect();
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
   * buildCsv
   * @param fields
   */
  public buildCsv(fields): void {
    const stream = Observable.zip(
      this._selectedTypes$,
      this._selectedBrands$,
      this._selectedSellers$,
      (types: string[], brands: string[], sellers: string[]) => ({types, brands, sellers})
    ).take(1);

    stream.subscribe((computed) => {
      this.pricesProcessor.buildCsv(computed, fields);
    });
  }

  /**
   * getProductTypesObservable
   * @returns {Observable<string[]>}
   */
  private getProductTypesObservable(): Observable<string[]> {
    return this.data.catalogData$.map((productsData: ProductsData) => {
      let productTypes = [];

      for (const item of productsData.items) {
        const itemType = Data.get(item, 'Раздел', productsData.headers);
        if (productTypes.indexOf(itemType) < 0) {
          productTypes.push(itemType);
        }
      }

      return productTypes.sort(UiData.sortDesc);
    });
  }

  /**
   * getBandsObservable
   * @returns {Observable<string[]>}
   */
  private getBandsObservable(): Observable<string[]> {
    const getBrands = (types) => {
      return this.data.catalogData$.map((productsData: ProductsData) => {
        let brands = [];

        for (const item of productsData.items) {
          const itemBrand = Data.get(item, 'Производитель', productsData.headers);
          const itemType = Data.get(item, 'Раздел', productsData.headers);
          if (brands.indexOf(itemBrand) < 0 && types.indexOf(itemType) > -1) {
            brands.push(itemBrand);
          }
        }

        return brands.sort(UiData.sortDesc);
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
      this.data.catalogData$,
      (types: string[], brands: string[], data: ProductsData) => ({types, brands, data})
    );

    const getSellers = (computed: { types: string[], brands: string[], data: ProductsData }) => {
      let sellers: string[] = [];

      for (const item of computed.data.items) {
        const itemBrand = Data.get(item, 'Производитель', computed.data.headers);
        const itemType = Data.get(item, 'Раздел', computed.data.headers);
        const itemTypeInSelection = computed.types.indexOf(itemType) > -1;
        const itemBrandInSelection = computed.brands.indexOf(itemBrand) > -1;

        if (itemTypeInSelection && itemBrandInSelection) {
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

      return sellers.sort(UiData.sortDesc);
    };

    return stream.map(getSellers);
  }
}
