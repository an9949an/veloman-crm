import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ExistedProducts } from './existed-products.service';
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
import { ProductsProcessing } from './products-processing.service';

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

  public loadingStatus$: BehaviorSubject<{ started: boolean, progress: number }>;
  public loaded$: BehaviorSubject<string[]>;
  public downloadCsv: () => void;

  constructor(
    private http: HttpClient,
    private existedProducts: ExistedProducts,
    private productsProcessing: ProductsProcessing
  ) {
    this.loadingStatus$ = new BehaviorSubject({started: false, progress: 0});
    this.loaded$ = new BehaviorSubject([]);
    this.downloadCsv =  this.productsProcessing.downloadCsv.bind(this.productsProcessing);
  }

  /**
   * loadProducts
   * @param link
   * @param takeUntil
   * @returns {Observable<object>}
   */
  public loadProducts(link, takeUntil: Observable<any>): Observable<object> {
    this.loadingStatus$.next({started: true, progress: 0});
    this.loaded$.next([]);

    const log = (product) => {
      this.loaded$.next([product.full_name, ...this.loaded$.value]);
    };

    return this.load(link)
      .do(log)
      .takeUntil(takeUntil)
      .toArray()
      .do((products) => this.productsProcessing.process(products))
      .finally(() => this.loadingStatus$.next({started: false, progress: 0}));
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
      const next = page.page.current < page.page.last ?
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
   * @param page
   * @returns {Observable<object>}
   */
  private loadProductsFromPage(page: {
    products: any[],
    total: number,
    total_ungrouped: number,
    page: {
      current: number,
      limit: number
    }
  }): Observable<object> {
    const load = (product, productIndexOnCurrentPage, products) => {
      return ProductsLoader
        .randomTimeout()
        .mergeMap(() => this.http.get(
          ProductsLoader.getProductLink(product)
        ))
        .do(this.setProgress(page, productIndexOnCurrentPage, products.length));
    };

    const productIsNew = (product) => this.existedProducts.names.indexOf(product.name) < 0;

    const products = [].concat(...page.products.map((product) => [product, ...product.children]));

    const productLoaders = products
      .filter(productIsNew)
      .map(load);

    return Observable.concat(...productLoaders);
  }

  /**
   * setProgress
   * @param page
   * @param {number} productIndexOnCurrentPage
   * @param pageSize
   * @returns {() => void}
   */
  private setProgress(page: {
                        total: number,
                        total_ungrouped: number,
                        page: {
                          current: number
                        }
                      },
                      productIndexOnCurrentPage: number,
                      pageSize: number): () => void {
    return () => {
      const productIndex = productIndexOnCurrentPage + 1
        + (page.page.current - 1) * pageSize;
      const totalProgress = 100 * productIndex / page.total_ungrouped;

      this.loadingStatus$.next({started: true, progress: totalProgress});
    };
  }

}
