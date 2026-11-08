import { evaluateCondition, isFieldVisible } from './visibility.util';
import { FieldConfig } from '../models/field-config.model';

describe('visibility.util', () => {
  describe('evaluateCondition', () => {
    it('equals / notEquals', () => {
      expect(evaluateCondition({ field: 'a', equals: 1 }, { a: 1 })).toBeTrue();
      expect(evaluateCondition({ field: 'a', equals: 1 }, { a: 2 })).toBeFalse();
      expect(evaluateCondition({ field: 'a', notEquals: 1 }, { a: 2 })).toBeTrue();
    });

    it('in / notIn', () => {
      expect(evaluateCondition({ field: 'a', in: ['x', 'y'] }, { a: 'x' })).toBeTrue();
      expect(evaluateCondition({ field: 'a', notIn: ['x'] }, { a: 'x' })).toBeFalse();
    });

    it('truthy gère les tableaux vides', () => {
      expect(evaluateCondition({ field: 'a', truthy: true }, { a: [] })).toBeFalse();
      expect(evaluateCondition({ field: 'a', truthy: true }, { a: ['x'] })).toBeTrue();
      expect(evaluateCondition({ field: 'a', truthy: false }, { a: '' })).toBeTrue();
    });

    it('sans opérateur, la condition est vraie', () => {
      expect(evaluateCondition({ field: 'a' }, {})).toBeTrue();
    });
  });

  describe('isFieldVisible', () => {
    const base: FieldConfig = { name: 'f', type: 'text' };

    it('visible si aucune condition', () => {
      expect(isFieldVisible(base, {})).toBeTrue();
    });

    it('toutes les conditions doivent être satisfaites', () => {
      const field: FieldConfig = {
        ...base,
        visibleWhen: [{ field: 'a', equals: 1 }, { field: 'b', truthy: true }],
      };
      expect(isFieldVisible(field, { a: 1, b: true })).toBeTrue();
      expect(isFieldVisible(field, { a: 1, b: false })).toBeFalse();
    });
  });
});
