import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxHelloTextComponent } from './ngx-hello-text.component';

describe('NgxHelloTextComponent', () => {
  let component: NgxHelloTextComponent;
  let fixture: ComponentFixture<NgxHelloTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxHelloTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxHelloTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
