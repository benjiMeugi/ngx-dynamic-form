import { TestBed } from '@angular/core/testing';

import { NgxHelloTextService } from './ngx-hello-text.service';

describe('NgxHelloTextService', () => {
  let service: NgxHelloTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxHelloTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
