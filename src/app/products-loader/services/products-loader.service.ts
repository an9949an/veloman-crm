import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/concat';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const random = require('lodash/random');

@Injectable()
export class ProductsLoader {

  // region Additional Static Functions

  /**
   * getApiLink
   * @param {string} link
   * @param {number} page
   * @returns {string}
   */
  private static getApiPageLink(link: string, page: number): string {
    return (link + '&page=' + page + '&group=1')
      .replace('https://catalog.onliner.by', 'https://catalog.api.onliner.by:443/search');
  }

  /**
   * randomTimeout
   * @returns {Observable<number>}
   */
  private static randomTimeout(): Observable<number> {
    return Observable.timer(random(1500, 2000)).take(1);
  }

  /**
   * getProductLink
   * @param product
   * @returns {string}
   */
  private static getProductLink(product: any): string {
    return 'https://catalog.api.onliner.by:443/products/' + product.key
      + '?include=schema,configurations,gallery,parameters';
  }

  // endregion Additional Static Functions

  public loadingInProcess$: BehaviorSubject<boolean>;
  public csv$: BehaviorSubject<boolean>;

  constructor(public http: HttpClient) {
    this.loadingInProcess$ = new BehaviorSubject(false);
  }

  public loadProducts(link): Observable<object> {
    this.loadingInProcess$.next(true);
    return this.load(link)
      .finally(() => this.loadingInProcess$.next(false));
  }

  /**
   * load
   * @param link
   * @param {Observable<object>} page$
   * @param {number} pageNumber
   * @returns {Observable<object>}
   */
  private load(link,
               page$?: Observable<object>,
               pageNumber = 2): Observable<object> {
    const getPage = (page: number) => {
      return this.http.get(ProductsLoader.getApiPageLink(link, page));
    };

    page$ = page$ || getPage(1);

    const nextPage = ProductsLoader.randomTimeout().mergeMap(() => getPage(pageNumber));

    const concatAllProductsRecursively = (page: any) => {
      const next = page.current < page.last ?
        this.load(link, nextPage, pageNumber + 1) : Observable.empty();

      return Observable.concat(
        this.loadProductsFromPage(page),
        next
      );
    };

    return page$.flatMap(concatAllProductsRecursively);
  }

  /**
   * loadProductsFromPage
   * @param {any[]} products
   * @returns {Observable<object>}
   */
  private loadProductsFromPage({products}: { products: any[] }): Observable<object> {
    return Observable.concat(...products.map((product) => {
      return ProductsLoader
        .randomTimeout()
        .mergeMap(() => this.http.get(
          ProductsLoader.getProductLink(product)
        ));
    }));
  }

}
