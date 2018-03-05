import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { Observable } from 'rxjs/Observable';
import { Data } from './data.service';

@Injectable()
export class PricesProcessor {

  public loadFile: (file: any) => Observable<string>;

  constructor(public data: Data) {
    this.loadFile = bindNodeCallback(this.parsePricesFile);
  }

  /**
   * loadPricesFile
   * @param file
   * @param {(file: any) => string} callback
   */
  private parsePricesFile(file: any,
                          callback: (error: string, result?: string) => void): void {
    let that = this;

    Papa.parse(file, {
      delimiter: ';',
      header: false,
      newline: '\n',
      quotes: true,
      quoteChar: '"',
      encoding: 'Windows-1251',
      complete(e, fileData) {
        that.data.setData({items: e.data.slice(1, -1), headers: e.data.slice(0, 1)});
        callback(null, <string> fileData.name);
      },
      error(e, fileData) {
        that.data.setData({items: [], headers: []});
        alert('Ошибка. И один Господь Бог в курсе что за хрень там произошла, извините, но ' +
          'ничего поделать уже нельзя. Все кончено. Товары не запаросились, бизнес просран. ' +
          'Выход один: алкоголизм. Приносим еще раз свои искренние извинения за неудобства, ' +
          'обратитесь в ближайший виноводочный отдел, благодарим за понимание.');
        callback(<string> fileData.name);
      }
    });
  }
}
