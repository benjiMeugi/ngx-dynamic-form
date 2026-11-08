import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipsFieldComponent } from './chips-field.component';
import { FormsModule } from '@angular/forms';

describe('ChipsFieldComponent', () => {
  let component: ChipsFieldComponent;
  let fixture: ComponentFixture<ChipsFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipsFieldComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty chips array', () => {
    expect(component.chips).toEqual([]);
  });

  it('should writeValue with array of strings', () => {
    component.writeValue(['angular', 'tailwind']);
    expect(component.chips).toEqual(['angular', 'tailwind']);
  });

  it('should writeValue with comma-separated string', () => {
    component.writeValue('html, css, js');
    expect(component.chips).toEqual(['html', 'css', 'js']);
  });

  it('should add a chip and trigger onChange', () => {
    let emitted: string[] | null = null;
    component.registerOnChange((val: string[]) => {
      emitted = val;
    });

    const success = component.addChip('angular');
    expect(success).toBeTrue();
    expect(component.chips).toEqual(['angular']);
    expect(emitted as string[] | null).toEqual(['angular']);
  });

  it('should reject duplicates by default', () => {
    component.chips = ['angular'];
    const success = component.addChip('angular');
    expect(success).toBeFalse();
    expect(component.chips.length).toBe(1);
    expect(component.errorMessage).toBeTruthy();
  });

  it('should allow duplicates when allowDuplicates is true', () => {
    component.chipsConfig = { allowDuplicates: true };
    component.chips = ['angular'];
    const success = component.addChip('angular');
    expect(success).toBeTrue();
    expect(component.chips.length).toBe(2);
  });

  it('should enforce maxChips limit', () => {
    component.chipsConfig = { maxChips: 2 };
    component.addChip('tag1');
    component.addChip('tag2');
    const success = component.addChip('tag3');
    expect(success).toBeFalse();
    expect(component.chips.length).toBe(2);
    expect(component.isMaxReached()).toBeTrue();
  });

  it('should validate pattern when provided', () => {
    component.chipsConfig = {
      pattern: '^[a-z]+@[a-z]+\\.[a-z]{2,}$',
      patternMessage: 'Email invalide',
    };

    const invalid = component.addChip('not-an-email');
    expect(invalid).toBeFalse();
    expect(component.errorMessage).toBe('Email invalide');

    const valid = component.addChip('user@domain.com');
    expect(valid).toBeTrue();
    expect(component.chips).toEqual(['user@domain.com']);
  });

  it('should remove a chip by index', () => {
    component.chips = ['a', 'b', 'c'];
    let emitted: string[] | null = null;
    component.registerOnChange((val: string[]) => {
      emitted = val;
    });

    component.removeChip(1);
    expect(component.chips).toEqual(['a', 'c']);
    expect(emitted as string[] | null).toEqual(['a', 'c']);
  });

  it('should remove last chip on Backspace when input is empty', () => {
    component.chips = ['first', 'second'];
    component.inputValue = '';

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(component.chips).toEqual(['first']);
  });

  it('should not add chips when disabled', () => {
    component.setDisabledState(true);
    const added = component.addChip('test');
    expect(added).toBeFalse();
    expect(component.chips.length).toBe(0);
  });
});
