import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DynamicFormComponent } from './dynamic-form.component';
import { FormConfig } from '../models/form-config.model';

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  const mockConfig: FormConfig = {
    id: 'test-form',
    title: 'Mon Formulaire de Test',
    submitLabel: 'Valider',
    fields: [
      { name: 'username', type: 'text', label: 'Nom d\'utilisateur', validation: { required: true } },
      { name: 'email', type: 'email', label: 'Email', validation: { email: true } },
      { name: 'isActive', type: 'toggle', label: 'Actif', defaultValue: true },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    component.formConfig = mockConfig;
    fixture.detectChanges();
  });

  it('devrait créer le composant et initialiser le formulaire', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.get('username')).toBeDefined();
    expect(component.form.get('email')).toBeDefined();
    expect(component.form.get('isActive')?.value).toBeTrue();
  });

  it('devrait émettre formSubmit si le formulaire est valide', () => {
    let submittedValue: any;
    component.formSubmit.subscribe(val => (submittedValue = val));

    component.form.get('username')?.setValue('Dupont');
    component.form.get('email')?.setValue('test@example.com');

    component.onSubmit();
    expect(submittedValue).toBeDefined();
    expect(submittedValue.username).toBe('Dupont');
    expect(submittedValue.isActive).toBeTrue();
  });

  it('ne devrait pas émettre et marquer tous les champs touchés si invalide', () => {
    let emitted = false;
    component.formSubmit.subscribe(() => (emitted = true));

    component.form.get('username')?.setValue('');
    component.onSubmit();

    expect(emitted).toBeFalse();
    expect(component.form.get('username')?.touched).toBeTrue();
  });

  it('devrait trier les champs selon l\'ordre défini', () => {
    const customConfig: FormConfig = {
      id: 'sorted',
      fields: [
        { name: 'b', type: 'text', order: 2 },
        { name: 'a', type: 'text', order: 1 },
      ],
    };
    component.formConfig = customConfig;
    component.ngOnChanges({
      formConfig: {
        currentValue: customConfig,
        previousValue: undefined,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    expect(component.sortedFields[0].name).toBe('a');
    expect(component.sortedFields[1].name).toBe('b');
  });

  it('devrait retourner le template custom s\'il est renseigné', () => {
    expect(component.getCustomFieldTemplate('unknown')).toBeUndefined();
    const fakeTpl = {} as any;
    component.customFieldTemplates = { 'custom-rich': fakeTpl };
    expect(component.getCustomFieldTemplate('custom-rich')).toBe(fakeTpl);
  });

  it('devrait détecter correctement les erreurs d\'un contrôle', () => {
    expect(component.hasControlError('username')).toBeFalse();
    const ctrl = component.form.get('username')!;
    ctrl.setValue('');
    ctrl.markAsTouched();
    expect(component.hasControlError('username')).toBeTrue();
  });
});
