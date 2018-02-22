import { Component, OnInit } from '@angular/core';
import { ExistedProducts } from './services';

@Component({
  selector: 'bikes-loader',
  templateUrl: 'products-loader.component.html',
  styleUrls: ['products-loader.component.scss'],
  providers: [
    ExistedProducts
  ]
})

export class ProductsLoaderComponent implements OnInit {
  public link: string;
  public loadingInProcess = false;
  public loadExistedState: { text: string, warningColor: boolean } = {
    text: 'Файл не загружен',
    warningColor: true
  };

  constructor(public existedProducts: ExistedProducts) {
  }

  public ngOnInit() {
  }

  public loadExistedProducts(file: any): void {
    this.existedProducts.loadExistedProducts(file)
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
