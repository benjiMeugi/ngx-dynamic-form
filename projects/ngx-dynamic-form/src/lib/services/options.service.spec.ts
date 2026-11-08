import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OptionsService } from './options.service';

describe('OptionsService', () => {
  let service: OptionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OptionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renvoie [] sans source', (done) => {
    service.load().subscribe(r => { expect(r).toEqual([]); done(); });
  });

  it('renvoie les options statiques', (done) => {
    service.load({ options: [{ key: 'a', value: 'A' }] }).subscribe(r => {
      expect(r.length).toBe(1);
      done();
    });
  });

  it('charge depuis une URL', () => {
    let res: any;
    service.load({ url: '/opts' }).subscribe(r => (res = r));
    http.expectOne('/opts').flush([{ key: 'k', value: 'v' }]);
    expect(res).toEqual([{ key: 'k', value: 'v' }]);
  });

  it('loadPage envoie page, pageSize et recherche', () => {
    service.loadPage({ url: '/v', pageSize: 10, searchParamName: 'q' }, 2, 'lo').subscribe();
    const req = http.expectOne(r => r.url === '/v');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('q')).toBe('lo');
    req.flush({ items: [], total: 0 });
  });

  it('loadPage n\'envoie pas la recherche sans searchParamName', () => {
    service.loadPage({ url: '/v' }, 1, 'lo').subscribe();
    const req = http.expectOne(r => r.url === '/v');
    expect(req.request.params.has('q')).toBeFalse();
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush({ items: [], total: 0 });
  });
});
