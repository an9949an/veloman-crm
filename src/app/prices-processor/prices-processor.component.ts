import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PricesProcessor } from './services';
import { UiData } from './services/ui-data.service';
import { Data } from './services/data.service';

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

  constructor(public pricesProcessor: PricesProcessor,
              public uiData: UiData) {
  }

  public loadFile(file: any): void {
    this.pricesProcessor.loadFile(file).subscribe();
  }

  public selectTypes(options: HTMLCollection) {
    const types = [].map.call(options, (option) => option.value);
    this.uiData.setTypes(types);
  }

}
