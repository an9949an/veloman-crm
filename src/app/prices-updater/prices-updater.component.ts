import { Component, OnInit } from '@angular/core';
import { PricesUpdater } from './services';

@Component({
  selector: 'prices-updater',
  templateUrl: 'prices-updater.component.html',
  styleUrls: ['prices-updater.component.scss'],
  providers: [
    PricesUpdater
  ]
})

export class PricesUpdaterComponent {

  public loadFromOnlinerState: { text: string, warningColor: boolean } = {
    text: 'Файл не загружен',
    warningColor: true
  };

  public loadFromSiteState: { text: string, warningColor: boolean } = {
    text: 'Файл не загружен',
    warningColor: true
  };

  constructor(public pricesUpdater: PricesUpdater) {
  }

  /**
   * loadFile
   * @param file
   * @param {(file: any) => Promise<string>} serviceFn
   * @param {string} stateProp
   */
  public loadFile(file: any,
                  serviceFn: (file: any) => Promise<string>,
                  stateProp: string
                  ): void {
    serviceFn(file)
      .then((fileName) => {
        this[stateProp] = {
          text: `Файл ${fileName} успешно обработан`,
          warningColor: false
        };
      })
      .catch((fileName) => {
        this[stateProp] = {
          text: `При обработке файла ${fileName} произошла ошибка`,
          warningColor: true
        };
      });
  }
}
