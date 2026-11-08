import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FieldConfig } from '../models/field-config.model';
import { isFieldVisible } from '../utils/visibility.util';

@Injectable({ providedIn: 'root' })
export class ConditionalVisibilityService {

  /**
   * Active la gestion des champs conditionnels sur un FormGroup.
   * Renvoie l'abonnement à détruire (ngOnDestroy, ou suppression d'une ligne de tableau).
   */
  attach(group: FormGroup, fields: FieldConfig[]): Subscription {
    this.sync(group, fields); // état initial

    const hasConditions = fields.some(f => !!f.visibleWhen);
    if (!hasConditions) return new Subscription();

    return group.valueChanges.subscribe(() => this.sync(group, fields));
  }

  private sync(group: FormGroup, fields: FieldConfig[]): void {
    for (const field of fields) {
      if (!field.visibleWhen) continue;
      if (field.disabled) continue; // le disabled statique reste toujours prioritaire

      const control = group.get(field.name);
      if (!control) continue;

      const visible = isFieldVisible(field, group.getRawValue());
      if (visible && control.disabled) {
        control.enable({ emitEvent: false });
      } else if (!visible && control.enabled) {
        control.disable({ emitEvent: false });
      }
    }
  }
}