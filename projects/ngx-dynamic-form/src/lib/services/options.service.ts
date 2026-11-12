import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    if (source.url && !source.lazy) {
      let params = new HttpParams();
      if (source.queryParams) {
        Object.entries(source.queryParams).forEach(([k, v]) => {
          params = params.set(k, String(v));
        });
      }
      return this.http.get<any>(source.url, { params }).pipe(
        map((response) => this.extractItems(response, source)),
        catchError(() => of(source.options ?? []))
      );
    }
    return of(source.options ?? []);
  }

  /** Chargement paginé + recherche (grandes listes) */
  loadPage(source: OptionSource, page: number, search = ''): Observable<PagedResult> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', source.pageSize ?? 20);

    if (source.queryParams) {
      Object.entries(source.queryParams).forEach(([k, v]) => {
        params = params.set(k, String(v));
      });
    }

    if (search && source.searchParamName) {
      params = params.set(source.searchParamName, search);
    }

    return this.http.get<any>(source.url!, { params }).pipe(
      map((response) => {
        const items = this.extractItems(response, source);
        const total = this.extractTotal(response, items.length);
        return { items, total };
      }),
      catchError(() => of({ items: source.options ?? [], total: source.options?.length ?? 0 }))
    );
  }

  /**
   * Extrait et normalise le tableau d'éléments en KeyValue[]
   */
  private extractItems(response: any, source: OptionSource): KeyValue[] {
    if (!response) return source.options ?? [];

    let rawList: any = null;

    if (source.dataPath) {
      rawList = this.resolvePath(response, source.dataPath);
    } else {
      // Détection automatique des structures d'enveloppes API courantes
      if (Array.isArray(response)) {
        rawList = response;
      } else if (response?.body?.response_data !== undefined) {
        const rd = response.body.response_data;
        rawList = Array.isArray(rd) ? rd : (Array.isArray(rd?.data) ? rd.data : []);
      } else if (Array.isArray(response?.data)) {
        rawList = response.data;
      } else if (Array.isArray(response?.items)) {
        rawList = response.items;
      }
    }

    if (!Array.isArray(rawList)) {
      return source.options ?? [];
    }

    return rawList.map((item) => this.mapToKeyValue(item, source));
  }

  /**
   * Mappe un élément brut vers l'interface KeyValue
   */
  private mapToKeyValue(item: any, source: OptionSource): KeyValue {
    if (typeof item !== 'object' || item === null) {
      return { key: String(item), value: String(item) };
    }

    // Si l'objet a déjà la forme { key, value } et aucune règle spécifique n'est fournie
    if (!source.keyProperty && !source.valueProperty && !source.labelFormat && 'key' in item && 'value' in item) {
      return { key: String(item.key), value: String(item.value) };
    }

    // Résolution de la clé
    let key: any;
    if (source.keyProperty && item[source.keyProperty] !== undefined) {
      key = item[source.keyProperty];
    } else if (item.id !== undefined) {
      key = item.id;
    } else if (item.key !== undefined) {
      key = item.key;
    } else if (item.code !== undefined) {
      key = item.code;
    } else {
      key = item;
    }

    // Résolution de la valeur (libellé)
    let value: string;
    if (typeof source.labelFormat === 'function') {
      value = source.labelFormat(item);
    } else if (typeof source.labelFormat === 'string') {
      value = source.labelFormat.replace(/\{(\w+)\}/g, (_, prop) =>
        item[prop] !== undefined && item[prop] !== null ? String(item[prop]) : ''
      );
    } else if (source.valueProperty && item[source.valueProperty] !== undefined) {
      value = String(item[source.valueProperty]);
    } else if (item.label !== undefined) {
      value = String(item.label);
    } else if (item.name !== undefined) {
      value = String(item.name);
    } else if (item.title !== undefined) {
      value = String(item.title);
    } else if (item.value !== undefined) {
      value = String(item.value);
    } else {
      value = String(key);
    }

    return { key: String(key), value };
  }

  /**
   * Extrait le total pour les réponses paginées
   */
  private extractTotal(response: any, fallbackCount: number): number {
    if (typeof response?.total === 'number') return response.total;
    if (typeof response?.body?.response_data?.total === 'number') return response.body.response_data.total;
    if (typeof response?.body?.total === 'number') return response.body.total;
    if (typeof response?.data?.total === 'number') return response.data.total;
    if (typeof response?.meta?.total === 'number') return response.meta.total;
    return fallbackCount;
  }

  /**
   * Résout un chemin imbriqué (ex: 'body.response_data')
   */
  private resolvePath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}
