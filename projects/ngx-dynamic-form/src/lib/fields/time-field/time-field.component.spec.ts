import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeFieldComponent } from './time-field.component';

describe('TimeFieldComponent', () => {
  let component: TimeFieldComponent;
  let fixture: ComponentFixture<TimeFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé avec valeur vide', () => {
    expect(component).toBeTruthy();
    expect(component.value).toBe('');
  });

  it('devrait écrire la valeur', () => {
    component.writeValue('08:30');
    expect(component.value).toBe('08:30');
  });

  it('devrait émettre la nouvelle heure saisie', () => {
    let emitted: string | null = null;
    component.registerOnChange((v: string | null) => (emitted = v));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '17:45';
    input.dispatchEvent(new Event('input'));

    expect(component.value).toBe('17:45');
    expect(emitted as string | null).toBe('17:45');
  });

  it('devrait respecter l\'état disabled', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBeTrue();
  });
});
