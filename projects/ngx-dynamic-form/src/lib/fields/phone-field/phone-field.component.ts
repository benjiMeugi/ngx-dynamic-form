import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AsYouType, CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { CountryDialCode, buildCountryList } from '../../models/country-dial-code.model';

@Component({
  selector: 'lib-phone-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhoneFieldComponent),
    multi: true,
  }],
})
export class PhoneFieldComponent implements ControlValueAccessor, OnInit {
  @Input() defaultCountryIso: CountryCode = 'FR';
  @Input() locale = 'fr';

  countries: CountryDialCode[] = [];
  filteredCountries: CountryDialCode[] = [];
  selectedCountry!: CountryDialCode;
  isOpen = false;
  displayValue = '';
  isDisabled = false;
  @Input() tabIndex = 0;
  private onChange: (v: string | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.countries = buildCountryList(this.locale);
    this.filteredCountries = this.countries;
    this.selectedCountry =
      this.countries.find(c => c.iso === this.defaultCountryIso) ?? this.countries[0];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.filteredCountries = this.countries;
      this.cdr.markForCheck();
    }
  }

  writeValue(value: string | null): void {
    if (!value) {
      this.displayValue = '';
      this.cdr.markForCheck();
      return;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (parsed) {
      const country = this.countries.find(c => c.iso === parsed.country);
      if (country) this.selectedCountry = country;
      this.displayValue = parsed.formatNational();
    } else {
      this.displayValue = value;
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
    this.cdr.markForCheck();
  }

  selectCountry(c: CountryDialCode): void {
    this.selectedCountry = c;
    this.isOpen = false;
    this.filteredCountries = this.countries;
    this.emitValue();
    this.cdr.markForCheck();
  }

  onCountrySearch(term: string): void {
    const t = term.toLowerCase();
    this.filteredCountries = this.countries.filter(
      c => c.name.toLowerCase().includes(t) || c.dial.includes(t)
    );
    this.cdr.markForCheck();
  }

  /** Formatage en direct selon le pays sélectionné (espaces, tirets propres à chaque pays) */
  onNumberInput(raw: string): void {
    this.displayValue = new AsYouType(this.selectedCountry.iso).input(raw);
    this.emitValue();
  }

  onBlur(): void { this.onTouchedFn(); }

  private emitValue(): void {
    const digits = this.displayValue.replace(/\D/g, '');
    this.onChange(digits ? `${this.selectedCountry.dial}${digits}` : null);
  }
}