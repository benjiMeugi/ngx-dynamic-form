import { FieldConfig } from './field-config.model';

export type CrossValidationType = 'matchFields' | 'dateRange' | 'numberRange';

export interface CrossValidationRule {
    type: CrossValidationType;
    fields: string[];       // noms des champs impliqués (2 pour la plupart des cas)
    message?: string;       // message custom, sinon message par défaut
    errorOnField?: string;
}
export interface FormConfig {
    id: string;
    title?: string;
    submitLabel?: string; // défaut: "Enregistrer"
    fields: FieldConfig[];
    crossValidation?: CrossValidationRule[];
}

export interface FormsCollection {
    forms: FormConfig[];
}