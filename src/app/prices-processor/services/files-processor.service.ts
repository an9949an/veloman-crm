import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse';
import { Observable } from 'rxjs/Observable';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { Data } from './data.service';
import * as FileSaver from 'file-saver';

@Injectable()
export class FilesProcessor {

  /**`
   * makeCsvFile
   * @param csv
   */
  public static makeFile(csv) {
    const csvStr = Papa.unparse(csv, {
      delimiter: ';',
      header: false,
      newline: '\n',
      quotes: true,
      quoteChar: '"'
    });

    const blob = new Blob([csvStr], {type: 'data:text/csv;charset=utf-8'});
    FileSaver.saveAs(blob, 'prices-for-onliner.csv');
  }

  /**
   * parseFile
   * @param {string} encoding
   * @param file
   * @param {(error: string, result?: any) => void} callback
   */
  private static parseFile(encoding: string,
                           file: any,
                           callback: (error: string, result?: any) => void): void {
    Papa.parse(file, {
      delimiter: ';',
      header: false,
      newline: '\n',
      quotes: true,
      quoteChar: '"',
      encoding,
      complete(e, fileData) {
        callback(null, {data: e.data, fileName: fileData.name});
      },
      error(e, fileData) {
        alert('Ошибка. И один Господь Бог в курсе что за хрень там произошла, извините, но ' +
          'ничего поделать уже нельзя. Все кончено. Товары не запарсились, бизнес просран. ' +
          'Выход один: алкоголизм. Приносим еще раз свои искренние извинения за неудобства, ' +
          'обратитесь в ближайший виноводочный отдел, благодарим за понимание.');
        callback(<string> fileData.name);
      }
    });
  }

  public loadFileWindows1251: (file: any) => Observable<any>;
  public loadFileUTF8: (file: any) => Observable<any>;

  constructor(private data: Data) {
    this.loadFileWindows1251 = bindNodeCallback(
      FilesProcessor.parseFile.bind(this, 'Windows-1251')
    );
    this.loadFileUTF8 = bindNodeCallback(FilesProcessor.parseFile.bind(this, 'UTF-8'));
  }

  /**
   * loadCatalogFile
   * @param file
   * @returns {Observable<string>}
   */
  public loadCatalogFile(file: any): Observable<string> {
    return this.loadFileWindows1251(file)
      .do((fileData) => this.data.setCatalogData({
          items: fileData.data.slice(1, -1),
          headers: fileData.data.slice(0, 1)[0]
        })
      )
      .map((fileData) => <string> fileData.fileName);
  }

  /**
   * loadShopFile
   * @param file
   * @returns {Observable<string>}
   */
  public loadShopFile(file: any): Observable<string> {
    return this.loadFileWindows1251(file)
      .map((fileData) => fileData.data.slice(0, -1))
      .do((products) => this.data.setShopData(products))
      .map((fileData) => <string> fileData.fileName);
  }
}
