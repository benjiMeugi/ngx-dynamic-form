import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CrossValidationRule } from '../models/form-config.model';

export function buildCrossValidator(rule: CrossValidationRule): ValidatorFn {
    switch (rule.type) {
        case 'matchFields':
            return matchFieldsValidator(rule);
        case 'dateRange':
            return dateRangeValidator(rule);
        case 'numberRange':
            return numberRangeValidator(rule);
    }
}

function matchFieldsValidator(rule: CrossValidationRule): ValidatorFn {
    const [fieldA, fieldB] = rule.fields;
    return (group: AbstractControl): ValidationErrors | null => {
        const valA = group.get(fieldA)?.value;
        const valB = group.get(fieldB)?.value;
        if (!valA || !valB) return null; // laisse `required` gérer les champs vides
        return valA === valB
            ? null
            : { matchFields: { fields: rule.fields, message: rule.message, errorOnField: rule.errorOnField } };
    };
}

function dateRangeValidator(rule: CrossValidationRule): ValidatorFn {
    const [startField, endField] = rule.fields;
    return (group: AbstractControl): ValidationErrors | null => {
        const start = group.get(startField)?.value;
        const end = group.get(endField)?.value;
        if (!start || !end) return null;
        return new Date(start) <= new Date(end)
            ? null
            : { dateRange: { fields: rule.fields, message: rule.message, errorOnField: rule.errorOnField } };
    };
}

function numberRangeValidator(rule: CrossValidationRule): ValidatorFn {
    const [minField, maxField] = rule.fields;
    return (group: AbstractControl): ValidationErrors | null => {
        const min = group.get(minField)?.value;
        const max = group.get(maxField)?.value;
        if (min === null || min === undefined || max === null || max === undefined) return null;
        return Number(min) <= Number(max)
            ? null
            : { numberRange: { fields: rule.fields, message: rule.message, errorOnField: rule.errorOnField } };
    };
}