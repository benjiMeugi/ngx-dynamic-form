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

  it('extrait automatiquement les données depuis une enveloppe body.response_data avec id/label', () => {
    let res: any;
    service.load({ url: '/api/languages' }).subscribe(r => (res = r));
    http.expectOne('/api/languages').flush({
      success: true,
      body: {
        response_data: [
          { id: 1, label: 'Français', code: 'fr' },
          { id: 2, label: 'Anglais', code: 'en' }
        ]
      }
    });
    expect(res).toEqual([
      { key: '1', value: 'Français' },
      { key: '2', value: 'Anglais' }
    ]);
  });

  it('prend en charge dataPath, keyProperty, valueProperty et queryParams', () => {
    let res: any;
    service.load({
      url: '/api/custom',
      dataPath: 'result.payload',
      keyProperty: 'uuid',
      valueProperty: 'title',
      queryParams: { active: true }
    }).subscribe(r => (res = r));

    const req = http.expectOne(r => r.url === '/api/custom');
    expect(req.request.params.get('active')).toBe('true');
    req.flush({
      result: {
        payload: [
          { uuid: 'u-1', title: 'Option 1' },
          { uuid: 'u-2', title: 'Option 2' }
        ]
      }
    });

    expect(res).toEqual([
      { key: 'u-1', value: 'Option 1' },
      { key: 'u-2', value: 'Option 2' }
    ]);
  });

  it('prend en charge un labelFormat personnalisé', () => {
    let res: any;
    service.load({
      url: '/api/users',
      labelFormat: (u) => `${u.first_name} ${u.last_name} (${u.role})`
    }).subscribe(r => (res = r));

    http.expectOne('/api/users').flush([
      { id: 10, first_name: 'Jean', last_name: 'Dupont', role: 'Admin' }
    ]);

    expect(res).toEqual([
      { key: '10', value: 'Jean Dupont (Admin)' }
    ]);
  });
});
