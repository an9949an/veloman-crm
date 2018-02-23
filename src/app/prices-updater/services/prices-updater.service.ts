import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse';

@Injectable()
export class PricesUpdater {

  private pricesFromOnliner: any[];
  private pricesFromSite: any[];

  /**
   * loadOnlinerCsv
   * @param file
   * @returns {Promise<string>}
   */
  public loadOnlinerCsv(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.parseOnlinerCsv(file, resolve, reject);
    });
  }

  /**
   * loadSiteCsv
   * @param file
   * @returns {Promise<string>}
   */
  public loadSiteCsv(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.parseSiteCsv(file, resolve, reject);
    });
  }

  /**
   * parseOnlinerCsv
   * @param file
   * @param {(result: string) => any} resolve
   * @param {(result: string) => any} reject
   */
  public parseOnlinerCsv(file: any,
                         resolve: (result: string) => any,
                         reject: (result: string) => any): void {
    const that = this;

    Papa.parse(file, {
      delimiter: ';',
      header: false,
      newline: '\n',
      quotes: true,
      encoding: 'Windows-1251',
      quoteChar: '"',
      complete(e, fileData) {
        that.pricesFromOnliner = e.data.map((x) => [x[2], x[5]]);
        resolve(fileData.name);
      },
      error(e, fileData) {
        that.pricesFromOnliner = [];
        reject(fileData.name);
      }
    });
  }

  /**
   * parseSiteCsv
   * @param file
   * @param {(result: string) => any} resolve
   * @param {(result: string) => any} reject
   */
  public parseSiteCsv(file: any,
                      resolve: (result: string) => any,
                      reject: (result: string) => any): void {

    const that = this;

    Papa.parse(file, {
      delimiter: ',',
      header: true,
      newline: '\n',
      quotes: true,
      quoteChar: '"',
      complete(e, fileData) {
        that.pricesFromSite = e.data
          .filter((x) => x['meta:name_from_onliner']).map(function (item) {
            return {
              'ID': item['ID'],
              'meta:name_from_onliner': item['meta:name_from_onliner'],
              'regular_price': item['regular_price'],
            };
          });
        resolve(fileData.name);
      },
      error(e, fileData) {
        that.pricesFromSite = [];
        reject(fileData.name);
      }
    });
  }

  /**
   * calculatePrices
   */
  public calculatePrices(): void {
    const updatePrice = (pricesFromOnliner, siteItem) => {
      const onlinerProductItem = pricesFromOnliner
        .find((item) => item[0] === siteItem['meta:name_from_onliner'].replace('&quot;', '"'));

      if (onlinerProductItem && parseInt(onlinerProductItem[1]) > 0) {
        return {
          ...siteItem,
          regular_price: onlinerProductItem[1],
          stock_status: 'instock'
        };
      }

      return {
        ...siteItem,
        stock_status: 'outofstock'
      };
    };

    const pricesForMerging = this.pricesFromSite
      .map(updatePrice.bind(null, this.pricesFromOnliner))
      .map(function (item) {
        delete item['meta:name_from_onliner'];
        return item;
      });

    const csv = Papa.unparse(pricesForMerging, {
      delimiter: '~',
      header: true,
      newline: '\n',
      quotes: true,
      quoteChar: '"'
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    window.open(encodedUri);
  }
}
