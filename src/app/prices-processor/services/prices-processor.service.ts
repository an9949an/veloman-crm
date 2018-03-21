import { Injectable } from '@angular/core';
import { Data } from './data.service';
import { ProductsData } from './models/products-data';
import { FilesProcessor } from './files-processor.service';

@Injectable()
export class PricesProcessor {

  /**
   * Indexes in csv item array
   */
  private static csvIndexes = {
    type: 0,
    brand: 1,
    name: 2,
    price: 5
  };

  /**
   * isProductsSimilar
   * @param {string[]} product
   * @param {string[]} otherProduct
   * @returns {boolean}
   */
  private static isProductsSimilar(product: string[], otherProduct: string[]) {
    return otherProduct[1] === product[1] && otherProduct[2] === product[2];
  }

  /**
   * isProductInSelection
   * @param {string[]} types
   * @param {string[]} brands
   * @param {string[]} headers
   * @param product
   * @returns {(product: string[]) => boolean}
   */
  private static isProductInSelection(types: string[],
                                      brands: string[],
                                      headers: string[],
                                      product: string[]): boolean {
    const productBrand = Data.get(product, 'Производитель', headers);
    const productType = Data.get(product, 'Раздел', headers);
    return types.indexOf(productType) > -1 && brands.indexOf(productBrand) > -1;
  }

  /**
   * isPriceExists
   * @param {string[]} product
   * @returns {boolean}
   */
  private static isPriceExists(product: string[]): boolean {
    const productPrice = product[PricesProcessor.csvIndexes.price]
      .replace(',', '.');
    return parseFloat(productPrice) > 0;
  }

  /**
   * minPriceReduce
   * @param {string[]} product
   * @param {string} price
   * @param {string} shop
   * @returns {string}
   */
  private static minPriceReduce(product: string[], price: string, shop: string): string {
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
  }

  constructor(private data: Data) {
  }

  /**
   * buildCsv
   * @param {string[]} types
   * @param {string[]} brands
   * @param {string[]} sellers
   * @param fields
   */
  public buildCsv({
                    types,
                    brands,
                    sellers
                  }: {
                    types: string[],
                    brands: string[],
                    sellers: string[]
                  },
                  fields: any): void {

    const process = ({items, headers}: ProductsData): void => {
      const filteredProducts = items.filter(
        PricesProcessor.isProductInSelection.bind(this, types, brands, headers)
      );

      const csvArray: string[][] = filteredProducts.map(
        this.getCsvItem.bind(this, fields, sellers, headers)
      );

      const filteredCsv = csvArray.filter(PricesProcessor.isPriceExists);

      this.makeCsvWithOldItems(filteredCsv, fields, types, brands);
    };

    this.data.catalogData$.take(1).subscribe(process);
  }

  /**
   * makeCsvWithOldItems
   * @param {string[][]} newCsv
   * @param fields
   * @param types
   * @param brands
   */
  private makeCsvWithOldItems(newCsv: string[][],
                              fields: any,
                              types: string[],
                              brands: string[]): void {
    this.data.shopData$.take(1)
      .map((shopCsv) => {
        if (fields.updateOldItems) {
          return shopCsv.map(this.updatePriceFrom.bind(this, newCsv));
        }
        return shopCsv;
      })
      .map((shopCsv) => {
        if (fields.deleteRedundant) {
          return shopCsv.filter(this.isProductActual.bind(this, newCsv, types, brands));
        }
        return shopCsv;
      })
      .map((shopCsv) => {
        const uniqueNewProductsCsv = newCsv.filter((newProduct) => {
          return !shopCsv.some(PricesProcessor.isProductsSimilar.bind(this, newProduct));
        });
        return [...shopCsv, ...uniqueNewProductsCsv];
      })
      .subscribe(FilesProcessor.makeFile);
  }

  /**
   * isProductActual
   * @param {string[][]} newCsv
   * @param {string[]} types
   * @param {string[]} brands
   * @param product
   * @returns {(product: string[]) => boolean}
   */
  private isProductActual(newCsv: string[][],
                          types: string[],
                          brands: string[],
                          product: string[]): boolean {
    const haveSelectedTypeAndBrand =
      types.indexOf(product[PricesProcessor.csvIndexes.type]) > -1 &&
      brands.indexOf(product[PricesProcessor.csvIndexes.brand]) > -1;

    if (haveSelectedTypeAndBrand) {
      return newCsv.some((newProduct) => PricesProcessor.isProductsSimilar(product, newProduct));
    }
    return true;
  }

  /**
   * updatePriceFrom
   * @param {string[][]} newCsv
   * @param {string[]} product
   * @returns {string[]}
   */
  private updatePriceFrom(newCsv: string[][], product: string[]): string[] {
    const newRelatedProduct = newCsv.find(PricesProcessor.isProductsSimilar.bind(this, product));

    if (newRelatedProduct) {
      product[PricesProcessor.csvIndexes.price] =
        newRelatedProduct[PricesProcessor.csvIndexes.price];
      return product;
    }

    return product;
  }

  /**
   * getCsvItem
   * @param fields
   * @param sellers
   * @param headers
   * @param product
   * @returns {(product) => (any)[]}
   */
  private getCsvItem(fields: any, sellers, headers, product): string[] {
    const productPrice = sellers.reduce(PricesProcessor.minPriceReduce.bind(this, product), '0');

    return [
      Data.get(product, 'Раздел', headers),
      Data.get(product, 'Производитель', headers),
      Data.get(product, 'Название', headers),
      '',
      '',
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
  }
}
