import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { KeyValue, OptionSource } from '../models/field-config.model';

export interface PagedResult {
  items: KeyValue[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OptionsService {
  constructor(private http: HttpClient) {}

  /** Chargement simple (petites listes) */
  load(source?: OptionSource): Observable<KeyValue[]> {
    if (!source) return of([]);
    if (source.url && !source.lazy) return this.http.get<KeyValue[]>(source.url);
    return of(source.options ?? []);
  }

  /** Chargement paginé + recherche (grandes listes) */
  loadPage(source: OptionSource, page: number, search = ''): Observable<PagedResult> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', source.pageSize ?? 20);

    if (search && source.searchParamName) {
      params = params.set(source.searchParamName, search);
    }

    return this.http.get<PagedResult>(source.url!, { params });
  }
}