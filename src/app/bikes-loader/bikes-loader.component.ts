import { Component, OnInit } from '@angular/core';
import { ProductsLoader } from './products-loader';

@Component({
  selector: 'bikes-loader',
  templateUrl: 'bikes-loader.component.html',
  styleUrls: ['bikes-loader.component.scss'],
  providers: [
    ProductsLoader
  ]
})

export class BikesLoaderComponent implements OnInit {
  public link: string;
  public loadingInProcess = false;
  public loadExistedState: { text: string, warningColor: boolean } = {
    text: 'Файл не загружен',
    warningColor: true
  };

  constructor(public productsLoader: ProductsLoader) {
  }

  public ngOnInit() {
  }

  public loadExistedProducts(file: any): void {
    this.productsLoader.loadExistedProducts(file)
      .then((fileName) => {
        this.loadExistedState = {
          text: `Файл ${fileName} успешно обработан`,
          warningColor: false
        };
      })
      .catch((fileName) => {
        this.loadExistedState = {
          text: `При обработке файла ${fileName} произошла ошибка`,
          warningColor: true
        };
      });
  }
}
