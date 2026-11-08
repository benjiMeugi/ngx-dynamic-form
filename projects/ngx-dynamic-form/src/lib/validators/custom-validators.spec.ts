import { FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';

const file = (size: number) => ({ size } as File);

describe('CustomValidators', () => {
  it('integer', () => {
    const v = CustomValidators.integer();
    expect(v(new FormControl(''))).toBeNull();
    expect(v(new FormControl(null))).toBeNull();
    expect(v(new FormControl(3))).toBeNull();
    expect(v(new FormControl('3.5'))).toEqual({ integer: true });
    expect(v(new FormControl('abc'))).toEqual({ integer: true });
  });

  it('pattern', () => {
    const v = CustomValidators.pattern('^[a-z]+$');
    expect(v(new FormControl('abc'))).toBeNull();
    expect(v(new FormControl('ABC'))).not.toBeNull();
  });

  it('maxFileSize', () => {
    const v = CustomValidators.maxFileSize(1);
    expect(v(new FormControl([file(500)]))).toBeNull();
    expect(v(new FormControl([file(2 * 1024 * 1024)]))).toEqual({ maxFileSize: { maxSizeMb: 1 } });
    expect(v(new FormControl(null))).toBeNull();
  });

  it('maxFilesCount', () => {
    const v = CustomValidators.maxFilesCount(1);
    expect(v(new FormControl([file(1)]))).toBeNull();
    expect(v(new FormControl([file(1), file(1)]))).toEqual({ maxFilesCount: { maxFiles: 1 } });
  });

  it('requiredFileList', () => {
    const v = CustomValidators.requiredFileList();
    expect(v(new FormControl([]))).toEqual({ required: true });
    expect(v(new FormControl([file(1)]))).toBeNull();
  });

  it('phone', () => {
    const v = CustomValidators.phone();
    expect(v(new FormControl(''))).toBeNull();
    expect(v(new FormControl('+33612345678'))).toBeNull();
    expect(v(new FormControl('123'))).toEqual({ phone: true });
  });

  it('minDate / maxDate', () => {
    expect(CustomValidators.minDate('2024-01-10')(new FormControl('2024-01-05'))).not.toBeNull();
    expect(CustomValidators.minDate('2024-01-10')(new FormControl('2024-01-15'))).toBeNull();
    expect(CustomValidators.maxDate('2024-01-10')(new FormControl('2024-01-15'))).not.toBeNull();
    expect(CustomValidators.maxDate('2024-01-10')(new FormControl(''))).toBeNull();
  });

  it('minTime / maxTime', () => {
    expect(CustomValidators.minTime('08:30')(new FormControl('08:00'))).not.toBeNull();
    expect(CustomValidators.minTime('08:30')(new FormControl('09:00'))).toBeNull();
    expect(CustomValidators.maxTime('18:00')(new FormControl('19:00'))).not.toBeNull();
    expect(CustomValidators.maxTime('18:00')(new FormControl('17:30'))).toBeNull();
    expect(CustomValidators.maxTime('18:00')(new FormControl(''))).toBeNull();
  });

  it('validateurs de tableau', () => {
    const arr = new FormArray([new FormControl('a'), new FormControl('b')]);
    expect(CustomValidators.minArrayLength(3)(arr)).toEqual({ minArrayLength: { min: 3 } });
    expect(CustomValidators.maxArrayLength(1)(arr)).toEqual({ maxArrayLength: { max: 1 } });
    expect(CustomValidators.minArrayLength(2)(arr)).toBeNull();
    expect(CustomValidators.requiredArray()(new FormControl([]))).toEqual({ required: true });
  });
});
