import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormArray } from '@angular/forms';
import { ArrayFieldComponent } from './array-field.component';

describe('ArrayFieldComponent', () => {
  let component: ArrayFieldComponent;
  let fixture: ComponentFixture<ArrayFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrayFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrayFieldComponent);
    component = fixture.componentInstance;
    component.field = { name: 'items', type: 'array', arrayConfig: { fields: [] } };
    component.formArray = new FormArray<any>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
