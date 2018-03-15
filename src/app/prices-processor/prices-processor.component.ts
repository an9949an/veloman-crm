import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PricesProcessor } from './services';
import { UiData } from './services/ui-data.service';
import { Data } from './services/data.service';
import { FilesProcessor } from './services/files-processor.service';

@Component({
  selector: 'bikes-loader',
  templateUrl: 'prices-processor.component.html',
  styleUrls: ['prices-processor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PricesProcessor,
    Data,
    UiData
  ]
})
export class PricesProcessorComponent {

  constructor(private filesProcessor: FilesProcessor,
              public uiData: UiData) {
  }

  public loadCatalogFile(fileInput: any): void {
    this.filesProcessor.loadCatalogFile(fileInput.files[0]).subscribe();
    fileInput.value = '';
  }

  public loadShopFile(fileInput: any): void {
    this.filesProcessor.loadShopFile(fileInput.files[0]).subscribe();
    fileInput.value = '';
  }

  public selectTypes(options: HTMLCollection) {
    const types = [].map.call(options, (option) => option.value);
    this.uiData.setTypes(types);
  }

  public selectBrands(options: HTMLCollection) {
    const brands = [].map.call(options, (option) => option.value);
    this.uiData.setBrands(brands);
  }

  public selectSellers(options: HTMLCollection) {
    const sellers = [].map.call(options, (option) => option.value);
    this.uiData.setSellers(sellers);
  }
}
