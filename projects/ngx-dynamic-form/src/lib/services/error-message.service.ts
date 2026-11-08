import { Injectable } from '@angular/core';
import { FieldConfig } from '../models/field-config.model';

const DEFAULT_MESSAGES: Record<string, (err: any) => string> = {
  required: () => 'Ce champ est requis',
  email: () => 'Email invalide',
  integer: () => 'Doit être un nombre entier',
  pattern: () => 'Format invalide',
  phone: () => 'Numéro de téléphone invalide',
  min: (err) => `La valeur minimum est ${err.min}`,
  max: (err) => `La valeur maximum est ${err.max}`,
  minlength: (err) => `${err.requiredLength} caractères minimum (actuellement ${err.actualLength})`,
  maxlength: (err) => `${err.requiredLength} caractères maximum`,
  minDate: (err) => `La date minimum est ${err.min}`,
  maxDate: (err) => `La date maximum est ${err.max}`,
  minTime: (err) => `L'heure minimum est ${err.min}`,
  maxTime: (err) => `L'heure maximum est ${err.max}`,
  maxFileSize: (err) => `Fichier trop volumineux (max ${err.maxSizeMb} Mo)`,
  maxFilesCount: (err) => `Maximum ${err.maxFiles} fichier(s) autorisé(s)`,
  minArrayLength: (err) => `Minimum ${err.min} élément(s) requis`,
  maxArrayLength: (err) => `Maximum ${err.max} élément(s) autorisé(s)`,
};

const CROSS_VALIDATION_MESSAGES: Record<string, string> = {
  matchFields: 'Les valeurs ne correspondent pas',
  dateRange: 'La date de fin doit être postérieure à la date de début',
  numberRange: 'La valeur maximum doit être supérieure ou égale au minimum',
};

/** Correspondance entre la clé d'erreur Angular et la clé de config custom (camelCase) */
const CONFIG_KEY_MAP: Record<string, string> = {
  minlength: 'minLength',
  maxlength: 'maxLength',
};

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {

  resolve(field: FieldConfig, errorKey: string, errorValue: any): string {
    const configKey = CONFIG_KEY_MAP[errorKey] ?? errorKey;
    const customTemplate = field.validation?.messages?.[configKey as keyof typeof field.validation.messages];

    if (customTemplate) {
      return this.interpolate(customTemplate, errorValue);
    }

    const defaultFn = DEFAULT_MESSAGES[errorKey];
    return defaultFn ? defaultFn(errorValue) : 'Valeur invalide';
  }

  private interpolate(template: string, values: any): string {
    if (!values || typeof values !== 'object') return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
  }

  resolveArrayError(field: FieldConfig, errorKey: string, errorValue: any): string {
    const customTemplate = field.arrayConfig?.messages?.[errorKey as 'minItems' | 'maxItems'];
    if (customTemplate) return this.interpolate(customTemplate, errorValue);

    const defaultFn = DEFAULT_MESSAGES[errorKey];
    return defaultFn ? defaultFn(errorValue) : 'Nombre d\'éléments invalide';
  }

  resolveCrossError(errorKey: string, errorValue: { message?: string }): string {
    return errorValue.message ?? CROSS_VALIDATION_MESSAGES[errorKey] ?? 'Erreur de validation';
  }
}