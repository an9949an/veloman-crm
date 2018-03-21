import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as Cookies from 'cookies-js';

@Component({
  selector: 'additional-fields',
  templateUrl: 'additional-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalFieldsComponent implements OnInit {

  private static readonly DRAFT_COOKIE = 'AdditionalFieldsDraft';

  public form: FormGroup;
  @Output() public buildFile = new EventEmitter();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      manufacturer: ['', Validators.required],
      importer: ['', Validators.required],
      services: ['', Validators.required],
      guarantee: ['', Validators.required],
      deliveryMinskTime: ['', Validators.required],
      deliveryMinskPrice: ['', Validators.required],
      deliveryBelarusTime: ['', Validators.required],
      deliveryBelarusPrice: ['', Validators.required],
      lifeTime: ['', Validators.required],
      forblablablaonly: [''],
      credit: [''],

      updateOldItems: [false],
      deleteRedundant: [false]
    });
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {

    const draft = Cookies.get(AdditionalFieldsComponent.DRAFT_COOKIE);

    if (draft) {
      this.form.setValue(JSON.parse(draft));
    }

    this.form.valueChanges
      .do((value) => Cookies.set(
        AdditionalFieldsComponent.DRAFT_COOKIE,
        JSON.stringify(value)
      ))
      .subscribe();
  }

}
