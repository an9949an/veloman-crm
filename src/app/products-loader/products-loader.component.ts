import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ExistedProducts } from './services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'bikes-loader',
  templateUrl: 'products-loader.component.html',
  styleUrls: ['products-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ExistedProducts
  ]
})
export class ProductsLoaderComponent  implements OnInit {
  public link: string;
  public loadingInProcess = false;
  private loadExistedState$: BehaviorSubject<{ text: string, warningColor: boolean }>;

  constructor(public existedProducts: ExistedProducts) {
  }

  public ngOnInit() {
    this.loadExistedState$ = new BehaviorSubject({
      text: 'Файл не загружен',
      warningColor: true
    });
  }

  public loadExistedProducts(file: any): void {
    this.existedProducts.loadExistedProducts(file)
      .subscribe(
        (fileName) => this.loadExistedState$.next({
          text: `Файл ${fileName} успешно обработан`,
          warningColor: false
        }),
        (fileName) => this.loadExistedState$.next({
          text: `При обработке файла ${fileName} произошла ошибка`,
          warningColor: true
        })
      );
  }
}
