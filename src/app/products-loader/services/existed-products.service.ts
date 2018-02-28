import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse/papaparse';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExistedProducts {

  public existedProductNames: string[] = [];
  public loadExistedProducts: (file: any) => Observable<string>;

  constructor(public http: HttpClient) {
    this.loadExistedProducts = bindNodeCallback(this.parseExistedProductsFile);
  }

  /**
   * parseExistedProductsFile
   * @param file
   * @param {(file: any) => string} callback
   */
  private parseExistedProductsFile(file: any,
                                   callback: (error: string, result?: string) => void): void {
    let that = this;

    Papa.parse(file, {
      delimiter: ',',
      header: true,
      newline: '\n',
      quotes: true,
      quoteChar: '"',
      complete(e, fileData) {
        that.existedProductNames = e.data.map((x) => x['meta:name_from_onliner']);
        callback(null, <string> fileData.name);
      },
      error(e, fileData) {
        that.existedProductNames = [];
        alert('Ошибка. И один Господь Бог в курсе что за хрень там произошла, извините, но ' +
          'ничего поделать уже нельзя. Все кончено. Товары не запаросились, бизнес просран. ' +
          'Выход один: алкоголизм. Приносим еще раз свои искренние извинения за неудобства, ' +
          'обратитесь в ближайший виноводочный отдел, благодарим за понимание.');
        callback(<string> fileData.name);
      }
    });
  }
}
