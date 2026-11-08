import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChipsConfig } from '../../models/field-config.model';

@Component({
  selector: 'lib-chips-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chips-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsFieldComponent),
      multi: true,
    },
  ],
})
export class ChipsFieldComponent implements ControlValueAccessor {
  @Input() placeholder?: string;
  @Input() chipsConfig?: ChipsConfig;
  @Input() tabIndex = 0;

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;

  chips: string[] = [];
  inputValue = '';
  errorMessage: string | null = null;
  isDisabled = false;

  private onChange: (v: string[]) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(val: any): void {
    if (Array.isArray(val)) {
      this.chips = [...val.map(String)];
    } else if (typeof val === 'string' && val.trim().length > 0) {
      this.chips = val.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      this.chips = [];
    }
    this.errorMessage = null;
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

  isMaxReached(): boolean {
    const max = this.chipsConfig?.maxChips;
    return typeof max === 'number' && this.chips.length >= max;
  }

  focusInput(): void {
    if (!this.isDisabled && this.inputEl) {
      this.inputEl.nativeElement.focus();
    }
  }

  addChip(rawText: string): boolean {
    if (this.isDisabled) return false;

    let text = rawText.trim();
    if (!text) return false;

    const transform = this.chipsConfig?.transform ?? 'trim';
    if (transform === 'lowercase') text = text.toLowerCase();
    if (transform === 'uppercase') text = text.toUpperCase();

    // Vérification du maximum
    if (this.isMaxReached()) {
      this.errorMessage = this.chipsConfig?.maxChipsMessage ?? `Nombre maximal de ${this.chipsConfig?.maxChips} éléments atteint.`;
      this.cdr.markForCheck();
      return false;
    }

    // Vérification des doublons
    const allowDuplicates = this.chipsConfig?.allowDuplicates ?? false;
    if (!allowDuplicates && this.chips.includes(text)) {
      this.errorMessage = this.chipsConfig?.duplicateMessage ?? `L'élément « ${text} » existe déjà.`;
      this.cdr.markForCheck();
      return false;
    }

    // Vérification de la regex
    if (this.chipsConfig?.pattern) {
      const regex = new RegExp(this.chipsConfig.pattern);
      if (!regex.test(text)) {
        this.errorMessage = this.chipsConfig?.patternMessage ?? `Format invalide pour « ${text} ».`;
        this.cdr.markForCheck();
        return false;
      }
    }

    this.chips.push(text);
    this.inputValue = '';
    this.errorMessage = null;
    this.onChange(this.chips);
    this.onTouchedFn();
    this.cdr.markForCheck();
    return true;
  }

  removeChip(index: number): void {
    if (this.isDisabled) return;
    if (index >= 0 && index < this.chips.length) {
      this.chips.splice(index, 1);
      this.errorMessage = null;
      this.onChange(this.chips);
      this.onTouchedFn();
      this.cdr.markForCheck();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const separators = this.chipsConfig?.separatorKeys ?? ['Enter', ','];
    if (separators.includes(event.key)) {
      event.preventDefault();
      this.addChip(this.inputValue);
      return;
    }

    if (event.key === 'Backspace' && this.inputValue === '' && this.chips.length > 0) {
      event.preventDefault();
      this.removeChip(this.chips.length - 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text');
    if (!pastedText) return;

    if (pastedText.includes(',') || pastedText.includes('\n')) {
      event.preventDefault();
      const parts = pastedText.split(/,|\n/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (!this.addChip(part)) break;
      }
    }
  }

  onInputBlur(): void {
    if (this.inputValue.trim().length > 0) {
      this.addChip(this.inputValue);
    }
    this.onTouchedFn();
  }
}
