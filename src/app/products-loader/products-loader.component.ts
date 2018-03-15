import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExistedProducts, ProductsLoader } from './services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ProductsProcessing } from './services/products-processing.service';

@Component({
  selector: 'bikes-loader',
  templateUrl: 'products-loader.component.html',
  styleUrls: ['products-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ExistedProducts,
    ProductsLoader,
    ProductsProcessing
  ]
})
export class ProductsLoaderComponent implements OnInit {
  @ViewChild('cancelBtn') public cancelBtn: ElementRef;
  public loadExistedState$: BehaviorSubject<{ text: string, warningColor: boolean }>;
  public log$: Observable<string>;

  constructor(public existedProducts: ExistedProducts,
              public productsLoader: ProductsLoader) {
    this.log$ = productsLoader.loaded$.map((names) => {
      return names.reduce((acc, name) => acc + name + '\r', '');
    });
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

  public loadProducts(link) {
    const cancelBtnClick = Observable.fromEvent(this.cancelBtn.nativeElement, 'click');

    this.productsLoader.loadProducts(link, cancelBtnClick)
      .subscribe((x) => console.log(x));
  }
}
