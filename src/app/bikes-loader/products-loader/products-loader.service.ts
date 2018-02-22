import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse/papaparse';

@Injectable()
export class ProductsLoader {

  public existedProductNames: string[] = [];

  constructor(public http: HttpClient) {
  }

  /**
   * loadExistedProducts
   * @param file
   * @returns {Promise<string>}
   */
  public loadExistedProducts(file: any): Promise<string> {
    console.log(file);

    return new Promise((resolve, reject) => {
      this.parseExistedProductsFile(file, resolve, reject);
    });
  }

  /**
   * parseExistedProductsFile
   * @param file
   * @param {(fileName: string) => any} resolve
   * @param {(error: string) => any} reject
   */
  public parseExistedProductsFile(file: any,
                                  resolve: (result: string) => any,
                                  reject: (result: string) => any ): void {
    let that = this;

    Papa.parse(file, {
      delimiter: ',',
      header: true,
      newline: '\n',
      quotes: true,
      quoteChar: '"',
      complete(e, fileData) {
        that.existedProductNames = e.data.map((x) => x['meta:name_from_onliner']);
        resolve(<string> fileData.name);
      },
      error(e, fileData) {
        that.existedProductNames = [];
        alert('Ошибка. И один Господь Бог в курсе что за хрень там произошла, извините, но ' +
          'ничего поделать уже нельзя. Все кончено. Товары не запаросились, бизнес просран. ' +
          'Выход один: алкоголизм. Приносим еще раз свои искренние извинения за неудобства, ' +
          'обратитесь в ближайший виноводочный отдел, благодарим за понимание.');
        reject(<string> fileData.name);
      }
    });
  }
}
