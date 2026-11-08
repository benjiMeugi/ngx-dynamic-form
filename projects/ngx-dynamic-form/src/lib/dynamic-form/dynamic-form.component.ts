import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { FieldConfig, KeyValue } from '../models/field-config.model';
import { FormConfig } from '../models/form-config.model';
import { DynamicFormBuilderService } from '../services/form-builder.service';
import { FormConfigService } from '../services/form-config.service';
import { OptionsService } from '../services/options.service';
import { ErrorMessageService } from '../services/error-message.service';

import { SelectFieldComponent } from '../fields/select-field/select-field.component';
import { DateFieldComponent } from '../fields/date-field/date-field.component';
import { PhoneFieldComponent } from '../fields/phone-field/phone-field.component';
import { FileFieldComponent } from '../fields/file-field/file-field.component';
import { ArrayFieldComponent } from '../fields/array-field/array-field.component';
import { ConditionalVisibilityService } from '../services/conditional-visibility.service';
import { isFieldVisible } from '../utils/visibility.util';
import { IntegerFieldComponent } from '../fields/integer-field/integer-field.component';
import { PasswordFieldComponent } from '../fields/password-field/password-field.component';
import { DecimalFieldComponent } from '../fields/decimal-field/decimal-field.component';
import { InputGroupComponent } from '../input-group/input-group.component';
import { ToggleFieldComponent } from '../fields/toggle-field/toggle-field.component';
import { TimeFieldComponent } from '../fields/time-field/time-field.component';
import { ChipsFieldComponent } from '../fields/chips-field/chips-field.component';
import { CustomFieldContext, CustomFieldDirective } from '../directives/custom-field.directive';

interface LazySelectState {
  items: KeyValue[];
  page: number;
  total: number;
  loading: boolean;
  search$: Subject<string>;
}

