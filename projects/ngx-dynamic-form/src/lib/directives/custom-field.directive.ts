import { Directive, Input, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FieldConfig } from '../models/field-config.model';

export interface CustomFieldContext {
  $implicit: FieldConfig;
  field: FieldConfig;
  control: AbstractControl | null;
}

@Directive({
  selector: '[dfCustomField]',
  standalone: true,
})
export class CustomFieldDirective {
  @Input('dfCustomField') fieldType!: string;

  constructor(public templateRef: TemplateRef<CustomFieldContext>) {}
}
