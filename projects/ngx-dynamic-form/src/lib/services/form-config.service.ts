import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FormConfig, FormsCollection } from '../models/form-config.model';

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  constructor(private http: HttpClient) {}

  /** jsonUrl : chemin vers le fichier regroupant tous les formulaires (ex: /assets/forms.json) */
  getFormById(jsonUrl: string, formId: string): Observable<FormConfig | undefined> {
    return this.http.get<FormsCollection>(jsonUrl).pipe(
      map(collection => collection.forms.find(f => f.id === formId))
    );
  }
}