@Component({
  selector: 'lib-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectFieldComponent,
    DateFieldComponent,
    PhoneFieldComponent,
    FileFieldComponent,
    ArrayFieldComponent,
    IntegerFieldComponent,
    PasswordFieldComponent,
    DecimalFieldComponent,
    InputGroupComponent,
    ToggleFieldComponent,
    TimeFieldComponent,
    ChipsFieldComponent,
    CustomFieldDirective
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent implements OnInit, OnChanges {

  @Input() jsonUrl?: string;
  @Input() formId?: string;
  @Input() formConfig?: FormConfig;
  @Input() gridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() customFieldTemplates: Record<string, TemplateRef<CustomFieldContext>> = {};

  @ContentChildren(CustomFieldDirective)
  set customDirectives(directives: QueryList<CustomFieldDirective>) {
    if (directives) {
      directives.forEach(dir => {
        this.customFieldTemplates[dir.fieldType] = dir.templateRef;
      });
      this.cdr.markForCheck();
    }
  }

  @Output() formSubmit = new EventEmitter<Record<string, any>>();

  form!: FormGroup;
  sortedFields: FieldConfig[] = [];
  submitLabel = 'Enregistrer';
  title?: string;

  optionsMap: Record<string, KeyValue[]> = {};
  lazyState: Record<string, LazySelectState> = {};

  private visibilitySub?: Subscription;

  constructor(
    private formConfigService: FormConfigService,
    private formBuilder: DynamicFormBuilderService,
    private optionsService: OptionsService,
    private errorMessageService: ErrorMessageService,
    private conditionalVisibility: ConditionalVisibilityService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.resolveFormConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formId'] || changes['formConfig']) {
      this.resolveFormConfig();
    }
  }

  private resolveFormConfig(): void {
    if (this.formConfig) {
      this.initForm(this.formConfig);
      return;
    }
    if (this.jsonUrl && this.formId) {
      this.formConfigService.getFormById(this.jsonUrl, this.formId).subscribe(config => {
        if (config) this.initForm(config);
        else console.error(`Formulaire "${this.formId}" introuvable dans ${this.jsonUrl}`);
      });
    }
  }

  private initForm(config: FormConfig): void {
    this.title = config.title;
    this.submitLabel = config.submitLabel ?? 'Enregistrer';
    this.sortedFields = [...config.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.form = this.formBuilder.buildForm(this.sortedFields, config.crossValidation); // ajout du 2e argument
    this.initAllOptions(this.sortedFields);

    this.visibilitySub?.unsubscribe();
    this.visibilitySub = this.conditionalVisibility.attach(this.form, this.sortedFields);
    this.cdr.markForCheck();
  }

  /** Parcourt récursivement les champs (y compris ceux imbriqués dans un array) pour charger les options select/radio */
  private initAllOptions(fields: FieldConfig[]): void {
    for (const field of fields) {
      if ((field.type === 'select' || field.type === 'radio') && field.optionSource) {
        this.initOptionsForField(field);
      }
      if (field.type === 'array' && field.arrayConfig) {
        this.initAllOptions(field.arrayConfig.fields);
      }
    }
  }

  private initOptionsForField(field: FieldConfig): void {
    const source = field.optionSource!;

    if (source.lazy) {
      const state: LazySelectState = {
        items: [],
        page: 1,
        total: 0,
        loading: false,
        search$: new Subject<string>(),
      };
      this.lazyState[field.name] = state;

      state.search$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          state.items = [];
          state.page = 1;
          state.loading = true;
          return this.optionsService.loadPage(source, 1, term);
        }),
      ).subscribe(result => {
        state.items = result.items;
        state.total = result.total;
        state.loading = false;
        this.cdr.markForCheck();
      });

      state.search$.next('');
    } else {
      this.optionsService.load(source).subscribe(items => {
        this.optionsMap[field.name] = items;
        this.cdr.markForCheck();
      });
    }
  }

  getCustomFieldTemplate(type: string): TemplateRef<CustomFieldContext> | undefined {
    return this.customFieldTemplates[type];
  }

  getSelectItems(field: FieldConfig): KeyValue[] {
    return field.optionSource?.lazy
      ? this.lazyState[field.name]?.items ?? []
      : this.optionsMap[field.name] ?? [];
  }

  onLazyScrollEnd(fieldName: string): void {
    const state = this.lazyState[fieldName];
    const field = this.findFieldByName(this.sortedFields, fieldName);
    if (!state || !field?.optionSource || state.loading) return;
    if (state.items.length >= state.total) return;

    state.loading = true;
    const nextPage = state.page + 1;
    this.optionsService.loadPage(field.optionSource, nextPage, '').subscribe(result => {
      state.items = [...state.items, ...result.items];
      state.page = nextPage;
      state.total = result.total;
      state.loading = false;
      this.cdr.markForCheck();
    });
  }

  onLazySearch(fieldName: string, term: string): void {
    this.lazyState[fieldName]?.search$.next(term);
  }

  private findFieldByName(fields: FieldConfig[], name: string): FieldConfig | undefined {
    for (const f of fields) {
      if (f.name === name) return f;
      if (f.type === 'array' && f.arrayConfig) {
        const found = this.findFieldByName(f.arrayConfig.fields, name);
        if (found) return found;
      }
    }
    return undefined;
  }

  hasControlError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    if (!control || !control.touched) return false;
    return !!control.errors || !!this.getCrossErrorMessage(fieldName);
  }

  getErrorMessageForControl(control: AbstractControl | null, field: FieldConfig): string | null {
    if (!control || !control.touched || !control.errors) return null;
    const firstErrorKey = Object.keys(control.errors)[0];
    return this.errorMessageService.resolve(field, firstErrorKey, control.errors[firstErrorKey]);
  }

  getCrossErrorMessage(fieldName: string): string | null {
    if (!this.form.errors) return null;

    for (const [errorKey, errorValue] of Object.entries(this.form.errors)) {
      const fields: string[] = errorValue.fields ?? [];
      const targetField = errorValue.errorOnField ?? fields[fields.length - 1];
      if (targetField === fieldName && this.isCrossFieldTouched(fields)) {
        return this.errorMessageService.resolveCrossError(errorKey, errorValue);
      }
    }
    return null;
  }

  /** On n'affiche l'erreur croisée que si les champs concernés ont déjà été "touchés" par l'utilisateur */
  private isCrossFieldTouched(fields: string[]): boolean {
    return fields.every(name => this.form.get(name)?.touched);
  }


  getFormArray(fieldName: string): FormArray {
    return this.form.get(fieldName) as FormArray;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.getRawValue());
  }

  isVisible(field: FieldConfig): boolean {
    return isFieldVisible(field, this.form.getRawValue());
  }

  ngOnDestroy(): void {
    this.visibilitySub?.unsubscribe();
  }
}