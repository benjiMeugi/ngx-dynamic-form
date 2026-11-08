import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-time-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimeFieldComponent),
    multi: true,
  }],
})
export class TimeFieldComponent implements ControlValueAccessor {
  @Input() placeholder = '--:--';
  @Input() minTime?: string;
  @Input() maxTime?: string;
  @Input() step?: number = 60;
  @Input() tabIndex = 0;

  value = '';
  isDisabled = false;

  private onChange: (v: string | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(val: string | null): void {
    this.value = val ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val || null);
  }

  onBlur(): void {
    this.onTouchedFn();
  }
}
