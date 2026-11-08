import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KeyValue } from '../../models/field-config.model';

@Component({
  selector: 'lib-select-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule],
  templateUrl: './select-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectFieldComponent),
    multi: true,
  }],
})
export class SelectFieldComponent implements ControlValueAccessor {
  @Input() items: KeyValue[] = [];
  @Input() placeholder = 'Sélectionner...';
  @Input() clearable = true;
  @Input() lazy = false;
  @Input() loading = false;
  @Input() multiple = false;
  @Input() tabIndex = 0;

  @Output() searchChange = new EventEmitter<string>();
  @Output() scrolledToBottom = new EventEmitter<void>();

  isOpen = false;
  searchTerm = '';

  /** Mode simple */
  selectedValue: string | null = null;
  selectedLabel = '';

  /** Mode multiple */
  selectedValues: string[] = [];

  private onChange: (value: any) => void = () => {};
  private onTouchedFn: () => void = () => {};
  isDisabled = false;

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.cdr.markForCheck();
    }
  }

  writeValue(value: string | string[] | null): void {
    if (this.multiple) {
      this.selectedValues = Array.isArray(value) ? value : [];
    } else {
      this.selectedValue = (value as string) ?? null;
      const found = this.items.find(i => i.key === this.selectedValue);
      this.selectedLabel = found ? found.value : '';
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedFn = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) this.isOpen = false;
    this.cdr.markForCheck();
  }

  toggleOpen(): void {
    if (this.isDisabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.onTouchedFn();
    this.cdr.markForCheck();
  }

  isSelected(opt: KeyValue): boolean {
    return this.multiple
      ? this.selectedValues.includes(opt.key)
      : this.selectedValue === opt.key;
  }

  selectOption(opt: KeyValue): void {
    if (this.isDisabled) return;
    if (this.multiple) {
      this.toggleMultipleOption(opt);
    } else {
      this.selectedValue = opt.key;
      this.selectedLabel = opt.value;
      this.onChange(opt.key);
      this.isOpen = false;
      this.searchTerm = '';
    }
    this.cdr.markForCheck();
  }

  private toggleMultipleOption(opt: KeyValue): void {
    const index = this.selectedValues.indexOf(opt.key);
    if (index >= 0) {
      this.selectedValues = this.selectedValues.filter(v => v !== opt.key);
    } else {
      this.selectedValues = [...this.selectedValues, opt.key];
    }
    this.onChange(this.selectedValues);
    this.cdr.markForCheck();
  }

  removeChip(key: string, event: Event): void {
    event.stopPropagation();
    this.selectedValues = this.selectedValues.filter(v => v !== key);
    this.onChange(this.selectedValues);
    this.cdr.markForCheck();
  }

  clearSelection(event: Event): void {
    if (this.isDisabled) return;
    event.stopPropagation();
    if (this.multiple) {
      this.selectedValues = [];
      this.onChange([]);
    } else {
      this.selectedValue = null;
      this.selectedLabel = '';
      this.onChange(null);
    }
    this.cdr.markForCheck();
  }

  getLabel(key: string): string {
    return this.items.find(i => i.key === key)?.value ?? key;
  }

  onSearchInput(term: string): void {
    this.searchChange.emit(term);
  }

  onScrolledIndexChange(index: number): void {
    if (!this.lazy) return;
    if (index >= this.items.length - 5) {
      this.scrolledToBottom.emit();
    }
  }
}