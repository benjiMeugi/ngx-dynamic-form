import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FieldConfig, KeyValue } from '../../models/field-config.model';
import { DynamicFormBuilderService } from '../../services/form-builder.service';
import { ErrorMessageService } from '../../services/error-message.service';
import { sanitizeIntegerInput } from '../../utils/integer-input.util';

import { SelectFieldComponent } from '../select-field/select-field.component';
import { DateFieldComponent } from '../date-field/date-field.component';
import { PhoneFieldComponent } from '../phone-field/phone-field.component';
import { FileFieldComponent } from '../file-field/file-field.component';
import { ConditionalVisibilityService } from '../../services/conditional-visibility.service';
import { isFieldVisible } from '../../utils/visibility.util';
import { Subscription } from 'rxjs';
import { PasswordFieldComponent } from '../password-field/password-field.component';
import { IntegerFieldComponent } from '../integer-field/integer-field.component';
import { DecimalFieldComponent } from '../decimal-field/decimal-field.component';
import { ToggleFieldComponent } from '../toggle-field/toggle-field.component';
import { TimeFieldComponent } from '../time-field/time-field.component';
import { CustomFieldContext } from '../../directives/custom-field.directive';

interface LazySelectState {
  items: KeyValue[];
  loading: boolean;
}

@Component({
  selector: 'lib-array-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectFieldComponent,
    DateFieldComponent,
    PhoneFieldComponent,
    FileFieldComponent,
    PasswordFieldComponent,
    IntegerFieldComponent,
    DecimalFieldComponent,
    ToggleFieldComponent,
    TimeFieldComponent
  ],
  templateUrl: './array-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayFieldComponent {
  /** Le FieldConfig de type 'array' (contient arrayConfig) */
  @Input() field!: FieldConfig;
  @Input() formArray!: FormArray;
  @Input() optionsMap: Record<string, KeyValue[]> = {};
  @Input() lazyState: Record<string, LazySelectState> = {};
  @Input() customFieldTemplates: Record<string, TemplateRef<CustomFieldContext>> = {};

  @Output() lazySearch = new EventEmitter<{ fieldName: string; term: string }>();
  @Output() lazyScrollEnd = new EventEmitter<string>();

  private visibilitySubs = new Map<FormGroup, Subscription>();

  constructor(
    private formBuilder: DynamicFormBuilderService,
    private errorMessageService: ErrorMessageService,
    private conditionalVisibility: ConditionalVisibilityService,
    private cdr: ChangeDetectorRef,
  ) { }
  ngOnInit(): void {
    this.groups.forEach(group => this.attachVisibility(group));
  }

  private attachVisibility(group: FormGroup): void {
    if (this.visibilitySubs.has(group)) return;
    const sub = this.conditionalVisibility.attach(group, this.field.arrayConfig!.fields);
    this.visibilitySubs.set(group, sub);
  }

  isVisible(group: FormGroup, subField: FieldConfig): boolean {
    return isFieldVisible(subField, group.getRawValue());
  }
  get groups(): FormGroup[] {
    return this.formArray.controls as FormGroup[];
  }

  getSelectItems(subField: FieldConfig): KeyValue[] {
    return subField.optionSource?.lazy
      ? this.lazyState[subField.name]?.items ?? []
      : this.optionsMap[subField.name] ?? [];
  }

  onLazySearch(subField: FieldConfig, term: string): void {
    this.lazySearch.emit({ fieldName: subField.name, term });
  }

  onLazyScrollEnd(subField: FieldConfig): void {
    this.lazyScrollEnd.emit(subField.name);
  }

  getErrorMessageForControl(control: AbstractControl | null, subField: FieldConfig): string | null {
    if (!control || !control.touched || !control.errors) return null;
    const key = Object.keys(control.errors)[0];
    return this.errorMessageService.resolve(subField, key, control.errors[key]);
  }

  canAdd(): boolean {
    const max = this.field.arrayConfig?.maxItems;
    return max === undefined || this.formArray.length < max;
  }

  canRemove(): boolean {
    const min = this.field.arrayConfig?.minItems;
    return min === undefined || this.formArray.length > min;
  }

  addItem(): void {
    if (!this.canAdd()) return;
    const newGroup = this.formBuilder.buildArrayItem(this.field);
    this.formArray.push(newGroup);
    this.attachVisibility(newGroup);
    this.cdr.markForCheck();
  }

  removeItem(index: number): void {
    if (!this.canRemove()) return;
    const group = this.groups[index];
    this.visibilitySubs.get(group)?.unsubscribe();
    this.visibilitySubs.delete(group);
    this.formArray.removeAt(index);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.visibilitySubs.forEach(sub => sub.unsubscribe());
    this.visibilitySubs.clear();
  }

  getArrayErrorMessage(): string | null {
    if (!this.formArray.touched || !this.formArray.errors) return null;
    const key = Object.keys(this.formArray.errors)[0];
    return this.errorMessageService.resolveArrayError(this.field, key, this.formArray.errors[key]);
  }

  hasSubControlError(group: FormGroup, subFieldName: string): boolean {
    const control = group.get(subFieldName);
    if (!control || !control.touched) return false;
    return !!control.errors || !!this.getCrossErrorMessage(group, subFieldName);
  }

  getCrossErrorMessage(group: FormGroup, subFieldName: string): string | null {
    if (!group.errors) return null;

    for (const [errorKey, errorValue] of Object.entries(group.errors)) {
      const fields: string[] = errorValue.fields ?? [];
      const targetField = errorValue.errorOnField ?? fields[fields.length - 1];
      if (targetField === subFieldName && fields.every(name => group.get(name)?.touched)) {
        return this.errorMessageService.resolveCrossError(errorKey, errorValue);
      }
    }
    return null;
  }
}