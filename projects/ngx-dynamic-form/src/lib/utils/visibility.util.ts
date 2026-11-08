import { FieldConfig, VisibleCondition } from '../models/field-config.model';

export function evaluateCondition(condition: VisibleCondition, groupValue: Record<string, any>): boolean {
  const actual = groupValue[condition.field];

  if (condition.equals !== undefined) return actual === condition.equals;
  if (condition.notEquals !== undefined) return actual !== condition.notEquals;
  if (condition.in !== undefined) return condition.in.includes(actual);
  if (condition.notIn !== undefined) return !condition.notIn.includes(actual);
  if (condition.truthy !== undefined) {
    const isTruthy = Array.isArray(actual) ? actual.length > 0 : !!actual;
    return condition.truthy ? isTruthy : !isTruthy;
  }
  return true;
}

export function isFieldVisible(field: FieldConfig, groupValue: Record<string, any>): boolean {
  if (!field.visibleWhen) return true;
  const conditions = Array.isArray(field.visibleWhen) ? field.visibleWhen : [field.visibleWhen];
  return conditions.every(c => evaluateCondition(c, groupValue));
}