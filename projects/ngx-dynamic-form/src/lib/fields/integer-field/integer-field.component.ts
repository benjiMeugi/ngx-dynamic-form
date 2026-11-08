import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { sanitizeIntegerInput } from '../../utils/integer-input.util';

@Component({
  selector: 'lib-integer-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './integer-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IntegerFieldComponent),
    multi: true,
  }],
})
export class IntegerFieldComponent implements ControlValueAccessor {
  displayValue = '';
  isDisabled = false;
  @Input() tabIndex = 0;

  private onChange: (value: number | null) => void = () => { };
  private onTouchedFn: () => void = () => { };

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: number | null): void {
    this.displayValue = value === null || value === undefined ? '' : String(value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedFn = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(raw: string): void {
    const cleaned = sanitizeIntegerInput(raw);
    this.displayValue = cleaned;
    this.onChange(cleaned === '' ? null : Number(cleaned));
  }

  onBlur(): void {
    this.onTouchedFn();
  }

  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End'
    ];

    // Touches de navigation/édition
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Autoriser les chiffres
    if (/^[0-9]$/.test(event.key)) {
      return;
    }

    // Autoriser "-" uniquement au début et une seule fois
    if (event.key === '-') {
      const input = event.target as HTMLInputElement;

      // Si le "-" existe déjà, on bloque
      if (input.value.includes('-')) {
        event.preventDefault();
        return;
      }

      // "-" doit être saisi au début
      if (input.selectionStart !== 0) {
        event.preventDefault();
        return;
      }

      return;
    }

    // Tout le reste est interdit
    event.preventDefault();
  }
}