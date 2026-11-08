import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleFieldComponent } from './toggle-field.component';

describe('ToggleFieldComponent', () => {
  let component: ToggleFieldComponent;
  let fixture: ComponentFixture<ToggleFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être initialisé à false par défaut', () => {
    expect(component.value).toBeFalse();
  });

  it('devrait inverser la valeur lors du toggle', () => {
    let changedVal: boolean | undefined;
    component.registerOnChange((v: boolean) => (changedVal = v));

    component.toggle();
    expect(component.value).toBeTrue();
    expect(changedVal).toBeTrue();

    component.toggle();
    expect(component.value).toBeFalse();
    expect(changedVal).toBeFalse();
  });

  it('ne devrait rien faire si disabled', () => {
    component.setDisabledState(true);
    component.toggle();
    expect(component.value).toBeFalse();
  });
});
