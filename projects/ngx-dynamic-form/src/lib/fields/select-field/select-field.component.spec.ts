import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFieldComponent } from './select-field.component';

describe('SelectFieldComponent', () => {
  let component: SelectFieldComponent;
  let fixture: ComponentFixture<SelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter items case-insensitively and accent-insensitively when not lazy', () => {
    component.items = [
      { key: '1', value: 'Bébé (0–12 mois)' },
      { key: '2', value: 'Moyen (12–24 mois)' },
      { key: '3', value: 'Grand (2–3 ans)' }
    ];
    component.lazy = false;

    // Sans recherche
    component.searchTerm = '';
    expect(component.filteredItems.length).toBe(3);

    // Avec recherche insensible aux accents ("bebe")
    component.searchTerm = 'bebe';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].key).toBe('1');

    // Avec recherche insensible à la casse ("GRAND")
    component.searchTerm = 'GRAND';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].key).toBe('3');

    // Recherche par clé
    component.searchTerm = '2';
    expect(component.filteredItems.some(i => i.key === '2')).toBeTrue();
  });

  it('should not filter items locally when lazy is true', () => {
    component.items = [
      { key: '1', value: 'Amina' },
      { key: '2', value: 'Kofi' }
    ];
    component.lazy = true;
    component.searchTerm = 'Amina';
    expect(component.filteredItems.length).toBe(2);
  });
});
