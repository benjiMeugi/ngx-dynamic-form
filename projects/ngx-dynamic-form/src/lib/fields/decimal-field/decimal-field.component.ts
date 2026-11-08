import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { decimalDisplayToNumber, numberToDecimalDisplay, sanitizeDecimalInput } from '../../utils/decimal-input.util';

@Component({
  selector: 'lib-decimal-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './decimal-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DecimalFieldComponent),
    multi: true,
  }],
})
export class DecimalFieldComponent implements ControlValueAccessor {
  @Input() decimals = 2;
  @Input() decimalSeparator: ',' | '.' = ',';
  @Input() placeholder = '';
  @Input() tabIndex = 0;

  displayValue = '';
  isDisabled = false;

  private onChange: (value: number | null) => void = () => { };
  private onTouchedFn: () => void = () => { };

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: number | null): void {
    this.displayValue = numberToDecimalDisplay(value, this.decimalSeparator);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedFn = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(raw: string): void {
    const cleaned = sanitizeDecimalInput(raw, this.decimalSeparator, this.decimals);
    this.displayValue = cleaned;
    this.onChange(decimalDisplayToNumber(cleaned, this.decimalSeparator));
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End'
    ];

    // Touches de navigation / édition
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Autoriser les chiffres
    if (/^[0-9]$/.test(event.key)) {
      return;
    }

    // Autoriser le signe "-" uniquement au début et une seule fois
    if (event.key === '-') {

      if (input.value.includes('-')) {
        event.preventDefault();
        return;
      }

      if (input.selectionStart !== 0) {
        event.preventDefault();
        return;
      }

      return;
    }

    // Autoriser le séparateur décimal
    if (event.key === this.decimalSeparator) {

      // Un seul séparateur
      if (input.value.includes(this.decimalSeparator)) {
        event.preventDefault();
        return;
      }

      // Le séparateur ne peut pas être le premier caractère
      // sauf si on veut permettre une saisie du type ".5" / ",5"
      if (input.selectionStart === 0) {
        event.preventDefault();
        return;
      }

      return;
    }

    // Tout le reste est interdit
    event.preventDefault();
  }

  onBlur(): void {
    this.onTouchedFn();
  }
}