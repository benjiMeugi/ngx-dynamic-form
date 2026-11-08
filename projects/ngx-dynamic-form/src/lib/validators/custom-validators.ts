import { AbstractControl, FormArray, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export class CustomValidators {
  static integer(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === '') return null;
      return Number.isInteger(Number(control.value)) ? null : { integer: true };
    };
  }

  static pattern(regex: string): ValidatorFn {
    return Validators.pattern(new RegExp(regex));
  }

  static maxFileSize(maxSizeMb: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const files: File[] = control.value;
      if (!files || !files.length) return null;
      const tooBig = files.some(f => f.size > maxSizeMb * 1024 * 1024);
      return tooBig ? { maxFileSize: { maxSizeMb } } : null;
    };
  }

  static maxFilesCount(maxFiles: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const files: File[] = control.value;
      if (!files) return null;
      return files.length > maxFiles ? { maxFilesCount: { maxFiles } } : null;
    };
  }


  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const parsed = parsePhoneNumberFromString(control.value);
      return parsed?.isValid() ? null : { phone: true };
    };
  }

  static requiredFileList(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const files: File[] = control.value;
      return files && files.length > 0 ? null : { required: true };
    };
  }

  static minDate(min: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return new Date(control.value) >= new Date(min) ? null : { minDate: { min } };
    };
  }

  static maxDate(max: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return new Date(control.value) <= new Date(max) ? null : { maxDate: { max } };
    };
  }

  static minTime(min: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value >= min ? null : { minTime: { min } };
    };
  }

  static maxTime(max: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value <= max ? null : { maxTime: { max } };
    };
  }

  static minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      return arr.length >= min ? null : { minArrayLength: { min } };
    };
  }

  static maxArrayLength(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      return arr.length <= max ? null : { maxArrayLength: { max } };
    };
  }

  static requiredArray(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return Array.isArray(value) && value.length > 0 ? null : { required: true };
    };
  }
}