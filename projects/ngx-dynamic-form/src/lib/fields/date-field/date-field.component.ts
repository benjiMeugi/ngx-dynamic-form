import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-date-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateFieldComponent),
    multi: true,
  }],
})
export class DateFieldComponent implements ControlValueAccessor {
  displayValue = '';
  private onChange: (v: any) => void = () => { };
  private onTouchedFn: () => void = () => { };
  @Input() minDate?: string;
  @Input() maxDate?: string;
  isDisabled = false;
  @Input() tabIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: string | null): void {
    this.displayValue = value ? this.isoToDisplay(value) : '';
    this.cdr.markForCheck();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedFn = fn; }

  /** Formatage progressif pendant la saisie : jj/mm/aaaa */
  onTextInput(raw: string): void {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    this.displayValue = formatted;
  }

  /** À la sortie du champ : validation + envoi de la valeur au FormControl (format ISO) */
  onBlur(): void {
    this.onTouchedFn();
    const match = this.displayValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      this.onChange(`${yyyy}-${mm}-${dd}`);
    } else {
      this.displayValue = '';
      this.onChange(null);
    }
  }

  /** Sélection via le calendrier natif (input caché) */
  onNativePick(nativeValue: string): void {
    this.displayValue = nativeValue ? this.isoToDisplay(nativeValue) : '';
    this.onChange(nativeValue || null);
    this.cdr.markForCheck();
  }

  private isoToDisplay(iso: string): string {
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }
}