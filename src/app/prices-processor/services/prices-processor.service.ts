import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { Observable } from 'rxjs/Observable';
import { Data } from './data.service';
import { ProductsData } from './models/products-data';

@Injectable()
export class PricesProcessor {

  /**
   * makeCsvFile
   * @param csv
   */
  private static makeCsvFile(csv) {
    const csvStr = Papa.unparse(csv, {
      delimiter: ';',
      header: false,
      newline: '\n',
      quotes: true,
      quoteChar: '"'
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvStr);
    window.open(encodedUri);
  }

  public loadFile: (file: any) => Observable<string>;

  constructor(public data: Data) {
    this.loadFile = bindNodeCallback(this.parsePricesFile);
  }

  /**
   * buildFile
   * @param {string[]} types
   * @param {string[]} brands
   * @param {string[]} sellers
   * @param fields
   */
  public buildFile({
                     types,
                     brands,
                     sellers
                   }: {
                     types: string[],
                     brands: string[],
                     sellers: string[]
                   },
                   fields: {
                     shop: string,
                     manufacturer: string
                   }): void {

    const process = ({items, headers}: ProductsData): void => {
      const filteredProducts = items.filter(
        this.filterProduct(types, brands, headers)
      );

      const csvArray = filteredProducts.map(
        this.getCsvItem(fields, sellers, headers)
      );

      const finalCsv = csvArray.filter(
        this.isPriceExists()
      );

      PricesProcessor.makeCsvFile(finalCsv);
    };

    this.data.data$.take(1).subscribe(process);
  }

  /**
   * productPriceReduce
   * @param {string[]} product
   * @returns {(price: string, shop: string) => string}
   */
  private productPriceReduce(product: string[]): (price: string, shop: string) => string {
    return (price: string, shop: string): string => {
      const shopIndex = product.indexOf(shop);
      if (shopIndex > -1) {
        const priceInShop = product[shopIndex + 1];
        const priceIsCorrect = parseFloat(priceInShop) > 0;
        const priceLessThenPrevious = parseFloat(priceInShop) < parseFloat(price);
        if (priceIsCorrect && (priceLessThenPrevious || price === '0')) {
          return priceInShop;
        }
      }
      return price;
    };
  }

  /**
   * getCsvItem
   * @param fields
   * @param sellers
   * @param headers
   * @returns {(product) => (any)[]}
   */
  private getCsvItem(fields: any, sellers, headers) {
    return (product) => {
      const productPrice = sellers.reduce(this.productPriceReduce(product), '0');

      return [
        Data.get(product, 'Раздел', headers),
        Data.get(product, 'Производитель', headers),
        Data.get(product, 'Название', headers),
        productPrice,
        'BYN',
        fields.description,
        fields.manufacturer,
        fields.importer,
        fields.services,
        fields.guarantee,
        fields.deliveryMinskTime,
        fields.deliveryMinskPrice,
        fields.deliveryBelarusTime,
        fields.deliveryBelarusPrice,
        fields.lifeTime,
        fields.forblablablaonly,
        fields.credit,
      ];
    };
  }

  /**
   * filterProduct
   * @param {string[]} types
   * @param {string[]} brands
   * @param {string[]} headers
   * @returns {(product: string[]) => boolean}
   */
  private filterProduct(types: string[],
                        brands: string[],
                        headers: string[]): (product: string[]) => boolean {
    return (product: string[]) => {
      const productBrand = Data.get(product, 'Производитель', headers);
      const productType = Data.get(product, 'Раздел', headers);
      return types.indexOf(productType) > -1 && brands.indexOf(productBrand) > -1;
    };
  }

  /**
   * isPriceExists
   * @returns {(product: string[]) => boolean}
   */
  private isPriceExists(): (product: string[]) => boolean {
    return (product: string[]) => {
      const productPrice = product[3].replace(',', '.');
      return parseFloat(productPrice) > 0;
    };
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
        that.data.setData({items: e.data.slice(1, -1), headers: e.data.slice(0, 1)[0]});
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
