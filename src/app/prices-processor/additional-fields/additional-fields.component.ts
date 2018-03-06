import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'additional-fields',
  templateUrl: 'additional-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdditionalFieldsComponent {

  public form: FormGroup;
  @Output() public buildFile = new EventEmitter();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      shop: ['', Validators.required],
      manufacturer: ['', Validators.required]
    });
  }

}
