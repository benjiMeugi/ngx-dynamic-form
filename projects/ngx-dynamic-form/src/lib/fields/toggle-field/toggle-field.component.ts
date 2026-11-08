import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-toggle-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleFieldComponent),
    multi: true,
  }],
})
export class ToggleFieldComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() tabIndex = 0;

  value = false;
  isDisabled = false;

  private onChange: (v: boolean) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(val: any): void {
    this.value = !!val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  toggle(): void {
    if (this.isDisabled) return;
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouchedFn();
  }
}
