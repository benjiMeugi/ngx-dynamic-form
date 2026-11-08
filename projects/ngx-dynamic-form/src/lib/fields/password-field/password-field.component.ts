import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-password-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PasswordFieldComponent),
    multi: true,
  }],
})
export class PasswordFieldComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() showToggle = true;

  value = '';
  isVisible = false;
  isDisabled = false;
  @Input() tabIndex = 0;

  private onChange: (value: string | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedFn = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(raw: string): void {
    this.value = raw;
    this.onChange(raw === '' ? null : raw);
  }

  onBlur(): void {
    this.onTouchedFn();
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.cdr.markForCheck();
  }
}