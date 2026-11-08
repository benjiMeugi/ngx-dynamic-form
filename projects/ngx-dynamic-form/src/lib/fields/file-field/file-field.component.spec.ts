import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFieldComponent } from './file-field.component';

describe('FileFieldComponent', () => {
  let component: FileFieldComponent;
  let fixture: ComponentFixture<FileFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
