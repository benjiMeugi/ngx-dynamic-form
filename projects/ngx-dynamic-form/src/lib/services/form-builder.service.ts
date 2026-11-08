import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { FieldConfig, FieldType } from '../models/field-config.model';
import { CustomValidators } from '../validators/custom-validators';
import { CrossValidationRule } from '../models/form-config.model';
import { buildCrossValidator } from '../validators/cross-field-validators';

@Injectable({ providedIn: 'root' })
export class DynamicFormBuilderService {

  buildForm(fields: FieldConfig[], crossValidation?: CrossValidationRule[]): FormGroup {
    const group: Record<string, AbstractControl> = {};

    for (const field of fields) {
      group[field.name] = field.type === 'array'
        ? this.buildFormArray(field)
        : this.buildFieldControl(field);
    }

    const formGroup = new FormGroup(group);

    if (crossValidation?.length) {
      formGroup.setValidators(crossValidation.map(rule => buildCrossValidator(rule)));
    }

    return formGroup;
  }

  private buildFieldControl(field: FieldConfig): FormControl {
    const validators = this.buildValidators(field);
    const defaultValue = field.defaultValue ?? this.emptyValueFor(field.type);
    return new FormControl({ value: defaultValue, disabled: field.disabled ?? false }, validators);
  }

  private emptyValueFor(type: FieldType): any {
    switch (type) {
      case 'integer':
      case 'decimal':
        return null;
      case 'checkbox':
      case 'toggle':
        return false;
      case 'chips':
        return [];
      default:
        return '';
    }
  }

  buildFormArray(field: FieldConfig): FormArray {
    const arrayConfig = field.arrayConfig;
    if (!arrayConfig) {
      throw new Error(`Le champ "${field.name}" de type "array" doit définir arrayConfig`);
    }

    const initialCount = arrayConfig.defaultItems ?? arrayConfig.minItems ?? 1;
    const groups = Array.from({ length: initialCount }, () => this.buildArrayItem(field));

    const validators: ValidatorFn[] = [];
    if (arrayConfig.minItems !== undefined) {
      validators.push(CustomValidators.minArrayLength(arrayConfig.minItems));
    }
    if (arrayConfig.maxItems !== undefined) {
      validators.push(CustomValidators.maxArrayLength(arrayConfig.maxItems));
    }

    return new FormArray(groups, validators);
  }

  buildArrayItem(field: FieldConfig): FormGroup {
    const arrayConfig = field.arrayConfig!;
    const itemGroup = this.buildForm(arrayConfig.fields);

    if (arrayConfig.crossValidation?.length) {
      itemGroup.setValidators(arrayConfig.crossValidation.map(rule => buildCrossValidator(rule)));
    }

    return itemGroup;
  }

  private buildValidators(field: FieldConfig): ValidatorFn[] {
    const v = field.validation;
    const validators: ValidatorFn[] = [];
    if (!v) return validators;

    if (v.required) {
      if (field.type === 'file') {
        validators.push(CustomValidators.requiredFileList());
      } else if (field.type === 'select' && field.multiple) {
        validators.push(CustomValidators.requiredArray());
      } else {
        validators.push(Validators.required);
      }
    }
    if (v.min !== undefined) validators.push(Validators.min(v.min));
    if (v.max !== undefined) validators.push(Validators.max(v.max));
    if (v.minLength !== undefined) validators.push(Validators.minLength(v.minLength));
    if (v.maxLength !== undefined) validators.push(Validators.maxLength(v.maxLength));
    if (v.email) validators.push(Validators.email);
    if (v.integer) validators.push(CustomValidators.integer());
    if (v.pattern) validators.push(CustomValidators.pattern(v.pattern));
    if (v.phone) validators.push(CustomValidators.phone());
    if (v.minDate) validators.push(CustomValidators.minDate(v.minDate));
    if (v.maxDate) validators.push(CustomValidators.maxDate(v.maxDate));
    if (v.minTime) validators.push(CustomValidators.minTime(v.minTime));
    if (v.maxTime) validators.push(CustomValidators.maxTime(v.maxTime));

    if (field.type === 'file' && field.fileConfig?.maxSizeMb) {
      validators.push(CustomValidators.maxFileSize(field.fileConfig.maxSizeMb));
    }
    if (field.type === 'file' && field.fileConfig?.maxFiles) {
      validators.push(CustomValidators.maxFilesCount(field.fileConfig.maxFiles));
    }

    return validators;
  }
}