import { Injectable } from '@angular/core';
import * as Papa from 'papaparse/papaparse';
const shuffle = require('lodash/shuffle');
const indexOf = require('lodash/indexOf');
const capitalize = require('lodash/capitalize');

@Injectable()
export class ProductsProcessing {

  private csv: any[];

  constructor() {
  }

  public process(products: any[]) {
    this.csv = this.createCsvArrayWithHeaders();
    products.forEach((product) => this.processProduct(product, this.csv));
  }

  public downloadCsv(): void {
    const that = this;

    if (that.csv.length) {
      const csvData = that.csv.map((line: any[]) => line.map((cell) => {
        return cell && cell.replace ? cell.replaceAll('#', ' ') : cell;
      }));

      const csv = Papa.unparse(csvData, {
        delimiter: '~',
        header: true,
        newline: '\n',
        quotes: true,
        quoteChar: '"'
      });
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
      window.open(encodedUri);
      console.log('File downloaded');
    }
  }

  private processProduct(product, csv) {
    csv.push([]);

    this.addToCsv(product.id, 'ID', csv);

    let postTitle = product.name_prefix + ' ' + product.full_name;
    this.addToCsv(postTitle, 'post_title', csv);
    this.addToCsv(product.name, 'meta:name_from_onliner', csv);
    this.addToCsv(product.key, 'meta:key_from_onliner', csv);
    this.addToCsv(product.id, 'meta:id_from_onliner', csv);
    this.addToCsv(
      product.full_name
        .replace(/[\(\)"',\.]/g, '')
        .replace(/&quot;/g, '')
        .split(' ')
        .join('-')
        .toLowerCase(),
      'post_name',
      csv
    );

    let description = '<strong>Велосипед ' + product.full_name
      + '</strong> имеет характеристики: ' +
      shuffle(product.description.split(', ')).join(', ') + '.';

    this.addToCsv(description, 'post_content', csv);
    let images = product.gallery.map(function (image) {
      return image.large.replace('large', 'main');
    }).join('|');
    this.addToCsv(images, 'images', csv);
    this.addToCsv(this.getCategories(product), 'tax:product_cat', csv);
    this.addToCsv(product.full_name, 'meta:_yoast_wpseo_focuskw', csv);
    this.addToCsv(
      'Купить велосипед ' + product.full_name + ' в Минске',
      'meta:_yoast_wpseo_title',
      csv
    );
    this.addToCsv(
      'Купить ' + this.getProductAttrValue('bike_class', product)
      + ' велосипед ' + product.full_name + ' в Минске. '
      + 'Бесплатная доставка, гарантия. Акции и подарки.',
      'meta:_yoast_wpseo_metadesc',
      csv
    );

    if (product.prices) {
      this.addToCsv(product.prices.price_min.amount, 'regular_price', csv);
      this.addToCsv(product.prices.price_max.amount, 'price_max', csv);
    } else {
      this.addToCsv('0', 'regular_price', csv);
    }
    this.addToCsv(this.getPrimaryCategory(product), 'meta:custom_primary_category', csv);
    this.addToCsv(product.parent_key || product.key, 'parent_key', csv);

    this.addAttributes(product, csv);
  }

  /**
   * addAttributes
   * @param product
   * @param csv
   */
  private addAttributes(product, csv) {
    this.addToCsv(product.manufacturer.name, 'attribute:pa_brand', csv);
    const that = this;

    product.parameters.forEach(function (parametersGroup) {
      parametersGroup.parameters.forEach(function (parameter) {
        if (parameter.value[0].type === 'bool') {
          that.addToCsv(parameter.value[0].value ? 'Да' : 'Нет', 'attribute:pa_' + parameter.id, csv);
        } else {
          that.addToCsv(parameter.value[0].value, 'attribute:pa_' + parameter.id, csv);
        }
      })
    });

    this.addToCsv(product.manufacturer.legal_name + '. ' + product.manufacturer.legal_address, 'attribute:pa_manufacturer', csv);
  }

  /**
   * createCsvArrayWithHeaders
   */
  private createCsvArrayWithHeaders() {
    return [[
      'post_title',
      'post_name',
      'ID',
      'regular_price',
      'price_max',
      'images',
      'tax:product_cat'
    ]]
  }

  /**
   * addToProductArray
   * @param value
   * @param attrName
   * @param csv
   */
  private addToCsv(value, attrName, csv) {
    let index = indexOf(csv[0], attrName);
    if (index == -1) {
      csv[0].push(attrName);
      this.addToCsv(value, attrName, csv);
      return;
    }

    csv[csv.length - 1][index] = value;
  }

  /**
   * getBikeBrandCategory
   * @param product
   */
  private getBikeBrandCategory = (product) => 'Велосипеды > Велосипеды ' + product.manufacturer.name;

  /**
   * getPrimaryCategory
   * @param product
   */
  private getPrimaryCategory(product) {
    switch (product.name_prefix) {
      case 'Велосипед':
        return this.getBikeBrandCategory(product);
    }
  }

  /**
   * getCategories
   * @param product
   * @returns {string}
   */
  private getCategories(product) {
    switch (product.name_prefix) {
      case 'Велосипед':
        return this.getBikeCategories(product);
      case 'Детский велосипед':
        return this.getKidBikeCategories(product);
    }
  }

  /**
   * getKidBikeCategories
   * @param product
   */
  private getKidBikeCategories(product) {
    let categories = 'Детские велосипеды';
    categories += '|Детские велосипеды > Детские велосипеды ' + product.manufacturer.name;
    return categories;
  }

  /**
   * getBikeCategories
   * @param product
   * @returns {string}
   */
  private getBikeCategories(product) {
    let categories = 'Велосипеды';

    let commonDate = this.getProductAttrValue('common_date', product);
    if (commonDate) {
      categories += '|Велосипеды > Велосипеды ' + commonDate;
    }

    let brandCategory = this.getBikeBrandCategory(product);
    categories += '|' + brandCategory;
    categories += '|' + brandCategory + ' > Велосипеды ' + product.manufacturer.name + ' ' + commonDate;

    let bikeClassCategories = this.getBikeClassCategories(product);
    bikeClassCategories.forEach(function (category) {
      categories += '|Велосипеды > ' + category;
      categories += '|Велосипеды > ' + category + ' > ' + category + ' ' + commonDate;
      categories += '|' + brandCategory + ' > ' + category + ' ' + product.manufacturer.name;
    });

    let bikeSexCategory = this.getBikeSexCategories(product);
    bikeSexCategory.forEach(function (sexCategory) {
      categories += '|Велосипеды > ' + sexCategory;
      categories += '|Велосипеды > ' + sexCategory + ' > ' + sexCategory + ' ' + commonDate;
      categories += '|' + brandCategory + ' > ' + sexCategory + ' ' + product.manufacturer.name;
      bikeClassCategories.forEach(function (bikeClassCategory) {
        categories += '|Велосипеды > ' + sexCategory + ' > ' + capitalize((sexCategory.split(' ')[0] + ' ' + bikeClassCategory).toLowerCase());
      });
    });

    let bwheelDiameter = this.getProductAttrValue('bwheel_diameter', product);
    if (bwheelDiameter) {
      let intDiameter = parseFloat(bwheelDiameter);
      let measurementUnit = intDiameter === 24 ? 'дюйма' : 'дюймов';
      categories += '|Велосипеды > Велосипеды ' + intDiameter + ' ' + measurementUnit;
    }

    if (product.prices) {
      if (product.prices.max > 10000000) {
        categories += '|Велосипеды > Дорогие велосипеды';
      } else if (product.prices.max < 4000000) {
        categories += '|Велосипеды > Дешевые велосипеды';
      }
    }

    let countryCategory = this.getCountryCategory(product);
    if (countryCategory) {
      categories += '|Велосипеды > ' + countryCategory;
    }

    let bikeColors = this.getProductAttrValue('bike_color', product);
    if (bikeColors) {
      bikeColors.split(', ').forEach(function (color) {
        categories += '|Велосипеды > ' + capitalize(color) + ' велосипед';
      });
    }

    return categories;
  }

  /**
   * getCountryCategory
   * @param product
   */
  private getCountryCategory(product) {
    switch (product.manufacturer.key) {
      case 'stels':
      case 'stinger':
      case 'shulz':
      case 'novatrack':
      case 'stark':
        return 'Российские велосипеды';
      case 'fuji':
        return 'Японские велосипеды';
      case 'aist':
        return 'Белорусские велосипеды';
      case 'trek':
      case 'schwinn':
      case 'specialized':
        return 'Американские велосипеды';
      case 'greenway':
      case 'nakxus':
        return 'Китайские велосипеды';
    }
  }

  /**
   * getBikeClassCategories
   * @param product
   */
  private getBikeClassCategories(product) {
    let bikeClass = this.getProductAttrValue('bike_class', product);
    let bikeClassCategories = [];
    switch (bikeClass) {
      case 'горный':
        bikeClassCategories.push('Горные велосипеды');
        break;
      case 'городской':
        bikeClassCategories.push('Городские велосипеды');
        break;
      case 'гибридный':
        bikeClassCategories.push('Гибридные велосипеды');
        break;
      case 'шоссейный':
        bikeClassCategories.push('Шоссейные велосипеды');
        break;
      case 'комфортный':
        bikeClassCategories.push('Комфортные велосипеды');
        break;
      case 'круизер':
        bikeClassCategories.push('Велосипеды круизеры');
        break;
      case 'BMX':
        bikeClassCategories.push('Велосипеды BMX');
        break;
      case 'туристический':
        bikeClassCategories.push('Туристические велосипеды');
        break;
      case 'циклокроссовый':
        bikeClassCategories.push('Циклокроссовые велосипеды');
        break;
      case 'трековый':
        bikeClassCategories.push('Трековые велосипеды');
        break;
      case 'тандем':
        bikeClassCategories.push('Тандем велосипеды');
        break;
      case 'электровелосипед':
        bikeClassCategories.push('Электровелосипеды');
        break;
      case 'фэт-байк':
        bikeClassCategories.push('Велосипеды фэт-байк');
        break;
    }
    if (this.getProductAttrValue('hardtail', product)) {
      bikeClassCategories.push('Двухподвесные велосипеды');
    }
    if (this.getProductAttrValue('folding_frame', product)) {
      bikeClassCategories.push('Складные велосипеды');
    }

    return bikeClassCategories;
  }

  /**
   * getBikeSexCategories
   * @param product
   */
  private getBikeSexCategories(product) {
    let bikeSexCategories = [];

    if (this.getProductAttrValue('female', product)) {
      bikeSexCategories.push('Женские велосипеды');
    } else {
      bikeSexCategories.push('Мужские велосипеды');
    }
    if (this.getProductAttrValue('bike_kid_teen', product)) {
      bikeSexCategories.push('Подростковые велосипеды');
    }

    return bikeSexCategories;
  }

  /**
   * getProductAttrValue
   * @param attrName
   * @param product
   * @returns {*}
   */
  private getProductAttrValue(attrName, product) {
    let attrValue, attrValueFound = product.parameters.some(function (item) {
      return item.parameters.some(function (param) {
        if (param.id === attrName) {
          attrValue = param.value[0].value;

          return true;
        }
      });
    });

    if (!attrValueFound) {
      console.log('Unknown product attribute ' + attrName + ', fuck you, sucker!');
    }

    return attrValue;
  }

}
